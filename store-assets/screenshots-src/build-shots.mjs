// Génère les 5 mockups HTML 1280×800 des captures Chrome Web Store de PixelLens.
// L'UI du side panel est reproduite fidèlement (tokens de src/styles/globals.css).
// Sites d'arrière-plan FICTIFS (aucune marque réelle).
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const out = dirname(fileURLToPath(import.meta.url))
mkdirSync(out, { recursive: true })

const CSS = `
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#0C0C0E;--surface:#161618;--border:#222225;--text:#EDEDEF;--dim:#83838C;
  --accent:#6366F1;--accent-h:#818CF8;--success:#22C55E;
  --sans:-apple-system,'Segoe UI',Inter,system-ui,sans-serif;
  --mono:'SF Mono',ui-monospace,'JetBrains Mono',Menlo,monospace;
}
body{width:1280px;height:800px;overflow:hidden;font-family:var(--sans);background:#000}
.stage{width:1280px;height:800px;display:flex;flex-direction:column}
/* ---- fake browser chrome ---- */
.browser{flex:1;display:flex;flex-direction:column;background:#1D1D20;min-height:0}
.toolbar{height:46px;display:flex;align-items:center;gap:10px;padding:0 14px;background:#28282C;border-bottom:1px solid #1A1A1D}
.dots{display:flex;gap:7px}.dot{width:11px;height:11px;border-radius:50%}
.urlbar{flex:1;height:28px;background:#1D1D20;border-radius:14px;display:flex;align-items:center;padding:0 14px;color:#9A9AA3;font-size:12px;gap:7px}
.urlbar .lock{width:10px;height:10px;border:1.5px solid #9A9AA3;border-radius:3px;border-top:none;position:relative}
.exticon{width:22px;height:22px;border-radius:6px;background:linear-gradient(135deg,#6366F1,#818CF8);display:flex;align-items:center;justify-content:center}
.exticon span{width:9px;height:9px;border:2px solid #fff;border-radius:50%}
.main{flex:1;display:flex;min-height:0}
.page{flex:1;min-width:0;overflow:hidden;position:relative}
/* ---- side panel ---- */
.panel{width:400px;background:var(--bg);border-left:1px solid #000;display:flex;flex-direction:column;color:var(--text)}
.p-head{border-bottom:1px solid var(--border);padding:12px 12px 0}
.p-brand{display:flex;align-items:center;gap:8px;margin-bottom:12px}
.p-logo{width:20px;height:20px;border-radius:6px;background:linear-gradient(135deg,#6366F1,#818CF8);display:flex;align-items:center;justify-content:center}
.p-logo i{width:8px;height:8px;border:2px solid #fff;border-radius:50%}
.p-brand b{font-size:16px;font-weight:600;letter-spacing:-.02em}
.kbd{margin-left:auto;border:1px solid var(--border);border-radius:6px;padding:4px 6px;font-family:var(--mono);font-size:10px;color:var(--dim)}
.tabs{display:flex;position:relative}
.tab{display:flex;align-items:center;gap:6px;padding:4px 12px 8px;font-size:12px;font-weight:500;color:var(--dim)}
.tab.on{color:var(--text);font-weight:600;box-shadow:inset 0 -2px 0 var(--accent)}
.p-body{flex:1;overflow:hidden;display:flex;flex-direction:column;min-height:0}
.p-foot{border-top:1px solid var(--border);padding:8px 12px;display:flex;align-items:center;justify-content:space-between}
.f-icons{display:flex;gap:4px}
.f-ic{width:27px;height:27px;border-radius:6px;display:flex;align-items:center;justify-content:center;color:var(--dim);font-size:13px}
.f-ic.on{background:var(--surface);color:var(--accent)}
.ver{font-family:var(--mono);font-size:10px;color:var(--dim)}
/* panel primitives */
.chip{display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:6px;background:var(--surface);border:1px solid var(--border);font-size:10px;color:var(--dim)}
.chip b{color:var(--text);font-family:var(--mono);font-weight:400}
.btn{display:flex;align-items:center;justify-content:center;gap:6px;padding:9px;border-radius:8px;font-size:12px;font-weight:500;background:var(--accent);color:#fff}
.btn.ghost{background:transparent;border:1px solid var(--border);color:var(--dim)}
.mono{font-family:var(--mono)}
.sec-h{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.sec-h b{font-size:12px;font-weight:600}
.count{font-size:10px;color:var(--dim);background:var(--surface);padding:2px 6px;border-radius:99px}
/* caption bar */
.caption{height:44px;background:#0C0C0E;border-top:1px solid #222225;display:flex;align-items:center;justify-content:center;color:#EDEDEF;font-size:15px;font-weight:500;letter-spacing:.01em}
.caption .lens{width:16px;height:16px;border-radius:5px;background:linear-gradient(135deg,#6366F1,#818CF8);margin-right:9px;display:inline-flex;align-items:center;justify-content:center}
.caption .lens i{width:6px;height:6px;border:1.5px solid #fff;border-radius:50%}
/* icons via css */
.svg{display:inline-flex}
`

