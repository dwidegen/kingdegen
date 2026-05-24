import React, { useState } from 'react';

function App() {
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState('eth'); // eth, bsc, base, arb, solana
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mapping network name ke format yang diminta GoPlus
  const getNetworkParam = () => {
    const map = {
      eth: 'eth',
      bsc: 'bsc',
      base: 'base',
      arb: 'arb',
      solana: 'solana'
    };
    return map[network] || 'eth';
  };

  const scanToken = async () => {
    if (!address.trim()) {
      alert('Masukkan contract address!');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let data;
      const chain = getNetworkParam();

      // Panggil GoPlus Token Security API
      const url = `https://api.gopluslabs.io/api/v1/token_security/${chain}?contract_addresses=${address}`;
      const res = await fetch(url);
      const json = await res.json();

      if (json.result && json.result[address]) {
        const sec = json.result[address];
        data = {
          chain: chain.toUpperCase(),
          contract: address,
          // Honeypot & Tax
          is_honeypot: sec.is_honeypot === '1' ? '⚠️ HONEYPOT! JANGAN BELI' : '✅ Aman (bukan honeypot)',
          buy_tax: sec.buy_tax ? `${sec.buy_tax}%` : '0%',
          sell_tax: sec.sell_tax ? `${sec.sell_tax}%` : '0%',
          cannot_buy: sec.cannot_buy === '1' ? '⚠️ Gak bisa beli' : '✅ Bisa beli',
          cannot_sell_all: sec.cannot_sell_all === '1' ? '⚠️ Gak bisa jual semua' : '✅ Bisa jual',
          // Owner & Liquidity
          owner: sec.owner_address || 'Renounced / No owner',
          owner_balance_percent: sec.owner_balance_percent ? `${sec.owner_balance_percent}%` : 'N/A',
          lp_holder_count: sec.lp_holder_count || '0',
          lp_total_supply_percent: sec.lp_total_supply_percent ? `${sec.lp_total_supply_percent}%` : 'N/A',
          // Holder Info
          holder_count: sec.holder_count || 'N/A',
          // Flags
          open_source: sec.open_source === '1' ? '✅ Open source' : '⚠️ Not verified',
          proxy: sec.proxy === '1' ? '⚠️ Proxy contract (bisa di-update)' : '✅ No proxy',
          mintable: sec.mintable === '1' ? '⚠️ Masih bisa mint token baru' : '✅ Tidak bisa mint',
          burnable: sec.burnable === '1' ? '⚠️ Bisa burn token' : '✅ Tidak bisa burn',
          hidden_owner: sec.hidden_owner === '1' ? '⚠️ Owner tersembunyi' : '✅ Owner jelas',
          trust_list: sec.trust_list === '1' ? '✅ Masuk trust list' : '⚠️ Tidak ada di trust list',
        };
      } else {
        data = { error: 'Token tidak ditemukan atau chain tidak didukung', raw: json };
      }

      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#0a0a0a',
      color: '#0f0',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'monospace'
    }}>
      <h1 style={{ borderBottom: '2px solid #0f0', display: 'inline-block' }}>KINGDEGEN</h1>
      <p>Rug Check & Security Scanner</p>

      <div style={{ marginTop: 20 }}>
        {/* Network Buttons */}
        <div>
          {['eth', 'bsc', 'base', 'arb', 'solana'].map((net) => (
            <button
              key={net}
              onClick={() => setNetwork(net)}
              style={{
                background: network === net ? '#0f0' : '#333',
                color: network === net ? '#000' : '#0f0',
                margin: 5,
                padding: '8px 16px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {net.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Address Input */}
        <input
          type="text"
          placeholder="Paste contract address (0x... atau Solana address)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{
            width: '90%',
            padding: 10,
            marginTop: 20,
            background: '#222',
            border: '1px solid #0f0',
            color: '#0f0',
            fontFamily: 'monospace'
          }}
        />

        {/* Scan Button */}
        <button
          onClick={scanToken}
          disabled={loading}
          style={{
            marginTop: 20,
            padding: '10px 20px',
            background: '#0f0',
            color: '#000',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'SCANNING...' : '🔍 RUG CHECK'}
        </button>

        {/* Result */}
        {result && (
          <pre style={{
            background: '#111',
            padding: 15,
            marginTop: 20,
            whiteSpace: 'pre-wrap',
            borderRadius: 8,
            fontSize: '0.9rem'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

export default App;
