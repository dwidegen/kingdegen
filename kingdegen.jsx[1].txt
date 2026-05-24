import { useState, useEffect } from "react";

const mockData = {
  name: "DegenAI",
  ticker: "DGAI",
  network: "Solana",
  age: "14 days",
  narrative: ["AI", "DeFi"],
  score: 62,
  label: "CAUTION",
  contract: "7xKj...m9Pq",
  links: { x: "https://x.com", website: "https://example.com", telegram: "https://t.me", discord: "https://discord.com" },
  contract_checks: { verified: true, ownership_renounced: false, mint_active: false, honeypot: false, buy_tax: 2, sell_tax: 5, proxy: false },
  tokenomics: { total_supply: "1,000,000,000", circulating: "620,000,000", top10_holders: 38, dev_wallet: 8, lp_locked: true, lp_size: "$284,000" },
  onchain: { holders: 3847, tx_24h: 1204, whale_activity: "Medium", suspicious_clusters: 2 },
  social: { x_posts_24h: 47, engagement: "High", fake_follower_flag: false, influencer_mentions: 3, paid_flag: true },
  news: [
    { time: "2h ago", title: "DegenAI partners with major DEX aggregator for deeper liquidity", sentiment: "bullish" },
    { time: "5h ago", title: "On-chain data shows whale accumulation in last 6 hours", sentiment: "bullish" },
    { time: "12h ago", title: "Dev wallet moved 2M tokens to unknown address", sentiment: "bearish" },
    { time: "1d ago", title: "AI narrative tokens rally as sector gains momentum", sentiment: "neutral" },
    { time: "2d ago", title: "Community raises concerns over vesting schedule transparency", sentiment: "bearish" },
  ],
};

const globalNews = [
  { time: "1h ago", title: "Solana ecosystem hits new ATH in daily active users", sentiment: "bullish", source: "X / @solana" },
  { time: "3h ago", title: "SEC drops investigation against major DeFi protocol", sentiment: "bullish", source: "X / @CryptoLaw" },
  { time: "6h ago", title: "Large liquidations spotted across BTC leveraged positions", sentiment: "bearish", source: "X / @WhaleAlert" },
  { time: "8h ago", title: "New AI narrative tokens gaining traction on Base chain", sentiment: "bullish", source: "X / @DegenNews" },
  { time: "12h ago", title: "Binance lists 3 new tokens — volume spikes across pairs", sentiment: "neutral", source: "X / @Binance" },
  { time: "1d ago", title: "On-chain data suggests institutional accumulation in ETH", sentiment: "bullish", source: "X / @glassnode" },
];

const SCAN_TABS = ["OVERVIEW", "CONTRACT", "TOKENOMICS", "ON-CHAIN", "SOCIAL", "TOKEN NEWS"];
const NAV_TABS = ["SCANNER", "GLOBAL NEWS", "PRICING"];

