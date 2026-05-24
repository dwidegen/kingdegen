import { useState } from "react";

const mockScan = {
  name: "DegenAI", ticker: "DGAI", network: "Solana", age: "14 days",
  narrative: ["AI", "DeFi"], score: 62, label: "CAUTION",
  contract: "7xKj...m9Pq",
  links: { x: "https://x.com", website: "https://example.com", telegram: "https://t.me" },
  checks: { verified: true, renounced: false, mint: false, honeypot: false, buy_tax: 2, sell_tax: 5, proxy: false },
  tokenomics: { total: "1,000,000,000", circulating: "620,000,000", top10: 38, dev: 8, lp_locked: true, lp_size: "$284,000" },
  onchain: { holders: 3847, tx24h: 1204, whale: "Medium", clusters: 2 },
  social: { posts24h: 47, engagement: "High", fake: false, influencers: 3, paid: true },
  news: [
    { time: "2h ago", title: "DegenAI partners with major DEX aggregator", sentiment: "bullish" },
    { time: "5h ago", title: "Whale accumulation spotted in last 6 hours", sentiment: "bullish" },
    { time: "12h ago", title: "Dev wallet moved 2M tokens to unknown address", sentiment: "bearish" },
    { time: "1d ago", title: "AI narrative tokens rally across the board", sentiment: "neutral" },
  ],
};

const globalNewsData = [
  { time: "1h ago", title: "Solana ecosystem hits new ATH in daily active users", sentiment: "bullish", source: "X / @solana" },
  { time: "3h ago", title: "SEC drops investigation against major DeFi protocol", sentiment: "bullish", source: "X / @CryptoLaw" },
  { time: "6h ago", title: "Large liquidations spotted across BTC leveraged positions", sentiment: "bearish", source: "X / @WhaleAlert" },
  { time: "8h ago", title: "New AI narrative tokens gaining traction on Base chain", sentiment: "bullish", source: "X / @DegenNews" },
  { time: "12h ago", title: "Binance lists 3 new tokens — volume spikes across pairs", sentiment: "neutral", source: "X / @Binance" },
  { time: "1d ago", title: "On-chain data suggests institutional accumulation in ETH", sentiment: "bullish", source: "X / @glassnode" },
];