const dots = `<div class="dots"><span class="dot" style="background:#FF5F57"></span><span class="dot" style="background:#FEBC2E"></span><span class="dot" style="background:#28C840"></span></div>`
const ic = {
  inspect: `<svg class="svg" width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>`,
  scan: `<svg class="svg" width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M2 5V2h3M11 2h3v3M14 11v3h-3M5 14H2v-3"/><path d="M2 8h12"/></svg>`,
  palette: `<svg class="svg" width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 14A6 6 0 1 1 14 8c0 2-1.5 2.5-3 2.5H9.5A1.5 1.5 0 0 0 8 12z"/><circle cx="5.5" cy="6.5" r=".9" fill="currentColor"/><circle cx="8.5" cy="4.8" r=".9" fill="currentColor"/><circle cx="11" cy="7" r=".9" fill="currentColor"/></svg>`,
  copy: `<svg class="svg" width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="5" y="5" width="8" height="8" rx="1.5"/><path d="M3 11V4a1 1 0 0 1 1-1h7"/></svg>`,
  dl: `<svg class="svg" width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M8 2v8M4.5 7.5 8 11l3.5-3.5M3 13.5h10"/></svg>`,
  spark: `<svg class="svg" width="13" height="13" viewBox="0 0 16 16" fill="#fff"><path d="M8 1l1.6 4.6L14 7l-4.4 1.4L8 13 6.4 8.4 2 7l4.4-1.4z"/></svg>`,
  stop: `<svg class="svg" width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><rect x="3.5" y="3.5" width="9" height="9" rx="1.5"/></svg>`,
  globe: `<svg class="svg" width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="6"/><path d="M2 8h12M8 2c-3.5 3.8-3.5 8.2 0 12 3.5-3.8 3.5-8.2 0-12z"/></svg>`,
}
const footIcons = (active) => {
  const names = ['◐','⇪','M','🌐','⟲','⚙']
  return `<div class="f-icons">${names.map((n, i) =>
    `<span class="f-ic ${i === active ? 'on' : ''}">${n}</span>`).join('')}</div>`
}

function panel({ activeTab = -1, activeFoot = -1, body }) {
  return `<div class="panel">
  <div class="p-head">
    <div class="p-brand"><span class="p-logo"><i></i></span><b>PixelLens</b><span class="kbd">⌘K</span></div>
    <div class="tabs">
      <span class="tab ${activeTab === 0 ? 'on' : ''}">${ic.inspect}Inspect</span>
      <span class="tab ${activeTab === 1 ? 'on' : ''}">${ic.scan}Scan</span>
      <span class="tab ${activeTab === 2 ? 'on' : ''}">${ic.palette}Design System</span>
    </div>
  </div>
  <div class="p-body">${body}</div>
  <div class="p-foot">${footIcons(activeFoot)}<span class="ver">v1.1.0</span></div>
</div>`
}

function shot({ url, page, panelHtml, caption }) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
<div class="stage">
  <div class="browser">
    <div class="toolbar">${dots}<div class="urlbar"><span class="lock"></span>${url}</div><span class="exticon"><span></span></span></div>
    <div class="main"><div class="page">${page}</div>${panelHtml}</div>
  </div>
  <div class="caption"><span class="lens"><i></i></span>${caption}</div>
