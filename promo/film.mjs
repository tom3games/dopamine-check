import '../mute-auto.mjs'   // ブラウザでは絶対に音を出さない。音は記録して ffmpeg で後から重ねる
// X 投稿用の縦長プレイ動画（1080x1920・30fps・H.264＋AAC）。node promo/film.mjs
// 何もせず耐える → 電話・赤い数字の山 → 偽の結果画面の「もう一度」を押してしまう →「それも通知でした」→ 本物の結果
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'
import { serve, open, Recorder, mix, encode, inspect, stills } from '../../_shared/promo-film.mjs'

const ROOT = new URL('..', import.meta.url).pathname
const SLUG = 'dopamine-check', SEED = +(process.env.SEED || 77)
const TMP = process.env.FRAMES || join(tmpdir(), `${SLUG}-frames-${Date.now()}`)
const OUT_DIR = join(homedir(), 'Desktop/バカゲー動画'); mkdirSync(OUT_DIR, { recursive: true })

const srv = await serve(ROOT)
const { b, p, errs } = await open({ chromium, port: srv.port, path: '/', ready: '__dcReady' })
const callAt = await p.evaluate(sd => {
  const F = window.__film
  localStorage.clear(); dc.seed(sd)
  F.hookSnd(); F.on()
  dc.startGame()
  const st = document.createElement('style'); st.textContent = '.__tap{position:fixed;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:rgba(255,255,255,.55);border:3px solid rgba(20,20,20,.55);pointer-events:none;z-index:99999;animation:__tp .38s ease-out forwards}@keyframes __tp{from{transform:scale(.5);opacity:1}to{transform:scale(1.25);opacity:0}}'
  document.head.appendChild(st)
  F.tapAt = (x, y) => { const d = document.createElement('div'); d.className = '__tap'; d.style.left = x + 'px'; d.style.top = y + 'px'; document.body.appendChild(d); window.setTimeout(() => d.remove(), 420); const el = document.elementFromPoint(x, y); el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, clientX: x, clientY: y, isPrimary: true })) }
  return dc.script().find(e => e[2] === 'call')[0]
}, SEED)
const tick = (F, a) => {
  const G = dc.G
  F.all = (F.all || 0) + 1
  if (a.mode === 'until') return G.t >= a.t
  if (a.mode === 'tapFake') { if (!F.tapped && G.t >= a.t) { const r = document.querySelector('#fakeEnd .again').getBoundingClientRect(); F.tapAt(r.left + r.width / 2, r.top + r.height / 2); F.tapped = true } return G.scene === 'end' }
  if (a.mode === 'for') { F.cnt = (F.cnt || 0) + 1; if (F.cnt >= a.n) { F.cnt = 0; return true } return false }
  return false
}
const rec = new Recorder(p, TMP)
const segs = []
const cut = async (t0, t1) => { await rec.run(tick, { ff: true, max: 30 * 300, arg: { mode: 'until', t: t0 } }); const s = rec.sec; await rec.run(tick, { max: 30 * 30, arg: { mode: 'until', t: t1 } }); segs.push([t0, s, rec.sec]) }
await cut(0, 7.5)
await cut(callAt + 0.2, callAt + 3.2)
await cut(222, 226)
await rec.run(tick, { ff: true, max: 30 * 300, arg: { mode: 'until', t: 250 } })
{ const s = rec.sec; await rec.run(tick, { max: 30 * 12, arg: { mode: 'tapFake', t: 252.6 } }); segs.push(['fake', s, rec.sec]) }
{ const s = rec.sec; await rec.run(tick, { max: 30 * 4, arg: { mode: 'for', n: 30 * 3 } }); segs.push(['end', s, rec.sec]) }
await p.evaluate(() => {
  const c = document.createElement('div'); c.textContent = 'ドーパミン中毒診断'
  c.style.cssText = 'position:fixed;left:0;right:0;top:44%;z-index:99998;text-align:center;font:900 44px "Zen Old Mincho",serif;color:#fff;background:rgba(200,16,46,.94);padding:14px 0;transform:rotate(-3deg);pointer-events:none;box-shadow:0 8px 20px rgba(0,0,0,.4)'
  document.body.appendChild(c)
})
await rec.run(tick, { max: 45, arg: { mode: 'x' } })
const log = await p.evaluate(() => ({ rec: window.__film.rec, gains: window.__film.gains, lost: dc.state().lost }))
await b.close(); srv.close()
const dur = rec.sec
const wav = join(TMP, 'mix.wav'), out = join(OUT_DIR, `${SLUG}-x-1080x1920.mp4`)
mix({ rec: log.rec, gains: log.gains, dur, root: ROOT, out: wav })
encode({ frames: TMP, wav, out })
const info = inspect(out)
const st = stills(out, [0.5, ...segs.map(s => (s[1] + s[2]) / 2), dur - 0.6], join(TMP, 'still'))
writeFileSync(join(ROOT, 'promo/film-log.json'), JSON.stringify({ seed: SEED, segs, info, lost: log.lost, errs, frames: TMP }, null, 1))
console.log(JSON.stringify({ out, info, segs, lost: log.lost, errs, stills: st }, null, 1))
