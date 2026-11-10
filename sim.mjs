import './mute-auto.mjs'
import { MUTE_LAUNCH, muteContext } from './mute.mjs'
// 遊び方ごとの分布。node sim.mjs [回数]
// 本物の台本（くじ）を使い、誘惑の強さ×がまん強さで「いつ何に負けるか」を人の速さ（0.6〜1.6秒の反応）で回す
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
const ROOT = import.meta.dirname
const PORT = 6483
const server = spawn(process.execPath, ['server.mjs'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) } })
await new Promise(r => setTimeout(r, 400))
const RUNS = +(process.argv[2] || 12)
const b = await chromium.launch(MUTE_LAUNCH), ctx = await b.newContext({ locale: 'ja-JP', viewport: { width: 390, height: 844 } })
await muteContext(ctx)
const p = await ctx.newPage()
await p.goto(`http://localhost:${PORT}/`); await p.waitForFunction(() => window.__dcReady)
// 誘惑の強さ（1回で押してしまう見込み。がまん強さ0の人の値）
const PULL = { 1: 0.12, 2: 0.26, 3: 0.32, again: 0.5, hima: 0.3, off: 0.4, ad: 0.45, endbtn: 0.35, call: 0.55, dim: 0.6, update: 0.3, clock: 0.1, fake: 0.65, rearr: 0.35, chaos: 0.2, final: 0.3, black: 0.4 }
const BOTS = [['反射で押す人', 0.15, 0.9], ['ふつうの人', 0.6, 0.3], ['がまん強い人', 0.85, 0.1], ['修行僧', 0.97, 0], ['何もしない', 1, 0]]
const DATA_LV = await p.evaluate(() => Object.fromEntries(DATA.N.map(n => [n.k, n.lv])))
const TIERS = await p.evaluate(() => DATA.TIERS.map(t => [t.s, t.ja]))
const tierOf = s => { let t = TIERS[0][1]; for (const [x, n] of TIERS) if (s >= x) t = n; return t }
let sd = 1
const rnd = () => (sd = sd * 16807 % 2147483647, (sd - 1) / 2147483646)
const out = []
for (const [name, r, rookie] of BOTS) {
  const secs = [], got = {}, tiers = {}
  for (let i = 0; i < RUNS; i++) {
    sd = 1000 + i * 7 + Math.round(r * 100)
    const sc = await p.evaluate(s => { dc.seed(s); dc.startGame(); return dc.script() }, 500 + i)
    let end = 300, by = 'なし'
    for (const [t, type, k] of sc) {
      let pull = type === 'n' ? (/^r_/.test(k) ? PULL.again : PULL[(DATA_LV[k] || 2)]) : PULL[k] || 0
      if (type === 'n' && t < 8 && rnd() < rookie) pull = 1   // ルールを知らない初回は最初の通知を押しがち
      if (pull && rnd() < pull * (1 - r)) { end = Math.min(300, t + 0.6 + rnd()); by = k; break }
    }
    secs.push(end); got[by] = (got[by] || 0) + 1; const tn = tierOf(end); tiers[tn] = (tiers[tn] || 0) + 1
  }
  secs.sort((a, b) => a - b)
  out.push(`| ${name}（がまん${r}） | ${secs[0].toFixed(1)} | ${secs[Math.floor(secs.length / 2)].toFixed(1)} | ${secs[secs.length - 1].toFixed(1)} | ${Object.entries(tiers).map(([k, v]) => k + v).join(' ')} | ${Object.entries(got).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => k + v).join(' ')} |`)
}
console.log('| bot | 最短 | 中央 | 最長 | 称号 | 負けた相手（上位3） |\n|---|---|---|---|---|---|\n' + out.join('\n'))
await b.close(); server.kill()