</div>
</body></html>`
}

/* ============ pages fictives ============ */

const articlePage = `
<div style="background:#FAF9F7;height:100%;padding:52px 70px;color:#1A1A1A;overflow:hidden">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:40px">
    <div style="width:26px;height:26px;border-radius:50%;background:#1A1A1A"></div>
    <b style="font-size:15px;letter-spacing:.06em">LUMEN&nbsp;JOURNAL</b>
    <span style="margin-left:auto;font-size:13px;color:#777">Essays · Craft · Notes</span>
  </div>
  <p style="font-size:12px;letter-spacing:.14em;color:#B0530A;font-weight:600;margin-bottom:14px">DESIGN ENGINEERING</p>
  <h1 style="font-size:42px;line-height:1.12;font-weight:700;letter-spacing:-.02em;max-width:640px;margin-bottom:18px">The quiet return of the eight-point grid</h1>
  <p style="font-size:15px;color:#555;max-width:600px;line-height:1.65;margin-bottom:28px">Why the oldest layout system on the web is winning again — spacing scales, optical rhythm, and what design tools got wrong about consistency.</p>
  <div style="display:flex;gap:14px;align-items:center;margin-bottom:34px">
    <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#D98E4A,#B0530A)"></div>
    <div><b style="font-size:13px">Maya Kessler</b><br><span style="font-size:12px;color:#888">12 min read · 2,847 words</span></div>
  </div>
  <div style="max-width:620px;font-size:15px;line-height:1.75;color:#333">
    <p style="margin-bottom:16px">Every mature interface eventually rediscovers the grid. Not the twelve-column scaffolding of the last decade, but something humbler: a spacing scale you can hold in your head.</p>
    <p style="margin-bottom:16px">Open the computed styles of any product you admire and a pattern emerges — <code style="background:#EFECE6;padding:1px 6px;border-radius:4px;font-size:13px">8px</code>, <code style="background:#EFECE6;padding:1px 6px;border-radius:4px;font-size:13px">16px</code>, <code style="background:#EFECE6;padding:1px 6px;border-radius:4px;font-size:13px">24px</code>, over and over, like a time signature…</p>
    <h2 style="font-size:22px;font-weight:700;margin:26px 0 12px">Rhythm you can measure</h2>
    <p>The grid is not an aesthetic. It is an agreement between everyone who will ever touch the file—</p>
  </div>