const C = {
  bg: "#0a0008", surface: "#110012", card: "#160018", border: "#3d0045",
  borderGlow: "#7b00ff", primary: "#c800ff", primaryDim: "#7b00ff33",
  accent: "#ff2d6b", accentDim: "#ff2d6b33", text: "#e8d0ff",
  muted: "#7a5a8a", dim: "#3d1f4d", green: "#00ff88", yellow: "#ffcc00", red: "#ff2d55",
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Bebas+Neue&family=Rajdhani:wght@400;600;700&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
@keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
@keyframes flicker { 0%,94%,100%{opacity:1} 95%{opacity:0.3} 97%{opacity:1} 99%{opacity:0.5} }
@keyframes pulse { 0%,100%{box-shadow:0 0 8px #bf00ff,0 0 24px #bf00ff44} 50%{box-shadow:0 0 18px #bf00ff,0 0 48px #bf00ff88} }
@keyframes pulseRed { 0%,100%{box-shadow:0 0 8px #ff2d6b,0 0 24px #ff2d6b44} 50%{box-shadow:0 0 18px #ff2d6b,0 0 48px #ff2d6b88} }
@keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
@keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
@keyframes gridMove { 0%{background-position:0 0} 100%{background-position:40px 40px} }
input::placeholder, textarea::placeholder { color: #3d1f4d; }
::-webkit-scrollbar { width:4px; height:4px; }
::-webkit-scrollbar-track { background:#0a0008; }
::-webkit-scrollbar-thumb { background:#7b00ff44; border-radius:2px; }
`;

const scoreColor = s => s >= 75 ? C.green : s >= 50 ? C.yellow : C.red;
const labelColor = l => l === "SAFU" ? C.green : l === "CAUTION" ? C.yellow : C.red;
const sentColor  = s => s === "bullish" ? C.green : s === "bearish" ? C.red : C.muted;

const Row = ({ label, val, bool, invert, warn }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", background:C.card, borderRadius:"6px", border:`1px solid ${C.border}` }}>
    <span style={{ fontSize:"13px", color:C.muted, fontFamily:"'Rajdhani',sans-serif", fontWeight:600 }}>{label}</span>
    {bool ? (
      <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:invert?(val?C.red:C.green):(val?C.green:C.red) }}>
        {val?(invert?"⚠ YES":"✓ YES"):(invert?"✓ NO":"✗ NO")}
      </span>
    ) : (
      <span style={{ fontFamily:"'Share Tech Mono'", fontSize:"11px", color:warn?C.yellow:C.primary }}>{val}</span>
    )}
  </div>
);

const NewsCard = ({ n, big }) => (
  <div style={{ padding:big?"14px":"12px", background:C.card, borderRadius:"8px", border:`1px solid ${C.border}`, borderLeft:`3px solid ${sentColor(n.sentiment)}` }}>
    <div style={{ fontSize:big?"14px":"13px", color:C.text, marginBottom:"6px", lineHeight:1.5 }}>{n.title}</div>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      {n.source && <span style={{ fontSize:"9px", color:C.muted, fontFamily:"'Share Tech Mono'" }}>{n.source}</span>}
      <div style={{ display:"flex", gap:"8px", alignItems:"center", marginLeft:"auto" }}>
        <span style={{ fontSize:"9px", color:C.dim, fontFamily:"'Share Tech Mono'" }}>{n.time}</span>
        <span style={{ fontSize:"9px", fontFamily:"'Share Tech Mono'", color:sentColor(n.sentiment), padding:"1px 6px", background:`${sentColor(n.sentiment)}22`, borderRadius:"3px" }}>{n.sentiment.toUpperCase()}</span>
      </div>
    </div>
  </div>
);

const NAV = ["SCANNER","NEWS","CREATE TOKEN","PRICING"];
const SCAN_TABS = ["OVERVIEW","CONTRACT","TOKENOMICS","ON-CHAIN","SOCIAL","TOKEN NEWS"];

export default function KingDegen() {
  const [ca, setCa] = useState("");
  const [nav, setNav] = useState("SCANNER");
  const [scanTab, setScanTab] = useState("OVERVIEW");
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [typed, setTyped] = useState("");
  const [scansUsed, setScansUsed] = useState(2);
  const [plan] = useState("FREE");
  const [token, setToken] = useState({ name:"", ticker:"", supply:"1000000000", desc:"", network:"Solana" });

  const limit = plan==="FREE"?5:plan==="DEGEN"?100:999999;
  const left  = Math.max(0, limit-scansUsed);
  const maxed = plan==="FREE" && scansUsed>=5;

  const handleScan = () => {
    if (!ca.trim()||maxed) return;
    setLoading(true); setScanned(false); setData(null);
    const msgs = ["CONNECTING TO CHAIN...","FETCHING CONTRACT...","ANALYZING TOKENOMICS...","SCANNING SOCIAL SIGNALS...","COMPUTING RISK SCORE..."];
    let i=0;
    const t = setInterval(()=>{
      if(i<msgs.length){setTyped(msgs[i]);i++;}
      else{clearInterval(t);setLoading(false);setScanned(true);setData(mockScan);setScansUsed(p=>p+1);setScanTab("OVERVIEW");}
    },520);
  };

  const Input = ({label,k,placeholder,type="text"}) => (
    <div>
      <div style={{fontSize:"9px",color:C.muted,fontFamily:"'Share Tech Mono'",letterSpacing:"1px",marginBottom:"5px"}}>{label}</div>
      <input value={token[k]} onChange={e=>setToken(p=>({...p,[k]:e.target.value}))} placeholder={placeholder} type={type}
        style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:"6px",padding:"11px 14px",color:C.primary,fontFamily:"'Share Tech Mono'",fontSize:"12px",outline:"none",transition:"border 0.2s"}}
        onFocus={e=>e.target.style.border=`1px solid ${C.primary}`}
        onBlur={e=>e.target.style.border=`1px solid ${C.border}`}
      />
    </div>
  );

  return (
    <>
      <style>{css}</style>
      <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Rajdhani',sans-serif",position:"relative",overflow:"hidden"}}>

        {/* Grid */}
        <div style={{position:"fixed",inset:0,zIndex:0,backgroundImage:`linear-gradient(${C.border}55 1px,transparent 1px),linear-gradient(90deg,${C.border}55 1px,transparent 1px)`,backgroundSize:"40px 40px",animation:"gridMove 8s linear infinite",pointerEvents:"none",opacity:0.5}}/>

        {/* Scanline */}
        <div style={{position:"fixed",top:0,left:0,right:0,height:"2px",background:`linear-gradient(90deg,transparent,${C.primary}88,transparent)`,animation:"scanline 5s linear infinite",zIndex:1,pointerEvents:"none"}}/>

        {/* Glow orbs */}
        <div style={{position:"fixed",top:"-80px",left:"-80px",width:"280px",height:"280px",background:`radial-gradient(circle,${C.primary}18,transparent 70%)`,pointerEvents:"none",zIndex:0}}/>
        <div style={{position:"fixed",bottom:"-80px",right:"-80px",width:"280px",height:"280px",background:`radial-gradient(circle,${C.accent}18,transparent 70%)`,pointerEvents:"none",zIndex:0}}/>

        {/* Ticker */}
        <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,overflow:"hidden",height:"26px",display:"flex",alignItems:"center",position:"relative",zIndex:2}}>
          <div style={{display:"flex",gap:"60px",whiteSpace:"nowrap",animation:"marquee 22s linear infinite",fontFamily:"'Share Tech Mono'",fontSize:"10px",color:C.primary}}>
            {[...Array(2)].map((_,i)=>(
              <span key={i} style={{display:"flex",gap:"60px"}}>
                <span>SOL <span style={{color:C.green}}>↑ +4.2%</span></span>
                <span>ETH <span style={{color:C.red}}>↓ -1.8%</span></span>
                <span>BTC <span style={{color:C.green}}>↑ +2.1%</span></span>
                <span>RUGS TODAY <span style={{color:C.red}}>47</span></span>
                <span>SAFUS VERIFIED <span style={{color:C.green}}>312</span></span>
                <span>TOKENS CREATED <span style={{color:C.primary}}>1,204</span></span>
              </span>
            ))}
          </div>
        </div>

        {/* Header */}
        <div style={{padding:"14px 18px 12px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",position:"relative",zIndex:2,background:`linear-gradient(180deg,${C.surface},transparent)`}}>
          <div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:"28px",letterSpacing:"5px",background:`linear-gradient(135deg,${C.primary},${C.accent})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"flicker 9s infinite"}}>
              KING<span>DEGEN</span>
            </div>
            <div style={{fontSize:"9px",color:C.muted,fontFamily:"'Share Tech Mono'",letterSpacing:"2px"}}>CONTRACT INTELLIGENCE PROTOCOL</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"5px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"5px"}}>
              <div style={{width:"6px",height:"6px",borderRadius:"50%",background:C.green,boxShadow:`0 0 8px ${C.green}`,animation:"blink 2s infinite"}}/>
              <span style={{fontSize:"9px",color:C.muted,fontFamily:"'Share Tech Mono'"}}>LIVE</span>
            </div>
            <div style={{fontSize:"8px",fontFamily:"'Share Tech Mono'",padding:"2px 8px",borderRadius:"20px",background:C.surface,color:C.muted,border:`1px solid ${C.border}`}}>
              {plan} PLAN
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,zIndex:10,background:C.bg}}>
          {NAV.map(t=>(
            <button key={t} onClick={()=>setNav(t)} style={{flex:1,padding:"11px 4px",background:"transparent",border:"none",borderBottom:nav===t?`2px solid ${C.primary}`:"2px solid transparent",color:nav===t?C.primary:C.muted,fontFamily:"'Share Tech Mono'",fontSize:"8px",letterSpacing:"1px",cursor:"pointer",transition:"all 0.2s",textShadow:nav===t?`0 0 10px ${C.primary}`:"none"}}>
              {t}
            </button>
          ))}
        </div>

        <div style={{padding:"18px 16px",position:"relative",zIndex:2,maxWidth:"600px",margin:"0 auto"}}>

          {/* ══ SCANNER ══ */}
          {nav==="SCANNER" && (
            <div style={{animation:"fadeUp 0.3s ease"}}>
              {/* Limit bar */}
              <div style={{marginBottom:"14px",padding:"10px 14px",background:C.surface,borderRadius:"8px",border:`1px solid ${C.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
                  <span style={{fontSize:"10px",color:C.muted,fontFamily:"'Share Tech Mono'"}}>DAILY SCANS</span>
                  <span style={{fontSize:"10px",fontFamily:"'Share Tech Mono'",color:left===0?C.red:left<=2?C.yellow:C.primary}}>
                    {plan==="WHALE"?"∞ UNLIMITED":`${left} / ${limit} LEFT`}
                  </span>
                </div>
                <div style={{height:"3px",background:C.dim,borderRadius:"2px",overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${(scansUsed/limit)*100}%`,background:`linear-gradient(90deg,${C.primary},${C.accent})`,borderRadius:"2px",transition:"width 0.5s"}}/>
                </div>
                {maxed && (
                  <div style={{marginTop:"8px",fontSize:"10px",color:C.red,fontFamily:"'Share Tech Mono'"}}>
                    ⚠ Daily limit reached — <span onClick={()=>setNav("PRICING")} style={{color:C.primary,cursor:"pointer",textDecoration:"underline"}}>Upgrade plan</span>
                  </div>
                )}
              </div>

              {/* Input */}
              <div style={{marginBottom:"18px"}}>
                <div style={{fontSize:"9px",color:C.primary,fontFamily:"'Share Tech Mono'",letterSpacing:"2px",marginBottom:"6px"}}>&gt; PASTE CONTRACT ADDRESS</div>
                <div style={{display:"flex",gap:"8px"}}>
                  <input value={ca} onChange={e=>setCa(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleScan()} placeholder="0x... or SOL address" disabled={maxed}
                    style={{flex:1,background:C.surface,border:`1px solid ${C.border}`,borderRadius:"6px",padding:"11px 14px",color:C.primary,fontFamily:"'Share Tech Mono'",fontSize:"12px",outline:"none",opacity:maxed?0.4:1,transition:"border 0.2s"}}
                    onFocus={e=>e.target.style.border=`1px solid ${C.primary}`}
                    onBlur={e=>e.target.style.border=`1px solid ${C.border}`}
                  />
                  <button onClick={handleScan} disabled={loading||maxed}
                    style={{padding:"11px 18px",background:maxed?"transparent":`linear-gradient(135deg,${C.primary},${C.accent})`,border:maxed?`1px solid ${C.border}`:"none",borderRadius:"6px",color:maxed?C.muted:"#fff",fontFamily:"'Bebas Neue'",fontSize:"15px",letterSpacing:"2px",cursor:maxed||loading?"not-allowed":"pointer",animation:!loading&&!maxed?"pulse 2s infinite":"none",whiteSpace:"nowrap"}}>
                    {loading?"⟳":"SCAN"}
                  </button>
                </div>
              </div>

              {loading && (
                <div style={{padding:"14px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:"8px",fontFamily:"'Share Tech Mono'",fontSize:"12px",color:C.primary}}>
                  <span style={{animation:"blink 0.7s infinite",display:"inline-block"}}>▋</span> {typed}
                </div>
              )}

              {scanned && data && (
                <div style={{animation:"fadeUp 0.4s ease"}}>
                  {/* Score card */}
                  <div style={{background:C.surface,border:`1px solid ${labelColor(data.label)}55`,borderRadius:"12px",padding:"16px",marginBottom:"14px",display:"flex",alignItems:"center",gap:"14px"}}>
                    <div style={{position:"relative",flexShrink:0}}>
                      <svg width="70" height="70" style={{transform:"rotate(-90deg)"}}>
                        <circle cx="35" cy="35" r="28" fill="none" stroke={C.dim} strokeWidth="5"/>
                        <circle cx="35" cy="35" r="28" fill="none" stroke={scoreColor(data.score)} strokeWidth="5"
                          strokeDasharray="176" strokeDashoffset={176-(data.score/100)*176} strokeLinecap="round"
                          style={{filter:`drop-shadow(0 0 6px ${scoreColor(data.score)})`,transition:"stroke-dashoffset 1s ease"}}/>
                      </svg>
                      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
                        <span style={{fontFamily:"'Bebas Neue'",fontSize:"20px",color:scoreColor(data.score),lineHeight:1}}>{data.score}</span>
                        <span style={{fontSize:"7px",color:C.muted,fontFamily:"'Share Tech Mono'"}}>/100</span>
                      </div>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"4px",flexWrap:"wrap"}}>
                        <span style={{fontFamily:"'Bebas Neue'",fontSize:"22px",color:"#fff"}}>{data.name}</span>
                        <span style={{fontSize:"10px",color:C.muted,fontFamily:"'Share Tech Mono'"}}>${data.ticker}</span>
                        <span style={{fontSize:"9px",padding:"2px 7px",background:C.primaryDim,borderRadius:"20px",color:C.primary,border:`1px solid ${C.borderGlow}44`}}>{data.network}</span>
                      </div>
                      <div style={{display:"flex",gap:"5px",flexWrap:"wrap",marginBottom:"8px"}}>
                        {data.narrative.map(n=>(
                          <span key={n} style={{fontSize:"9px",padding:"2px 7px",background:C.accentDim,borderRadius:"20px",color:C.accent,border:`1px solid ${C.accent}44`,fontFamily:"'Share Tech Mono'"}}>{n}</span>
                        ))}
                        <span style={{fontSize:"9px",padding:"2px 7px",background:C.surface,borderRadius:"20px",color:C.muted,fontFamily:"'Share Tech Mono'"}}>AGE: {data.age}</span>
                      </div>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"6px"}}>
                        <div style={{padding:"3px 10px",borderRadius:"4px",background:`${labelColor(data.label)}22`,border:`1px solid ${labelColor(data.label)}`,color:labelColor(data.label),fontFamily:"'Bebas Neue'",fontSize:"13px",letterSpacing:"2px"}}>
                          ⚡ {data.label}
                        </div>
                        <div style={{display:"flex",gap:"5px"}}>
                          {[{l:"𝕏",h:data.links.x},{l:"🌐",h:data.links.website},{l:"✈️",h:data.links.telegram}].map(lk=>(
                            <a key={lk.l} href={lk.h} target="_blank" rel="noopener noreferrer" style={{width:"28px",height:"28px",background:C.card,border:`1px solid ${C.border}`,borderRadius:"5px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",textDecoration:"none"}}>{lk.l}</a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scan sub-tabs */}
                  <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,marginBottom:"12px",overflowX:"auto"}}>
                    {SCAN_TABS.map(t=>(
                      <button key={t} onClick={()=>setScanTab(t)} style={{padding:"8px 10px",background:"transparent",border:"none",borderBottom:scanTab===t?`2px solid ${C.primary}`:"2px solid transparent",color:scanTab===t?C.primary:C.muted,fontFamily:"'Share Tech Mono'",fontSize:"8px",letterSpacing:"1px",cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.2s"}}>{t}</button>
                    ))}
                  </div>

                  <div style={{animation:"fadeUp 0.3s ease",display:"flex",flexDirection:"column",gap:"8px"}}>
                    {scanTab==="OVERVIEW" && [
                      {label:"Contract Verified",val:data.checks.verified,bool:true},
                      {label:"Ownership Renounced",val:data.checks.renounced,bool:true},
                      {label:"Honeypot Detected",val:data.checks.honeypot,bool:true,invert:true},
                      {label:"LP Locked",val:data.tokenomics.lp_locked,bool:true},
                      {label:"Top 10 Holders",val:`${data.tokenomics.top10}%`,warn:data.tokenomics.top10>30},
                      {label:"Sell Tax",val:`${data.checks.sell_tax}%`,warn:data.checks.sell_tax>5},
                    ].map(r=><Row key={r.label} {...r}/>)}

                    {scanTab==="CONTRACT" && <>
                      <div style={{padding:"12px 14px",background:C.card,borderRadius:"6px",border:`1px solid ${C.border}`}}>
                        <div style={{fontSize:"8px",color:C.muted,fontFamily:"'Share Tech Mono'",marginBottom:"4px"}}>CONTRACT ADDRESS</div>
                        <div style={{fontSize:"11px",color:C.primary,fontFamily:"'Share Tech Mono'",wordBreak:"break-all"}}>{ca||data.contract}</div>
                      </div>
                      {[
                        {label:"Verified on Explorer",val:data.checks.verified,bool:true},
                        {label:"Ownership Renounced",val:data.checks.renounced,bool:true},
                        {label:"Mint Function Active",val:data.checks.mint,bool:true,invert:true},
                        {label:"Honeypot Detected",val:data.checks.honeypot,bool:true,invert:true},
                        {label:"Buy Tax",val:`${data.checks.buy_tax}%`},
                        {label:"Sell Tax",val:`${data.checks.sell_tax}%`,warn:data.checks.sell_tax>5},
                        {label:"Proxy / Upgradeable",val:data.checks.proxy,bool:true,invert:true},
                      ].map(r=><Row key={r.label} {...r}/>)}
                    </>}

                    {scanTab==="TOKENOMICS" && <>
                      {[
                        {label:"Total Supply",val:data.tokenomics.total},
                        {label:"Circulating Supply",val:data.tokenomics.circulating},
                        {label:"Top 10 Holders",val:`${data.tokenomics.top10}%`,warn:data.tokenomics.top10>30},
                        {label:"Dev Wallet",val:`${data.tokenomics.dev}%`,warn:data.tokenomics.dev>5},
                        {label:"LP Size",val:data.tokenomics.lp_size},
                        {label:"LP Locked",val:data.tokenomics.lp_locked,bool:true},
                      ].map(r=><Row key={r.label} {...r}/>)}
                      <div style={{padding:"12px 14px",background:C.card,borderRadius:"6px",border:`1px solid ${C.border}`}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}>
                          <span style={{fontSize:"12px",color:C.muted}}>Concentration Risk</span>
                          <span style={{fontSize:"11px",color:C.yellow,fontFamily:"'Share Tech Mono'"}}>MEDIUM</span>
                        </div>
                        <div style={{height:"4px",background:C.dim,borderRadius:"2px",overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${data.tokenomics.top10}%`,background:`linear-gradient(90deg,${C.primary},${C.yellow})`,borderRadius:"2px"}}/>
                        </div>
                        <div style={{fontSize:"9px",color:C.muted,fontFamily:"'Share Tech Mono'",marginTop:"5px"}}>Top 10 wallets hold {data.tokenomics.top10}% of supply</div>
                      </div>
                    </>}

                    {scanTab==="ON-CHAIN" && [
                      {label:"Total Holders",val:data.onchain.holders.toLocaleString()},
                      {label:"Transactions (24h)",val:data.onchain.tx24h.toLocaleString()},
                      {label:"Whale Activity",val:data.onchain.whale,warn:data.onchain.whale==="High"},
                      {label:"Suspicious Clusters",val:data.onchain.clusters,warn:data.onchain.clusters>0},
                      {label:"Contract Age",val:data.age},
                    ].map(r=><Row key={r.label} {...r}/>)}

                    {scanTab==="SOCIAL" && <>
                      {[
                        {label:"X Posts (24h)",val:data.social.posts24h},
                        {label:"Engagement Rate",val:data.social.engagement},
                        {label:"Fake Follower Flag",val:data.social.fake,bool:true,invert:true},
                        {label:"Influencer Mentions",val:data.social.influencers},
                        {label:"Paid Promotion Flag",val:data.social.paid,bool:true,invert:true},
                      ].map(r=><Row key={r.label} {...r}/>)}
                      <a href={data.links.x} target="_blank" rel="noopener noreferrer"
                        style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",padding:"11px",background:C.card,border:`1px solid ${C.border}`,borderRadius:"6px",color:"#fff",textDecoration:"none",fontFamily:"'Bebas Neue'",fontSize:"13px",letterSpacing:"2px"}}>
                        𝕏 &nbsp;VIEW ON X / TWITTER
                      </a>
                    </>}

                    {scanTab==="TOKEN NEWS" && data.news.map((n,i)=><NewsCard key={i} n={n}/>)}
                  </div>

                  <div style={{marginTop:"14px",padding:"10px 14px",background:`${C.red}11`,border:`1px solid ${C.red}22`,borderRadius:"6px",fontSize:"9px",color:`${C.red}88`,fontFamily:"'Share Tech Mono'",lineHeight:1.7}}>
                    ⚠ DYOR. Data is for reference only, not financial advice. KingDegen is not responsible for your trading decisions.
                  </div>
                </div>
              )}

              {!scanned && !loading && (
                <div style={{textAlign:"center",padding:"50px 20px"}}>
                  <div style={{fontSize:"42px",marginBottom:"12px",opacity:0.15}}>👑</div>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:"18px",color:C.dim,letterSpacing:"4px"}}>PASTE CA TO SCAN</div>
                  <div style={{fontSize:"10px",color:C.dim,fontFamily:"'Share Tech Mono'",marginTop:"6px"}}>ETH · BSC · SOLANA · BASE · ARB</div>
                </div>
              )}
            </div>
          )}

          {/* ══ NEWS ══ */}
          {nav==="NEWS" && (
            <div style={{animation:"fadeUp 0.3s ease"}}>
              <div style={{fontSize:"9px",color:C.primary,fontFamily:"'Share Tech Mono'",letterSpacing:"2px",marginBottom:"14px"}}>&gt; LATEST CRYPTO INTEL</div>
              <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                {globalNewsData.map((n,i)=><NewsCard key={i} n={n} big/>)}
              </div>
              <div style={{marginTop:"14px",padding:"10px 14px",background:C.primaryDim,border:`1px solid ${C.borderGlow}44`,borderRadius:"6px",fontSize:"9px",color:`${C.primary}88`,fontFamily:"'Share Tech Mono'",lineHeight:1.7}}>
                ℹ News is curated manually by KingDegen team. Last updated: today.
              </div>
            </div>
          )}

          {/* ══ CREATE TOKEN ══ */}
          {nav==="CREATE TOKEN" && (
            <div style={{animation:"fadeUp 0.3s ease"}}>
              <div style={{fontSize:"9px",color:C.primary,fontFamily:"'Share Tech Mono'",letterSpacing:"2px",marginBottom:"4px"}}>&gt; LAUNCH YOUR MEME COIN</div>
              <div style={{fontSize:"11px",color:C.muted,fontFamily:"'Share Tech Mono'",marginBottom:"20px"}}>Fill in the details — connect Phantom to deploy</div>
              <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                <Input label="TOKEN NAME" k="name" placeholder="e.g. KingPepe"/>
                <Input label="TICKER SYMBOL" k="ticker" placeholder="e.g. KPEPE"/>
                <Input label="TOTAL SUPPLY" k="supply" placeholder="e.g. 1000000000"/>
                <div>
                  <div style={{fontSize:"9px",color:C.muted,fontFamily:"'Share Tech Mono'",letterSpacing:"1px",marginBottom:"5px"}}>NETWORK</div>
                  <div style={{display:"flex",gap:"8px"}}>
                    {["Solana","Ethereum","BSC","Base"].map(n=>(
                      <button key={n} onClick={()=>setToken(p=>({...p,network:n}))}
                        style={{flex:1,padding:"8px 4px",background:token.network===n?C.primaryDim:C.surface,border:`1px solid ${token.network===n?C.primary:C.border}`,borderRadius:"6px",color:token.network===n?C.primary:C.muted,fontFamily:"'Share Tech Mono'",fontSize:"9px",cursor:"pointer",transition:"all 0.2s"}}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{fontSize:"9px",color:C.muted,fontFamily:"'Share Tech Mono'",letterSpacing:"1px",marginBottom:"5px"}}>DESCRIPTION (OPTIONAL)</div>
                  <textarea value={token.desc} onChange={e=>setToken(p=>({...p,desc:e.target.value}))} placeholder="What's the narrative?" rows={3}
                    style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:"6px",padding:"11px 14px",color:C.primary,fontFamily:"'Share Tech Mono'",fontSize:"12px",outline:"none",resize:"none",transition:"border 0.2s"}}
                    onFocus={e=>e.target.style.border=`1px solid ${C.primary}`}
                    onBlur={e=>e.target.style.border=`1px solid ${C.border}`}
                  />
                </div>
                {(token.name||token.ticker) && (
                  <div style={{padding:"14px",background:C.card,border:`1px solid ${C.border}`,borderRadius:"10px"}}>
                    <div style={{fontSize:"9px",color:C.muted,fontFamily:"'Share Tech Mono'",marginBottom:"8px"}}>PREVIEW</div>
                    <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                      <div style={{width:"40px",height:"40px",borderRadius:"50%",background:`linear-gradient(135deg,${C.primary},${C.accent})`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue'",fontSize:"14px",color:"#fff",flexShrink:0}}>
                        {token.ticker?token.ticker.slice(0,2).toUpperCase():"??"}
                      </div>
                      <div>
                        <div style={{fontFamily:"'Bebas Neue'",fontSize:"18px",color:"#fff",letterSpacing:"1px"}}>{token.name||"Token Name"}</div>
                        <div style={{fontSize:"10px",color:C.muted,fontFamily:"'Share Tech Mono'"}}>${token.ticker||"TICKER"} · {token.network}</div>
                      </div>
                    </div>
                    {token.desc && <div style={{marginTop:"8px",fontSize:"11px",color:C.muted,lineHeight:1.5}}>{token.desc}</div>}
                  </div>
                )}
                <button style={{width:"100%",padding:"14px",background:`linear-gradient(135deg,${C.primary},${C.accent})`,border:"none",borderRadius:"8px",color:"#fff",fontFamily:"'Bebas Neue'",fontSize:"16px",letterSpacing:"3px",cursor:"pointer",animation:"pulse 2s infinite",marginTop:"4px"}}>
                  👻 CONNECT PHANTOM TO DEPLOY
                </button>
                <div style={{padding:"10px 14px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:"6px"}}>
                  <div style={{fontSize:"9px",color:C.primary,fontFamily:"'Share Tech Mono'",marginBottom:"6px"}}>DEPLOYMENT INCLUDES</div>
                  {["Token contract on selected network","Initial liquidity setup","Auto-lock LP for 6 months","Ownership renounced after deploy","Token verified on explorer"].map((s,i)=>(
                    <div key={i} style={{display:"flex",gap:"8px",marginBottom:"5px",alignItems:"center"}}>
                      <span style={{color:C.green,fontSize:"10px"}}>✓</span>
                      <span style={{fontSize:"12px",color:C.muted}}>{s}</span>
                    </div>
                  ))}
                </div>
                <div style={{padding:"10px 14px",background:`${C.yellow}11`,border:`1px solid ${C.yellow}22`,borderRadius:"6px",fontSize:"9px",color:`${C.yellow}88`,fontFamily:"'Share Tech Mono'",lineHeight:1.7}}>
                  ⚠ Deploy feature coming soon. Connect wallet to join the waitlist.
                </div>
              </div>
            </div>
          )}

          {/* ══ PRICING ══ */}
          {nav==="PRICING" && (
            <div style={{animation:"fadeUp 0.3s ease"}}>
              <div style={{fontSize:"9px",color:C.primary,fontFamily:"'Share Tech Mono'",letterSpacing:"2px",marginBottom:"4px"}}>&gt; CHOOSE YOUR PLAN</div>
              <div style={{fontSize:"11px",color:C.muted,fontFamily:"'Share Tech Mono'",marginBottom:"20px"}}>Pay with USDT · Instant activation via email</div>
              {/* FREE */}
              <div style={{padding:"18px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:"12px",marginBottom:"12px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"14px"}}>
                  <div>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:"22px",color:"#fff",letterSpacing:"3px"}}>FREE</div>
                    <div style={{fontSize:"9px",color:C.muted,fontFamily:"'Share Tech Mono'"}}>No registration needed</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:"28px",color:C.muted}}>$0</div>
                    <div style={{fontSize:"9px",color:C.muted,fontFamily:"'Share Tech Mono'"}}>forever</div>
                  </div>
                </div>
                {["5 scans per day","Basic contract check","Overview tab only","Global news access"].map(f=>(
                  <div key={f} style={{display:"flex",gap:"8px",marginBottom:"6px",alignItems:"center"}}>
                    <span style={{color:C.muted,fontSize:"10px"}}>✓</span>
                    <span style={{fontSize:"12px",color:C.muted}}>{f}</span>
                  </div>
                ))}
                <div style={{marginTop:"14px",padding:"10px",background:C.card,borderRadius:"6px",textAlign:"center",fontFamily:"'Share Tech Mono'",fontSize:"10px",color:C.muted}}>✓ CURRENT PLAN</div>
              </div>
              {/* DEGEN */}
              <div style={{padding:"18px",background:C.surface,border:`1px solid ${C.primary}`,borderRadius:"12px",marginBottom:"12px",position:"relative"}}>
                <div style={{position:"absolute",top:"-10px",right:"16px",background:`linear-gradient(135deg,${C.primary},${C.accent})`,borderRadius:"20px",padding:"3px 12px",fontSize:"9px",color:"#fff",fontFamily:"'Share Tech Mono'",letterSpacing:"1px"}}>POPULAR</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"14px"}}>
                  <div>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:"22px",color:C.primary,letterSpacing:"3px"}}>DEGEN</div>
                    <div style={{fontSize:"9px",color:C.muted,fontFamily:"'Share Tech Mono'"}}>For active traders</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:"28px",color:C.primary}}>$9</div>
                    <div style={{fontSize:"9px",color:C.muted,fontFamily:"'Share Tech Mono'"}}>per month</div>
                  </div>
                </div>
                {["100 scans per day","Full contract analysis","All tabs unlocked","Token news feed","Priority support"].map(f=>(
                  <div key={f} style={{display:"flex",gap:"8px",marginBottom:"6px",alignItems:"center"}}>
                    <span style={{color:C.primary,fontSize:"10px"}}>✓</span>
                    <span style={{fontSize:"12px",color:C.text}}>{f}</span>
                  </div>
                ))}
                <button style={{marginTop:"14px",width:"100%",padding:"13px",background:`linear-gradient(135deg,${C.primary},${C.accent})`,border:"none",borderRadius:"8px",color:"#fff",fontFamily:"'Bebas Neue'",fontSize:"15px",letterSpacing:"3px",cursor:"pointer",animation:"pulse 2s infinite"}}>
                  PAY WITH USDT
                </button>
              </div>
              {/* WHALE */}
              <div style={{padding:"18px",background:C.surface,border:`1px solid ${C.accent}`,borderRadius:"12px",marginBottom:"16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"14px"}}>
                  <div>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:"22px",color:C.accent,letterSpacing:"3px"}}>WHALE</div>
                    <div style={{fontSize:"9px",color:C.muted,fontFamily:"'Share Tech Mono'"}}>For power users</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:"28px",color:C.accent}}>$25</div>
                    <div style={{fontSize:"9px",color:C.muted,fontFamily:"'Share Tech Mono'"}}>per month</div>
                  </div>
                </div>
                {["Unlimited scans","Full contract analysis","All tabs unlocked","Token + global news","Whale alert notifications","VIP support","Early access to new features"].map(f=>(
                  <div key={f} style={{display:"flex",gap:"8px",marginBottom:"6px",alignItems:"center"}}>
                    <span style={{color:C.accent,fontSize:"10px"}}>✓</span>
                    <span style={{fontSize:"12px",color:C.text}}>{f}</span>
                  </div>
                ))}
                <button style={{marginTop:"14px",width:"100%",padding:"13px",background:`linear-gradient(135deg,${C.accent},#ff6b35)`,border:"none",borderRadius:"8px",color:"#fff",fontFamily:"'Bebas Neue'",fontSize:"15px",letterSpacing:"3px",cursor:"pointer",animation:"pulseRed 2s infinite"}}>
                  PAY WITH USDT
                </button>
              </div>
              {/* How it works */}
              <div style={{padding:"14px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:"10px"}}>
                <div style={{fontSize:"9px",color:C.primary,fontFamily:"'Share Tech Mono'",marginBottom:"10px",letterSpacing:"1px"}}>HOW PAYMENT WORKS</div>
                {["Click PAY WITH USDT","Send exact amount to wallet address shown","System detects your payment automatically","Email confirmation sent instantly","Your plan activates immediately"].map((s,i)=>(
                  <div key={i} style={{display:"flex",gap:"10px",marginBottom:"7px",alignItems:"flex-start"}}>
                    <span style={{fontSize:"9px",color:C.primary,fontFamily:"'Share Tech Mono'",flexShrink:0,marginTop:"2px"}}>{i+1}.</span>
                    <span style={{fontSize:"12px",color:C.muted}}>{s}</span>
                  </div>
                ))}
                <div style={{marginTop:"10px",padding:"8px",background:C.card,borderRadius:"6px",fontSize:"9px",color:C.muted,fontFamily:"'Share Tech Mono'",textAlign:"center"}}>
                  Accepts USDT TRC20 · ERC20 · BEP20
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
