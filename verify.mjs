import './mute-auto.mjs'
import { MUTE_LAUNCH, muteContext } from './mute.mjs'
// ドーパミン中毒診断 の検証。node verify.mjs
import { chromium, webkit } from 'playwright'
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
const ROOT = import.meta.dirname
mkdirSync(ROOT + '/shots', { recursive: true })
const PORT = 6481
const server = spawn(process.execPath, ['server.mjs'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) } })
await new Promise(r => setTimeout(r, 400))
const URL0 = `http://localhost:${PORT}/`
let pass = 0, fail = 0
const results = []
async function t(name, fn) {
  try { const r = await fn(); if (r === false) throw new Error('false'); pass++; results.push(`ok   ${name}${r && r !== true ? '  ' + JSON.stringify(r) : ''}`) }
  catch (e) { fail++; results.push(`FAIL ${name}  ${e.message.split('\n')[0]}`) }
}
const expect = (c, msg) => { if (!c) throw new Error(msg) }
async function open(browser, opts = {}, keep) {
  const ctx = await browser.newContext({ locale: 'ja-JP', viewport: { width: 390, height: 844 }, hasTouch: true, ...opts })
  await muteContext(ctx)
  if (!keep) await ctx.addInitScript(() => { try { if (!sessionStorage.getItem('kept')) { localStorage.clear(); sessionStorage.setItem('kept', '1') } } catch (e) {} })
  const p = await ctx.newPage(); p.errs = []
  p.on('pageerror', e => p.errs.push('pageerror ' + e.message))
  p.on('console', m => { if (m.type() === 'error') p.errs.push('console ' + m.text()) })
  p.on('requestfailed', r => { if (!/fonts\.(googleapis|gstatic)/.test(r.url())) p.errs.push('reqfail ' + r.url()) })
  await p.goto(URL0); await p.waitForFunction(() => window.__dcReady, null, { timeout: 15000 })
  return p
}
const overflow = p => p.evaluate(() => {
  const W = document.documentElement.clientWidth, bad = []
  for (const el of document.querySelectorAll('main:not([hidden]) *, .ovl:not([hidden]) *')) {
    if (el.closest('[hidden]') || el.closest('#pile') || el.closest('.bn') || el.closest('#grid.rearr') || el.closest('#hima') || (el.checkVisibility && !el.checkVisibility({ visibilityProperty: true }))) continue
    const r = el.getBoundingClientRect(); if (r.width && (r.right > W + 1 || r.left < -1)) bad.push((el.id || el.className || el.tagName) + ':' + Math.round(r.left) + '-' + Math.round(r.right))
  }
  return { sw: document.documentElement.scrollWidth, W, bad: bad.slice(0, 5) }
})
const fit = q => q.evaluate(() => {
  const H = innerHeight, de = document.documentElement, over = []
  if (de.scrollHeight > H + 1) over.push('page:' + de.scrollHeight)
  for (const el of document.querySelectorAll('main:not([hidden]) button, .ovl:not([hidden]) button, #tmSupport, #tmHome, .ic, #wait, #dock, .bn, #endBtn, .rep')) {
    if (!el.offsetParent || el.closest('[hidden]') || el.closest('.out')) continue
    const r = el.getBoundingClientRect(); if (r.bottom > H + 1 || r.top < -1 || r.right > innerWidth + 1 || r.left < -1) over.push((el.id || el.className) + ':' + Math.round(r.top) + '-' + Math.round(r.bottom))
  }
  return { H, over: over.slice(0, 6) }
})
const xyOf = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e || e.closest('[hidden]')) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }, sel)
const skip = (p, s) => p.evaluate(s => dc.dbg.skipTo(s), s)
const lost = p => p.evaluate(() => dc.state().lost)
async function newRun(p, seed) { await p.evaluate(sd => { dc.seed(sd); dc.dbg.pause(true); dc.startGame() }, seed) }
async function finishOpen(p) { await p.evaluate(() => dc.dbg.step(200)) }
// 台本の中から仕掛けの時刻を探す
const gagAt = (p, name) => p.evaluate(n => { const e = dc.script().find(x => x[2] === n); return e ? e[0] : null }, name)