</div>`

const docsPage = `
<div style="background:#0B1120;height:100%;color:#DCE3F1;display:flex;overflow:hidden">
  <div style="width:230px;border-right:1px solid #1B2437;padding:24px 20px;background:#0D1526">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:26px"><div style="width:22px;height:22px;border-radius:6px;background:linear-gradient(135deg,#2DD4BF,#0EA5E9)"></div><b style="font-size:15px">Polaris Docs</b></div>
    ${['Getting started', 'Installation', 'Configuration', 'Components', 'Buttons', 'Forms', 'Navigation', 'Theming', 'Tokens', 'Dark mode', 'CLI reference', 'Migrations', 'Changelog'].map((x, i) => `<div style="font-size:13px;padding:6px 10px;border-radius:6px;color:${i === 4 ? '#2DD4BF' : '#8B96AC'};background:${i === 4 ? '#12233A' : 'transparent'};margin-bottom:2px">${x}</div>`).join('')}
  </div>
  <div style="flex:1;padding:44px 56px;overflow:hidden">
    <p style="font-size:12px;color:#2DD4BF;letter-spacing:.1em;font-weight:600;margin-bottom:10px">COMPONENTS</p>
    <h1 style="font-size:34px;font-weight:700;letter-spacing:-.02em;margin-bottom:14px">Buttons</h1>
    <p style="font-size:15px;color:#8B96AC;line-height:1.7;max-width:560px;margin-bottom:26px">Buttons trigger actions. Polaris ships five variants, each with hover, focus and disabled states wired to your theme tokens.</p>
    <div style="display:flex;gap:10px;margin-bottom:26px">
      <span style="background:#2DD4BF;color:#04252B;font-weight:600;font-size:13px;padding:9px 18px;border-radius:8px">Primary</span>
      <span style="border:1px solid #2A3852;font-size:13px;padding:9px 18px;border-radius:8px">Secondary</span>
      <span style="font-size:13px;padding:9px 18px;border-radius:8px;color:#8B96AC">Ghost</span>
    </div>
    <div style="background:#0D1526;border:1px solid #1B2437;border-radius:10px;padding:18px;font-family:var(--mono);font-size:12.5px;line-height:1.7;color:#9FB2D8;max-width:560px">
      <span style="color:#F472B6">&lt;Button</span> <span style="color:#2DD4BF">variant</span>=<span style="color:#FBBF24">"primary"</span> <span style="color:#2DD4BF">size</span>=<span style="color:#FBBF24">"md"</span><span style="color:#F472B6">&gt;</span><br>&nbsp;&nbsp;Deploy changes<br><span style="color:#F472B6">&lt;/Button&gt;</span>
    </div>
  </div>
</div>`

const brandPage = `
<div style="background:#F4F1EC;height:100%;overflow:hidden;color:#182B26">
  <div style="display:flex;align-items:center;padding:26px 60px;gap:34px">
    <b style="font-size:18px;letter-spacing:-.01em">nordwind</b>
    <span style="font-size:13.5px;color:#5A6B66">Destinations</span><span style="font-size:13.5px;color:#5A6B66">Journal</span><span style="font-size:13.5px;color:#5A6B66">About</span>
    <span style="margin-left:auto;background:#1D5C4F;color:#fff;font-size:13px;font-weight:600;padding:10px 20px;border-radius:99px">Plan a trip</span>
  </div>
  <div style="padding:34px 60px 0">
    <h1 style="font-size:52px;line-height:1.05;font-weight:700;letter-spacing:-.03em;max-width:560px;margin-bottom:18px">Travel slowly,<br>see <em style="font-style:italic;color:#1D5C4F">everything</em>.</h1>
    <p style="font-size:16px;color:#5A6B66;max-width:440px;line-height:1.6;margin-bottom:26px">Small-group journeys across the Nordic coast — designed around light, weather and silence.</p>
    <div style="display:flex;gap:12px;margin-bottom:38px">
      <span style="background:#1D5C4F;color:#fff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:10px">Browse journeys</span>
      <span style="border:1.5px solid #1D5C4F;color:#1D5C4F;font-size:14px;font-weight:600;padding:12px 24px;border-radius:10px">Watch the film</span>
    </div>
    <div style="display:flex;gap:16px">
      <div style="width:200px;height:150px;border-radius:14px;background:linear-gradient(160deg,#7FB5A4,#1D5C4F)"></div>
      <div style="width:200px;height:150px;border-radius:14px;background:linear-gradient(160deg,#E8B34B,#C2762B)"></div>
      <div style="width:200px;height:150px;border-radius:14px;background:linear-gradient(160deg,#31536B,#182B3E)"></div>
    </div>
  </div>
</div>`

const inspectPage = `
<div style="background:#FFFFFF;height:100%;overflow:hidden;color:#111827;position:relative">
  <div style="display:flex;align-items:center;padding:22px 56px;gap:30px;border-bottom:1px solid #EEF0F3">
    <b style="font-size:17px">runlog<span style="color:#6366F1">.</span></b>
    <span style="font-size:13.5px;color:#6B7280">Product</span><span style="font-size:13.5px;color:#6B7280">Pricing</span><span style="font-size:13.5px;color:#6B7280">Docs</span>
    <span style="margin-left:auto;font-size:13.5px;color:#6B7280">Sign in</span>
  </div>
  <div style="padding:58px 56px">
    <h1 style="font-size:44px;font-weight:800;letter-spacing:-.03em;line-height:1.08;max-width:560px;margin-bottom:16px">Ship faster with confidence</h1>
    <p style="font-size:16px;color:#6B7280;max-width:470px;line-height:1.65;margin-bottom:30px">Runlog turns your deploy pipeline into a readable story — every release, every regression, every rollback.</p>
    <div style="position:relative;display:inline-block">
      <!-- box model overlay : margin / padding / content -->
      <div style="position:absolute;inset:-18px -26px;background:rgba(249,115,22,.15);border-radius:4px"></div>
      <div style="position:absolute;inset:0;background:rgba(34,197,94,.15)"></div>
      <span style="position:relative;display:inline-flex;align-items:center;background:#6366F1;color:#fff;font-size:15px;font-weight:600;padding:13px 26px;border-radius:10px;outline:2px solid #6366F1;outline-offset:2px">Start free trial</span>
      <div style="position:absolute;top:-46px;left:0;background:rgba(0,0,0,.85);color:#EDEDEF;font-family:var(--mono);font-size:11px;padding:3px 8px;border-radius:4px;white-space:nowrap">button.cta-primary&nbsp;·&nbsp;182 × 48</div>
    </div>
    <div style="margin-top:44px;display:flex;gap:38px">
      ${['2.1s|Median deploy time', '12k deploys/day|Tracked in prod', '99.98% uptime|Last 12 months'].map(x => { const [a, b] = x.split('|'); return `<div><b style="font-size:19px;letter-spacing:-.01em">${a}</b><br><span style="font-size:12.5px;color:#9CA3AF">${b}</span></div>` }).join('')}
    </div>
  </div>
</div>`

/* ============ contenus du panel ============ */

const mdChips = [['≡', '2,847', 'words'], ['H', '14', 'headings'], ['⛓', '38', 'links'], ['▣', '6', 'images'], ['▦', '2', 'tables'], ['‹›', '5', 'code']]
const panelMarkdown = panel({
  activeFoot: 2,
  body: `
  <div style="padding:12px;border-bottom:1px solid var(--border)">
    <b style="font-size:13px">The quiet return of the eight-point grid</b>
    <div style="display:flex;align-items:center;gap:5px;margin-top:3px;color:var(--dim)">${ic.globe}<span class="mono" style="font-size:11px">lumenjournal.com</span></div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">${mdChips.map(([i, v, l]) => `<span class="chip">${i} <b>${v}</b> ${l}</span>`).join('')}</div>
    <p class="mono" style="font-size:10px;color:var(--dim);margin-top:9px">Aug 3, 2026, 2:41 PM</p>
  </div>
  <div style="flex:1;margin:12px;border:1px solid var(--border);border-radius:8px;background:var(--surface);padding:12px;font-size:11.5px;line-height:1.75;color:#C9C9CF;overflow:hidden">
    <span class="mono" style="color:var(--dim)">---<br>title: "The quiet return of the eight-point grid"<br>url: "https://lumenjournal.com/essays/eight-point-grid"<br>capturedAt: "2026-08-03T12:41:00Z"<br>wordCount: 2847<br>---</span><br>
    <b style="color:var(--text)"># The quiet return of the eight-point grid</b><br>
    Every mature interface eventually rediscovers the grid. Not the twelve-column scaffolding of the last decade, but something humbler: a spacing scale you can hold in your head.<br>
    <b style="color:var(--text)">## Rhythm you can measure</b><br>
    Open the computed styles of any product you admire and a pattern emerges — \`8px\`, \`16px\`, \`24px\`…</div>
  <div style="padding:12px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:8px">
    <div class="btn">${ic.spark}Copy for LLM</div>
    <div style="display:flex;gap:8px"><div class="btn ghost" style="flex:1;color:var(--text)">${ic.copy}Copy Markdown</div><div class="btn ghost" style="width:44px">${ic.dl}</div></div>
  </div>`,
})

