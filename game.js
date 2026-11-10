'use strict'
// ドーパミン中毒診断。始めると画面がスマホのホーム画面になる。何も言わない。触った瞬間に診断が終わる
window.__jsUp = true
const $ = s => document.querySelector(s)
const STEP = 1 / 60
const END = 300
const D = window.DATA
let lang = 'ja'
try { lang = localStorage.getItem('dc_lang') || ((navigator.language || 'ja').toLowerCase().startsWith('ja') ? 'ja' : 'en') } catch (e) { lang = (navigator.language || 'ja').toLowerCase().startsWith('ja') ? 'ja' : 'en' }
const T = () => D.UI[lang]
let seed = (Date.now() % 2147483646) + 1
const rnd = () => (seed = seed * 16807 % 2147483647, (seed - 1) / 2147483646)
const pick = a => a[Math.floor(rnd() * a.length)]
const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const store = { get(k, d) { try { const v = localStorage.getItem('dc_' + k); return v == null ? d : JSON.parse(v) } catch (e) { return d } }, set(k, v) { try { localStorage.setItem('dc_' + k, JSON.stringify(v)) } catch (e) {} } }

// ---- 音（全部録音素材）
Snd.def({
  notif: ['snd/notif1.mp3', 'snd/notif2.mp3', 'snd/notif3.mp3', 'snd/notif4.mp3'], buzz: ['snd/buzz1.mp3', 'snd/buzz2.mp3', 'snd/buzz3.mp3'],
  pop: ['snd/pop1.mp3', 'snd/pop2.mp3', 'snd/pop3.mp3'], crack: ['snd/crack1.mp3', 'snd/crack2.mp3'], ring: 'snd/ring.mp3',
  open: 'snd/open.mp3', off: 'snd/off.mp3', ok: 'snd/ok.mp3', paper: 'snd/paper.mp3', j_low: 'snd/j_low.mp3', j_mid: 'snd/j_mid.mp3', j_high: 'snd/j_high.mp3',
})
try { Snd.muted = localStorage.getItem('dc_mute') === '1' } catch (e) {}

// ---- 絵（アプリの印は全部手描きの SVG。地の色は CSS のグラデーション）
const W = '#fff'
const GLYPH = {
  talk: `<path d="M30 13C19 13 11 20 11 28.5c0 5 3 9.6 7.6 12.3L17 47l7.4-3.6c1.8.4 3.6.6 5.6.6 11 0 19-7 19-15.5S41 13 30 13z" fill="${W}"/>`,
  phone: `<path d="M21.5 15.5c1-.6 2.2-.3 2.9.6l3.5 5.4c.6.9.5 2.1-.3 2.9l-2.4 2.3c1.6 3.6 4.4 6.5 8 8.2l2.4-2.3c.8-.8 2-.9 2.9-.3l5.3 3.6c.9.6 1.2 1.8.6 2.8l-1.7 2.9c-.8 1.4-2.4 2.1-4 1.7C27.5 42.6 17.7 32.7 15 21.4c-.4-1.6.3-3.2 1.7-4z" fill="${W}"/>`,
  web: '<circle cx="30" cy="30" r="17" fill="none" stroke="#2a7fe6" stroke-width="3"/><path d="M30 15v3M30 42v3M15 30h3M42 30h3" stroke="#2a7fe6" stroke-width="2"/><path d="M38 22 33 33 22 38 27 27z" fill="#e5484d"/><path d="M38 22 33 33 27 27z" fill="#c9ced6"/>',
  music: `<path d="M24 41V20l17-4v21" fill="none" stroke="${W}" stroke-width="3.4"/><ellipse cx="20.5" cy="41.5" rx="5" ry="4" fill="${W}"/><ellipse cx="37.5" cy="37.5" rx="5" ry="4" fill="${W}"/>`,
  album: '<rect x="13" y="16" width="34" height="28" rx="3" fill="#cfe8ff"/><circle cx="39" cy="24" r="4" fill="#ffb020"/><path d="M13 40l10-11 7 7 5-4 12 10v2H13z" fill="#3aa35b"/><path d="M13 44l8-9 8 9z" fill="#2c7f45"/>',
  camera: '<rect x="11" y="20" width="38" height="25" rx="5" fill="#2b2f35"/><rect x="22" y="15" width="12" height="7" rx="2" fill="#2b2f35"/><circle cx="30" cy="32.5" r="9" fill="#6f7984"/><circle cx="30" cy="32.5" r="5.5" fill="#1a1d21"/><circle cx="28" cy="30.5" r="1.6" fill="#9fb3c6"/><circle cx="43" cy="25" r="1.8" fill="#ffd60a"/>',
  shop: `<path d="M12 17h6l5 19h18l4-13H20" fill="none" stroke="${W}" stroke-width="3.4" stroke-linejoin="round"/><circle cx="25" cy="42" r="3" fill="${W}"/><circle cx="38" cy="42" r="3" fill="${W}"/>`,
  live: `<rect x="12" y="17" width="36" height="26" rx="6" fill="${W}"/><path d="M27 24v12l10-6z" fill="#c8153a"/><circle cx="44" cy="15" r="4.5" fill="#ffe14d" stroke="#c8153a" stroke-width="1.5"/>`,
  news: '<rect x="14" y="13" width="32" height="35" rx="2" fill="#fff" stroke="#c9ccd2"/><rect x="18" y="17" width="24" height="7" fill="#e5484d"/><path d="M18 29h24M18 33h24M18 37h16M18 41h20" stroke="#8a8f99" stroke-width="2"/>',
  sns: `<circle cx="22" cy="24" r="5.5" fill="${W}"/><circle cx="38" cy="24" r="5.5" fill="${W}"/><circle cx="30" cy="20" r="6.5" fill="${W}" stroke="#1f6fd6" stroke-width="2"/><path d="M13 42c0-6 4-10 9-10s9 4 9 10zM29 42c0-6 4-10 9-10s9 4 9 10z" fill="${W}"/><path d="M20 43c0-7 4.5-11.5 10-11.5S40 36 40 43z" fill="${W}" stroke="#1f6fd6" stroke-width="2"/>`,
  bank: '<path d="M14 24 30 14l16 10z" fill="#ffd36a"/><path d="M17 26v14M24 26v14M36 26v14M43 26v14" stroke="#ffd36a" stroke-width="4"/><rect x="13" y="41" width="34" height="4" fill="#ffd36a"/><text x="30" y="37" font-size="11" font-weight="900" text-anchor="middle" fill="#ffd36a" font-family="sans-serif">¥</text>',
  point: '<rect x="13" y="17" width="34" height="26" rx="5" fill="#fff" opacity=".9"/><text x="30" y="38" font-size="21" font-weight="900" text-anchor="middle" fill="#e08a00" font-family="sans-serif">P</text>',
  game: '<rect x="16" y="30" width="9" height="9" fill="#ffd60a"/><rect x="25" y="30" width="9" height="9" fill="#ffd60a"/><rect x="25" y="21" width="9" height="9" fill="#ffd60a"/><rect x="34" y="30" width="9" height="9" fill="#5be0ff"/><rect x="34" y="39" width="9" height="9" fill="#5be0ff"/><rect x="25" y="39" width="9" height="9" fill="#ff7ab0"/><path d="M16 30h27M25 21v27M34 21v27" stroke="rgba(0,0,0,.18)" stroke-width="1"/>',
  mail: `<rect x="12" y="18" width="36" height="25" rx="3" fill="${W}"/><path d="M13 20l17 13 17-13" fill="none" stroke="#2a7fe6" stroke-width="2.6"/>`,
  cal: '<text x="30" y="21" font-size="9" font-weight="700" text-anchor="middle" fill="#e5484d" font-family="sans-serif" class="cw">MON</text><text x="30" y="45" font-size="25" font-weight="300" text-anchor="middle" fill="#111" font-family="sans-serif" class="cd">10</text>',
  set: '<g transform="translate(30 30)"><path d="M-3-17h6l1 5 4 2 4-3 4 4-3 4 2 4 5 1v6l-5 1-2 4 3 4-4 4-4-3-4 2-1 5h-6l-1-5-4-2-4 3-4-4 3-4-2-4-5-1v-6l5-1 2-4-3-4 4-4 4 3 4-2z" fill="#e9ecef"/><circle r="6" fill="#80878f"/></g>',
  weather: '<circle cx="25" cy="24" r="8" fill="#ffd60a"/><path d="M20 44a7 7 0 0 1 1.5-13.8A9.5 9.5 0 0 1 39.5 33a5.5 5.5 0 0 1 .5 11z" fill="#fff"/>',
}
const appBg = a => `background:linear-gradient(160deg,${D.APPS[a].c[0]},${D.APPS[a].c[1]})`
const glyph = a => `<svg viewBox="0 0 60 60" aria-hidden="true">${GLYPH[D.APPS[a].g]}</svg>`
const appName = a => D.APPS[a][lang]
const WALL = `<svg viewBox="0 0 400 860" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#15304d"/><stop offset=".42" stop-color="#2f5d80"/><stop offset=".62" stop-color="#c98a5e"/><stop offset=".7" stop-color="#f0b27a"/></linearGradient>
<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d5f7d"/><stop offset="1" stop-color="#132538"/></linearGradient></defs>
<rect width="400" height="860" fill="url(#sky)"/><circle cx="262" cy="598" r="26" fill="#ffd9a0" opacity=".9"/>
<path d="M0 560 C60 548 100 556 150 548 C210 538 250 552 300 546 C340 541 372 548 400 544 V612 H0Z" fill="#2c3f52"/>
<path d="M-10 590 C40 572 70 584 110 576 C150 568 180 588 230 590 V614 H-10Z" fill="#203142"/>
<rect y="612" width="400" height="248" fill="url(#sea)"/>
<g fill="#ffd9a0" opacity=".55"><rect x="240" y="620" width="44" height="3"/><rect x="232" y="634" width="60" height="2.5"/><rect x="246" y="650" width="34" height="2"/><rect x="226" y="668" width="70" height="2"/><rect x="250" y="690" width="26" height="2"/></g>
<g fill="#fff" opacity=".7"><circle cx="40" cy="80" r="1"/><circle cx="120" cy="140" r="1.2"/><circle cx="330" cy="60" r="1"/><circle cx="270" cy="190" r="1"/><circle cx="70" cy="260" r="1"/><circle cx="360" cy="300" r="1.2"/></g></svg>`
const AD_ART = '<svg viewBox="0 0 120 80" aria-hidden="true"><circle cx="38" cy="42" r="20" fill="#cfefff" stroke="#111" stroke-width="5"/><circle cx="82" cy="42" r="20" fill="#cfefff" stroke="#111" stroke-width="5"/><path d="M58 40q2-5 4 0" stroke="#111" stroke-width="5" fill="none"/><path d="M18 38 4 30M102 38l14-8" stroke="#111" stroke-width="4"/><path d="M30 34q4-5 9-5M74 34q4-5 9-5" stroke="#fff" stroke-width="3" fill="none"/></svg>'
const THUMB = '<svg viewBox="0 0 90 120" aria-hidden="true"><rect width="90" height="120" fill="#c9b8a4"/><rect y="70" width="90" height="50" fill="#8f7d68"/><ellipse cx="40" cy="70" rx="58" ry="66" fill="#e7b48f" opacity=".96"/><ellipse cx="34" cy="36" rx="20" ry="16" fill="#f3cfb1" opacity=".8"/><path d="M8 104q30-12 64 2" stroke="#c98d68" stroke-width="3" fill="none" opacity=".6"/></svg>'

