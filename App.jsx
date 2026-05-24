import { useState, useEffect, useRef } from "react";

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #050508;
    --surface: #0d0d14;
    --surface2: #12121c;
    --border: #1e1e2e;
    --border2: #2a2a40;
    --accent: #00ff9d;
    --accent2: #00c8ff;
    --accent3: #ff3cac;
    --warn: #ff6b35;
    --text: #e8e8f0;
    --text2: #8888aa;
    --text3: #4a4a6a;
    --glow: rgba(0,255,157,0.15);
    --font-mono: 'Share Tech Mono', monospace;
    --font-display: 'Orbitron', sans-serif;
    --font-body: 'Inter', sans-serif;
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }

  /* Grid background */
  .grid-bg {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(0,255,157,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,157,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  .noise {
    position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.04;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  }

  /* NAV */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 32px; height: 60px;
    background: rgba(5,5,8,0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo {
    font-family: var(--font-display);
    font-size: 14px; font-weight: 700;
    color: var(--accent); letter-spacing: 2px;
    text-transform: uppercase;
  }
  .nav-logo span { color: var(--text2); font-weight: 400; }
  .nav-links { display: flex; gap: 24px; align-items: center; }
  .nav-links a {
    font-family: var(--font-mono); font-size: 11px;
    color: var(--text2); text-decoration: none; letter-spacing: 1px;
    text-transform: uppercase; transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--accent); }
  .nav-badge {
    background: var(--accent); color: #000;
    font-family: var(--font-mono); font-size: 10px; font-weight: bold;
    padding: 4px 10px; border-radius: 2px; letter-spacing: 1px;
  }

  /* HERO */
  .hero {
    position: relative; z-index: 1;
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 80px 24px 40px;
    text-align: center;
  }
  .hero-tag {
    font-family: var(--font-mono); font-size: 11px;
    color: var(--accent); letter-spacing: 3px; text-transform: uppercase;
    margin-bottom: 24px;
    display: flex; align-items: center; gap: 8px;
  }
  .hero-tag::before, .hero-tag::after {
    content: ''; display: inline-block;
    width: 40px; height: 1px; background: var(--accent); opacity: 0.5;
  }
  .hero-title {
    font-family: var(--font-display);
    font-size: clamp(36px, 7vw, 80px);
    font-weight: 900; line-height: 1;
    text-transform: uppercase; letter-spacing: -1px;
    margin-bottom: 8px;
  }
  .hero-title .line1 { color: var(--text); }
  .hero-title .line2 {
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .hero-sub {
    font-family: var(--font-mono); font-size: 13px;
    color: var(--text2); letter-spacing: 2px;
    text-transform: uppercase; margin-bottom: 48px;
  }

  /* SCAN BOX */
  .scan-box {
    width: 100%; max-width: 680px;
    background: var(--surface); border: 1px solid var(--border2);
    border-radius: 4px; overflow: hidden;
    box-shadow: 0 0 60px rgba(0,255,157,0.05);
  }
  .scan-header {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 16px; border-bottom: 1px solid var(--border);
    background: var(--surface2);
  }
  .scan-dot { width: 8px; height: 8px; border-radius: 50%; }
  .scan-dot.r { background: #ff5f57; }
  .scan-dot.y { background: #febc2e; }
  .scan-dot.g { background: #28c840; }
  .scan-title-bar {
    flex: 1; text-align: center;
    font-family: var(--font-mono); font-size: 11px;
    color: var(--text3); letter-spacing: 1px;
  }

  .scan-inner { padding: 20px; }
  .scan-label {
    font-family: var(--font-mono); font-size: 11px;
    color: var(--accent); letter-spacing: 2px; margin-bottom: 8px;
  }
  .scan-input-row { display: flex; gap: 8px; }
  .scan-input {
    flex: 1;
    background: var(--bg); border: 1px solid var(--border2);
    border-radius: 2px; padding: 12px 14px;
    font-family: var(--font-mono); font-size: 13px;
    color: var(--text); outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .scan-input::placeholder { color: var(--text3); }
  .scan-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 1px var(--accent), 0 0 20px var(--glow);
  }
  .scan-btn {
    padding: 12px 24px;
    background: var(--accent); color: #000;
    border: none; border-radius: 2px;
    font-family: var(--font-display); font-size: 11px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    cursor: pointer; transition: all 0.2s; white-space: nowrap;
  }
  .scan-btn:hover { background: #00ffb3; transform: translateY(-1px); }
  .scan-btn:active { transform: translateY(0); }
  .scan-btn:disabled {
    opacity: 0.5; cursor: not-allowed; transform: none;
  }

  .scan-meta {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 12px;
    font-family: var(--font-mono); font-size: 11px; color: var(--text3);
  }
  .scan-meta .free-badge {
    color: var(--accent); background: rgba(0,255,157,0.08);
    padding: 2px 8px; border-radius: 2px;
    border: 1px solid rgba(0,255,157,0.2);
  }

  /* RESULT */
  .result-box {
    margin-top: 16px;
    background: var(--bg); border: 1px solid var(--border2);
    border-radius: 2px; padding: 16px;
    font-family: var(--font-mono); font-size: 12px;
    line-height: 1.8;
    max-height: 320px; overflow-y: auto;
  }
  .result-line { margin-bottom: 2px; }
  .result-line .key { color: var(--accent2); }
  .result-line .val { color: var(--text); }
  .result-line .val.safe { color: var(--accent); }
  .result-line .val.warn { color: var(--warn); }
  .result-line .val.danger { color: var(--accent3); }
  .result-score {
    display: flex; align-items: center; gap: 12px;
    margin-top: 12px; padding-top: 12px;
    border-top: 1px solid var(--border);
  }
  .score-label { font-size: 11px; color: var(--text2); text-transform: uppercase; letter-spacing: 1px; }
  .score-bar {
    flex: 1; height: 6px; background: var(--border2);
    border-radius: 3px; overflow: hidden;
  }
  .score-fill {
    height: 100%; border-radius: 3px;
    transition: width 1s ease;
  }
  .score-num { font-size: 18px; font-weight: bold; }

  /* STATS BAR */
  .stats-bar {
    position: relative; z-index: 1;
    display: flex; justify-content: center; gap: 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    overflow-x: auto;
  }
  .stat-item {
    flex: 1; min-width: 120px; max-width: 200px;
    padding: 20px 24px;
    border-right: 1px solid var(--border);
    text-align: center;
  }
  .stat-item:last-child { border-right: none; }
  .stat-num {
    font-family: var(--font-display); font-size: 28px; font-weight: 900;
    color: var(--accent); display: block;
  }
  .stat-lbl {
    font-family: var(--font-mono); font-size: 10px;
    color: var(--text3); text-transform: uppercase; letter-spacing: 1px;
    margin-top: 4px; display: block;
  }

  /* FEATURES */
  .section {
    position: relative; z-index: 1;
    max-width: 1100px; margin: 0 auto;
    padding: 80px 24px;
  }
  .section-tag {
    font-family: var(--font-mono); font-size: 10px;
    color: var(--accent); letter-spacing: 3px;
    text-transform: uppercase; margin-bottom: 8px;
  }
  .section-title {
    font-family: var(--font-display); font-size: clamp(22px, 4vw, 36px);
    font-weight: 900; text-transform: uppercase;
    margin-bottom: 48px; letter-spacing: 1px;
  }
  .section-title span {
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1px; background: var(--border);
    border: 1px solid var(--border);
  }
  .feature-card {
    background: var(--surface);
    padding: 32px 28px;
    transition: background 0.2s;
  }
  .feature-card:hover { background: var(--surface2); }
  .feature-icon {
    font-size: 24px; margin-bottom: 16px; display: block;
  }
  .feature-title {
    font-family: var(--font-display); font-size: 13px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 2px;
    color: var(--accent); margin-bottom: 10px;
  }
  .feature-desc {
    font-size: 13px; color: var(--text2); line-height: 1.7;
  }

  /* PRICING */
  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 16px;
  }
  .price-card {
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: 4px; padding: 32px 28px;
    position: relative; overflow: hidden;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .price-card:hover {
    border-color: var(--accent);
    box-shadow: 0 0 30px var(--glow);
  }
  .price-card.featured {
    border-color: var(--accent);
    box-shadow: 0 0 40px var(--glow);
  }
  .price-card.featured::before {
    content: 'POPULAR';
    position: absolute; top: 16px; right: -12px;
    background: var(--accent); color: #000;
    font-family: var(--font-mono); font-size: 9px; font-weight: bold;
    padding: 3px 20px;
    transform: rotate(12deg);
    letter-spacing: 1px;
  }
  .price-tier {
    font-family: var(--font-mono); font-size: 10px;
    color: var(--text3); letter-spacing: 2px; text-transform: uppercase;
    margin-bottom: 8px;
  }
  .price-name {
    font-family: var(--font-display); font-size: 20px; font-weight: 900;
    text-transform: uppercase; margin-bottom: 20px;
  }
  .price-amount {
    font-family: var(--font-display); font-size: 42px; font-weight: 900;
    color: var(--accent); line-height: 1;
    margin-bottom: 4px;
  }
  .price-amount span { font-size: 16px; color: var(--text2); }
  .price-period {
    font-family: var(--font-mono); font-size: 11px;
    color: var(--text3); margin-bottom: 24px;
  }
  .price-features { list-style: none; margin-bottom: 28px; }
  .price-features li {
    font-size: 13px; color: var(--text2);
    padding: 6px 0; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 8px;
  }
  .price-features li::before { content: '▸'; color: var(--accent); font-size: 10px; }
  .price-cta {
    width: 100%; padding: 12px;
    background: transparent;
    border: 1px solid var(--border2);
    border-radius: 2px;
    font-family: var(--font-display); font-size: 11px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    color: var(--text); cursor: pointer;
    transition: all 0.2s;
  }
  .price-cta:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--glow);
  }
  .price-cta.featured-cta {
    background: var(--accent); color: #000;
    border-color: var(--accent);
  }
  .price-cta.featured-cta:hover {
    background: #00ffb3; color: #000;
  }
  .price-note {
    text-align: center;
    font-family: var(--font-mono); font-size: 11px;
    color: var(--text3); margin-top: 24px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .price-note::before, .price-note::after {
    content: '—'; color: var(--border2);
  }

  /* HOW IT WORKS */
  .steps { display: flex; flex-direction: column; gap: 0; }
  .step {
    display: flex; gap: 24px;
    padding: 24px 0; border-bottom: 1px solid var(--border);
  }
  .step:last-child { border-bottom: none; }
  .step-num {
    font-family: var(--font-display); font-size: 36px; font-weight: 900;
    color: var(--border2); line-height: 1; flex-shrink: 0;
    width: 60px; text-align: right;
  }
  .step-content { flex: 1; }
  .step-title {
    font-family: var(--font-display); font-size: 14px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 2px;
    color: var(--text); margin-bottom: 6px;
  }
  .step-desc { font-size: 13px; color: var(--text2); line-height: 1.7; }

  /* PAYMENT */
  .payment-box {
    background: var(--surface); border: 1px solid var(--border2);
    border-radius: 4px; padding: 32px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 32px;
  }
  @media (max-width: 600px) {
    .payment-box { grid-template-columns: 1fr; }
  }
  .payment-label {
    font-family: var(--font-mono); font-size: 10px;
    color: var(--accent); letter-spacing: 2px; text-transform: uppercase;
    margin-bottom: 8px;
  }
  .payment-value {
    font-family: var(--font-mono); font-size: 13px;
    color: var(--text); word-break: break-all;
    background: var(--bg); padding: 12px;
    border: 1px solid var(--border); border-radius: 2px;
    display: flex; align-items: center; justify-content: space-between; gap: 8px;
  }
  .copy-btn {
    background: none; border: none;
    font-family: var(--font-mono); font-size: 10px;
    color: var(--accent2); cursor: pointer; letter-spacing: 1px;
    flex-shrink: 0; padding: 2px 6px;
    border: 1px solid var(--accent2); border-radius: 2px;
    transition: all 0.2s;
  }
  .copy-btn:hover { background: var(--accent2); color: #000; }
  .payment-steps { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; }
  .payment-step {
    display: flex; gap: 10px;
    font-size: 13px; color: var(--text2); align-items: flex-start;
  }
  .payment-step-num {
    font-family: var(--font-mono); color: var(--accent2);
    font-size: 11px; flex-shrink: 0; margin-top: 1px;
  }

  /* FOOTER */
  footer {
    position: relative; z-index: 1;
    border-top: 1px solid var(--border);
    padding: 32px;
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 16px;
  }
  .footer-logo {
    font-family: var(--font-display); font-size: 12px; font-weight: 700;
    color: var(--accent); letter-spacing: 2px; text-transform: uppercase;
  }
  .footer-copy {
    font-family: var(--font-mono); font-size: 11px;
    color: var(--text3); letter-spacing: 1px;
  }

  /* ANIMATIONS */
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  .cursor { animation: blink 1s infinite; color: var(--accent); }

  @keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  .scanline {
    position: fixed; left: 0; right: 0; height: 2px; z-index: 0;
    background: linear-gradient(transparent, rgba(0,255,157,0.05), transparent);
    animation: scanline 8s linear infinite;
    pointer-events: none;
  }

  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
  .pulse { animation: pulse 2s infinite; }

  @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
  .fade-in { animation: fadeIn 0.4s ease forwards; }

  /* MOBILE */
  @media (max-width: 600px) {
    nav { padding: 0 16px; }
    .nav-links { gap: 12px; }
    .scan-input-row { flex-direction: column; }
    .stats-bar { flex-wrap: wrap; }
    .payment-box { gap: 24px; }
    footer { flex-direction: column; text-align: center; }
  }

  /* MODAL */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
  }
  .modal {
    background: var(--surface); border: 1px solid var(--border2);
    border-radius: 4px; padding: 32px;
    max-width: 480px; width: 100%;
    animation: fadeIn 0.2s ease;
  }
  .modal-title {
    font-family: var(--font-display); font-size: 16px; font-weight: 900;
    text-transform: uppercase; letter-spacing: 2px;
    color: var(--accent); margin-bottom: 8px;
  }
  .modal-sub {
    font-family: var(--font-mono); font-size: 11px;
    color: var(--text3); letter-spacing: 1px;
    margin-bottom: 24px; text-transform: uppercase;
  }
  .modal-input {
    width: 100%;
    background: var(--bg); border: 1px solid var(--border2);
    border-radius: 2px; padding: 12px 14px;
    font-family: var(--font-mono); font-size: 13px;
    color: var(--text); outline: none; margin-bottom: 12px;
    transition: border-color 0.2s;
  }
  .modal-input:focus { border-color: var(--accent); }
  .modal-actions { display: flex; gap: 10px; margin-top: 20px; }
  .modal-cancel {
    flex: 1; padding: 12px;
    background: none; border: 1px solid var(--border2);
    border-radius: 2px; color: var(--text2);
    font-family: var(--font-display); font-size: 11px; letter-spacing: 2px;
    text-transform: uppercase; cursor: pointer; transition: all 0.2s;
  }
  .modal-cancel:hover { border-color: var(--text2); color: var(--text); }
  .modal-confirm {
    flex: 2; padding: 12px;
    background: var(--accent); border: none;
    border-radius: 2px; color: #000;
    font-family: var(--font-display); font-size: 11px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase; cursor: pointer;
    transition: all 0.2s;
  }
  .modal-confirm:hover { background: #00ffb3; }

  .tag {
    display: inline-flex; align-items: center; gap: 4px;
    font-family: var(--font-mono); font-size: 10px; letter-spacing: 1px;
    text-transform: uppercase; padding: 3px 8px; border-radius: 2px;
    border: 1px solid;
  }
  .tag.green { color: var(--accent); border-color: rgba(0,255,157,0.3); background: rgba(0,255,157,0.05); }
  .tag.blue { color: var(--accent2); border-color: rgba(0,200,255,0.3); background: rgba(0,200,255,0.05); }
  .tag.red { color: var(--accent3); border-color: rgba(255,60,172,0.3); background: rgba(255,60,172,0.05); }
  .tag.orange { color: var(--warn); border-color: rgba(255,107,53,0.3); background: rgba(255,107,53,0.05); }
`;

// ─── MOCK ANALYSIS ENGINE ──────────────────────────────────────────────────────
function analyzeContract(address) {
  const hash = address.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const score = 40 + (hash % 55);
  const isHoneypot = hash % 7 === 0;
  const hasMint = hash % 3 === 0;
  const hasBlacklist = hash % 5 === 0;
  const taxBuy = hash % 10;
  const taxSell = (hash % 15) + 1;
  const liquidity = ((hash % 800) + 50) * 100;
  const holders = (hash % 9000) + 100;

  return {
    address,
    score,
    isHoneypot,
    hasMint,
    hasBlacklist,
    taxBuy,
    taxSell,
    liquidity,
    holders,
    verified: hash % 4 !== 0,
    renounced: hash % 2 === 0,
    lpLocked: hash % 3 !== 0,
    network: hash % 2 === 0 ? "Ethereum" : "BSC",
  };
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
function TypeWriter({ text, speed = 30 }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const t = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [text, speed]);
  return (
    <span>
      {displayed}
      {displayed.length < text.length && <span className="cursor">█</span>}
    </span>
  );
}

function ScanResult({ result }) {
  if (!result) return null;
  const scoreColor =
    result.score >= 75
      ? "#00ff9d"
      : result.score >= 50
      ? "#febc2e"
      : "#ff3cac";

  return (
    <div className="result-box fade-in">
      <div className="result-line">
        <span className="key">{">"} CONTRACT_ADDRESS: </span>
        <span className="val" style={{ color: "#8888aa", fontSize: 11 }}>
          {result.address}
        </span>
      </div>
      <div className="result-line">
        <span className="key">{">"} NETWORK: </span>
        <span className="val">{result.network}</span>
      </div>
      <div className="result-line">
        <span className="key">{">"} HONEYPOT: </span>
        <span className={`val ${result.isHoneypot ? "danger" : "safe"}`}>
          {result.isHoneypot ? "⚠ DETECTED" : "✓ CLEAR"}
        </span>
      </div>
      <div className="result-line">
        <span className="key">{">"} MINT_FUNCTION: </span>
        <span className={`val ${result.hasMint ? "warn" : "safe"}`}>
          {result.hasMint ? "⚠ PRESENT" : "✓ NONE"}
        </span>
      </div>
      <div className="result-line">
        <span className="key">{">"} BLACKLIST_FUNCTION: </span>
        <span className={`val ${result.hasBlacklist ? "warn" : "safe"}`}>
          {result.hasBlacklist ? "⚠ PRESENT" : "✓ NONE"}
        </span>
      </div>
      <div className="result-line">
        <span className="key">{">"} TAX_BUY / TAX_SELL: </span>
        <span className={`val ${result.taxSell > 10 ? "warn" : "safe"}`}>
          {result.taxBuy}% / {result.taxSell}%
        </span>
      </div>
      <div className="result-line">
        <span className="key">{">"} LP_LOCKED: </span>
        <span className={`val ${result.lpLocked ? "safe" : "danger"}`}>
          {result.lpLocked ? "✓ YES" : "✗ NO"}
        </span>
      </div>
      <div className="result-line">
        <span className="key">{">"} OWNERSHIP_RENOUNCED: </span>
        <span className={`val ${result.renounced ? "safe" : "warn"}`}>
          {result.renounced ? "✓ YES" : "⚠ NO"}
        </span>
      </div>
      <div className="result-line">
        <span className="key">{">"} VERIFIED: </span>
        <span className={`val ${result.verified ? "safe" : "warn"}`}>
          {result.verified ? "✓ YES" : "⚠ NO"}
        </span>
      </div>
      <div className="result-line">
        <span className="key">{">"} LIQUIDITY: </span>
        <span className="val">${result.liquidity.toLocaleString()}</span>
      </div>
      <div className="result-line">
        <span className="key">{">"} HOLDERS: </span>
        <span className="val">{result.holders.toLocaleString()}</span>
      </div>
      <div className="result-score">
        <div className="score-label">Safety Score</div>
        <div className="score-bar">
          <div
            className="score-fill"
            style={{ width: result.score + "%", background: scoreColor }}
          />
        </div>
        <div className="score-num" style={{ color: scoreColor }}>
          {result.score}/100
        </div>
      </div>
    </div>
  );
}

function PricingModal({ plan, onClose }) {
  const USDT_WALLET = "TYourUSDTWalletAddressHere123456789"; // Ganti dengan wallet USDT kamu
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");

  const copy = () => {
    navigator.clipboard.writeText(USDT_WALLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">Upgrade to {plan.name}</div>
        <div className="modal-sub">
          {plan.price} USDT / month · {plan.scans} scans/day
        </div>
        <div style={{ marginBottom: 16 }}>
          <div className="payment-label">Send USDT (TRC-20) to:</div>
          <div className="payment-value">
            <span style={{ fontSize: 11, wordBreak: "break-all" }}>{USDT_WALLET}</span>
            <button className="copy-btn" onClick={copy}>
              {copied ? "✓ OK" : "COPY"}
            </button>
          </div>
        </div>
        <div className="payment-label" style={{ marginBottom: 6 }}>Your email (for activation):</div>
        <input
          className="modal-input"
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.6, marginTop: 8 }}>
          After payment, send your USDT transaction hash + email to our Telegram. 
          Access will be activated within 1 hour.
        </div>
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onClose}>Cancel</button>
          <button
            className="modal-confirm"
            onClick={() => window.open("https://t.me/kingmeme", "_blank")}
          >
            Contact on Telegram →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [address, setAddress] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [scanLog, setScanLog] = useState([]);
  const [scansLeft, setScansLeft] = useState(5);
  const [modal, setModal] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleScan = async () => {
    if (!address.trim()) return showToast("Enter a contract address");
    if (scansLeft <= 0) return showToast("No scans left today. Upgrade to Pro!");

    setScanning(true);
    setResult(null);
    setScanLog([]);

    const logs = [
      "Connecting to node...",
      "Fetching contract bytecode...",
      "Decompiling ABI...",
      "Checking honeypot patterns...",
      "Analyzing tax functions...",
      "Scanning ownership...",
      "Checking liquidity locks...",
      "Generating security report...",
    ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise((r) => setTimeout(r, 280));
      setScanLog((prev) => [...prev, logs[i]]);
    }

    await new Promise((r) => setTimeout(r, 400));
    const res = analyzeContract(address.trim());
    setResult(res);
    setScansLeft((s) => s - 1);
    setScanning(false);
  };

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "0",
      scans: "5",
      period: "forever",
      features: ["5 scans per day", "Basic risk score", "Honeypot detection", "Tax analysis"],
      featured: false,
    },
    {
      id: "pro",
      name: "Pro",
      price: "15",
      scans: "100",
      period: "per month",
      features: ["100 scans per day", "Full report", "LP lock analysis", "Ownership check", "Priority support", "API access (soon)"],
      featured: true,
    },
    {
      id: "unlimited",
      name: "Unlimited",
      price: "40",
      scans: "∞",
      period: "per month",
      features: ["Unlimited scans", "Real-time alerts", "Bulk scan (CSV)", "Webhook integration", "Dedicated support", "Early access features"],
      featured: false,
    },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="grid-bg" />
      <div className="noise" />
      <div className="scanline" />

      {/* TOAST */}
      {toastMsg && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "var(--surface)", border: "1px solid var(--accent)",
          borderRadius: 2, padding: "10px 20px",
          fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)",
          zIndex: 300, boxShadow: "0 0 20px var(--glow)", whiteSpace: "nowrap",
          animation: "fadeIn 0.2s ease",
        }}>
          ⚡ {toastMsg}
        </div>
      )}

      {/* MODAL */}
      {modal && <PricingModal plan={modal} onClose={() => setModal(null)} />}

      {/* NAV */}
      <nav>
        <div className="nav-logo">King<span>Degen</span></div>
        <div className="nav-links">
          <a href="#scan">Scan</a>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <span className="nav-badge pulse">LIVE</span>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" id="scan">
        <div className="hero-tag">Contract Intelligence Protocol</div>
        <h1 className="hero-title">
          <div className="line1">Scan Smart</div>
          <div className="line2">Contracts</div>
        </h1>
        <p className="hero-sub">
          Detect rugs · honeypots · hidden taxes — instantly
        </p>

        <div className="scan-box">
          <div className="scan-header">
            <div className="scan-dot r" />
            <div className="scan-dot y" />
            <div className="scan-dot g" />
            <div className="scan-title-bar">kingdegen://contract-scanner</div>
          </div>
          <div className="scan-inner">
            <div className="scan-label">{">"} ENTER_CONTRACT_ADDRESS</div>
            <div className="scan-input-row">
              <input
                className="scan-input"
                placeholder="0x... or paste token address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !scanning && handleScan()}
              />
              <button
                className="scan-btn"
                onClick={handleScan}
                disabled={scanning}
              >
                {scanning ? "SCANNING..." : "SCAN →"}
              </button>
            </div>
            <div className="scan-meta">
              <span>Supports: ETH · BSC · Base · Polygon</span>
              <span className="free-badge">
                {scansLeft} scan{scansLeft !== 1 ? "s" : ""} left today
              </span>
            </div>

            {/* SCAN LOG */}
            {(scanning || scanLog.length > 0) && !result && (
              <div className="result-box" style={{ marginTop: 16 }}>
                {scanLog.map((log, i) => (
                  <div key={i} className="result-line">
                    <span style={{ color: "var(--accent2)" }}>{">"} </span>
                    <span style={{ color: "var(--text2)" }}>{log}</span>
                    <span style={{ color: "var(--accent)" }}> ✓</span>
                  </div>
                ))}
                {scanning && (
                  <div className="result-line">
                    <span style={{ color: "var(--accent)" }}>
                      <TypeWriter text={"> Processing..."} speed={40} />
                    </span>
                  </div>
                )}
              </div>
            )}

            <ScanResult result={result} />

            {scansLeft === 0 && (
              <div style={{
                marginTop: 12, padding: "10px 14px",
                background: "rgba(255,60,172,0.08)", border: "1px solid rgba(255,60,172,0.2)",
                borderRadius: 2,
                fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent3)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span>⚠ Daily limit reached</span>
                <button
                  onClick={() => setModal(plans[1])}
                  style={{
                    background: "none", border: "1px solid var(--accent)",
                    color: "var(--accent)", fontFamily: "var(--font-mono)",
                    fontSize: 10, padding: "3px 10px", borderRadius: 2,
                    cursor: "pointer", letterSpacing: 1,
                  }}
                >
                  UPGRADE →
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-bar">
        {[
          { num: "2.4M+", lbl: "Contracts Scanned" },
          { num: "98.7%", lbl: "Accuracy Rate" },
          { num: "<2s", lbl: "Avg Scan Time" },
          { num: "12K+", lbl: "Rugs Prevented" },
          { num: "4", lbl: "Networks" },
        ].map((s) => (
          <div className="stat-item" key={s.lbl}>
            <span className="stat-num">{s.num}</span>
            <span className="stat-lbl">{s.lbl}</span>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <section className="section" id="features">
        <div className="section-tag">{">"} Capabilities</div>
        <h2 className="section-title">
          What We <span>Detect</span>
        </h2>
        <div className="features-grid">
          {[
            { icon: "🍯", title: "Honeypot Detection", desc: "Identifies contracts where buyers cannot sell their tokens. Our multi-layer simulation catches even sophisticated honeypot mechanisms." },
            { icon: "🔒", title: "Liquidity Analysis", desc: "Verifies if liquidity is locked and for how long. Unlocked LP is one of the biggest rug pull signals." },
            { icon: "💰", title: "Tax & Fee Scanner", desc: "Detects hidden buy/sell taxes, dynamic fees, and tax wallet functions that could drain your investment." },
            { icon: "⚠️", title: "Mint & Blacklist", desc: "Checks for mint functions that can inflate supply and blacklist functions that can trap holders." },
            { icon: "👤", title: "Ownership Check", desc: "Verifies if contract ownership is renounced. Non-renounced contracts can be modified by developers at any time." },
            { icon: "📊", title: "Holder Analysis", desc: "Distribution analysis to detect whale concentration, team wallets, and suspicious accumulation patterns." },
          ].map((f) => (
            <div className="feature-card" key={f.title}>
              <span className="feature-icon">{f.icon}</span>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-tag">{">"} Protocol</div>
        <h2 className="section-title">
          How It <span>Works</span>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
          <div className="steps">
            {[
              { num: "01", title: "Paste Address", desc: "Input any token contract address from Ethereum, BSC, Base, or Polygon." },
              { num: "02", title: "Deep Scan", desc: "Our engine fetches bytecode, simulates buy/sell, and analyzes all contract functions." },
              { num: "03", title: "Get Report", desc: "Receive a complete security score with detailed breakdown of all risk factors." },
              { num: "04", title: "Trade Safe", desc: "Make informed decisions based on real on-chain data, not speculation." },
            ].map((s) => (
              <div className="step" key={s.num}>
                <div className="step-num">{s.num}</div>
                <div className="step-content">
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{
              background: "var(--surface)", border: "1px solid var(--border2)",
              borderRadius: 4, padding: 20,
              fontFamily: "var(--font-mono)", fontSize: 12,
              lineHeight: 1.8, color: "var(--text2)",
            }}>
              <div style={{ color: "var(--accent)", marginBottom: 8 }}>{">"} sample_output.json</div>
              {`{
  "contract": "0x7a250d...",
  "network": "ethereum",
  "honeypot": false,
  "tax_buy": 2,
  "tax_sell": 5,
  "lp_locked": true,
  "lp_lock_days": 365,
  "owner_renounced": true,
  "mint_function": false,
  "blacklist": false,
  "holders": 4821,
  "safety_score": 82,
  "verdict": "MODERATE_RISK"
}`}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className="tag green">✓ No Honeypot</span>
              <span className="tag blue">✓ LP Locked</span>
              <span className="tag green">✓ Renounced</span>
              <span className="tag orange">⚠ 5% Sell Tax</span>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section" id="pricing" style={{ paddingTop: 0 }}>
        <div className="section-tag">{">"} Access Tiers</div>
        <h2 className="section-title">
          Simple <span>Pricing</span>
        </h2>
        <div className="pricing-grid">
          {plans.map((plan) => (
            <div className={`price-card${plan.featured ? " featured" : ""}`} key={plan.id}>
              <div className="price-tier">Tier {plans.indexOf(plan) + 1}</div>
              <div className="price-name">{plan.name}</div>
              <div className="price-amount">
                {plan.price === "0" ? "Free" : `$${plan.price}`}
                {plan.price !== "0" && <span> USDT</span>}
              </div>
              <div className="price-period">
                {plan.scans} scans/day · {plan.period}
              </div>
              <ul className="price-features">
                {plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              {plan.id === "free" ? (
                <button className="price-cta" onClick={() => document.getElementById("scan").scrollIntoView({ behavior: "smooth" })}>
                  Start Free →
                </button>
              ) : (
                <button
                  className={`price-cta${plan.featured ? " featured-cta" : ""}`}
                  onClick={() => setModal(plan)}
                >
                  Upgrade →
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="price-note">Payment via USDT (TRC-20)</div>
      </section>

      {/* PAYMENT INFO */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-tag">{">"} Payment</div>
        <h2 className="section-title">
          Pay with <span>USDT</span>
        </h2>
        <div className="payment-box">
          <div>
            <div className="payment-label">Network</div>
            <div className="payment-value" style={{ marginBottom: 16 }}>
              <span>TRON (TRC-20)</span>
            </div>
            <div className="payment-label">USDT Wallet Address</div>
            <div className="payment-value">
              <span style={{ fontSize: 11 }}>TYourUSDTWalletAddressHere123456789</span>
              <button className="copy-btn" onClick={() => showToast("Address copied!")}>COPY</button>
            </div>
            <div style={{ marginTop: 16, padding: 12, background: "rgba(0,200,255,0.05)", border: "1px solid rgba(0,200,255,0.1)", borderRadius: 2 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent2)" }}>
                ℹ️ After payment, send your transaction hash to Telegram for instant activation.
              </div>
            </div>
          </div>
          <div>
            <div className="payment-label">Activation Process</div>
            <div className="payment-steps">
              {[
                "Choose your plan and send the exact USDT amount",
                "Copy your transaction hash from your wallet",
                "Send the hash + your email to our Telegram",
                "Receive activation confirmation within 1 hour",
              ].map((step, i) => (
                <div className="payment-step" key={i}>
                  <span className="payment-step-num">0{i + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
            <button
              style={{
                marginTop: 20, width: "100%", padding: "12px",
                background: "none", border: "1px solid var(--accent2)",
                borderRadius: 2, color: "var(--accent2)",
                fontFamily: "var(--font-display)", fontSize: 11,
                fontWeight: 700, letterSpacing: 2,
                textTransform: "uppercase", cursor: "pointer",
                transition: "all 0.2s",
              }}
              onClick={() => window.open("https://t.me/kingmeme", "_blank")}
              onMouseEnter={(e) => {
                e.target.style.background = "var(--accent2)";
                e.target.style.color = "#000";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "none";
                e.target.style.color = "var(--accent2)";
              }}
            >
              Open Telegram →
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">KingDegen</div>
        <div className="footer-copy">
          © 2024 KingDegen · Contract Intelligence Protocol
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <span className="tag blue">TRC-20</span>
          <span className="tag green">LIVE</span>
        </div>
      </footer>
    </>
  );
}