const panelCrawl = panel({
  activeFoot: 3,
  body: `
  <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;padding:0 34px;text-align:center">
    <div style="width:100%">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px" class="mono"><span style="font-size:11px;color:var(--dim)">34/87 pages</span><span style="font-size:11px;color:var(--dim)">39%</span></div>
      <div style="height:8px;border-radius:99px;background:var(--surface);overflow:hidden"><div style="width:39%;height:100%;border-radius:99px;background:linear-gradient(90deg,#6366F1,#818CF8,#6366F1)"></div></div>
      <p class="mono" style="font-size:10px;color:var(--dim);margin-top:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">https://polarisdocs.dev/components/navigation</p>
      <p style="font-size:10px;color:var(--dim);margin-top:4px">2 skipped</p>
    </div>
    <div class="btn ghost" style="color:var(--text);padding:9px 18px">${ic.stop}&nbsp;Stop</div>
    <p style="font-size:10.5px;color:var(--dim);line-height:1.6;max-width:250px">Sitemap found — crawling every same-site page into one Markdown document.</p>
  </div>`,
})

const swatches = [['#1D5C4F', 'primary', '#1D5C4F'], ['#E8B34B', 'accent', '#E8B34B'], ['#182B26', 'text', '#182B26'], ['#F4F1EC', 'background', '#F4F1EC'], ['#5A6B66', 'muted', '#5A6B66'], ['#C2762B', 'accent-warm', '#C2762B']]
const panelDS = panel({
  activeTab: 2,
  body: `
  <div style="padding:10px 12px;border-bottom:1px solid var(--border);background:rgba(22,22,24,.5);display:flex;align-items:center;justify-content:space-between">
    <div><b style="font-size:12px">Nordwind — Travel slowly</b><br><span class="mono" style="font-size:10px;color:var(--dim)">https://nordwind.travel</span></div>
    <span class="btn" style="padding:7px 12px;font-size:11px">⇪ Export</span>
  </div>
  <div style="flex:1;padding:12px;overflow:hidden">
    <div class="sec-h">${ic.palette}<b>Palette</b><span class="count">6</span></div>
    <div style="display:flex;flex-direction:column;gap:7px;margin-bottom:16px">
      ${swatches.map(([c, n, hex]) => `<div style="display:flex;align-items:center;gap:8px">
        <span style="width:26px;height:26px;border-radius:7px;background:${c};border:1px solid var(--border)"></span>
        <span style="font-size:11px;font-weight:500">${n}</span>
        <span class="mono" style="margin-left:auto;font-size:10px;color:var(--dim)">${hex.toUpperCase()}</span></div>`).join('')}
    </div>
    <div class="sec-h"><span style="color:var(--dim)">T</span><b>Type Scale</b><span class="count">2</span></div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:8px">
      <p style="font-size:14px;margin-bottom:5px">GT Sectra Display</p>
      <span class="chip mono">52px / 700</span> <span class="chip mono">22px / 600</span>
    </div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:10px">
      <p style="font-size:14px;margin-bottom:5px">Söhne</p>
      <span class="chip mono">16px / 400</span> <span class="chip mono">13.5px / 500</span> <span class="chip mono">13px / 600</span>
    </div>
  </div>`,
})