const browser = await chromium.launch(MUTE_LAUNCH)
let p = await open(browser)
await t('起動時にエラーが出ない', async () => { expect(p.errs.length === 0, p.errs.join('|')) })
await t('ブラウザの拡大が起きない', async () => {
  const r = await p.evaluate(() => {
    const vp = document.querySelector('meta[name=viewport]').content
    const g = new Event('gesturestart', { cancelable: true }); document.dispatchEvent(g)
    const w = new WheelEvent('wheel', { ctrlKey: true, deltaY: -10, bubbles: true, cancelable: true }); window.dispatchEvent(w)
    const k = new KeyboardEvent('keydown', { key: '+', ctrlKey: true, bubbles: true, cancelable: true }); window.dispatchEvent(k)
    return { vp, gesture: g.defaultPrevented, wheel: w.defaultPrevented, key: k.defaultPrevented, ta: getComputedStyle(document.documentElement).touchAction, us: getComputedStyle(document.body).userSelect }
  })
  expect(/user-scalable=no/.test(r.vp) && r.gesture && r.wheel && r.key && r.ta === 'manipulation' && r.us === 'none', JSON.stringify(r))
})
await t('OGP・canonical・横丁への転送がある', async () => {
  const r = await p.evaluate(() => ({ og: ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'].every(k => document.querySelector(`meta[property="${k}"]`)), tw: !!document.querySelector('meta[name="twitter:card"]'), can: document.querySelector('link[rel=canonical]').href, gh: document.getElementById('ghMove').textContent }))
  expect(r.og && r.tw && r.can === 'https://tom3games.com/play/dopamine-check/' && /tom3games\.com\/play\/dopamine-check\//.test(r.gh), JSON.stringify(r))
})
await t('画面と文言に AI・画像生成・「開くな」の語がない', async () => {
  const txt = await p.evaluate(() => document.body.innerText + JSON.stringify(DATA))
  expect(!/(\bAI\b|画像生成|生成AI|ChatGPT|開くな|触るな|触らないで|開かないで|押さないで|Don't (open|touch))/i.test(txt), 'found')
})

// ---- 通し（本物の指）
await p.evaluate(() => { dc.seed(11); dc.dbg.pause(true) })
await p.mouse.click(...Object.values(await xyOf(p, '#bStart')))
await t('始めるとスマホの画面になる・待ってくださいだけが出る', async () => {
  const r = await p.evaluate(() => ({ scene: dc.state().scene, play: !document.querySelector('#vPlay').hidden, wait: document.querySelector('#waitT').textContent, icons: document.querySelectorAll('.ic').length }))
  expect(r.scene === 'play' && r.play && r.wait === 'しばらくお待ちください' && r.icons === 16, JSON.stringify(r)); return r
})
await t('無音: 始めた後も実際には鳴っていない（Chromium）', async () => { const r = await p.evaluate(() => ({ ok: window.__muteOk(), calls: window.__soundCalls })); expect(r.ok, JSON.stringify(r)); return r })
await t('始めた直後0.3秒のタッチは数えない（始めるボタンの指の残り）', async () => {
  await p.mouse.click(200, 600)
  const r = await p.evaluate(() => dc.state().scene); expect(r === 'play', r)
})
await skip(p, 3.2)
await t('最初の通知が上から来て、アイコンに赤い数字がつく', async () => {
  const r = await p.evaluate(() => ({ b: dc.state().banners, c: dc.state().counts }))
  expect(r.b.length === 1 && Object.values(r.c).reduce((a, b) => a + b, 0) === 1, JSON.stringify(r)); return r
})
await t('通知を実座標で押すと、その場で診断が終わり中身のオチが開く', async () => {
  await p.waitForTimeout(500)
  const b = (await p.evaluate(() => dc.bannerXY()))[0]
  expect(await p.evaluate(([x, y]) => dc.topAt(x, y), [b.x, b.y]) === b.k, 'banner not on top')
  await p.mouse.click(b.x, b.y)
  const r = await p.evaluate(() => ({ s: dc.state(), open: !document.querySelector('#openApp').hidden, txt: document.querySelector('#openApp').innerText }))
  expect(r.s.scene === 'open' && r.open && r.s.lost.k === b.k && r.txt.length > 3, JSON.stringify(r)); return { k: b.k, secs: Math.round(r.s.lost.secs * 10) / 10, open: r.txt.replace(/\n/g, ' ') }
})
await t('開いた画面の後に結果（記録紙）が出る・称号と負けた相手が書かれる', async () => {
  await finishOpen(p); await p.waitForTimeout(900)
  const r = await p.evaluate(() => ({ end: !document.querySelector('#vEnd').hidden, txt: document.querySelector('#report').innerText, again: document.querySelector('#bAgain').textContent, sup: !!document.querySelector('#tmSupport') }))
  expect(r.end && /通知の申し子|反射で生きてる/.test(r.txt) && /一番動かしたもの/.test(r.txt) && /画面に触れた時点で終了/.test(r.txt) && r.again === 'もう一度' && r.sup, JSON.stringify(r)); return r.txt.split('\n').slice(0, 8).join(' / ')
})
await t('結果に作った統計（上位〇%・全国）を出さない', async () => { const r = await p.evaluate(() => document.querySelector('#report').innerText); expect(!/上位|全国|平均|%/.test(r), r) })
await t('結果画像（1080x1350）に中身が描ける', async () => {
  const v = await p.evaluate(() => { const c = dc.drawCard(), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let s = 0, s2 = 0, n = 0; for (let i = 0; i < d.length; i += 4 * 97) { const v = d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11; s += v; s2 += v * v; n++ } return Math.round(s2 / n - (s / n) ** 2) })
  expect(v > 300, v); return { variance: v }
})
await t('Xでポストの文に秒数・称号・負けた相手が入る', async () => {
  const r = await p.evaluate(() => { let u = ''; const o = window.open; window.open = x => { u = x }; document.querySelector('#bPost').click(); window.open = o; return decodeURIComponent(u) })
  expect(/x\.com\/intent\/post/.test(r) && /秒「/.test(r) && /tom3games\.com\/play\/dopamine-check/.test(r), r); return r.slice(0, 120)
})
await t('負けた相手の系統を覚え、次の回はその系統の通知が早く来る', async () => {
  const before = await lost(p)
  await newRun(p, 12)
  const r = await p.evaluate(() => ({ weak: dc.state().weak, early: dc.script().filter(e => e[1] === 'n' && /^r_/.test(e[2])).map(e => e[0] + ':' + e[2]) }))
  expect(r.weak === before.cat && r.early.length === 3 && /^1[67]/.test(r.early[0]), JSON.stringify(r)); return r
})

// ---- 罠と仕掛けを1つずつ本物の指で押す
const traps = [
  ['hima', '#hima', 'hima'], ['off', '#shY', 'off'], ['off', '#shN', 'later'], ['ad', '#ad .x', 'adclose'], ['ad', '#adArt', 'ad'],
  ['endbtn', '#endBtn', 'endbtn'], ['call', '#call .yes', 'callyes'], ['call', '#call .no', 'callno'], ['call', '#call .who', 'callyes'],
  ['update', '#shY', 'upnow'], ['update', '#shN', 'upnight'], ['clock', '#wClock', 'clock'],
]
for (const [g, sel, want] of traps) {
  await t(`罠: ${g} の ${sel} を押すと「${want}」で終わる`, async () => {
    await newRun(p, 21)
    const at = await gagAt(p, g); expect(at != null, 'no gag ' + g)
    await skip(p, at + 0.5); await p.waitForTimeout(450)
    const xy = await xyOf(p, sel); expect(xy, 'not visible ' + sel)
    const top = await p.evaluate(([x, y]) => dc.topAt(x, y), [xy.x, xy.y])
    await p.mouse.click(xy.x, xy.y)
    const l = await lost(p); expect(l && l.k === want, JSON.stringify({ top, l }))
    await finishOpen(p)
    return { at: Math.round(at), label: l.label }
  })
}
await t('罠: 暗くなった画面に触れると「dim」で終わる', async () => {
  await newRun(p, 21); const at = await gagAt(p, 'dim'); await skip(p, at + 3); await p.waitForTimeout(300)
  const r = await p.evaluate(() => !document.querySelector('#dimOv').hidden); expect(r, 'dim not shown')
  await p.mouse.click(200, 400); const l = await lost(p); expect(l.k === 'dim', JSON.stringify(l)); await finishOpen(p); return l.label
})
await t('罠: 並び替えの「ここ」を押すと「slot」で終わる', async () => {
  await newRun(p, 22); await skip(p, 175); await p.waitForTimeout(1200)
  const xy = await xyOf(p, '#slotEl'); expect(xy, 'slot hidden'); await p.mouse.click(xy.x, xy.y); const l = await lost(p); expect(l.k === 'slot', JSON.stringify(l)); await finishOpen(p); return xy
})
await t('落ちてきた赤い数字を押すと「badge」で終わる', async () => {
  await newRun(p, 23); await skip(p, 214); await p.waitForTimeout(300)
  const c = await p.evaluate(() => { const e = [...document.querySelectorAll('.chip')].reverse().find(el => { const r = el.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return top === el }); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, n: document.querySelectorAll('.chip').length } })
  expect(c, 'no chip on top'); await p.mouse.click(c.x, c.y); const l = await lost(p); expect(l.k === 'badge', JSON.stringify(l)); await finishOpen(p); return { chips: c.n }
})
await t('偽の結果画面の「もう一度」を押すと「fake」（それも通知でした）', async () => {
  await newRun(p, 24); await skip(p, 256); await p.waitForTimeout(900)
  const r = await p.evaluate(() => ({ txt: document.querySelector('#fakeEnd').innerText, bn: dc.state().banners }))
  expect(/検査 結果/.test(r.txt) && /ほぼ仏/.test(r.txt), r.txt)
  const xy = await xyOf(p, '#fakeEnd .again'); await p.mouse.click(xy.x, xy.y); const l = await lost(p); expect(l.k === 'fake', JSON.stringify(l))
  const o = await p.evaluate(() => document.querySelector('#openApp').innerText); expect(/それも通知でした/.test(o), o); await finishOpen(p); return o.replace(/\n/g, ' ')
})
await t('偽の結果は30秒で崩れて「まだです」に戻る', async () => {
  await newRun(p, 25); await skip(p, 281); await p.waitForTimeout(1200)
  const r = await p.evaluate(() => ({ fake: !document.querySelector('#fakeEnd').hidden, hud: document.querySelector('#hud').textContent, scene: dc.state().scene }))
  expect(!r.fake && r.scene === 'play', JSON.stringify(r)); return r
})
await t('電池が切れた黒い画面に触れると「black」で終わる', async () => {
  await skip(p, 296); await p.waitForTimeout(300)
  await p.mouse.click(200, 400); const l = await lost(p); expect(l.k === 'black', JSON.stringify(l)); await finishOpen(p); return l.label
})
await t('アイコンを押すと「icon」・未読の数がオチになる', async () => {
  await newRun(p, 26); await skip(p, 33); await p.waitForTimeout(300)
  const xy = await p.evaluate(() => dc.iconXY('shop')); await p.mouse.click(xy.x, xy.y)
  const l = await lost(p), o = await p.evaluate(() => document.querySelector('#openApp').innerText)
  expect(l.k === 'icon' && /かいもの/.test(l.label) && /未読/.test(o), JSON.stringify({ l, o })); await finishOpen(p); return l.label
})
await t('何もない所（壁紙）を押しても終わる', async () => {
  await newRun(p, 27); await skip(p, 1.5)
  const xy = { x: 195, y: 680 }; const top = await p.evaluate(([x, y]) => dc.topAt(x, y), [xy.x, xy.y])
  await p.mouse.click(xy.x, xy.y); const l = await lost(p); expect(l.k === 'empty' && top === 'empty', JSON.stringify({ top, l })); await finishOpen(p); return l.label
})
await t('触らずに5分たつと「悟りの境地」で終わる（終わりがある）', async () => {
  await newRun(p, 28); await skip(p, 301); await p.waitForTimeout(900)
  const r = await p.evaluate(() => ({ l: dc.state().lost, end: !document.querySelector('#vEnd').hidden, txt: document.querySelector('#report').innerText }))
  expect(r.end && r.l.k === 'none' && r.l.secs === 300 && /悟りの境地/.test(r.txt) && /なし/.test(r.txt), JSON.stringify(r)); return { secs: r.l.secs, tier: r.l.tier }
})
await t('このページを離れたら「本物のスマホ」で終わる', async () => {
  await newRun(p, 29); await skip(p, 40)
  await p.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }) })
  const r = await p.evaluate(() => ({ l: dc.state().lost, end: !document.querySelector('#vEnd').hidden })); expect(r.end && r.l.k === 'away', JSON.stringify(r)); return r.l.label
})
await t('結果の後に画面を連打しても壊れない・もう一度で最初から', async () => {
  for (let i = 0; i < 6; i++) await p.mouse.click(40 + i * 50, 300)
  await p.mouse.click(...Object.values(await xyOf(p, '#bAgain')))
  const r = await p.evaluate(() => ({ s: dc.state().scene, t: dc.state().t, b: dc.state().banners.length, chips: dc.state().chips, crack: document.querySelector('#crack').children.length }))
  expect(r.s === 'play' && r.t < 1 && r.b === 0 && r.chips === 0 && r.crack === 0, JSON.stringify(r)); return r
})
await t('見つけた負け方の数が増えて残る', async () => { const r = await p.evaluate(() => ({ f: JSON.parse(localStorage.getItem('dc_found') || '[]').length, total: dc.totalWays() })); expect(r.f >= 15 && r.total > 50, JSON.stringify(r)); return r })
await t('やることが無い時間がない: 通知・仕掛けの間は最長7秒以下（5回のくじ。30秒からは赤い数字も約1.7秒ごとに増える）', async () => {
  const gaps = []
  for (const sd of [31, 32, 33, 34, 35]) { await newRun(p, sd); await skip(p, 291); gaps.push(await p.evaluate(() => dc.maxGap(0, 291))) }
  expect(gaps.every(g => g.gap <= 7), JSON.stringify(gaps)); return gaps
})
await t('毎回違う: くじで通知の並びが変わる', async () => {
  const a = await p.evaluate(() => { dc.seed(41); dc.startGame(); return dc.script().filter(e => e[1] === 'n').slice(0, 12).map(e => e[2]).join() })
  const b = await p.evaluate(() => { dc.seed(42); dc.startGame(); return dc.script().filter(e => e[1] === 'n').slice(0, 12).map(e => e[2]).join() })
  expect(a !== b, a); return { a: a.slice(0, 60), b: b.slice(0, 60) }
})
await t('英語に切り替えると全部英語', async () => {
  await p.evaluate(() => { dc.G.scene = 'title' }); await p.goto(URL0); await p.waitForFunction(() => window.__dcReady)
  await p.click('#bLang')
  const ti = await p.evaluate(() => document.querySelector('#paper').innerText)
  await p.evaluate(() => { dc.seed(5); dc.dbg.pause(true); dc.startGame(); dc.dbg.skipTo(10) })
  const w = await p.evaluate(() => document.querySelector('#waitT').textContent + '|' + document.querySelector('#banners').innerText)
  await p.evaluate(() => { dc.lose('none') }); await p.waitForTimeout(300)
  const r = await p.evaluate(() => document.querySelector('#report').innerText + document.querySelector('#bAgain').textContent)
  expect(/Dopamine Addiction Test/.test(ti) && !/[ぁ-んァ-ヶ一-龠]/.test(ti + w + r), JSON.stringify({ ti, w, r })); return w.slice(0, 80)
})
await t('エラーなし（ここまで全部）', async () => { expect(p.errs.length === 0, p.errs.join('|')) })
await p.close()

// ---- スマホ縦3サイズ × 全画面で一画面に収まる
for (const [w, h, name] of [[360, 640, 'small'], [390, 844, 'phone'], [430, 932, 'max']]) {
  const q = await open(browser, { viewport: { width: w, height: h } })
  const views = {}
  views.title = await fit(q); await q.screenshot({ path: `${ROOT}/shots/fit-${name}-title.png` })
  await q.click('#bHow'); views.how = await fit(q); await q.screenshot({ path: `${ROOT}/shots/fit-${name}-how.png` }); await q.click('#howClose')
  await q.evaluate(() => { dc.seed(3); dc.dbg.pause(true); dc.startGame() })
  for (const tt of [5, 45, 110, 175, 230]) { await q.evaluate(t => dc.dbg.skipTo(t), tt); await q.waitForTimeout(450); views['play' + tt] = await fit(q); await q.screenshot({ path: `${ROOT}/shots/fit-${name}-play${tt}.png` }) }
  await q.evaluate(() => dc.dbg.skipTo(257)); await q.waitForTimeout(1000); views.fake = await fit(q); await q.screenshot({ path: `${ROOT}/shots/fit-${name}-fake.png` })
  await q.evaluate(() => dc.startGame()); await q.evaluate(() => dc.dbg.skipTo(48)); await q.waitForTimeout(450)
  const b = (await q.evaluate(() => dc.bannerXY()))[0]; await q.mouse.click(b.x, b.y); await q.waitForTimeout(400)
  views.open = await fit(q); await q.screenshot({ path: `${ROOT}/shots/fit-${name}-open.png` })
  await q.evaluate(() => dc.dbg.step(200)); await q.waitForTimeout(1300); views.end = await fit(q); await q.screenshot({ path: `${ROOT}/shots/fit-${name}-end.png` })
  for (const [v, r] of Object.entries(views)) await t(`一画面に収まる ${name} ${w}x${h} ${v}`, async () => { expect(!r.over.length, JSON.stringify(r)) })
  await t(`${name}: はみ出し・エラーなし`, async () => { const o = await overflow(q); expect(o.sw <= o.W && !o.bad.length && !q.errs.length, JSON.stringify(o) + q.errs.join('|')) })
  await t(`${name}: アイコン16個とドックが画面内・通知が時計に重ならず読める`, async () => {
    const r = await q.evaluate(() => { dc.startGame(); dc.dbg.skipTo(4); const H = innerHeight; const ics = [...document.querySelectorAll('.ic .sq')].map(e => e.getBoundingClientRect()); return { n: ics.length, out: ics.filter(r => r.bottom > H || r.top < 0).length, isz: Math.round(ics[0].width) } })
    expect(r.n === 16 && r.out === 0 && r.isz >= 46, JSON.stringify(r)); return r
  })
  await q.close()
}
await browser.close()

// ---- WebKit（iPhone 相当）でタッチの通し
const wb = await webkit.launch(), wp = await open(wb, { isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
await t('WebKit: 2本指の touchmove を止める', async () => {
  const r = await wp.evaluate(() => { const e = new Event('touchmove', { cancelable: true, bubbles: true }); Object.defineProperty(e, 'touches', { value: [{}, {}] }); document.body.dispatchEvent(e); return e.defaultPrevented })
  expect(r, r)
})
await t('WebKit: タップで始めて通知をタップすると結果まで行く', async () => {
  await wp.evaluate(() => { dc.seed(9); dc.dbg.pause(true) })
  const s = await xyOf(wp, '#bStart'); await wp.touchscreen.tap(s.x, s.y)
  await wp.evaluate(() => dc.dbg.skipTo(8)); await wp.waitForTimeout(500)
  const b = (await wp.evaluate(() => dc.bannerXY()))[0]; await wp.touchscreen.tap(b.x, b.y)
  await wp.evaluate(() => dc.dbg.step(200)); await wp.waitForTimeout(900)
  const r = await wp.evaluate(() => ({ l: dc.state().lost, end: !document.querySelector('#vEnd').hidden }))
  await wp.screenshot({ path: `${ROOT}/shots/webkit-end.png` })
  expect(r.end && r.l && r.l.k === b.k, JSON.stringify(r)); return { k: r.l.k, secs: Math.round(r.l.secs * 10) / 10 }
})
await t('WebKit: 実際には無音', async () => { const r = await wp.evaluate(() => ({ ok: window.__muteOk(), calls: window.__soundCalls })); expect(r.ok, JSON.stringify(r)); return r })
await t('WebKit: エラーなし', async () => { expect(wp.errs.length === 0, wp.errs.join('|')) })
await wb.close()
server.kill()
console.log(results.join('\n'))
console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
