import './mute-auto.mjs'
import { MUTE_LAUNCH, muteContext } from './mute.mjs'
// 公開URLの確認。node live.mjs（ログインしていないブラウザで見る）。SKIPGH=1 で GitHub ページの確認を省く
// 横丁に入った後は LIVE_URL=https://tom3games.com/play/dopamine-check/ で本体を見る
import { chromium, webkit } from 'playwright'
import { execSync } from 'node:child_process'
// 個人のアカウント名は公開リポジトリに書かない。実行時に gh から取る（2026-11-02 live.mjs に名前が文字で入ったまま5本公開していた）
const OWNER = (() => { try { return execSync('gh api user -q .login', { encoding: 'utf8' }).trim().toLowerCase() } catch { return '' } })()
const URL0 = process.env.LIVE_URL || 'https://tom3games.github.io/dopamine-check/'
const out = []
for (const [name, bt, opts] of [['chromium', chromium, {}], ['webkit', webkit, { isMobile: true, hasTouch: true, deviceScaleFactor: 2 }]]) {
  const b = await bt.launch(bt === chromium ? MUTE_LAUNCH : {}), ctx = await b.newContext({ locale: 'ja-JP', viewport: { width: 390, height: 844 }, ...opts })
  await muteContext(ctx)
  const p = await ctx.newPage()
  const errs = []
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
  p.on('requestfailed', r => errs.push('fail ' + r.url()))
  await p.goto(URL0 + '?t=' + Date.now(), { waitUntil: 'networkidle' })
  await p.waitForFunction(() => window.__dcReady, null, { timeout: 15000 })
  // 遊びの通し: 始める → 最初の通知を本物の指で押す → 結果まで
  await p.evaluate(() => { dc.seed(3); dc.dbg.pause(true) })
  const sb = await p.locator('#bStart').boundingBox(); if (bt === webkit) await p.touchscreen.tap(sb.x + sb.width / 2, sb.y + sb.height / 2); else await p.mouse.click(sb.x + sb.width / 2, sb.y + sb.height / 2)
  await p.evaluate(() => dc.dbg.skipTo(4)); await p.waitForTimeout(500)
  const c = (await p.evaluate(() => dc.bannerXY()))[0]
  if (bt === webkit) await p.touchscreen.tap(c.x, c.y); else await p.mouse.click(c.x, c.y)
  await p.evaluate(() => dc.dbg.step(200)); await p.waitForTimeout(900)
  const muted = await p.evaluate(() => window.__muteOk())
  if (!muted) errs.push('not muted')
  if (await p.evaluate(() => dc.state().scene) !== 'end') errs.push('no result screen')
  await p.screenshot({ path: `shots/live-${name}.png` })
  const og = await p.evaluate(async () => { const r = await fetch(document.querySelector('meta[property="og:image"]').content); return r.status + ' ' + r.headers.get('content-type') })
  out.push(`${name}: og=${og} errors=${errs.length ? errs.join(' | ') : 'none'}`)
  await b.close()
}
if (process.env.SKIPGH) { console.log(out.join('\n')); process.exit(0) }
// ログアウト状態でリポジトリ・更新履歴に個人のIDが出ていないか
const b = await chromium.launch(MUTE_LAUNCH), p = await b.newPage()
for (const u of ['https://github.com/tom3games/dopamine-check', 'https://github.com/tom3games/dopamine-check/commits/main']) {
  const res = await p.goto(u, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(2500)
  out.push(`${u} status=${res.status()} owner=${OWNER && (await p.content()).toLowerCase().includes(OWNER) ? 'FOUND' : 'none'}`)
}
await b.close()
console.log(out.join('\n'))