const twLines = [
  ['export default', ' {', '#C792EA'],
  ['  theme', ': {', '#EDEDEF'],
  ['    extend', ': {', '#EDEDEF'],
  ['      colors', ': {', '#82AAFF'],
  ["        'primary'", ": '#1D5C4F',", '#82AAFF'],
  ["        'accent'", ": '#E8B34B',", '#82AAFF'],
  ["        'accent-warm'", ": '#C2762B',", '#82AAFF'],
  ["        'surface'", ": '#F4F1EC',", '#82AAFF'],
  ["        'ink'", ": '#182B26',", '#82AAFF'],
  ['      },', '', '#EDEDEF'],
  ['      spacing', ': {', '#82AAFF'],
  ["        'xs'", ": '8px',", '#82AAFF'],
  ["        'sm'", ": '12px',", '#82AAFF'],
  ["        'md'", ": '16px',", '#82AAFF'],
  ["        'lg'", ": '24px',", '#82AAFF'],
  ["        'xl'", ": '38px',", '#82AAFF'],
  ['      },', '', '#EDEDEF'],
  ['      borderRadius', ": { 'card': '14px', 'pill': '99px' },", '#82AAFF'],
  ['    },', '', '#EDEDEF'],
  ['  },', '', '#EDEDEF'],
  ['}', '', '#C792EA'],
]
const panelExport = panel({
  activeFoot: 1,
  body: `
  <div style="padding:12px;border-bottom:1px solid var(--border)">
    <div style="display:flex;gap:4px;padding:3px;background:var(--surface);border-radius:8px">
      <span style="flex:1;text-align:center;padding:7px 0;font-size:11px;font-weight:500;color:var(--dim)">CSS Variables</span>
      <span style="flex:1;text-align:center;padding:7px 0;font-size:11px;font-weight:600;border-radius:6px;background:var(--accent);color:#fff">Tailwind</span>
      <span style="flex:1;text-align:center;padding:7px 0;font-size:11px;font-weight:500;color:var(--dim)">JSON</span>
    </div>
  </div>
  <div style="flex:1;margin:12px;border:1px solid var(--border);border-radius:8px;background:var(--surface);padding:12px;overflow:hidden" class="mono">
    ${twLines.map(([a, b, c]) => `<div style="font-size:10.8px;line-height:1.62;white-space:pre"><span style="color:${c}">${a}</span><span style="color:#89DDFF">${b}</span></div>`).join('')}
  </div>
  <div style="padding:12px;border-top:1px solid var(--border);display:flex;gap:8px">
    <div class="btn" style="flex:1">${ic.copy}Copy to Clipboard</div>
    <div class="btn ghost" style="width:44px">${ic.dl}</div>
  </div>`,
})