// ---- 状態
const G = {
  scene: 'title', t: 0, script: [], si: 0, banners: [], counts: {}, ignored: 0, spikes: [], chips: [], bins: [], log: [],
  name: '', oshi: '', weak: null, lost: null, gag: {}, clockStop: 0, battPct: 64, nextChip: 0, bulkAcc: 0, waitI: -1, openT: 0, crackN: 0, lastTouch: null,
}
const phone = $('#phone'), grid = $('#grid'), dock = $('#dock'), bannersEl = $('#banners'), pile = $('#pile')

function show(id) { for (const v of ['vTitle', 'vPlay', 'vEnd']) $('#' + v).hidden = v !== id; $('#corner').hidden = id === 'vPlay' }
function fmtS(s) { return (Math.floor(s * 10) / 10).toFixed(1) }
function fill(s) { return s.replace(/\{n\}/g, G.name).replace(/\{o\}/g, G.oshi) }

// ---- タイトル（問診票）
function buildTitle() {
  const u = T()
  document.documentElement.lang = lang
  document.title = lang === 'ja' ? 'ドーパミン中毒診断｜スマホ依存度が秒数でわかるゲーム' : 'Dopamine Addiction Test'
  const best = store.get('best', null)
  const d = new Date()
  $('#paper').innerHTML = `<div class="fh"><span>${u.form}</span><span>${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}</span></div>` +
    `<h1>${lang === 'ja' ? 'ドーパミン<wbr>中毒診断' : esc(u.title)}</h1>` +
    `<div class="fr"><span>${u.fName}</span><b>${u.vName}</b></div>` +
    `<div class="fr"><span>${u.fBest}</span><b>${best == null ? u.vNone : fmtS(best) + u.sec}</b></div>` +
    `<div class="fr"><span>${u.fTime}</span><b>${u.vTime}</b></div>` +
    `<div class="fq"><i class="on"></i>${u.q1}</div><div class="fq"><i class="on"></i>${u.q2}</div><div class="fq x"><i class="on"></i>${u.q3}</div><div class="fq x"><i></i>${u.q4}</div>`
  $('#signL').textContent = lang === 'ja' ? '受付' : 'DESK'; { const m = lang === 'ja' ? 'ただいま診断中です　しばらくお待ちください　　' : 'Testing in progress. Please wait.　　'; $('#signT').textContent = m + m }
  $('#bStart').textContent = u.start; $('#bHow').textContent = u.how
  $('#bLang').textContent = lang === 'ja' ? 'EN' : '日本語'
  $('#loadTxt').textContent = u.load
}
function buildHow() {
  const u = T()
  $('#howH').textContent = u.howH
  $('#howBody').innerHTML = `<ol><li>${u.how1}</li><li>${u.how2}</li><li>${u.how3}</li></ol><small>${u.credit}<br><a href="privacy.html" target="_blank" rel="noopener">${u.privacy}</a></small>`
  $('#howClose').textContent = u.close
}
function setMuteIcons() { for (const b of document.querySelectorAll('.wv')) b.style.opacity = Snd.muted ? '0' : '1' }
function toggleMute() { Snd.setMute(!Snd.muted); try { localStorage.setItem('dc_mute', Snd.muted ? '1' : '0') } catch (e) {} setMuteIcons() }

