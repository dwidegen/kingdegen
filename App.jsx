import { useState, useEffect } from "react";

// ==================================================
// 🔑 API KEY MORALIS (sudah dari akun kamu)
const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjI4NDZiNWEwLTQ2ZTgtNDRkMi1iNzdjLTg1ZTI5OWUyYjM0OSIsIm9yZ0lkIjoiNTE3MjYwIiwidXNlcklkIjoiNTMyMzIyIiwidHlwZUlkIjoiZTcyMGRiYjUtZTc0NC00Njg0LTk5ZDAtZWIzYmQwOTU0NDg3IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3Nzk2MjEwNDMsImV4cCI6NDkzNTM4MTA0M30.NMC4212fAlCD-e9eR4IO0YWXgeKnLb2uhrjfZRRfUkQ';
// ==================================================

const SCAN_TABS = ["OVERVIEW", "CONTRACT", "TOKENOMICS", "ON-CHAIN", "SOCIAL", "TOKEN NEWS"];
const NAV_TABS = ["SCANNER", "GLOBAL NEWS", "PRICING"];

const FREE_LIMIT = 5;

// Mock global news (tetap karena tidak dari API)
const globalNews = [
  { time: "1h ago", title: "Solana ecosystem hits new ATH in daily active users", sentiment: "bullish", source: "X / @solana" },
  { time: "3h ago", title: "SEC drops investigation against major DeFi protocol", sentiment: "bullish", source: "X / @CryptoLaw" },
  { time: "6h ago", title: "Large liquidations spotted across BTC leveraged positions", sentiment: "bearish", source: "X / @WhaleAlert" },
  { time: "8h ago", title: "New AI narrative tokens gaining traction on Base chain", sentiment: "bullish", source: "X / @DegenNews" },
  { time: "12h ago", title: "Binance lists 3 new tokens — volume spikes across pairs", sentiment: "neutral", source: "X / @Binance" },
  { time: "1d ago", title: "On-chain data suggests institutional accumulation in ETH", sentiment: "bullish", source: "X / @glassnode" },
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Bebas+Neue&family=Rajdhani:wght@400;600;700&display=swap');
@keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
@keyframes flicker { 0%,95%,100%{opacity:1}96%{opacity:0.4}97%{opacity:1}98%{opacity:0.2} }
@keyframes pulse-neon { 0%,100%{box-shadow:0 0 5px #00ffe5,0 0 20px #00ffe544}50%{box-shadow:0 0 15px #00ffe5,0 0 40px #00ffe588} }
@keyframes fadeUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
@keyframes blink { 0%,100%{opacity:1}50%{opacity:0} }
@keyframes marquee { from{transform:translateX(0)}to{transform:translateX(-50%)} }
@keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
`;

export default function KingDegen() {
  const [ca, setCa] = useState("");
  const [activeScanTab, setActiveScanTab] = useState("OVERVIEW");
  const [activeNav, setActiveNav] = useState("SCANNER");
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [typed, setTyped] = useState("");
  const [scansUsed, setScansUsed] = useState(2);
  const [plan, setPlan] = useState("FREE");
  const [errorMsg, setErrorMsg] = useState("");

  const scanLimit = plan === "FREE" ? 5 : plan === "DEGEN" ? 100 : 999999;
  const scansLeft = Math.max(0, scanLimit - scansUsed);
  const isLimited = plan === "FREE" && scansUsed >= FREE_LIMIT;

  // Fungsi ambil data dari GoPlus (gratis, tanpa API key)
  const fetchGoPlus = async (chain, contract) => {
    try {
      let url = `https://api.gopluslabs.io/api/v1/token_security/${chain}?contract_addresses=${contract}`;
      if (chain === 'solana') url = `https://api.gopluslabs.io/api/v1/solana/token_security?contract_addresses=${contract}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.result && json.result[contract]) {
        return json.result[contract];
      }
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // Fungsi ambil holder dari Moralis (EVM only)
  const fetchMoralisHolders = async (chain, contract) => {
    try {
      const chainMap = { eth: 'eth', bsc: 'bsc', base: 'base', arb: 'arbitrum' };
      const moralisChain = chainMap[chain] || 'eth';
      const url = `https://deep-index.moralis.io/api/v2.2/erc20/${contract}/owners?chain=${moralisChain}&order=DESC&limit=10`;
      const res = await fetch(url, { headers: { 'X-API-Key': MORALIS_API_KEY } });
      const data = await res.json();
      if (data && data.result) {
        let totalPct = 0;
        const topHolders = data.result.slice(0, 10).map(h => {
          const pct = parseFloat(h.percentage_relative_to_total_supply);
          totalPct += pct;
          return { address: h.owner_address, percentage: pct.toFixed(2) };
        });
        return { top10_percent: totalPct.toFixed(2), total_supply: data.total_supply, holders: topHolders };
      }
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // Deteksi network dari input address (sederhana)
  const detectNetwork = (address) => {
    if (address.startsWith("0x")) return "eth";
    if (address.length >= 32 && address.length <= 44 && !address.startsWith("0x")) return "solana";
    return "eth";
  };

  const handleScan = async () => {
    if (!ca.trim() || isLimited) return;
    setLoading(true);
    setScanned(false);
    setData(null);
    setErrorMsg("");
    setTyped("CONNECTING TO CHAIN...");

    try {
      const chain = detectNetwork(ca);
      setTyped("FETCHING CONTRACT DATA FROM GOPLUS...");
      const goplus = await fetchGoPlus(chain, ca);
      if (!goplus) {
        throw new Error("Token tidak ditemukan di GoPlus atau address salah.");
      }

      let holdersData = null;
      if (chain !== "solana") {
        setTyped("FETCHING HOLDER DATA FROM MORALIS...");
        holdersData = await fetchMoralisHolders(chain, ca);
      }

      // Mapping ke format UI yang sudah ada
      const contract_checks = {
        verified: goplus.open_source === "1",
        ownership_renounced: goplus.owner_address === "0x0000000000000000000000000000000000000000" || !goplus.owner_address,
        mint_active: goplus.mintable === "1",
        honeypot: goplus.is_honeypot === "1",
        buy_tax: parseFloat(goplus.buy_tax) || 0,
        sell_tax: parseFloat(goplus.sell_tax) || 0,
        proxy: goplus.proxy === "1",
      };
      const token_name = goplus.token_name || goplus.name || "Unknown";
      const token_ticker = goplus.symbol || "???";
      const score = goplus.is_honeypot === "1" ? 12 : goplus.mintable === "1" ? 45 : 78;
      const label = score >= 70 ? "SAFU" : score >= 40 ? "CAUTION" : "DANGER";

      const tokenomics = {
        total_supply: holdersData?.total_supply || "N/A",
        circulating: "N/A",
        top10_holders: holdersData?.top10_percent || "0",
        dev_wallet: goplus.owner_balance_percent || "0",
        lp_locked: goplus.lp_holder_count > 0,
        lp_size: "$?",
      };
      const onchain = {
        holders: goplus.holder_count || "N/A",
        tx_24h: "N/A",
        whale_activity: "Unknown",
        suspicious_clusters: 0,
      };
      const social = {
        x_posts_24h: 0,
        engagement: "N/A",
        fake_follower_flag: false,
        influencer_mentions: 0,
        paid_flag: false,
      };
      const news = [
        { time: "now", title: `Contract ${contract_checks.verified ? "verified" : "not verified"} on explorer`, sentiment: "neutral" },
        { time: "now", title: `Honeypot: ${contract_checks.honeypot ? "DETECTED ⚠️" : "Not detected"}`, sentiment: contract_checks.honeypot ? "bearish" : "bullish" },
      ];
      const links = { x: "https://x.com", website: "#", telegram: "#", discord: "#" };

      setData({
        name: token_name,
        ticker: token_ticker,
        network: chain.toUpperCase(),
        age: "Unknown",
        narrative: [],
        score: score,
        label: label,
        contract: ca,
        links: links,
        contract_checks: contract_checks,
        tokenomics: tokenomics,
        onchain: onchain,
        social: social,
        news: news,
      });

      setScanned(true);
      setScansUsed(prev => prev + 1);
      setActiveScanTab("OVERVIEW");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
      setTyped("");
    }
  };

  const scoreColor = (s) => s >= 75 ? "#00ffe5" : s >= 50 ? "#ffcc00" : "#ff2d55";
  const labelColor = (l) => l === "SAFU" ? "#00ffe5" : l === "CAUTION" ? "#ffcc00" : "#ff2d55";
  const sentimentColor = (s) => s === "bullish" ? "#00ffe5" : s === "bearish" ? "#ff2d55" : "#4a5568";

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight:"100vh", background:"#060810", color:"#e0e8ff", fontFamily:"'Rajdhani',sans-serif", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"fixed", inset:0, zIndex:0, backgroundImage:`linear-gradient(rgba(0,255,229,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,229,0.03) 1px,transparent 1px)`, backgroundSize:"40px 40px", pointerEvents:"none" }} />
        <div style={{ position:"fixed", top:0, left:0, right:0, height:"2px", background:"linear-gradient(90deg,transparent,#00ffe566,transparent)", animation:"scanline 4s linear infinite", zIndex:1, pointerEvents:"none" }} />
        <div style={{ background:"#0a0f1e", borderBottom:"1px solid #00ffe511", overflow:"hidden", height:"28px", display:"flex", alignItems:"center" }}>
          <div style={{ display:"flex", gap:"60px", whiteSpace:"nowrap", animation:"marquee 20s linear infinite", fontFamily:"'Share Tech Mono',monospace", fontSize:"10px", color:"#00ffe5" }}>
            {[...Array(2)].map((_,i) => (
              <span key={i} style={{ display:"flex", gap:"60px" }}>
                <span>SOL <span style={{color:"#00ff88"}}>↑ +4.2%</span></span>
                <span>ETH <span style={{color:"#ff2d55"}}>↓ -1.8%</span></span>
                <span>BTC <span style={{color:"#00ff88"}}>↑ +2.1%</span></span>
                <span>RUGS DETECTED TODAY <span style={{color:"#ff2d55"}}>47</span></span>
                <span>SAFUS VERIFIED <span style={{color:"#00ffe5"}}>312</span></span>
              </span>
            ))}
          </div>
        </div>
        <div style={{ padding:"16px 20px 12px", borderBottom:"1px solid #00ffe511", display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative", zIndex:2 }}>
          <div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"26px", letterSpacing:"4px", color:"#00ffe5", textShadow:"0 0 20px #00ffe5", animation:"flicker 8s infinite" }}>
              KING<span style={{color:"#ff2d55"}}>DEGEN</span>
            </div>
            <div style={{ fontSize:"9px", color:"#4a5568", fontFamily:"'Share Tech Mono',monospace", letterSpacing:"2px" }}>CONTRACT INTELLIGENCE PROTOCOL</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"4px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
              <div style={{ width:"7px", height:"7px", borderRadius:"50%", background:"#00ff88", boxShadow:"0 0 8px #00ff88", animation:"blink 2s infinite" }} />
              <span style={{ fontSize:"10px", color:"#4a5568", fontFamily:"'Share Tech Mono',monospace" }}>LIVE</span>
            </div>
            <div style={{ fontSize:"9px", fontFamily:"'Share Tech Mono'", padding:"2px 8px", borderRadius:"20px", background: plan==="FREE"?"#1a2035": plan==="DEGEN"?"#00ffe522":"#ff2d5522", color: plan==="FREE"?"#4a5568": plan==="DEGEN"?"#00ffe5":"#ff2d55", border:`1px solid ${plan==="FREE"?"#ffffff11": plan==="DEGEN"?"#00ffe533":"#ff2d5533"}` }}>
              {plan} PLAN
            </div>
          </div>
        </div>
        <div style={{ display:"flex", borderBottom:"1px solid #00ffe511", position:"relative", zIndex:2, background:"#060810" }}>
          {NAV_TABS.map(tab => (
            <button key={tab} onClick={() => setActiveNav(tab)} style={{ flex:1, padding:"12px 8px", background:"transparent", border:"none", borderBottom: activeNav===tab?"2px solid #00ffe5":"2px solid transparent", color: activeNav===tab?"#00ffe5":"#4a5568", fontFamily:"'Share Tech Mono',monospace", fontSize:"9px", letterSpacing:"1px", cursor:"pointer", transition:"all 0.2s" }}>
              {tab}
            </button>
          ))}
        </div>
        <div style={{ padding:"20px 18px", position:"relative", zIndex:2 }}>
          {activeNav === "SCANNER" && (
            <div style={{ animation:"fadeUp 0.3s ease" }}>
              <div style={{ marginBottom:"16px", padding:"10px 14px", background:"#0a0f1e", borderRadius:"8px", border:"1px solid #ffffff08" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
                  <span style={{ fontSize:"11px", color:"#8892a4", fontFamily:"'Share Tech Mono'" }}>DAILY SCANS</span>
                  <span style={{ fontSize:"11px", fontFamily:"'Share Tech Mono'", color: scansLeft===0?"#ff2d55": scansLeft<=2?"#ffcc00":"#00ffe5" }}>
                    {plan==="WHALE" ? "∞ UNLIMITED" : `${scansLeft} / ${scanLimit} LEFT`}
                  </span>
                </div>
                {plan !== "WHALE" && (
                  <div style={{ height:"4px", background:"#1a2035", borderRadius:"2px", overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${(scansUsed/scanLimit)*100}%`, background: scansLeft===0?"#ff2d55": scansLeft<=2?"#ffcc00":"linear-gradient(90deg,#00ffe5,#00a8ff)", borderRadius:"2px", transition:"width 0.5s" }} />
                  </div>
                )}
                {isLimited && (
                  <div style={{ marginTop:"8px", fontSize:"10px", color:"#ff2d55", fontFamily:"'Share Tech Mono'" }}>
                    ⚠ Daily limit reached — <span onClick={() => setActiveNav("PRICING")} style={{ color:"#00ffe5", cursor:"pointer", textDecoration:"underline" }}>Upgrade your plan</span>
                  </div>
                )}
              </div>
              <div style={{ marginBottom:"20px" }}>
                <div style={{ fontSize:"10px", color:"#00ffe5", fontFamily:"'Share Tech Mono',monospace", letterSpacing:"2px", marginBottom:"6px" }}>&gt; PASTE CONTRACT ADDRESS</div>
                <div style={{ display:"flex", gap:"8px" }}>
                  <input
                    value={ca} onChange={e => setCa(e.target.value)} onKeyDown={e => e.key==="Enter" && handleScan()}
                    placeholder="0x... or SOL address"
                    disabled={isLimited}
                    style={{ flex:1, background: isLimited?"#080c18":"#0a0f1e", border:"1px solid #00ffe533", borderRadius:"4px", padding:"11px 14px", color:"#00ffe5", fontFamily:"'Share Tech Mono',monospace", fontSize:"12px", outline:"none", opacity: isLimited?0.5:1 }}
                    onFocus={e => e.target.style.border="1px solid #00ffe5"}
                    onBlur={e => e.target.style.border="1px solid #00ffe533"}
                  />
                  <button onClick={handleScan} disabled={loading || isLimited} style={{ padding:"11px 18px", background: isLimited?"#1a2035": loading?"#0a0f1e":"linear-gradient(135deg,#00ffe5,#00a8ff)", border:"none", borderRadius:"4px", color: isLimited?"#4a5568":"#060810", fontFamily:"'Bebas Neue',sans-serif", fontSize:"15px", letterSpacing:"2px", cursor: isLimited||loading?"not-allowed":"pointer", animation: !loading&&!isLimited?"pulse-neon 2s infinite":"none", whiteSpace:"nowrap" }}>
                    {loading ? "⟳" : "SCAN"}
                  </button>
                </div>
              </div>
              {loading && (
                <div style={{ padding:"16px", background:"#0a0f1e", border:"1px solid #00ffe522", borderRadius:"8px", fontFamily:"'Share Tech Mono',monospace", fontSize:"12px", color:"#00ffe5", animation:"fadeUp 0.3s ease" }}>
                  <span style={{ animation:"blink 0.8s infinite", display:"inline-block" }}>▋</span> {typed}
                </div>
              )}
              {errorMsg && (
                <div style={{ padding:"16px", background:"#ff2d5511", border:"1px solid #ff2d55", borderRadius:"8px", color:"#ff2d55", fontFamily:"'Share Tech Mono'", fontSize:"12px" }}>
                  Error: {errorMsg}
                </div>
              )}
              {scanned && data && (
                <div style={{ animation:"fadeUp 0.4s ease" }}>
                  <div style={{ background:"#0a0f1e", border:`1px solid ${labelColor(data.label)}44`, borderRadius:"12px", padding:"16px", marginBottom:"14px", display:"flex", alignItems:"center", gap:"16px" }}>
                    <div style={{ position:"relative", flexShrink:0 }}>
                      <svg width="72" height="72" style={{ transform:"rotate(-90deg)" }}>
                        <circle cx="36" cy="36" r="30" fill="none" stroke="#1a2035" strokeWidth="5" />
                        <circle cx="36" cy="36" r="30" fill="none" stroke={scoreColor(data.score)} strokeWidth="5" strokeDasharray="188" strokeDashoffset={188-(data.score/100)*188} strokeLinecap="round" style={{ filter:`drop-shadow(0 0 6px ${scoreColor(data.score)})`, transition:"stroke-dashoffset 1s ease" }} />
                      </svg>
                      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column" }}>
                        <span style={{ fontFamily:"'Bebas Neue'", fontSize:"20px", color:scoreColor(data.score), lineHeight:1 }}>{data.score}</span>
                        <span style={{ fontSize:"7px", color:"#4a5568", fontFamily:"'Share Tech Mono'" }}>/100</span>
                      </div>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"4px", flexWrap:"wrap" }}>
                        <span style={{ fontFamily:"'Bebas Neue'", fontSize:"20px", color:"#fff" }}>{data.name}</span>
                        <span style={{ fontSize:"10px", color:"#4a5568", fontFamily:"'Share Tech Mono'" }}>${data.ticker}</span>
                        <span style={{ fontSize:"9px", padding:"2px 7px", background:"#1a2035", borderRadius:"20px", color:"#00a8ff", border:"1px solid #00a8ff33" }}>{data.network}</span>
                      </div>
                      <div style={{ display:"flex", gap:"5px", flexWrap:"wrap", marginBottom:"8px" }}>
                        {data.narrative.map(n => (
                          <span key={n} style={{ fontSize:"9px", padding:"2px 7px", background:"#00ffe511", borderRadius:"20px", color:"#00ffe5", border:"1px solid #00ffe522", fontFamily:"'Share Tech Mono'" }}>{n}</span>
                        ))}
                        <span style={{ fontSize:"9px", padding:"2px 7px", background:"#1a2035", borderRadius:"20px", color:"#4a5568", fontFamily:"'Share Tech Mono'" }}>AGE: {data.age}</span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <div style={{ display:"inline-block", padding:"3px 10px", borderRadius:"4px", background:`${labelColor(data.label)}22`, border:`1px solid ${labelColor(data.label)}`, color:labelColor(data.label), fontFamily:"'Bebas Neue'", fontSize:"13px", letterSpacing:"2px" }}>
                          ⚡ {data.label}
                        </div>
                        <div style={{ display:"flex", gap:"6px" }}>
                          {[{label:"𝕏",href:data.links.x},{label:"🌐",href:data.links.website},{label:"✈️",href:data.links.telegram}].map(l => (
                            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" style={{ width:"28px", height:"28px", background:"#1a2035", border:"1px solid #ffffff11", borderRadius:"5px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", textDecoration:"none" }}>{l.label}</a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display:"flex", borderBottom:"1px solid #00ffe511", marginBottom:"14px", overflowX:"auto" }}>
                    {SCAN_TABS.map(tab => (
                      <button key={tab} onClick={() => setActiveScanTab(tab)} style={{ padding:"8px 12px", background:"transparent", border:"none", borderBottom: activeScanTab===tab?"2px solid #00ffe5":"2px solid transparent", color: activeScanTab===tab?"#00ffe5":"#4a5568", fontFamily:"'Share Tech Mono',monospace", fontSize:"9px", letterSpacing:"1px", cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.2s" }}>{tab}</button>
                    ))}
                  </div>
                  <div style={{ animation:"fadeUp 0.3s ease" }}>
                    {activeScanTab === "OVERVIEW" && (
                      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <span style={{ fontSize:"13px", color:"#8892a4" }}>Contract Verified</span>
                          <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:data.contract_checks.verified?"#00ffe5":"#ff2d55" }}>{data.contract_checks.verified?"✓ YES":"✗ NO"}</span>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <span style={{ fontSize:"13px", color:"#8892a4" }}>Ownership Renounced</span>
                          <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:data.contract_checks.ownership_renounced?"#00ffe5":"#ff2d55" }}>{data.contract_checks.ownership_renounced?"✓ YES":"✗ NO"}</span>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <span style={{ fontSize:"13px", color:"#8892a4" }}>Honeypot Detected</span>
                          <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:data.contract_checks.honeypot?"#ff2d55":"#00ffe5" }}>{data.contract_checks.honeypot?"⚠ YES":"✓ NO"}</span>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <span style={{ fontSize:"13px", color:"#8892a4" }}>LP Locked</span>
                          <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:data.tokenomics.lp_locked?"#00ffe5":"#ff2d55" }}>{data.tokenomics.lp_locked?"✓ YES":"✗ NO"}</span>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <span style={{ fontSize:"13px", color:"#8892a4" }}>Top 10 Holders</span>
                          <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color: parseFloat(data.tokenomics.top10_holders) > 30 ? "#ffcc00":"#00ffe5" }}>{data.tokenomics.top10_holders}%</span>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <span style={{ fontSize:"13px", color:"#8892a4" }}>Sell Tax</span>
                          <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:data.contract_checks.sell_tax > 5 ? "#ffcc00":"#00ffe5" }}>{data.contract_checks.sell_tax}%</span>
                        </div>
                      </div>
                    )}
                    {activeScanTab === "CONTRACT" && (
                      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                        <div style={{ padding:"12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <div style={{ fontSize:"9px", color:"#4a5568", fontFamily:"'Share Tech Mono'", marginBottom:"4px" }}>CONTRACT ADDRESS</div>
                          <div style={{ fontSize:"11px", color:"#00ffe5", fontFamily:"'Share Tech Mono'", wordBreak:"break-all" }}>{ca}</div>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <span style={{ fontSize:"13px", color:"#8892a4" }}>Verified on Explorer</span>
                          <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:data.contract_checks.verified?"#00ffe5":"#ff2d55" }}>{data.contract_checks.verified?"✓ YES":"✗ NO"}</span>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <span style={{ fontSize:"13px", color:"#8892a4" }}>Ownership Renounced</span>
                          <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:data.contract_checks.ownership_renounced?"#00ffe5":"#ff2d55" }}>{data.contract_checks.ownership_renounced?"✓ YES":"✗ NO"}</span>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <span style={{ fontSize:"13px", color:"#8892a4" }}>Mint Function Active</span>
                          <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:data.contract_checks.mint_active?"#ff2d55":"#00ffe5" }}>{data.contract_checks.mint_active?"⚠ YES":"✓ NO"}</span>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <span style={{ fontSize:"13px", color:"#8892a4" }}>Honeypot Detected</span>
                          <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:data.contract_checks.honeypot?"#ff2d55":"#00ffe5" }}>{data.contract_checks.honeypot?"⚠ YES":"✓ NO"}</span>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <span style={{ fontSize:"13px", color:"#8892a4" }}>Buy Tax</span>
                          <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:"#00ffe5" }}>{data.contract_checks.buy_tax}%</span>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <span style={{ fontSize:"13px", color:"#8892a4" }}>Sell Tax</span>
                          <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:data.contract_checks.sell_tax > 5 ? "#ffcc00":"#00ffe5" }}>{data.contract_checks.sell_tax}%</span>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <span style={{ fontSize:"13px", color:"#8892a4" }}>Proxy / Upgradeable</span>
                          <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:data.contract_checks.proxy?"#ff2d55":"#00ffe5" }}>{data.contract_checks.proxy?"⚠ YES":"✓ NO"}</span>
                        </div>
                      </div>
                    )}
                    {activeScanTab === "TOKENOMICS" && (
                      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <span style={{ fontSize:"13px", color:"#8892a4" }}>Total Supply</span>
                          <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:"#00ffe5" }}>{data.tokenomics.total_supply}</span>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <span style={{ fontSize:"13px", color:"#8892a4" }}>Circulating Supply</span>
                          <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:"#00ffe5" }}>{data.tokenomics.circulating}</span>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <span style={{ fontSize:"13px", color:"#8892a4" }}>Top 10 Holders</span>
                          <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color: parseFloat(data.tokenomics.top10_holders) > 30 ? "#ffcc00":"#00ffe5" }}>{data.tokenomics.top10_holders}%</span>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <span style={{ fontSize:"13px", color:"#8892a4" }}>Dev Wallet</span>
                          <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color: parseFloat(data.tokenomics.dev_wallet) > 5 ? "#ffcc00":"#00ffe5" }}>{data.tokenomics.dev_wallet}%</span>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <span style={{ fontSize:"13px", color:"#8892a4" }}>LP Size</span>
                          <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:"#00ffe5" }}>{data.tokenomics.lp_size}</span>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <span style={{ fontSize:"13px", color:"#8892a4" }}>LP Locked</span>
                          <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:data.tokenomics.lp_locked?"#00ffe5":"#ff2d55" }}>{data.tokenomics.lp_locked?"✓ YES":"✗ NO"}</span>
                        </div>
                        <div style={{ padding:"12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
                            <span style={{ fontSize:"12px", color:"#8892a4" }}>Concentration Risk</span>
                            <span style={{ fontSize:"11px", color: parseFloat(data.tokenomics.top10_holders) > 30 ? "#ffcc00" : parseFloat(data.tokenomics.top10_holders) > 15 ? "#ffcc00" : "#00ffe5", fontFamily:"'Share Tech Mono'" }}>{parseFloat(data.tokenomics.top10_holders) > 30 ? "HIGH" : parseFloat(data.tokenomics.top10_holders) > 15 ? "MEDIUM" : "LOW"}</span>
                          </div>
                          <div style={{ height:"5px", background:"#1a2035", borderRadius:"3px", overflow:"hidden" }}>
                            <div style={{ height:"100%", width:`${Math.min(100, parseFloat(data.tokenomics.top10_holders))}%`, background:"linear-gradient(90deg,#00ffe5,#ffcc00)", borderRadius:"3px" }} />
                          </div>
                          <div style={{ fontSize:"9px", color:"#4a5568", fontFamily:"'Share Tech Mono'", marginTop:"4px" }}>Top 10 wallets hold {data.tokenomics.top10_holders}% of supply</div>
                        </div>
                      </div>
                    )}
                    {activeScanTab === "ON-CHAIN" && (
                      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <span style={{ fontSize:"13px", color:"#8892a4" }}>Total Holders</span>
                          <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:"#00ffe5" }}>{data.onchain.holders}</span>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <span style={{ fontSize:"13px", color:"#8892a4" }}>Transactions (24h)</span>
                          <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:"#00ffe5" }}>{data.onchain.tx_24h}</span>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <span style={{ fontSize:"13px", color:"#8892a4" }}>Whale Activity</span>
                          <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:"#ffcc00" }}>{data.onchain.whale_activity}</span>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <span style={{ fontSize:"13px", color:"#8892a4" }}>Suspicious Clusters</span>
                          <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:data.onchain.suspicious_clusters > 0 ? "#ffcc00":"#00ffe5" }}>{data.onchain.suspicious_clusters}</span>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <span style={{ fontSize:"13px", color:"#8892a4" }}>Contract Age</span>
                          <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:"#00ffe5" }}>{data.age}</span>
                        </div>
                      </div>
                    )}
                    {activeScanTab === "SOCIAL" && (
                      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <span style={{ fontSize:"13px", color:"#8892a4" }}>X Posts (24h)</span>
                          <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:"#00ffe5" }}>{data.social.x_posts_24h}</span>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <span style={{ fontSize:"13px", color:"#8892a4" }}>Engagement Rate</span>
                          <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:"#00ffe5" }}>{data.social.engagement}</span>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <span style={{ fontSize:"13px", color:"#8892a4" }}>Fake Follower Flag</span>
                          <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:data.social.fake_follower_flag?"#ff2d55":"#00ffe5" }}>{data.social.fake_follower_flag?"⚠ FLAGGED":"✓ CLEAN"}</span>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <span style={{ fontSize:"13px", color:"#8892a4" }}>Influencer Mentions</span>
                          <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:"#00ffe5" }}>{data.social.influencer_mentions}</span>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <span style={{ fontSize:"13px", color:"#8892a4" }}>Paid Promotion Flag</span>
                          <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:data.social.paid_flag?"#ff2d55":"#00ffe5" }}>{data.social.paid_flag?"⚠ FLAGGED":"✓ CLEAN"}</span>
                        </div>
                        <a href={data.links.x} target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", padding:"11px", background:"#0a0f1e", border:"1px solid #ffffff22", borderRadius:"6px", color:"#fff", textDecoration:"none", fontFamily:"'Bebas Neue'", fontSize:"13px", letterSpacing:"2px" }}>
                          𝕏 &nbsp;VIEW ON X / TWITTER
                        </a>
                      </div>
                    )}
                    {activeScanTab === "TOKEN NEWS" && (
                      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                        {data.news.map((n,i) => (
                          <div key={i} style={{ padding:"12px", background:"#0a0f1e", borderRadius:"6px", borderLeft:`3px solid ${sentimentColor(n.sentiment)}`, border:"1px solid #ffffff08", borderLeft:`3px solid ${sentimentColor(n.sentiment)}` }}>
                            <div style={{ fontSize:"13px", color:"#e0e8ff", marginBottom:"4px", lineHeight:1.4 }}>{n.title}</div>
                            <div style={{ display:"flex", justifyContent:"space-between" }}>
                              <span style={{ fontSize:"9px", color:"#4a5568", fontFamily:"'Share Tech Mono'" }}>{n.time}</span>
                              <span style={{ fontSize:"9px", fontFamily:"'Share Tech Mono'", color:sentimentColor(n.sentiment) }}>{n.sentiment.toUpperCase()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop:"14px", padding:"10px 12px", background:"#ff2d5511", border:"1px solid #ff2d5522", borderRadius:"6px", fontSize:"9px", color:"#ff2d5577", fontFamily:"'Share Tech Mono'", lineHeight:1.6 }}>
                    ⚠ DYOR. Data is for reference only, not financial advice. KingDegen is not responsible for your trading decisions.
                  </div>
                </div>
              )}
              {!scanned && !loading && !errorMsg && (
                <div style={{ textAlign:"center", padding:"40px 20px" }}>
                  <div style={{ fontSize:"38px", marginBottom:"12px", opacity:0.2 }}>👑</div>
                  <div style={{ fontFamily:"'Bebas Neue'", fontSize:"16px", color:"#2a3555", letterSpacing:"3px" }}>PASTE CA TO SCAN</div>
                  <div style={{ fontSize:"10px", color:"#2a3555", fontFamily:"'Share Tech Mono'", marginTop:"6px" }}>ETH · BSC · SOLANA · BASE · ARB</div>
                </div>
              )}
            </div>
          )}
          {activeNav === "GLOBAL NEWS" && (
            <div style={{ animation:"fadeUp 0.3s ease" }}>
              <div style={{ fontSize:"10px", color:"#00ffe5", fontFamily:"'Share Tech Mono'", letterSpacing:"2px", marginBottom:"14px" }}>&gt; LATEST CRYPTO INTEL</div>
              <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                {globalNews.map((n,i) => (
                  <div key={i} style={{ padding:"14px", background:"#0a0f1e", borderRadius:"8px", borderLeft:`3px solid ${sentimentColor(n.sentiment)}`, border:"1px solid #ffffff08", borderLeft:`3px solid ${sentimentColor(n.sentiment)}` }}>
                    <div style={{ fontSize:"14px", color:"#e0e8ff", marginBottom:"6px", lineHeight:1.4 }}>{n.title}</div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontSize:"9px", color:"#4a5568", fontFamily:"'Share Tech Mono'" }}>{n.source}</span>
                      <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
                        <span style={{ fontSize:"9px", color:"#4a5568", fontFamily:"'Share Tech Mono'" }}>{n.time}</span>
                        <span style={{ fontSize:"9px", fontFamily:"'Share Tech Mono'", color:sentimentColor(n.sentiment), padding:"1px 6px", background:`${sentimentColor(n.sentiment)}22`, borderRadius:"3px" }}>{n.sentiment.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:"14px", padding:"10px 12px", background:"#00ffe511", border:"1px solid #00ffe522", borderRadius:"6px", fontSize:"9px", color:"#00ffe577", fontFamily:"'Share Tech Mono'", lineHeight:1.6 }}>
                ℹ News is curated manually. Last updated: today.
              </div>
            </div>
          )}
          {activeNav === "PRICING" && (
            <div style={{ animation:"fadeUp 0.3s ease" }}>
              <div style={{ fontSize:"10px", color:"#00ffe5", fontFamily:"'Share Tech Mono'", letterSpacing:"2px", marginBottom:"6px" }}>&gt; CHOOSE YOUR PLAN</div>
              <div style={{ fontSize:"11px", color:"#4a5568", fontFamily:"'Share Tech Mono'", marginBottom:"20px" }}>Pay with USDT · Instant activation via email</div>
              <div style={{ padding:"18px", background:"#0a0f1e", border:"1px solid #ffffff11", borderRadius:"12px", marginBottom:"12px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"12px" }}>
                  <div><div style={{ fontFamily:"'Bebas Neue'", fontSize:"20px", color:"#fff", letterSpacing:"2px" }}>FREE</div><div style={{ fontSize:"10px", color:"#4a5568", fontFamily:"'Share Tech Mono'" }}>No registration needed</div></div>
                  <div><div style={{ fontFamily:"'Bebas Neue'", fontSize:"26px", color:"#4a5568" }}>$0</div><div style={{ fontSize:"9px", color:"#4a5568", fontFamily:"'Share Tech Mono'" }}>forever</div></div>
                </div>
                {["5 scans per day","Basic contract check","Overview tab only","Global news access"].map(f => <div key={f} style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px" }}><span style={{ color:"#00ffe5", fontSize:"11px" }}>✓</span><span style={{ fontSize:"12px", color:"#8892a4" }}>{f}</span></div>)}
                <div style={{ marginTop:"12px", padding:"10px", background:"#1a2035", borderRadius:"6px", textAlign:"center", fontFamily:"'Share Tech Mono'", fontSize:"11px", color:"#4a5568" }}>CURRENT PLAN</div>
              </div>
              <div style={{ padding:"18px", background:"#0a0f1e", border:"1px solid #00ffe544", borderRadius:"12px", marginBottom:"12px", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:"10px", right:"10px", background:"#00ffe522", border:"1px solid #00ffe5", borderRadius:"20px", padding:"2px 10px", fontSize:"9px", color:"#00ffe5", fontFamily:"'Share Tech Mono'", letterSpacing:"1px" }}>POPULAR</div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"12px" }}>
                  <div><div style={{ fontFamily:"'Bebas Neue'", fontSize:"20px", color:"#00ffe5", letterSpacing:"2px" }}>DEGEN</div><div style={{ fontSize:"10px", color:"#4a5568", fontFamily:"'Share Tech Mono'" }}>For active traders</div></div>
                  <div><div style={{ fontFamily:"'Bebas Neue'", fontSize:"26px", color:"#00ffe5" }}>$9</div><div style={{ fontSize:"9px", color:"#4a5568", fontFamily:"'Share Tech Mono'" }}>per month</div></div>
                </div>
                {["100 scans per day","Full contract analysis","All tabs unlocked","Token news feed","Priority support"].map(f => <div key={f} style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px" }}><span style={{ color:"#00ffe5", fontSize:"11px" }}>✓</span><span style={{ fontSize:"12px", color:"#e0e8ff" }}>{f}</span></div>)}
                <button style={{ marginTop:"12px", width:"100%", padding:"12px", background:"linear-gradient(135deg,#00ffe5,#00a8ff)", border:"none", borderRadius:"6px", color:"#060810", fontFamily:"'Bebas Neue'", fontSize:"15px", letterSpacing:"2px", cursor:"pointer", animation:"pulse-neon 2s infinite" }}>PAY WITH USDT</button>
              </div>
              <div style={{ padding:"18px", background:"#0a0f1e", border:"1px solid #ff2d5544", borderRadius:"12px", marginBottom:"12px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"12px" }}>
                  <div><div style={{ fontFamily:"'Bebas Neue'", fontSize:"20px", color:"#ff2d55", letterSpacing:"2px" }}>WHALE</div><div style={{ fontSize:"10px", color:"#4a5568", fontFamily:"'Share Tech Mono'" }}>For power users</div></div>
                  <div><div style={{ fontFamily:"'Bebas Neue'", fontSize:"26px", color:"#ff2d55" }}>$25</div><div style={{ fontSize:"9px", color:"#4a5568", fontFamily:"'Share Tech Mono'" }}>per month</div></div>
                </div>
                {["Unlimited scans","Full contract analysis","All tabs unlocked","Token + global news","Whale alert notifications","VIP support"].map(f => <div key={f} style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px" }}><span style={{ color:"#ff2d55", fontSize:"11px" }}>✓</span><span style={{ fontSize:"12px", color:"#e0e8ff" }}>{f}</span></div>)}
                <button style={{ marginTop:"12px", width:"100%", padding:"12px", background:"linear-gradient(135deg,#ff2d55,#ff6b35)", border:"none", borderRadius:"6px", color:"#fff", fontFamily:"'Bebas Neue'", fontSize:"15px", letterSpacing:"2px", cursor:"pointer" }}>PAY WITH USDT</button>
              </div>
              <div style={{ padding:"12px", background:"#0a0f1e", border:"1px solid #ffffff08", borderRadius:"8px" }}>
                <div style={{ fontSize:"10px", color:"#00ffe5", fontFamily:"'Share Tech Mono'", marginBottom:"8px", letterSpacing:"1px" }}>HOW PAYMENT WORKS</div>
                {["Click PAY WITH USDT","Send exact amount to wallet address shown","System detects your payment automatically","Email confirmation sent instantly","Your plan activates immediately"].map((s,i) => <div key={i} style={{ display:"flex", gap:"10px", marginBottom:"6px", alignItems:"flex-start" }}><span style={{ fontSize:"10px", color:"#00ffe5", fontFamily:"'Share Tech Mono'", flexShrink:0 }}>{i+1}.</span><span style={{ fontSize:"12px", color:"#8892a4" }}>{s}</span></div>)}
                <div style={{ marginTop:"8px", fontSize:"9px", color:"#4a5568", fontFamily:"'Share Tech Mono'" }}>Accepts USDT TRC20 · ERC20 · BEP20</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
