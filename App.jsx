import React, { useState } from 'react';

function App() {
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState('eth');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mapping network ke format GoPlus
  const getNetworkParam = () => {
    const map = {
      eth: 'eth',
      bsc: 'bsc',
      base: 'base',
      arb: 'arb',
      solana: 'solana',
      polygon: 'polygon',
      avalanche: 'avalanche'
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
      const chain = getNetworkParam();
      let url;

      // Pilih endpoint berdasarkan jaringan
      if (chain === 'solana') {
        url = `https://api.gopluslabs.io/api/v1/solana/token_security?contract_addresses=${address}`;
      } else {
        url = `https://api.gopluslabs.io/api/v1/token_security/${chain}?contract_addresses=${address}`;
      }

      const res = await fetch(url);
      const json = await res.json();

      if (json.result && json.result[address]) {
        const sec = json.result[address];
        
        // Hasil untuk semua jaringan (EVM + Solana)
        const baseData = {
          chain: chain.toUpperCase(),
          contract: address,
          risk_level: sec.risk_level || 'N/A',
          // Honeypot & Tax (khusus EVM)
          is_honeypot: sec.is_honeypot === '1' ? '⚠️ HONEYPOT! JANGAN BELI' : (sec.is_honeypot === '0' ? '✅ Aman (bukan honeypot)' : 'N/A'),
          buy_tax: sec.buy_tax ? `${sec.buy_tax}%` : (sec.buy_tax === '0' ? '0%' : 'N/A'),
          sell_tax: sec.sell_tax ? `${sec.sell_tax}%` : (sec.sell_tax === '0' ? '0%' : 'N/A'),
          cannot_buy: sec.cannot_buy === '1' ? '⚠️ Gak bisa beli' : (sec.cannot_buy === '0' ? '✅ Bisa beli' : 'N/A'),
          cannot_sell_all: sec.cannot_sell_all === '1' ? '⚠️ Gak bisa jual semua' : (sec.cannot_sell_all === '0' ? '✅ Bisa jual' : 'N/A'),
          // Owner & Liquidity
          owner: sec.owner_address || 'Renounced / No owner',
          owner_balance_percent: sec.owner_balance_percent ? `${sec.owner_balance_percent}%` : 'N/A',
          holder_count: sec.holder_count || 'N/A',
          lp_holder_count: sec.lp_holder_count || 'N/A',
          lp_total_supply_percent: sec.lp_total_supply_percent ? `${sec.lp_total_supply_percent}%` : 'N/A',
          // Security Flags EVM
          open_source: sec.open_source === '1' ? '✅ Open source' : (sec.open_source === '0' ? '⚠️ Not verified' : 'N/A'),
          proxy: sec.proxy === '1' ? '⚠️ Proxy contract (bisa di-update)' : (sec.proxy === '0' ? '✅ No proxy' : 'N/A'),
          mintable: sec.mintable === '1' ? '⚠️ Masih bisa mint token baru' : (sec.mintable === '0' ? '✅ Tidak bisa mint' : 'N/A'),
          burnable: sec.burnable === '1' ? '⚠️ Bisa burn token' : (sec.burnable === '0' ? '✅ Tidak bisa burn' : 'N/A'),
          hidden_owner: sec.hidden_owner === '1' ? '⚠️ Owner tersembunyi' : (sec.hidden_owner === '0' ? '✅ Owner jelas' : 'N/A'),
          trust_list: sec.trust_list === '1' ? '✅ Masuk trust list' : (sec.trust_list === '0' ? '⚠️ Tidak ada di trust list' : 'N/A'),
        };

        // Data khusus Solana
        if (chain === 'solana') {
          const solanaData = {
            freeze_authority: sec.freeze_authority === '1' ? '⚠️ Ada otoritas bekuin token' : '✅ Aman',
            mint_authority: sec.mint_authority === '1' ? '⚠️ Masih bisa cetak token baru' : '✅ Aman',
            renounced: (sec.mint_authority === '0' && sec.freeze_authority === '0') ? '✅✅✅ SUDAH RENOUNCE! ✅✅✅' : '⚠️ Hak istimewa masih ada',
            is_self_destruct: sec.is_self_destruct === '1' ? '⚠️ Ada fungsi hancurkan diri!' : '✅ Aman',
            is_true_token: sec.is_true_token === '1' ? '✅ Ini token beneran' : '⚠️ Mungkin cuma akun biasa',
            token_program: sec.token_program || 'N/A',
            decimals: sec.decimals || 'N/A',
            total_supply: sec.total_supply || 'N/A',
          };
          setResult({ ...baseData, ...solanaData });
        } else {
          setResult(baseData);
        }
      } else {
        setResult({
          error: 'Token tidak ditemukan atau chain tidak didukung',
          contract: address,
          chain: chain.toUpperCase(),
          raw: json
        });
      }
    } catch (err) {
      setResult({ error: err.message, contract: address });
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
      <p>Rug Check & Security Scanner | 7 Networks Supported</p>

      <div style={{ marginTop: 20 }}>
        {/* Network Buttons - 7 jaringan */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {['eth', 'bsc', 'base', 'arb', 'solana', 'polygon', 'avalanche'].map((net) => (
            <button
              key={net}
              onClick={() => setNetwork(net)}
              style={{
                background: network === net ? '#0f0' : '#222',
                color: network === net ? '#000' : '#0f0',
                border: `1px solid ${network === net ? '#0f0' : '#333'}`,
                padding: '8px 16px',
                cursor: 'pointer',
                fontWeight: 'bold',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            >
              {net === 'avalanche' ? 'AVAX' : net.toUpperCase()}
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
            width: '100%',
            maxWidth: '600px',
            padding: '12px',
            marginTop: '20px',
            background: '#222',
            border: '1px solid #0f0',
            color: '#0f0',
            fontFamily: 'monospace',
            fontSize: '14px',
            borderRadius: '4px'
          }}
        />

        {/* Scan Button */}
        <button
          onClick={scanToken}
          disabled={loading}
          style={{
            marginTop: '20px',
            padding: '12px 24px',
            background: '#0f0',
            color: '#000',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            borderRadius: '4px',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? '🔄 SCANNING...' : '🔍 RUG CHECK'}
        </button>

        {/* Result Display */}
        {result && (
          <div style={{
            background: '#111',
            padding: '15px',
            marginTop: '20px',
            borderRadius: '8px',
            maxWidth: '900px',
            overflowX: 'auto'
          }}>
            <pre style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              fontSize: '12px',
              color: '#0f0',
              fontFamily: 'monospace'
            }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #333', fontSize: '12px', color: '#555' }}>
        <p>Powered by GoPlus Security | 7 Networks: ETH, BSC, BASE, ARB, SOLANA, POLYGON, AVAX</p>
      </div>
    </div>
  );
}

export default App;