// ---- ホーム画面
function iconHTML(a, inDock) { return `<div class="ic" data-k="icon:${a}" data-app="${a}"><div class="sq" style="${appBg(a)}">${glyph(a)}</div><b class="bdg" hidden></b>${inDock ? '' : `<span class="lb">${esc(appName(a))}</span>`}</div>` }
function buildHome() {
  $('#wall').innerHTML = WALL
  grid.innerHTML = D.GRID.map(a => iconHTML(a)).join('')
  dock.innerHTML = D.DOCK.map(a => iconHTML(a, true)).join('')
  const d = new Date(), wd = lang === 'ja' ? '日月火水木金土'[d.getDay()] : ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][d.getDay()]
  for (const e of document.querySelectorAll('.cw')) e.textContent = wd
  for (const e of document.querySelectorAll('.cd')) e.textContent = d.getDate()
  $('#wDate').textContent = lang === 'ja' ? `${d.getMonth() + 1}月${d.getDate()}日 ${wd}曜日` : `${wd} ${d.getMonth() + 1}/${d.getDate()}`
  $('#wPlace').textContent = T().weatherWhere; $('#wSky').textContent = T().sunny
  fitHome()
}
// 縦の空きからアイコンの大きさと行の間を決める（小さい画面でも一画面に収める）
function fitHome() {
  const W0 = Math.min(innerWidth, 480), H = innerHeight
  let isz = Math.min(62, Math.floor((W0 - 40 - 24) / 4 * 0.8))
  const wh = Math.min(170, (W0 - 56) / 2)
  const need = 30 + 6 + wh + 44 + 3 * (isz + 16) + 27 + (isz + 24) + 20
  let rg = 14
  if (need > H) { const over = need - H; isz = Math.max(46, isz - Math.ceil(over / 5)); rg = 8 }
  phone.style.setProperty('--isz', isz + 'px'); phone.style.setProperty('--rg', rg + 'px')
}

// ---- 台本（毎回くじで並びと中身が変わる）
function buildScript() {
  const s = []
  const add = (t, type, o = {}) => s.push({ t, type, ...o })
  const jit = (t, a = 0.8) => t + (rnd() * 2 - 1) * a
  const L1 = shuffle(D.N.filter(n => n.lv === 1)), L2 = shuffle(D.N.filter(n => n.lv === 2)), L3 = shuffle(D.N.filter(n => n.lv === 3 && n.k !== 'soon'))
  const t1 = [2.5, 6, 9.5, 13, 17, 24, 34], t2 = [20, 27.5, 31, 40, 44, 48, 51.5, 55, 61, 64, 73, 81, 92, 102, 112, 116], t3 = [120.5, 124.5, 133.5, 137, 142, 174, 178, 187.5, 191, 205, 214, 218, 222, 225.5, 229, 235, 241]
  // 同じ通知が2回出ないように、段ごとの山から順に引く（足りなければ次の段から）
  const take = (...qs) => { for (const q of qs) if (q.length) return q.shift(); return pick(D.N) }
  t1.forEach(t => add(jit(t, 0.5), 'n', { n: take(L1, L2) }))
  t2.forEach(t => add(jit(t), 'n', { n: take(L2, L1, L3) }))
  t3.forEach(t => add(jit(t), 'n', { n: take(L3, L2, L1) }))
  if (G.weak && D.AGAIN[G.weak]) for (const t of [16.5, 51.5, 95]) add(jit(t, 0.4), 'n', { n: D.AGAIN[G.weak], again: true })
  add(150, 'n', { n: D.FIXED.midnight }); add(166, 'n', { n: D.N.find(n => n.k === 'soon') }); add(184, 'n', { n: D.FIXED.sugoi })
  add(255, 'n', { n: D.FIXED.share }); add(260.5, 'n', { n: D.FIXED.again }); add(266, 'n', { n: D.FIXED.saved }); add(271.5, 'n', { n: D.FIXED.print })
  add(285.5, 'n', { n: D.FIXED.batt2 }); add(290, 'n', { n: D.FIXED.last })
  const gA = shuffle(['hima', 'off', 'ad']), gB = shuffle(['clock', 'endbtn', 'call', 'dim', 'update'])
  ;[36, 58, 77].forEach((t, i) => add(t, 'gag', { g: gA[i] }))
  ;[87, 97, 107.5, 130, 155.5].forEach((t, i) => add(t, 'gag', { g: gB[i] }))
  add(30, 'fx', { f: 'bulk1' }); add(70, 'fx', { f: 'jiggle' }); add(104, 'fx', { f: 'crack' }); add(128, 'fx', { f: 'bulk2' }); add(147, 'fx', { f: 'crack' })
  add(160, 'fx', { f: 'chaos' }); add(170, 'fx', { f: 'rearr' }); add(196, 'fx', { f: 'unrearr' }); add(200, 'fx', { f: 'crack' }); add(210, 'gag', { g: 'hima2' }); add(246, 'fx', { f: 'crack' })
  add(250, 'fx', { f: 'fake' }); add(277, 'fx', { f: 'unfake' }); add(281, 'fx', { f: 'final' }); add(294.5, 'fx', { f: 'black' })
  s.sort((a, b) => a.t - b.t)
  return s
}

// ---- 始める
let wake = null
async function wakeOn() { try { if (navigator.wakeLock) wake = await navigator.wakeLock.request('screen') } catch (e) { wake = null } }
function wakeOff() { try { if (wake) wake.release() } catch (e) {} wake = null }
function startGame() {
  Snd.init()
  G.scene = 'play'; G.t = 0; G.si = 0; G.banners = []; G.counts = {}; G.ignored = 0; G.spikes = []; G.chips = []; G.log = []
  G.lost = null; G.gag = {}; G.clockStop = 0; G.battPct = 64; G.nextChip = 0; G.bulkAcc = 0; G.waitI = -1; G.crackN = 0; G.bulk = 0; G.lastTouch = null
  G.name = pick(D.NAMES[lang]); G.oshi = pick(D.OSHI[lang]); G.weak = store.get('weak', null)
  G.bins = new Array(48).fill(0)
  G.script = buildScript()
  buildHome()
  bannersEl.innerHTML = ''; pile.innerHTML = ''; $('#crack').innerHTML = ''
  for (const id of ['#hima', '#endBtn', '#ad', '#sheet', '#call', '#dimOv', '#fakeEnd', '#black', '#openApp', '#slotEl', '#wNote']) $(id).hidden = true
  grid.classList.remove('jig', 'rearr'); dock.classList.remove('jig'); phone.classList.remove('off')
  for (const ic of document.querySelectorAll('.ic')) ic.style.transform = ''
  $('#wSec').classList.remove('stop')
  show('vPlay')
  Snd.loop('bgm', 'snd/hold.mp3', 0.2); Snd.loop('amb', 'snd/amb_clock.mp3', 0.32)
  wakeOn()
  if (window.TM) TM.start()
  render()
}