const FREE_LIMIT = 5;

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
  const [scansUsed, setScansUsed] = useState(2); // mock: user used 2 of 5
  const [plan, setPlan] = useState("FREE"); // FREE | DEGEN | WHALE

  const scanLimit = plan === "FREE" ? 5 : plan === "DEGEN" ? 100 : 999999;
  const scansLeft = Math.max(0, scanLimit - scansUsed);
  const isLimited = plan === "FREE" && scansUsed >= FREE_LIMIT;

  const handleScan = () => {
    if (!ca.trim() || isLimited) return;
    setLoading(true);
    setScanned(false);
    setData(null);
    const msgs = ["CONNECTING TO CHAIN...", "FETCHING CONTRACT...", "ANALYZING TOKENOMICS...", "SCANNING SOCIAL...", "COMPUTING RISK SCORE..."];
    let i = 0;
    const interval = setInterval(() => {
      if (i < msgs.length) { setTyped(msgs[i]); i++; }
      else {
        clearInterval(interval);
        setLoading(false);
        setScanned(true);
        setData(mockData);
        setScansUsed(prev => prev + 1);
        setActiveScanTab("OVERVIEW");
      }
    }, 500);
  };

  const scoreColor = (s) => s >= 75 ? "#00ffe5" : s >= 50 ? "#ffcc00" : "#ff2d55";
  const labelColor = (l) => l === "SAFU" ? "#00ffe5" : l === "CAUTION" ? "#ffcc00" : "#ff2d55";
  const sentimentColor = (s) => s === "bullish" ? "#00ffe5" : s === "bearish" ? "#ff2d55" : "#4a5568";

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight:"100vh", background:"#060810", color:"#e0e8ff", fontFamily:"'Rajdhani',sans-serif", position:"relative", overflow:"hidden" }}>

        {/* Grid bg */}
        <div style={{ position:"fixed", inset:0, zIndex:0, backgroundImage:`linear-gradient(rgba(0,255,229,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,229,0.03) 1px,transparent 1px)`, backgroundSize:"40px 40px", pointerEvents:"none" }} />

        {/* Scanline */}
        <div style={{ position:"fixed", top:0, left:0, right:0, height:"2px", background:"linear-gradient(90deg,transparent,#00ffe566,transparent)", animation:"scanline 4s linear infinite", zIndex:1, pointerEvents:"none" }} />

        {/* Ticker */}
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

        {/* Header */}
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
            {/* Plan badge */}
            <div style={{ fontSize:"9px", fontFamily:"'Share Tech Mono'", padding:"2px 8px", borderRadius:"20px", background: plan==="FREE"?"#1a2035": plan==="DEGEN"?"#00ffe522":"#ff2d5522", color: plan==="FREE"?"#4a5568": plan==="DEGEN"?"#00ffe5":"#ff2d55", border:`1px solid ${plan==="FREE"?"#ffffff11": plan==="DEGEN"?"#00ffe533":"#ff2d5533"}` }}>
              {plan} PLAN
            </div>
          </div>
        </div>

        {/* Nav tabs */}
        <div style={{ display:"flex", borderBottom:"1px solid #00ffe511", position:"relative", zIndex:2, background:"#060810" }}>
          {NAV_TABS.map(tab => (
            <button key={tab} onClick={() => setActiveNav(tab)} style={{ flex:1, padding:"12px 8px", background:"transparent", border:"none", borderBottom: activeNav===tab?"2px solid #00ffe5":"2px solid transparent", color: activeNav===tab?"#00ffe5":"#4a5568", fontFamily:"'Share Tech Mono',monospace", fontSize:"9px", letterSpacing:"1px", cursor:"pointer", transition:"all 0.2s" }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding:"20px 18px", position:"relative", zIndex:2 }}>

          {/* ===== SCANNER TAB ===== */}
          {activeNav === "SCANNER" && (
            <div style={{ animation:"fadeUp 0.3s ease" }}>

              {/* Scan limit bar */}
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

              {/* Input */}
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

              {/* Loading */}
              {loading && (
                <div style={{ padding:"16px", background:"#0a0f1e", border:"1px solid #00ffe522", borderRadius:"8px", fontFamily:"'Share Tech Mono',monospace", fontSize:"12px", color:"#00ffe5", animation:"fadeUp 0.3s ease" }}>
                  <span style={{ animation:"blink 0.8s infinite", display:"inline-block" }}>▋</span> {typed}
                </div>
              )}

              {/* Results */}
              {scanned && data && (
                <div style={{ animation:"fadeUp 0.4s ease" }}>
                  {/* Score card */}
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

                  {/* Scan tabs */}
                  <div style={{ display:"flex", borderBottom:"1px solid #00ffe511", marginBottom:"14px", overflowX:"auto" }}>
                    {SCAN_TABS.map(tab => (
                      <button key={tab} onClick={() => setActiveScanTab(tab)} style={{ padding:"8px 12px", background:"transparent", border:"none", borderBottom: activeScanTab===tab?"2px solid #00ffe5":"2px solid transparent", color: activeScanTab===tab?"#00ffe5":"#4a5568", fontFamily:"'Share Tech Mono',monospace", fontSize:"9px", letterSpacing:"1px", cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.2s" }}>{tab}</button>
                    ))}
                  </div>

                  <div style={{ animation:"fadeUp 0.3s ease" }}>
                    {activeScanTab === "OVERVIEW" && (
                      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                        {[
                          {label:"Contract Verified", val:data.contract_checks.verified, bool:true},
                          {label:"Ownership Renounced", val:data.contract_checks.ownership_renounced, bool:true},
                          {label:"Honeypot Detected", val:data.contract_checks.honeypot, bool:true, invert:true},
                          {label:"LP Locked", val:data.tokenomics.lp_locked, bool:true},
                          {label:"Top 10 Holders", val:`${data.tokenomics.top10_holders}%`, warn:data.tokenomics.top10_holders>30},
                          {label:"Sell Tax", val:`${data.contract_checks.sell_tax}%`, warn:data.contract_checks.sell_tax>5},
                        ].map(item => (
                          <div key={item.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                            <span style={{ fontSize:"13px", color:"#8892a4" }}>{item.label}</span>
                            {item.bool ? (
                              <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:item.invert?(item.val?"#ff2d55":"#00ffe5"):(item.val?"#00ffe5":"#ff2d55") }}>
                                {item.val?(item.invert?"⚠ YES":"✓ YES"):(item.invert?"✓ NO":"✗ NO")}
                              </span>
                            ) : (
                              <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:item.warn?"#ffcc00":"#00ffe5" }}>{item.val}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {activeScanTab === "CONTRACT" && (
                      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                        <div style={{ padding:"12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <div style={{ fontSize:"9px", color:"#4a5568", fontFamily:"'Share Tech Mono'", marginBottom:"4px" }}>CONTRACT ADDRESS</div>
                          <div style={{ fontSize:"11px", color:"#00ffe5", fontFamily:"'Share Tech Mono'", wordBreak:"break-all" }}>{ca||data.contract}</div>
                        </div>
                        {[
                          {label:"Verified on Explorer", val:data.contract_checks.verified, bool:true},
                          {label:"Ownership Renounced", val:data.contract_checks.ownership_renounced, bool:true},
                          {label:"Mint Function Active", val:data.contract_checks.mint_active, bool:true, invert:true},
                          {label:"Honeypot Detected", val:data.contract_checks.honeypot, bool:true, invert:true},
                          {label:"Buy Tax", val:`${data.contract_checks.buy_tax}%`},
                          {label:"Sell Tax", val:`${data.contract_checks.sell_tax}%`, warn:data.contract_checks.sell_tax>5},
                          {label:"Proxy / Upgradeable", val:data.contract_checks.proxy, bool:true, invert:true},
                        ].map(item => (
                          <div key={item.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                            <span style={{ fontSize:"13px", color:"#8892a4" }}>{item.label}</span>
                            {item.bool ? (
                              <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:item.invert?(item.val?"#ff2d55":"#00ffe5"):(item.val?"#00ffe5":"#ff2d55") }}>
                                {item.val?(item.invert?"⚠ YES":"✓ YES"):(item.invert?"✓ NO":"✗ NO")}
                              </span>
                            ) : (
                              <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:item.warn?"#ffcc00":"#00ffe5" }}>{item.val}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {activeScanTab === "TOKENOMICS" && (
                      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                        {[
                          {label:"Total Supply", val:data.tokenomics.total_supply},
                          {label:"Circulating Supply", val:data.tokenomics.circulating},
                          {label:"Top 10 Holders", val:`${data.tokenomics.top10_holders}%`, warn:data.tokenomics.top10_holders>30},
                          {label:"Dev Wallet", val:`${data.tokenomics.dev_wallet}%`, warn:data.tokenomics.dev_wallet>5},
                          {label:"LP Size", val:data.tokenomics.lp_size},
                          {label:"LP Locked", val:data.tokenomics.lp_locked, bool:true},
                        ].map(item => (
                          <div key={item.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                            <span style={{ fontSize:"13px", color:"#8892a4" }}>{item.label}</span>
                            {item.bool ? (
                              <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:item.val?"#00ffe5":"#ff2d55" }}>{item.val?"✓ YES":"✗ NO"}</span>
                            ) : (
                              <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:item.warn?"#ffcc00":"#00ffe5" }}>{item.val}</span>
                            )}
                          </div>
                        ))}
                        <div style={{ padding:"12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
                            <span style={{ fontSize:"12px", color:"#8892a4" }}>Concentration Risk</span>
                            <span style={{ fontSize:"11px", color:"#ffcc00", fontFamily:"'Share Tech Mono'" }}>MEDIUM</span>
                          </div>
                          <div style={{ height:"5px", background:"#1a2035", borderRadius:"3px", overflow:"hidden" }}>
                            <div style={{ height:"100%", width:`${data.tokenomics.top10_holders}%`, background:"linear-gradient(90deg,#00ffe5,#ffcc00)", borderRadius:"3px" }} />
                          </div>
                          <div style={{ fontSize:"9px", color:"#4a5568", fontFamily:"'Share Tech Mono'", marginTop:"4px" }}>Top 10 wallets hold {data.tokenomics.top10_holders}% of supply</div>
                        </div>
                      </div>
                    )}

                    {activeScanTab === "ON-CHAIN" && (
                      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                        {[
                          {label:"Total Holders", val:data.onchain.holders.toLocaleString()},
                          {label:"Transactions (24h)", val:data.onchain.tx_24h.toLocaleString()},
                          {label:"Whale Activity", val:data.onchain.whale_activity, warn:data.onchain.whale_activity==="High"},
                          {label:"Suspicious Clusters", val:data.onchain.suspicious_clusters, warn:data.onchain.suspicious_clusters>0},
                          {label:"Contract Age", val:data.age},
                        ].map(item => (
                          <div key={item.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                            <span style={{ fontSize:"13px", color:"#8892a4" }}>{item.label}</span>
                            <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:item.warn?"#ffcc00":"#00ffe5" }}>{item.val}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeScanTab === "SOCIAL" && (
                      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                        {[
                          {label:"X Posts (24h)", val:data.social.x_posts_24h},
                          {label:"Engagement Rate", val:data.social.engagement},
                          {label:"Fake Follower Flag", val:data.social.fake_follower_flag, bool:true, invert:true},
                          {label:"Influencer Mentions", val:data.social.influencer_mentions},
                          {label:"Paid Promotion Flag", val:data.social.paid_flag, bool:true, invert:true},
                        ].map(item => (
                          <div key={item.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#0a0f1e", borderRadius:"6px", border:"1px solid #ffffff08" }}>
                            <span style={{ fontSize:"13px", color:"#8892a4" }}>{item.label}</span>
                            {item.bool ? (
                              <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:item.invert?(item.val?"#ff2d55":"#00ffe5"):(item.val?"#00ffe5":"#ff2d55") }}>
                                {item.val?(item.invert?"⚠ FLAGGED":"✓ YES"):(item.invert?"✓ CLEAN":"✗ NO")}
                              </span>
                            ) : (
                              <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:"#00ffe5" }}>{item.val}</span>
                            )}
                          </div>
                        ))}
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

              {/* Empty state */}
              {!scanned && !loading && (
                <div style={{ textAlign:"center", padding:"40px 20px" }}>
                  <div style={{ fontSize:"38px", marginBottom:"12px", opacity:0.2 }}>👑</div>
                  <div style={{ fontFamily:"'Bebas Neue'", fontSize:"16px", color:"#2a3555", letterSpacing:"3px" }}>PASTE CA TO SCAN</div>
                  <div style={{ fontSize:"10px", color:"#2a3555", fontFamily:"'Share Tech Mono'", marginTop:"6px" }}>ETH · BSC · SOLANA · BASE · ARB</div>
                </div>
              )}
            </div>
          )}

          {/* ===== GLOBAL NEWS TAB ===== */}
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

          {/* ===== PRICING TAB ===== */}
          {activeNav === "PRICING" && (
            <div style={{ animation:"fadeUp 0.3s ease" }}>
              <div style={{ fontSize:"10px", color:"#00ffe5", fontFamily:"'Share Tech Mono'", letterSpacing:"2px", marginBottom:"6px" }}>&gt; CHOOSE YOUR PLAN</div>
              <div style={{ fontSize:"11px", color:"#4a5568", fontFamily:"'Share Tech Mono'", marginBottom:"20px" }}>Pay with USDT · Instant activation via email</div>

              {/* FREE */}
              <div style={{ padding:"18px", background:"#0a0f1e", border:"1px solid #ffffff11", borderRadius:"12px", marginBottom:"12px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"12px" }}>
                  <div>
                    <div style={{ fontFamily:"'Bebas Neue'", fontSize:"20px", color:"#fff", letterSpacing:"2px" }}>FREE</div>
                    <div style={{ fontSize:"10px", color:"#4a5568", fontFamily:"'Share Tech Mono'" }}>No registration needed</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"'Bebas Neue'", fontSize:"26px", color:"#4a5568" }}>$0</div>
                    <div style={{ fontSize:"9px", color:"#4a5568", fontFamily:"'Share Tech Mono'" }}>forever</div>
                  </div>
                </div>
                {["5 scans per day","Basic contract check","Overview tab only","Global news access"].map(f => (
                  <div key={f} style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px" }}>
                    <span style={{ color:"#00ffe5", fontSize:"11px" }}>✓</span>
                    <span style={{ fontSize:"12px", color:"#8892a4" }}>{f}</span>
                  </div>
                ))}
                <div style={{ marginTop:"12px", padding:"10px", background:"#1a2035", borderRadius:"6px", textAlign:"center", fontFamily:"'Share Tech Mono'", fontSize:"11px", color:"#4a5568" }}>
                  CURRENT PLAN
                </div>
              </div>

              {/* DEGEN */}
              <div style={{ padding:"18px", background:"#0a0f1e", border:"1px solid #00ffe544", borderRadius:"12px", marginBottom:"12px", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:"10px", right:"10px", background:"#00ffe522", border:"1px solid #00ffe5", borderRadius:"20px", padding:"2px 10px", fontSize:"9px", color:"#00ffe5", fontFamily:"'Share Tech Mono'", letterSpacing:"1px" }}>POPULAR</div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"12px" }}>
                  <div>
                    <div style={{ fontFamily:"'Bebas Neue'", fontSize:"20px", color:"#00ffe5", letterSpacing:"2px" }}>DEGEN</div>
                    <div style={{ fontSize:"10px", color:"#4a5568", fontFamily:"'Share Tech Mono'" }}>For active traders</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"'Bebas Neue'", fontSize:"26px", color:"#00ffe5" }}>$9</div>
                    <div style={{ fontSize:"9px", color:"#4a5568", fontFamily:"'Share Tech Mono'" }}>per month</div>
                  </div>
                </div>
                {["100 scans per day","Full contract analysis","All tabs unlocked","Token news feed","Priority support"].map(f => (
                  <div key={f} style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px" }}>
                    <span style={{ color:"#00ffe5", fontSize:"11px" }}>✓</span>
                    <span style={{ fontSize:"12px", color:"#e0e8ff" }}>{f}</span>
                  </div>
                ))}
                <button style={{ marginTop:"12px", width:"100%", padding:"12px", background:"linear-gradient(135deg,#00ffe5,#00a8ff)", border:"none", borderRadius:"6px", color:"#060810", fontFamily:"'Bebas Neue'", fontSize:"15px", letterSpacing:"2px", cursor:"pointer", animation:"pulse-neon 2s infinite" }}>
                  PAY WITH USDT
                </button>
              </div>

              {/* WHALE */}
              <div style={{ padding:"18px", background:"#0a0f1e", border:"1px solid #ff2d5544", borderRadius:"12px", marginBottom:"12px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"12px" }}>
                  <div>
                    <div style={{ fontFamily:"'Bebas Neue'", fontSize:"20px", color:"#ff2d55", letterSpacing:"2px" }}>WHALE</div>
                    <div style={{ fontSize:"10px", color:"#4a5568", fontFamily:"'Share Tech Mono'" }}>For power users</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"'Bebas Neue'", fontSize:"26px", color:"#ff2d55" }}>$25</div>
                    <div style={{ fontSize:"9px", color:"#4a5568", fontFamily:"'Share Tech Mono'" }}>per month</div>
                  </div>
                </div>
                {["Unlimited scans","Full contract analysis","All tabs unlocked","Token + global news","Whale alert notifications","VIP support"].map(f => (
                  <div key={f} style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px" }}>
                    <span style={{ color:"#ff2d55", fontSize:"11px" }}>✓</span>
                    <span style={{ fontSize:"12px", color:"#e0e8ff" }}>{f}</span>
                  </div>
                ))}
                <button style={{ marginTop:"12px", width:"100%", padding:"12px", background:"linear-gradient(135deg,#ff2d55,#ff6b35)", border:"none", borderRadius:"6px", color:"#fff", fontFamily:"'Bebas Neue'", fontSize:"15px", letterSpacing:"2px", cursor:"pointer" }}>
                  PAY WITH USDT
                </button>
              </div>

              {/* Payment info */}
              <div style={{ padding:"12px", background:"#0a0f1e", border:"1px solid #ffffff08", borderRadius:"8px" }}>
                <div style={{ fontSize:"10px", color:"#00ffe5", fontFamily:"'Share Tech Mono'", marginBottom:"8px", letterSpacing:"1px" }}>HOW PAYMENT WORKS</div>
                {["Click PAY WITH USDT","Send exact amount to wallet address shown","System detects your payment automatically","Email confirmation sent instantly","Your plan activates immediately"].map((s,i) => (
                  <div key={i} style={{ display:"flex", gap:"10px", marginBottom:"6px", alignItems:"flex-start" }}>
                    <span style={{ fontSize:"10px", color:"#00ffe5", fontFamily:"'Share Tech Mono'", flexShrink:0 }}>{i+1}.</span>
                    <span style={{ fontSize:"12px", color:"#8892a4" }}>{s}</span>
                  </div>
                ))}
                <div style={{ marginTop:"8px", fontSize:"9px", color:"#4a5568", fontFamily:"'Share Tech Mono'" }}>Accepts USDT TRC20 · ERC20 · BEP20</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
