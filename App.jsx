import React, { useState } from 'react';

// 🔑 API Key Moralis (sudah dari kamu)
const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjI4NDZiNWEwLTQ2ZTgtNDRkMi1iNzdjLTg1ZTI5OWUyYjM0OSIsIm9yZ0lkIjoiNTE3MjYwIiwidXNlcklkIjoiNTMyMzIyIiwidHlwZUlkIjoiZTcyMGRiYjUtZTc0NC00Njg0LTk5ZDAtZWIzYmQwOTU0NDg3IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3Nzk2MjEwNDMsImV4cCI6NDkzNTM4MTA0M30.NMC4212fAlCD-e9eR4IO0YWXgeKnLb2uhrjfZRRfUkQ';

function App() {
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState('eth');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const getNetworkParam = () => {
    const map = { eth: 'eth', bsc: 'bsc', base: 'base', arb: 'arb', solana: 'solana' };
    return map[network] || 'eth';
  };

  // 🔐 GoPlus Security (gratis, tanpa API key)
  const fetchGoPlus = async (chain, contract) => {
    try {
      let url = `https://api.gopluslabs.io/api/v1/token_security/${chain}?contract_addresses=${contract}`;
      if (chain === 'solana') url = `https://api.gopluslabs.io/api/v1/solana/token_security?contract_addresses=${contract}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.result && data.result[contract]) {
        const s = data.result[contract];
        return {
          token_name: s.token_name || s.name || 'Unknown',
          is_honeypot: s.is_honeypot === '1',
          buy_tax: s.buy_tax ? `${s.buy_tax}%` : '0%',
          sell_tax: s.sell_tax ? `${s.sell_tax}%` : '0%',
          owner: s.owner_address || 'Renounced',
          holder_count: s.holder_count || 'N/A',
          open_source: s.open_source === '1',
          mintable: s.mintable === '1',
          proxy: s.proxy === '1',
        };
      }
      return null;
    } catch (err) {
      return { error: err.message };
    }
  };

  // 📊 Moralis Holder (untuk ETH, BSC, BASE, ARB)
  const fetchMoralisHolders = async (chain, contract) => {
    try {
      const chainMap = { eth: 'eth', bsc: 'bsc', base: 'base', arb: 'arbitrum' };
      const moralisChain = chainMap[chain] || 'eth';
      const url = `https://deep-index.moralis.io/api/v2.2/erc20/${contract}/owners?chain=${moralisChain}&order=DESC&limit=10`;
      const res = await fetch(url, { headers: { 'X-API-Key': MORALIS_API_KEY } });
      const data = await res.json();
      if (data && data.result) {
        let totalPct = 0;
        const top = data.result.slice(0, 10).map(h => {
          const pct = parseFloat(h.percentage_relative_to_total_supply);
          totalPct += pct;
          return { address: h.owner_address, percentage: pct.toFixed(2) + '%' };
        });
        return { top10_percent: totalPct.toFixed(2) + '%', holders: top };
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  const handleScan = async () => {
    if (!address.trim()) return alert('Masukkan contract address!');
    setLoading(true);
    setResult(null);
    try {
      const chain = getNetworkParam();
      const security = await fetchGoPlus(chain, address);
      let holders = null;
      if (chain !== 'solana') {
        holders = await fetchMoralisHolders(chain, address);
      }
      setResult({ chain: chain.toUpperCase(), address, security, holders });
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#0a0a0a', color: '#0f0', minHeight: '100vh', padding: 20, fontFamily: 'monospace' }}>
      <h1 style={{ borderBottom: '2px solid #0f0', display: 'inline-block' }}>KINGDEGEN</h1>
      <p>Contract Intelligence Protocol — Rug Check & Holder Analysis</p>

      <div>
        {['eth', 'bsc', 'base', 'arb', 'solana'].map(net => (
          <button key={net} onClick={() => setNetwork(net)} style={{
            background: network === net ? '#0f0' : '#333',
            color: network === net ? '#000' : '#0f0',
            margin: 5, padding: '8px 16px', cursor: 'pointer', border: 'none', borderRadius: 4
          }}>{net.toUpperCase()}</button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Paste contract address (0x... atau Solana address)"
        value={address}
        onChange={e => setAddress(e.target.value)}
        style={{ width: '90%', padding: 12, marginTop: 20, background: '#222', border: '1px solid #0f0', color: '#0f0', borderRadius: 4 }}
      />

      <button onClick={handleScan} disabled={loading} style={{ marginTop: 20, padding: '10px 20px', background: '#0f0', color: '#000', cursor: 'pointer', borderRadius: 4 }}>
        {loading ? 'SCANNING...' : '🔍 RUG CHECK'}
      </button>

      {result && (
        <div style={{ marginTop: 30, background: '#111', padding: 16, borderRadius: 8 }}>
          {result.error ? (
            <div style={{ color: '#f66' }}>Error: {result.error}</div>
          ) : (
            <>
              <h2 style={{ color: '#0f0', margin: '0 0 10px 0', fontSize: 28 }}>
                {result.security?.token_name || 'Unknown Token'} ({result.chain})
              </h2>
              <pre style={{ background: '#000', padding: 12, borderRadius: 4, overflowX: 'auto', fontSize: 12, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