// ---- 通知
function bump(a, n = 1, loud) {
  G.counts[a] = (G.counts[a] || 0) + n
  const el = document.querySelector(`.ic[data-app="${a}"] .bdg`); if (!el) return
  const c = G.counts[a]
  el.hidden = false; el.textContent = c < 100 ? c : c < 1000 ? '99+' : c < 10000 ? '999+' : '9999+'
  el.classList.toggle('l1', c >= 100 && c < 1000); el.classList.toggle('l2', c >= 1000 && c < 10000); el.classList.toggle('l3', c >= 10000)
  if (loud) { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop') }
}
function notify(n) {
  const u = T(), sys = !!n.sys
  const from = n.from ? (typeof n.from === 'string' ? fill(n.from) : n.from[lang]) : ''
  const body = fill(n[lang][0])
  const el = document.createElement('div')
  el.className = 'bn' + (sys ? ' sys' : ''); el.dataset.k = n.k
  el.innerHTML = `<span class="bi" style="${appBg(n.app)}">${glyph(n.app)}</span><div class="bt"><div class="bh"><b>${esc(appName(n.app))}</b><i>${u.now}</i></div>${from ? `<div class="bf">${esc(from)}</div><div class="bb">${esc(body)}</div>` : `<div class="bf">${esc(body)}</div>`}</div>`
  el._n = n
  bannersEl.appendChild(el)
  const life = G.t < 120 ? 5 : G.t < 200 ? 4.2 : 3.6
  G.banners.unshift({ el, life, n })
  const max = G.t < 120 ? 2 : G.t < 200 ? 3 : 4
  while (G.banners.length > max) dropBanner(G.banners[G.banners.length - 1])
  requestAnimationFrame(() => { el.classList.add('in'); layoutBanners() })
  bump(n.app, 1, true)
  G.spikes.push([G.t, n.lv || 2])
  G.log.push([G.t, 'n:' + n.k])
  Snd.play('notif', { vol: 0.7 })
  if (G.t > 40 && rnd() < 0.5) { Snd.play('buzz', { vol: 0.45, delay: 0.05 }); buzzPhone() }
}
function dropBanner(b) { G.banners = G.banners.filter(x => x !== b); b.el.classList.add('out'); G.ignored++; setTimeout(() => b.el.remove(), 420); layoutBanners() }
function layoutBanners() { let y = 0; for (const b of G.banners) { b.el.style.setProperty('--y', y + 'px'); b.el.style.zIndex = 100 - G.banners.indexOf(b); y += (b.el.offsetHeight || 70) + 8 } }
function buzzPhone() { phone.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-2px)' }, { transform: 'translateX(2px)' }, { transform: 'translateX(0)' }], { duration: 120, iterations: 3 }) }
function hud(t, sec = 1.6) { const e = $('#hud'); e.textContent = t; e.classList.add('on'); G.hudT = sec }

// ---- 仕掛け
function gag(g) {
  const u = T()
  G.log.push([G.t, 'g:' + g]); G.spikes.push([G.t, 2.5])
  if (g !== 'dim' && G.gag.dim > 0) { G.gag.dim = 0; G.gag.dimIn = 0; $('#dimOv').hidden = true }
  if (g === 'hima' || g === 'hima2') { const h = $('#hima'); h.textContent = g === 'hima' ? u.hima : (lang === 'ja' ? 'まだ暇ですか？' : 'Still bored?'); h.hidden = false; G.gag.hima = 6; Snd.play('pop', { vol: 0.6 }) }
  if (g === 'off') { sheet(u.offH, u.offB, u.offY, 'off', u.offN, 'later'); G.gag.sheet = 8 }
  if (g === 'update') { sheet(u.upH, u.upB, u.upY, 'upnow', u.upN, 'upnight'); G.gag.sheet = 8 }
  if (g === 'ad') { $('#adArt').innerHTML = AD_ART; $('#adH').textContent = u.adH; $('#adS').textContent = u.adS; $('#ad .x').textContent = u.adClose + ' ×'; $('#ad').hidden = false; G.gag.ad = 9; G.gag.adCnt = 5; Snd.play('pop', { vol: 0.8 }) }
  if (g === 'endbtn') { const b = $('#endBtn'); b.textContent = u.endBtn; b.hidden = false; G.gag.endbtn = 44 }
  if (g === 'call') { $('#callWho').textContent = u.callWho; $('#callSub').textContent = u.callSub; $('#callYes').textContent = u.callYes; $('#callNo').textContent = u.callNo; $('#call').hidden = false; G.gag.call = 9; G.gag.ringT = 0 }
  if (g === 'dim') { hud(u.dimMsg, 1.8); G.gag.dimIn = 1.8; G.gag.dim = 9.2 }
  if (g === 'clock') { G.clockStop = 6; $('#wSec').classList.add('stop'); Snd.loopVol('amb', 0.0001, 0.05) }
}
function sheet(h, b, y, ky, n, kn) { $('#shH').textContent = h; $('#shB').textContent = b; const Y = $('#shY'), N = $('#shN'); Y.textContent = y; Y.dataset.k = ky; N.textContent = n; N.dataset.k = kn; $('#sheet').hidden = false; Snd.play('pop', { vol: 0.6 }) }
function fx(f) {
  G.log.push([G.t, 'f:' + f])
  if (f === 'bulk1') G.bulk = 1
  if (f === 'bulk2') G.bulk = 2
  if (f === 'chaos') G.bulk = 3
  if (f === 'jiggle') { grid.classList.add('jig'); dock.classList.add('jig') }
  if (f === 'crack') { addCrack(); Snd.play('crack', { vol: 0.5 + G.crackN * 0.1 }); G.spikes.push([G.t, 2]) }
  if (f === 'rearr') rearrange(true)
  if (f === 'unrearr') rearrange(false)
  if (f === 'fake') showFake()
  if (f === 'unfake') { const e = $('#fakeEnd'); e.classList.add('glitch'); Snd.play('crack', { vol: 0.7 }); setTimeout(() => { if (G.scene === 'play') { e.hidden = true; e.classList.remove('glitch'); hud(T().notYet, 2); Snd.loopVol('bgm', 0.2, 0.4); Snd.loopRate('bgm', 0.85, 0.3) } }, 750) }
  if (f === 'final') { G.final = true; Snd.loopRate('bgm', 0.62, 7); hud(T().battOut, 2.2) }
  if (f === 'black') { $('#black').hidden = false; $('#blackT').textContent = T().battOut; Snd.loop('bgm', null, 0.3); Snd.loop('amb', null, 0.3); Snd.play('off', { vol: 0.8, jitter: 0 }); for (const b of G.banners.slice()) dropBanner(b) }
}
function rearrange(on) {
  const ics = [...grid.querySelectorAll('.ic')], slot = $('#slotEl')
  if (!on) { for (const ic of ics) ic.style.transform = ''; slot.hidden = true; return }
  grid.classList.add('rearr')
  const gr = grid.getBoundingClientRect(), pr = phone.getBoundingClientRect()
  ics.forEach((ic, i) => { const r = ic.getBoundingClientRect(), side = i % 2 ? 1 : -1; const tx = side > 0 ? gr.right - r.right + 6 - (i % 3) * 6 : gr.left - r.left - 6 + (i % 3) * 6; ic.style.transform = `translate(${tx}px,${(i % 4 - 1.5) * 4}px) rotate(${side * (6 + i % 3 * 4)}deg)` })
  const isz = parseFloat(getComputedStyle(phone).getPropertyValue('--isz')) || 62
  slot.textContent = T().slot; slot.style.left = (gr.left - pr.left + gr.width / 2 - isz / 2) + 'px'; slot.style.top = (gr.top - pr.top + gr.height / 2 - isz / 2) + 'px'
  setTimeout(() => { if (G.scene === 'play' && G.t < 196) slot.hidden = false }, 900)
}
function addCrack() {
  G.crackN++
  const svg = $('#crack'), ox = 300, oy = 700
  let d = ''
  const n = 3 + G.crackN * 3
  for (let i = 0; i < n; i++) {
    let x = ox, y = oy, a = rnd() * Math.PI * 2, len = 40 + G.crackN * 50 + rnd() * 60
    d += `M${x.toFixed(0)} ${y.toFixed(0)}`
    for (let k = 0; k < 5; k++) { a += (rnd() - 0.5) * 0.9; x += Math.cos(a) * len / 5; y += Math.sin(a) * len / 5; d += ` L${x.toFixed(0)} ${y.toFixed(0)}` }
  }
  if (G.crackN >= 3) for (let r = 1; r <= G.crackN - 2; r++) { const R = 22 * r + rnd() * 10; d += ` M${ox + R} ${oy}`; for (let k = 1; k <= 9; k++) { const a = k / 9 * Math.PI * 2; d += ` L${(ox + Math.cos(a) * R * (0.85 + rnd() * 0.3)).toFixed(0)} ${(oy + Math.sin(a) * R * (0.85 + rnd() * 0.3)).toFixed(0)}` } }
  svg.insertAdjacentHTML('beforeend', `<path d="${d}" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="2.4"/><path d="${d}" fill="none" stroke="rgba(255,255,255,.82)" stroke-width="1.1"/>`)
}
function showFake() {
  const e = $('#fakeEnd'), u = T(), s = G.t - 2.4
  e.innerHTML = reportHTML({ secs: s, tier: D.TIERS[7], got: u.fakeGot, sub: '', ignored: G.ignored, fake: true }) +
    `<div class="endBtns"><button class="again">${u.again}</button><div class="row2"><button>${u.save}</button><button>${u.post}</button></div></div><div class="fc"><i>${lang === 'ja' ? 'EN' : '日本語'}</i><i><svg viewBox="0 0 24 24" fill="#f2f4f2" width="20" height="20" style="vertical-align:middle"><path d="M3 9h4l6-5v16l-6-5H3z"/><path d="M15 8.5a5 5 0 0 1 0 7v-2.2a2.6 2.6 0 0 0 0-2.6zM17 5a9 9 0 0 1 0 14v-2.4a6.6 6.6 0 0 0 0-9.2z"/></svg></i></div>`
  e.hidden = false
  const rep = e.querySelector('.rep'); rep.classList.add('in')
  drawWave(e.querySelector('canvas'), s, true)
  for (const b of G.banners.slice()) dropBanner(b)
  Snd.loopVol('bgm', 0.0001, 0.2); Snd.play('paper', { vol: 0.8 }); setTimeout(() => { if (G.scene === 'play') Snd.play('j_high', { vol: 0.7, jitter: 0 }) }, 650)
}

const FAKE_N = ['share', 'again', 'saved', 'print']
// ---- 毎フレーム（固定60Hz）
function update(dt) {
  if (G.scene !== 'play') return
  G.t += dt
  while (G.si < G.script.length && G.script[G.si].t <= G.t) {
    const e = G.script[G.si++]
    if (G.t > 249.5 && G.t < 277 && e.type === 'n' && !FAKE_N.includes(e.n.k)) continue   // 偽の結果の間は結果らしい通知だけ
    if (e.t >= 294.5 && e.type !== 'fx') continue
    if (e.type === 'n') notify(e.n); else if (e.type === 'gag') gag(e.g); else fx(e.f)
  }
  for (const b of G.banners.slice()) { b.life -= dt; if (b.life <= 0) dropBanner(b) }
  // 赤い数字（後半ほど増える）
  const rate = G.bulk === 1 ? 0.6 : G.bulk === 2 ? 6 : G.bulk === 3 ? Math.min(900, 25 * Math.pow(1.035, G.t - 160)) : 0
  if (rate && !G.final) {
    G.bulkAcc += rate * dt
    while (G.bulkAcc >= 1) {
      const n = G.bulkAcc > 60 ? Math.floor(G.bulkAcc * (0.3 + rnd() * 0.5)) : 1
      G.bulkAcc -= n
      bump(pick(D.GRID.concat(D.DOCK)), n, rnd() < 0.15)
    }
  }
  // 数字があふれて落ちてくる
  if (G.bulk === 3 && G.t < 250 && G.chips.length < 150) {
    G.nextChip -= dt
    if (G.nextChip <= 0) { spawnChip(); G.nextChip = Math.max(0.12, 1.1 - (G.t - 160) * 0.012) }
  }
  stepChips(dt)
  // 仕掛けの時間切れ
  const gg = G.gag
  if (gg.hima > 0 && (gg.hima -= dt) <= 0) $('#hima').hidden = true
  if (gg.sheet > 0 && (gg.sheet -= dt) <= 0) $('#sheet').hidden = true
  if (gg.ad > 0) { gg.ad -= dt; gg.adCnt -= dt; $('#adCnt').textContent = T().adCount(Math.max(0, Math.ceil(gg.adCnt))); if (gg.ad <= 0) $('#ad').hidden = true }
  if (gg.endbtn > 0 && (gg.endbtn -= dt) <= 0) $('#endBtn').hidden = true
  if (gg.call > 0) {
    gg.ringT -= dt
    if (gg.ringT <= 0) { Snd.play('ring', { vol: 0.75, jitter: 0 }); Snd.play('buzz', { vol: 0.5 }); buzzPhone(); gg.ringT = 3.4 }
    if ((gg.call -= dt) <= 0) { $('#call').hidden = true; bump('phone', 1, true) }
  }
  if (gg.dimIn > 0 && (gg.dimIn -= dt) <= 0) { $('#dimHint').textContent = T().dimHint; $('#dimOv').hidden = false }
  if (gg.dim > 0 && (gg.dim -= dt) <= 0) $('#dimOv').hidden = true
  if (G.clockStop > 0 && (G.clockStop -= dt) <= 0) { $('#wSec').classList.remove('stop'); const n = $('#wNote'); n.textContent = T().clockNote; n.hidden = false; G.noteT = 2.5; Snd.loopVol('amb', 0.32, 0.1) }
  if (G.noteT > 0 && (G.noteT -= dt) <= 0) $('#wNote').hidden = true
  if (G.hudT > 0 && (G.hudT -= dt) <= 0) $('#hud').classList.remove('on')
  // 電池
  G.battPct = G.final ? Math.max(1, G.battPct - dt * 9) : 64 - G.t * 0.05
  if (G.t >= END) lose('none')
}
function spawnChip() {
  const src = [...document.querySelectorAll('.bdg:not([hidden])')]
  const pr = phone.getBoundingClientRect()
  let x = rnd() * (pr.width - 40) + 10, y = 120
  if (src.length) { const r = pick(src).getBoundingClientRect(); x = r.left - pr.left; y = r.top - pr.top }
  const el = document.createElement('b'); el.className = 'chip'; el.dataset.k = 'badge'
  el.textContent = pick(['99+', '999+', '9999+', String(1 + Math.floor(rnd() * 98)), '999+'])
  pile.appendChild(el)
  G.chips.push({ el, x, y, vx: (rnd() - 0.5) * 80, vy: -60 - rnd() * 80, rot: (rnd() - 0.5) * 40, vr: (rnd() - 0.5) * 300, rest: false, w: 34 })
  G.log.push([G.t, 'chip'])
  if (rnd() < 0.3) Snd.play('pop', { vol: 0.35, rate: 1.2 })
}
function stepChips(dt) {
  if (!G.chips.length) return
  const pr = phone.getBoundingClientRect(), H = pr.height, Wd = pr.width, bw = Wd / G.bins.length
  for (const c of G.chips) {
    if (c.rest) continue
    c.vy += 900 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.rot += c.vr * dt
    if (c.x < 0) { c.x = 0; c.vx = -c.vx * 0.5 } if (c.x > Wd - c.w) { c.x = Wd - c.w; c.vx = -c.vx * 0.5 }
    const bi = Math.max(0, Math.min(G.bins.length - 1, Math.floor((c.x + c.w / 2) / bw)))
    const floor = H - 24 - G.bins[bi]
    if (c.y >= floor) { c.y = floor; c.rest = true; c.rot = (rnd() - 0.5) * 50; for (let k = -1; k <= 1; k++) { const j = bi + k; if (j >= 0 && j < G.bins.length) G.bins[j] += k ? 7 : 14 } }
    c.el.style.transform = `translate(${c.x.toFixed(1)}px,${c.y.toFixed(1)}px) rotate(${c.rot.toFixed(0)}deg)`
  }
}

// ---- 描く（時計と電池）
function render() {
  if (G.scene !== 'play') return
  if (G.clockStop <= 0) G.shownT = G.t
  const base = (23 * 3600 + 57 * 60 + 30 + Math.floor(G.shownT || 0)) % 86400
  const hh = Math.floor(base / 3600), mm = Math.floor(base / 60) % 60, ss = base % 60
  const hm = `${hh}:${String(mm).padStart(2, '0')}`
  if ($('#wTime').textContent !== hm) { $('#wTime').textContent = hm; $('#sTime').textContent = hm }
  const sx = String(ss).padStart(2, '0'); if ($('#wSec').textContent !== sx) $('#wSec').textContent = sx
  const p = Math.round(G.battPct), pe = $('#sPct'); if (pe.textContent !== p + '%') { pe.textContent = p + '%'; $('#sFill').style.width = p + '%'; $('#sBatt').classList.toggle('low', p <= 20) }
  let wi = 0; for (let i = 0; i < D.WAIT.length; i++) if (G.t >= D.WAIT[i][0]) wi = i
  if (wi !== G.waitI) { G.waitI = wi; $('#waitT').textContent = D.WAIT[wi][lang === 'ja' ? 1 : 2] }
}

// ---- 触った（負け）
function keyOf(el) { const h = el && el.closest && el.closest('[data-k]'); return h ? h.dataset.k : 'empty' }
function lose(k, el, x, y) {
  if (G.scene !== 'play') return
  if (k !== 'none' && k !== 'away' && G.t < 0.3) return
  G.scene = 'open'
  const u = T(), secs = k === 'none' ? END : G.t
  let bn0 = null, label = '', sub = '', cat = 'empty', h = '', b = '', app = 'set', style = 'card', from = ''
  if (k === 'none') { label = u.none; sub = u.noneSub; cat = null }
  else if (k === 'away') { label = u.awayH; sub = u.awaySub; cat = null }
  else {
    const bn = el && el.closest && el.closest('.bn')
    if (bn && bn._n) {
      const n = bn._n; bn0 = n; app = n.app; cat = n.cat
      from = n.from ? (typeof n.from === 'string' ? fill(n.from) : n.from[lang]) : ''
      label = (from ? from + (lang === 'ja' ? '：' : ': ') : '') + fill(n[lang][0])
      h = fill(n[lang][1][0]); b = fill(n[lang][1][1]); sub = b
      style = n.app === 'talk' ? 'chat' : n.k === 'photo' || n.k === 'r_sns' ? 'photo' : 'card'
    } else if (k.startsWith('icon:') || k === 'weather') {
      app = k === 'weather' ? 'weather' : k.slice(5); cat = 'app'
      const c = G.counts[app] || 0
      label = lang === 'ja' ? `「${appName(app)}」のアイコン` : `The ${appName(app)} icon`
      h = appName(app); b = c ? (lang === 'ja' ? `未読 ${c.toLocaleString()}件` : `${c.toLocaleString()} unread`) : (lang === 'ja' ? '未読 0件' : '0 unread')
      sub = b; k = 'icon'
    } else {
      const tr = D.TRAP[k] || D.TRAP.empty
      if (!D.TRAP[k]) k = 'empty'
      app = tr.app || 'set'; cat = tr.cat
      h = tr[lang][0]; b = tr[lang][1]; sub = h + (lang === 'ja' ? (/^[がをにとで]/.test(b) ? '' : '　') : ' ') + b
      const src = el && el.closest && el.closest('[data-k]')
      const txt = src && src !== phone && src.id !== 'fakeEnd' && src.id !== 'dimOv' && src.id !== 'black' && src.id !== 'call' ? src.textContent.trim().replace(/\s+/g, ' ') : ''
      const ja = lang === 'ja', shH = $('#shH').textContent
      label = { empty: ja ? '何もない所' : 'Nothing at all', hima: ja ? 'おてんきの「暇ですか？」' : 'Weather asking "Bored?"', ad: ja ? `広告「${u.adH}」` : `The ad "${u.adH}"`, later: `「${shH}」${ja ? 'の' : ': '}「${txt}」`, upnow: `「${shH}」${ja ? 'の' : ': '}「${txt}」`, upnight: `「${shH}」${ja ? 'の' : ': '}「${txt}」`, sbar: lang === 'ja' ? '画面の上の端' : 'The top edge', clock: lang === 'ja' ? '時計' : 'The clock', fake: lang === 'ja' ? '診断結果（にせもの）' : 'The test result (fake)', dim: lang === 'ja' ? '暗くなった画面' : 'The dimmed screen', black: lang === 'ja' ? '電池の切れた画面' : 'The dead screen', callyes: lang === 'ja' ? '非通知の電話' : 'A call from Unknown', badge: lang === 'ja' ? '落ちてきた赤い数字' : 'A fallen red badge' }[k] || (txt ? `「${txt.slice(0, 22)}」` : k)
      if (k === 'callno') label = lang === 'ja' ? '非通知の電話の「拒否」' : '"Decline" on the Unknown call'
    }
  }
  G.lost = { k, secs, label, sub, cat }
  Snd.loop('bgm', null, 0.15); Snd.loop('amb', null, 0.15)
  wakeOff()
  // 記録
  const found = store.get('found', []); if (!found.includes(k)) { found.push(k); store.set('found', found) }
  G.lost.found = found.length
  if (cat) store.set('weak', cat)
  G.lost.weak = cat
  const best = store.get('best', null); G.lost.newBest = best == null || secs > best; if (G.lost.newBest) store.set('best', secs)
  if (k === 'none' || k === 'away') { finish(); return }
  // 開いてしまった画面（中身のオチ）
  const o = $('#openApp'), pr = phone.getBoundingClientRect()
  o.style.setProperty('--ox', ((x == null ? pr.width / 2 : x - pr.left) | 0) + 'px'); o.style.setProperty('--oy', ((y == null ? pr.height / 2 : y - pr.top) | 0) + 'px')
  let body = ''
  const exp = G.lost.label && k !== 'empty' ? `<div class="exp"><small>${lang === 'ja' ? '開いたもの' : 'You opened'}</small>${esc(G.lost.label)}</div>` : ''
  if (style === 'chat') body = `<div class="chat"><span class="nm">${esc(from || h)}</span><div class="bu">${esc(fill(bn0 ? bn0[lang][0] : ''))}</div><div class="bu pay">${esc(b)}</div>${/既読|Seen/.test(h) ? `<span class="seen pay">${esc(h)}</span>` : ''}</div>`
  else if (style === 'photo') body = `${exp}<div class="photo pay">${THUMB}</div><p class="big pay">${esc(b)}</p>`
  else body = `${exp}<span class="bigi" style="${appBg(app)}">${glyph(app)}</span><p class="small pay">${esc(h)}</p><p class="big pay">${esc(b)}</p>`
  o.innerHTML = `<div class="oh" style="${appBg(app)};${D.APPS[app].c[0] === '#ffffff' || D.APPS[app].c[0] === '#f2f2f2' ? 'color:#111' : ''}"><span class="bi" style="${appBg(app)}">${glyph(app)}</span>${esc(appName(app))}</div><div class="ob">${body}</div>`
  o.hidden = false
  Snd.play('open', { vol: 0.8, jitter: 0 })
  setTimeout(() => { if (G.scene === 'open') Snd.play('pop', { vol: 0.7, rate: 0.85 }) }, 560)
  G.openT = 2.9
}
function finish() {
  G.scene = 'end'
  const R = G.lost
  R.tier = tierOf(R.secs)
  R.ignored = G.ignored + G.banners.length
  if (window.TM) TM.end(Math.round(R.secs * 10) / 10, R.k === 'none')
  renderReport()
  show('vEnd')
  Snd.play('paper', { vol: 0.8 })
  const j = R.secs >= 150 ? 'j_high' : R.secs >= 30 ? 'j_mid' : 'j_low'
  setTimeout(() => Snd.play(j, { vol: 0.8, jitter: 0 }), 600)
}
function tierOf(s) { let t = D.TIERS[0]; for (const x of D.TIERS) if (s >= x.s - 1e-6) t = x; return t }
function totalWays() { return D.N.length + Object.keys(D.FIXED).length + Object.keys(D.AGAIN).length + Object.keys(D.TRAP).length + 2 }

// ---- 結果（検査の記録紙）
function reportHTML(R) {
  const u = T(), d = new Date()
  const tierName = R.tier[lang], com = lang === 'ja' ? R.tier.jc : R.tier.ec
  const head = `<div class="rh"><b>${u.repH}</b><span>${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}</span></div>`
  const main = `<div class="rm"><div class="rs"><small>${u.lasted}</small><b>${fmtS(R.secs)}</b><i>${u.sec}</i></div><div class="st"><small>${u.judge}</small><b>${esc(tierName)}</b></div></div>`
  const got = `<div class="rg"><small>${u.got}</small><b>${esc(R.got)}</b>${R.sub ? `<span>${esc(R.sub)}</span>` : ''}</div>`
  const foot = `<div class="rf"><span>${u.ignored(R.ignored)}</span>${R.fake ? '' : `<span>${u.found(R.found, totalWays())}</span>`}</div>`
  const note = R.fake ? '' : `<p class="rn">${u.fine}${R.weak && D.CATS[R.weak] ? '<br>' + u.weak(D.CATS[R.weak][lang]) : ''}</p>`
  return `<div class="rep">${head}${main}<p class="rc">${esc(com)}</p>${got}<div class="wv"><canvas></canvas></div>${foot}${note}</div>`
}
function renderReport() {
  const R = G.lost, u = T()
  const html = reportHTML({ secs: R.secs, tier: R.tier, got: R.label, sub: R.sub, ignored: R.ignored, found: R.found, weak: R.weak })
  const tmp = document.createElement('div'); tmp.innerHTML = html
  const rep = $('#report'); rep.innerHTML = tmp.firstChild.innerHTML
  rep.classList.remove('in'); void rep.offsetWidth; rep.classList.add('in')
  requestAnimationFrame(() => drawWave(rep.querySelector('canvas'), R.secs))
  $('#bAgain').textContent = u.again; $('#bSave').textContent = u.save; $('#bPost').textContent = u.post
}
// 心電図ふうの波形。通知や仕掛けのたびに小さく跳ね、触った瞬間に振り切れる
function drawWave(c, secs, fake) {
  if (!c) return
  const dpr = Math.min(2, devicePixelRatio || 1), w = c.clientWidth || 300, h = c.clientHeight || 60
  c.width = Math.round(w * dpr); c.height = Math.round(h * dpr)
  const x = c.getContext('2d'); x.scale(dpr, dpr)
  waveTo(x, 0, 0, w, h, secs, fake, 2)
}
function waveTo(x, X, Y, w, h, secs, fake, lw) {
  const span = Math.max(20, secs + 2), base = Y + h * 0.62
  const sp = G.spikes.filter(s => s[0] <= secs)
  x.strokeStyle = '#2a1414'; x.lineWidth = lw; x.lineJoin = 'round'; x.beginPath()
  const N = Math.max(120, Math.round(w / 1.5))
  let wob = 1
  for (let i = 0; i <= N; i++) {
    const tt = i / N * span, px = X + i / N * w
    let v = Math.sin(tt * 7.3) * 0.6 + Math.sin(tt * 3.1 + 1) * 0.5
    for (const s of sp) { const dt = tt - s[0]; if (dt > -0.4 && dt < 0.6) v += (dt < 0 ? (dt + 0.4) / 0.4 : Math.max(0, 1 - dt / 0.6)) * s[1] * 7 * (dt < 0.1 ? 1 : -0.4) }
    if (!fake && tt > secs - 0.2) { const k = (tt - secs + 0.2); v += k < 0.3 ? k / 0.3 * h : h * (1 - (k - 0.3) * 1.5) * (Math.floor(tt * 30) % 2 ? 1 : -0.7) }
    wob = v
    const py = Math.max(Y + 2, Math.min(Y + h - 2, base - wob * h / 40))
    if (i) x.lineTo(px, py); else x.moveTo(px, py)
  }
  x.stroke()
}

// ---- 画像（SNS 用）
function drawCard() {
  const c = $('#card'), x = c.getContext('2d'), R = G.lost, u = T(), W0 = c.width, H0 = c.height
  x.fillStyle = '#1b1d1f'; x.fillRect(0, 0, W0, H0)
  const L = 90, Tp = 70, PW = W0 - 180, PH = H0 - 140
  x.fillStyle = '#fff7f5'; x.fillRect(L, Tp, PW, PH)
  x.save(); x.beginPath(); x.rect(L, Tp, PW, PH); x.clip()
  for (let gx = L; gx < L + PW; gx += 14) { x.strokeStyle = (gx - L) % 70 ? 'rgba(226,92,92,.13)' : 'rgba(226,92,92,.34)'; x.lineWidth = 2; x.beginPath(); x.moveTo(gx, Tp); x.lineTo(gx, Tp + PH); x.stroke() }
  for (let gy = Tp; gy < Tp + PH; gy += 14) { x.strokeStyle = (gy - Tp) % 70 ? 'rgba(226,92,92,.13)' : 'rgba(226,92,92,.34)'; x.lineWidth = 2; x.beginPath(); x.moveTo(L, gy); x.lineTo(L + PW, gy); x.stroke() }
  x.restore()
  const MIN = '"Zen Old Mincho","Hiragino Mincho ProN",serif', CODE = '"M PLUS 1 Code","Hiragino Sans",monospace', SYS = '"Hiragino Sans",sans-serif'
  x.fillStyle = '#2a1a1a'; x.font = `900 52px ${MIN}`; x.textBaseline = 'alphabetic'; x.fillText(u.repH, L + 50, Tp + 100)
  x.fillRect(L + 50, Tp + 124, PW - 100, 5)
  x.font = `600 34px ${SYS}`; x.fillStyle = '#6a4a4a'; x.fillText(u.lasted, L + 50, Tp + 200)
  x.font = `700 190px ${CODE}`; x.fillStyle = '#2a1a1a'; const sv = fmtS(R.secs); x.fillText(sv, L + 40, Tp + 380)
  const sw = x.measureText(sv).width; x.font = `700 54px ${CODE}`; x.fillText(u.sec, L + 50 + sw, Tp + 380)
  // はんこ
  x.save(); x.translate(L + PW - 210, Tp + 300); x.rotate(-0.1)
  x.strokeStyle = '#c8102e'; x.lineWidth = 8; x.strokeRect(-170, -110, 340, 220); x.lineWidth = 3; x.strokeRect(-156, -96, 312, 192)
  x.fillStyle = '#c8102e'; x.textAlign = 'center'; x.font = `700 28px ${SYS}`; x.fillText(u.judge, 0, -52)
  const tn = R.tier[lang], lines = lang === 'ja' ? (tn.length > 6 ? [tn.slice(0, Math.ceil(tn.length / 2)), tn.slice(Math.ceil(tn.length / 2))] : [tn]) : tn.split(' ').reduce((a, w) => { if (a.length && (a[a.length - 1] + ' ' + w).length <= 13) a[a.length - 1] += ' ' + w; else a.push(w); return a }, [])
  x.font = `900 ${lang === 'ja' ? 54 : 40}px ${MIN}`; lines.forEach((t, i) => x.fillText(t, 0, 10 + (i - (lines.length - 1) / 2) * 62))
  x.restore(); x.textAlign = 'left'
  // 一番動かしたもの
  x.fillStyle = 'rgba(255,255,255,.9)'; x.fillRect(L + 50, Tp + 450, PW - 100, 230); x.fillStyle = '#c8102e'; x.fillRect(L + 50, Tp + 450, 10, 230)
  x.fillStyle = '#6a4a4a'; x.font = `600 30px ${SYS}`; x.fillText(u.got, L + 84, Tp + 500)
  x.fillStyle = '#1a1010'; x.font = `800 44px ${SYS}`
  wrapText(x, R.label, L + 84, Tp + 562, PW - 160, 56, 2)
  if (R.sub) { x.fillStyle = '#6a4a4a'; x.font = `600 30px ${SYS}`; wrapText(x, R.sub, L + 84, Tp + 655, PW - 160, 36, 1) }
  // 波形
  waveTo(x, L + 50, Tp + 720, PW - 100, 260, R.secs, false, 5)
  x.fillStyle = '#4a3030'; x.font = `500 32px ${CODE}`; x.fillText(u.ignored(R.ignored), L + 50, Tp + 1040)
  x.fillStyle = '#7a6a6a'; x.font = `600 30px ${SYS}`; x.fillText(lang === 'ja' ? 'ドーパミン中毒診断  tom3games.com' : 'Dopamine Addiction Test  tom3games.com', L + 50, Tp + PH - 50)
  return c
}
function wrapText(x, s, X, Y, maxW, lh, maxL) {
  const parts = lang === 'ja' ? [...s] : s.split(' ').map((w, i, a) => i < a.length - 1 ? w + ' ' : w)
  let line = '', n = 0
  for (const ch of parts) { if (x.measureText(line + ch).width > maxW) { if (n === maxL - 1) { x.fillText(line.replace(/.$/, '...'), X, Y + n * lh); return } x.fillText(line, X, Y + n * lh); n++; line = '' } line += ch }
  x.fillText(line, X, Y + n * lh)
}
async function saveCard() {
  const c = drawCard()
  if (window.TM) TM.share('save')
  const blob = await new Promise(r => c.toBlob(r, 'image/png'))
  if (!blob) return
  const file = new File([blob], 'dopamine-check.png', { type: 'image/png' })
  try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file] }); return } } catch (e) { if (e && e.name === 'AbortError') return }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'dopamine-check.png'; document.body.appendChild(a); a.click(); a.remove()
}
function postX() {
  const R = G.lost, u = T()
  if (window.TM) TM.share('x')
  const text = u.share(fmtS(R.secs), R.tier[lang], R.label) + (lang === 'ja' ? ' #ドーパミン中毒診断' : ' #tom3games')
  window.open('https://x.com/intent/post?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent('https://tom3games.com/play/dopamine-check/'), '_blank', 'noopener')
}

// ---- 入力
phone.addEventListener('pointerdown', e => {
  if (e.isPrimary === false) return
  if (G.scene === 'open') { if (G.openT < 1.6) G.openT = 0; return }
  if (G.scene !== 'play') return
  e.preventDefault()
  G.lastTouch = keyOf(e.target)
  lose(G.lastTouch, e.target, e.clientX, e.clientY)
})
phone.addEventListener('contextmenu', e => e.preventDefault())
$('#bStart').addEventListener('click', () => { Snd.init(); Snd.play('ok', { vol: 0.6 }); startGame() })
$('#bHow').addEventListener('click', () => { buildHow(); $('#how').hidden = false })
$('#howClose').addEventListener('click', () => { $('#how').hidden = true })
$('#bLang').addEventListener('click', () => { lang = lang === 'ja' ? 'en' : 'ja'; try { localStorage.setItem('dc_lang', lang) } catch (e) {} buildTitle(); buildHow(); if (G.scene === 'end') renderReport() })
$('#bMute').addEventListener('click', () => { Snd.init(); toggleMute() })
$('#bAgain').addEventListener('click', () => { Snd.play('ok', { vol: 0.6 }); startGame() })
$('#bSave').addEventListener('click', saveCard)
$('#bPost').addEventListener('click', postX)
addEventListener('resize', () => { if (G.scene === 'play') { fitHome(); layoutBanners() } })
// 画面を離れたら（本物のスマホを見に行ったら）そこで終わり
document.addEventListener('visibilitychange', () => { if (document.hidden && G.scene === 'play' && G.t > 0.3) lose('away'); if (!document.hidden) { last = performance.now(); if (G.scene === 'play') wakeOn() } })

// ---- 時計（固定60Hz・performance.now で数える）
let acc = 0, last = performance.now(), paused = false
function frame() {
  const now = performance.now()
  let d = (now - last) / 1000; last = now
  if (d > 0.25) d = 0.25
  if (!paused) { acc += d; while (acc >= STEP) { tick(STEP); acc -= STEP } }
  render()
  requestAnimationFrame(frame)
}
function tick(dt) {
  if (G.scene === 'open') { G.openT -= dt; if (G.openT <= 0) { $('#openApp').hidden = true; finish() } return }
  update(dt)
}

// ---- 検証用の窓口
const rectOf = el => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height } }
window.dc = {
  G, startGame, lose: k => lose(k), finish: () => finish(), drawCard: () => drawCard(), tierOf, totalWays,
  seed: n => { seed = n % 2147483646 + 1 },
  state: () => ({ scene: G.scene, t: G.t, banners: G.banners.map(b => b.n.k), counts: { ...G.counts }, chips: G.chips.length, lost: G.lost && { k: G.lost.k, secs: G.lost.secs, label: G.lost.label, tier: G.lost.tier && G.lost.tier.ja, cat: G.lost.cat }, ignored: G.ignored, gag: { ...G.gag }, weak: G.weak }),
  script: () => G.script.map(e => [Math.round(e.t * 10) / 10, e.type, e.n ? e.n.k : e.g || e.f]),
  bannerXY: () => G.banners.map(b => ({ k: b.n.k, ...rectOf(b.el) })),
  xy: sel => { const e = typeof sel === 'string' ? $(sel) : sel; return e && !e.closest('[hidden]') ? rectOf(e) : null },
  iconXY: a => rectOf(document.querySelector(`.ic[data-app="${a}"] .sq`)),
  topAt: (x, y) => keyOf(document.elementFromPoint(x, y)),
  log: () => G.log.slice(),
  maxGap: (a = 0, b = 300) => { const t = [a].concat(G.log.map(e => e[0]).filter(v => v >= a && v <= b)).concat([Math.min(b, G.t)]).sort((p, q) => p - q); let m = 0, at = 0; for (let i = 1; i < t.length; i++) if (t[i] - t[i - 1] > m) { m = t[i] - t[i - 1]; at = t[i - 1] } return { gap: Math.round(m * 10) / 10, at: Math.round(at) } },
  dbg: {
    pause: on => { paused = !!on; last = performance.now(); acc = 0 },
    step: n => { for (let i = 0; i < (n || 1); i++) tick(STEP); render() },
    skipTo: t => { while (G.scene === 'play' && G.t < t) tick(STEP); render() },
  },
}

