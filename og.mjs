import './mute-auto.mjs'
import { MUTE_LAUNCH, muteContext } from './mute.mjs'
// og.png（1200x630）を作る。赤い数字があふれたスマホ＋検査の記録紙＋題名。node og.mjs
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
const ROOT = import.meta.dirname
const PORT = 6485
const server = spawn(process.execPath, ['server.mjs'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) } })
await new Promise(r => setTimeout(r, 400))
const b = await chromium.launch(MUTE_LAUNCH)
const ctx = await b.newContext({ locale: 'ja-JP', viewport: { width: 390, height: 800 }, deviceScaleFactor: 2 })
await muteContext(ctx)
const p = await ctx.newPage()
await p.goto(`http://localhost:${PORT}/`)
await p.waitForFunction(() => window.__dcReady)
await p.evaluate(() => document.fonts.ready)
await p.evaluate(() => { localStorage.clear(); dc.seed(8); dc.dbg.pause(true); dc.startGame(); dc.dbg.skipTo(219) })
await p.evaluate(() => { const e = dc.script().find(x => x[1] === 'n' && x[0] > 219); dc.dbg.skipTo(e[0] + 0.3) })
await p.waitForTimeout(700)
const shot = (await p.screenshot({ type: 'png' })).toString('base64')
// 結果（記録紙）
await p.evaluate(() => dc.startGame()); await p.evaluate(() => dc.dbg.skipTo(44)); await p.waitForTimeout(500)
const bx = (await p.evaluate(() => dc.bannerXY()))[0]
await p.mouse.click(bx.x, bx.y); await p.evaluate(() => dc.dbg.step(200)); await p.waitForTimeout(1600)
const rep = (await p.locator('#report').screenshot({ type: 'png' })).toString('base64')
const og = await (await b.newContext({ viewport: { width: 1200, height: 630 } })).newPage()
await og.setContent(`<html><head><link href="https://fonts.googleapis.com/css2?family=Zen+Old+Mincho:wght@900&display=swap" rel="stylesheet"><style>
*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;overflow:hidden;position:relative;background:linear-gradient(180deg,#d6ded8 0,#d6ded8 76%,#b9a58b 76%,#a8937a 100%);font-family:"Zen Old Mincho",serif}
.ph{position:absolute;left:470px;top:22px;width:300px;height:615px;border-radius:40px;background:#111;padding:9px;transform:rotate(-4deg);box-shadow:0 26px 40px rgba(0,0,0,.45)}
.ph img{width:100%;height:100%;object-fit:cover;object-position:top;border-radius:32px;display:block}
.rep{position:absolute;right:26px;top:96px;width:330px;transform:rotate(5deg);box-shadow:0 18px 30px rgba(0,0,0,.4)}
.rep img{width:100%;display:block}
.tag{position:absolute;left:52px;top:118px;font:700 22px/1 "Hiragino Sans",sans-serif;letter-spacing:.3em;color:#5f6b64}
h1{position:absolute;left:46px;top:156px;color:#22201c;font-weight:900;font-size:68px;line-height:1.12;width:420px}
p{position:absolute;left:50px;top:330px;color:#2c3a33;font:700 27px/1.55 "Hiragino Sans",sans-serif;width:400px}
p b{color:#c8102e}
</style></head><body><span class="tag">問診票</span><h1>ドーパミン<br>中毒診断</h1><p>通知が来ます。<br>赤い数字がたまります。<br>しばらくお待ちください。<br>あなたは<b>何秒</b>耐えられる？</p>
<div class="ph"><img src="data:image/png;base64,${shot}"></div><div class="rep"><img src="data:image/png;base64,${rep}"></div></body></html>`)
await og.evaluate(() => document.fonts.ready)
await og.waitForTimeout(600)
await og.screenshot({ path: ROOT + '/og.png' })
await b.close(); server.kill()
console.log('og.png')