const cssRows = [['display', 'inline-flex'], ['padding', '13px 26px'], ['margin', '0 0 18px'], ['background', '#6366F1'], ['color', '#FFFFFF'], ['font-size', '15px'], ['font-weight', '600'], ['border-radius', '10px'], ['line-height', '1.2']]
const panelInspect = panel({
  activeTab: 0,
  body: `
  <div style="padding:12px;border-bottom:1px solid var(--border)">
    <span class="mono" style="font-size:11px;color:var(--accent-h)">button.cta-primary</span>
    <div style="margin-top:10px;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px;display:flex;justify-content:center">
      <div style="background:rgba(249,115,22,.15);padding:15px 22px;border-radius:4px;position:relative">
        <span class="mono" style="position:absolute;top:2px;left:6px;font-size:8.5px;color:#F97316">margin 18</span>
        <div style="background:rgba(34,197,94,.15);padding:12px 20px;position:relative">
          <span class="mono" style="position:absolute;top:1px;left:5px;font-size:8.5px;color:#22C55E">padding 13·26</span>
          <div style="background:rgba(59,130,246,.2);border:1px dashed #3B82F6;padding:7px 16px" class="mono"><span style="font-size:10px;color:#93C5FD">182 × 48</span></div>
        </div>
      </div>
    </div>
  </div>
  <div style="flex:1;padding:12px;overflow:hidden">
    <div class="sec-h"><b>Computed styles</b><span class="count">${cssRows.length}</span></div>
    ${cssRows.map(([k, v]) => `<div style="display:flex;align-items:center;padding:5.5px 8px;border-radius:6px;background:${k === 'background' ? 'var(--surface)' : 'transparent'}">
      <span class="mono" style="font-size:10.5px;color:#82AAFF">${k}</span>
      <span class="mono" style="margin-left:auto;font-size:10.5px;color:var(--text);display:flex;align-items:center;gap:6px">${k === 'background' ? '<i style="width:9px;height:9px;border-radius:3px;background:#6366F1;display:inline-block"></i>' : ''}${v}<span style="color:var(--dim)">${ic.copy}</span></span></div>`).join('')}
  </div>`,
})

/* ============ écrire les 5 fichiers ============ */
const shots = [
  ['01-copy-for-llm', shot({ url: 'lumenjournal.com/essays/eight-point-grid', page: articlePage, panelHtml: panelMarkdown, caption: 'One click: the whole page as clean Markdown, ready for your AI.' })],
  ['02-crawl', shot({ url: 'polarisdocs.dev/components/buttons', page: docsPage, panelHtml: panelCrawl, caption: 'Crawl a whole site into one Markdown document — sitemap-first.' })],
  ['03-design-system', shot({ url: 'nordwind.travel', page: brandPage, panelHtml: panelDS, caption: 'Scan any page. Get its palette, type scale, spacing and shadows.' })],
  ['04-export-tailwind', shot({ url: 'nordwind.travel', page: brandPage, panelHtml: panelExport, caption: 'Export your tokens: CSS variables, Tailwind config, JSON, PNG.' })],
  ['05-inspect', shot({ url: 'runlog.app', page: inspectPage, panelHtml: panelInspect, caption: 'Hover any element: box model, computed CSS, one-click copy.' })],
]
for (const [name, html] of shots) {
  writeFileSync(join(out, `${name}.html`), html)
  console.log('wrote', name + '.html')
}