// ---- 起動（ロード画面は本物の読み込み数で進む。12秒で必ず消す）
buildTitle(); buildHow(); setMuteIcons(); buildHome()
show('vTitle')
requestAnimationFrame(frame)
;(function boot() {
  const jobs = []
  if (document.fonts && document.fonts.load) {
    jobs.push(document.fonts.load('900 30px "Zen Old Mincho"', 'ドーパミン中毒診断問診票を始める検査結果判定'))
    jobs.push(document.fonts.load('700 30px "M PLUS 1 Code"', '0123456789.秒'))
  }
  for (const u of ['snd/notif1.mp3', 'snd/notif2.mp3', 'snd/pop1.mp3']) jobs.push(fetch(u).catch(() => {}))
  let done = 0
  const num = $('#loadN'), total = jobs.length + 1
  const step = () => { done++; num.textContent = Math.max(1, Math.round(done / total * 99)) }
  step()
  const cap = new Promise(r => setTimeout(r, 3000))
  Promise.race([Promise.all(jobs.map(j => j.then(step, step))), cap]).then(() => {
    num.textContent = '99+'
    const l = $('#loading'); l.style.opacity = '0'
    setTimeout(() => { l.hidden = true; window.__dcReady = true }, 260)
  })
  setTimeout(() => { const l = $('#loading'); if (!l.hidden) { l.hidden = true; window.__dcReady = true } }, 12000)
})()
