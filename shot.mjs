import './mute-auto.mjs'
import { MUTE_LAUNCH, muteContext } from './mute.mjs'
// 画面を撮って目で見る。node shot.mjs [幅x高さ]
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
const ROOT = import.meta.dirname
mkdirSync(ROOT + '/shots', { recursive: true })
const PORT = 6482
const server = spawn(process.execPath, ['server.mjs'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) } })
await new Promise(r => setTimeout(r, 400))
const [w, h] = (process.argv[2] || '390x844').split('x').map(Number)
const b = await chromium.launch(MUTE_LAUNCH)
const ctx = await b.newContext({ locale: process.env.EN ? 'en-US' : 'ja-JP', viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true })
await muteContext(ctx)
const p = await ctx.newPage(); const errs = []
p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
await p.goto(`http://localhost:${PORT}/`); await p.waitForFunction(() => window.__dcReady)
await p.evaluate(() => document.fonts.ready)
const tag = `${w}x${h}${process.env.EN ? '-en' : ''}`
await p.screenshot({ path: `${ROOT}/shots/s-${tag}-title.png` })
await p.evaluate(() => { dc.seed(7); dc.dbg.pause(true); dc.startGame() })
for (const t of [7, 37, 60, 78, 99, 109, 133, 158, 176, 225, 256]) {
  await p.evaluate(t => dc.dbg.skipTo(t), t); await p.waitForTimeout(450)
  await p.screenshot({ path: `${ROOT}/shots/s-${tag}-t${t}.png` })
}
// 開いてしまった画面と結果
await p.evaluate(() => dc.startGame()); await p.evaluate(() => dc.dbg.skipTo(46)); await p.waitForTimeout(450)
const bx = (await p.evaluate(() => dc.bannerXY()))[0]
console.log('banner', JSON.stringify(bx))
await p.mouse.click(bx.x, bx.y); await p.waitForTimeout(500)
await p.screenshot({ path: `${ROOT}/shots/s-${tag}-open.png` })
await p.evaluate(() => dc.dbg.step(200)); await p.waitForTimeout(1500)
await p.screenshot({ path: `${ROOT}/shots/s-${tag}-end.png` })
console.log(JSON.stringify(await p.evaluate(() => dc.state().lost)))
console.log('errors', errs.join(' | ') || 'none')
await b.close(); server.kill()
