import React, { useState } from 'react';

function App() {
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState('eth');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const getNetworkParam = () => {
    const map = { eth: 'eth', bsc: 'bsc', base: 'base', arb: 'arb', solana: 'solana' };
    return map[network] || 'eth';
  };

  const scanToken = async () => {
    if (!address.trim()) return alert('Masukkan contract address!');
    setLoading(true);
    setResult(null);
    try {
      const chain = getNetworkParam();
      let finalResult = {};

      // 1️⃣ GoPlus Security (Rug Check)
      finalResult.security = await fetchGoPlusData(chain, address);
      
      // 2️⃣ Solana Analysis (Tanpa API Key!)
      if (chain === 'solana') {
        finalResult.solanaHolders = await fetchSolanaHoldersViaSolscan(address);
      } 
      // 3️⃣ Untuk EVM (ETH/BSC/BASE/ARB)
      else {
        finalResult.evmHolderAnalysis = await fetchEvmHolderData(chain, address);
      }

      setResult(finalResult);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Fungsi baru untuk ambil holder Solana dari Solscan (GRATIS, No API Key!)
  const fetchSolanaHoldersViaSolscan = async (contractAddress) => {
    try {
      const url = `https://public-api.solscan.io/token/holders?tokenAddress=${contractAddress}&limit=10`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data.data) {
        let totalPercentage = 0;
        const topHolders = data.data.slice(0, 10).map(holder => {
          const percentage = parseFloat((holder.amount / data.total_supply) * 100).toFixed(2);
          totalPercentage += parseFloat(percentage);
          return {
            address: holder.owner,
            amount: holder.amount,
            percentage: percentage + '%',
            rank: holder.rank
          };
        });

        let riskLevel = 'Low Risk';
        let riskNotes = 'Konsentrasi pemegang rendah.';
        if (totalPercentage > 50) {
          riskLevel = 'High Risk';
          riskNotes = `⚠️ Top 10 holders menguasai ${totalPercentage.toFixed(2)}% suplai. Risiko manipulasi tinggi!`;
        } else if (totalPercentage > 20) {
          riskLevel = 'Medium Risk';
          riskNotes = `Top 10 holders menguasai ${totalPercentage.toFixed(2)}% suplai. Ada potensi sentralisasi.`;
        }

        return {
          source: 'Solscan API (Gratis)',
          total_holders: data.total,
          total_supply: data.total_supply,
          top10_holder_percentage: totalPercentage.toFixed(2) + '%',
          risk_level: riskLevel,
          risk_note: riskNotes,
          top_holders: topHolders
        };
      }
      return { error: 'Gagal ambil data holder dari Solscan' };
    } catch (error) {
      return { error: error.message };
    }
  };

  // Fungsi GoPlus (Tetap sama)
  const fetchGoPlusData = async (chain, contractAddress) => {
    try {
      let url = `https://api.gopluslabs.io/api/v1/token_security/${chain}?contract_addresses=${contractAddress}`;
      if (chain === 'solana') url = `https://api.gopluslabs.io/api/v1/solana/token_security?contract_addresses=${contractAddress}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.result && data.result[contractAddress]) {
        const sec = data.result[contractAddress];
        return {
          is_honeypot: sec.is_honeypot === '1',
          buy_tax: sec.buy_tax ? `${sec.buy_tax}%` : '0%',
          sell_tax: sec.sell_tax ? `${sec.sell_tax}%` : '0%',
          owner_balance_percent: sec.owner_balance_percent,
          holder_count: sec.holder_count
        };
      }
      return { error: 'Gagal ambil data dari GoPlus' };
    } catch (error) {
      return { error: error.message };
    }
  };

  // Fungsi holder EVM (Tetap pake Moralis)
  const fetchEvmHolderData = async (chain, contractAddress) => {
    try {
      const chainMap = { eth: 'eth', bsc: 'bsc', base: 'base', arb: 'arbitrum' };
      const moralisChain = chainMap[chain] || 'eth';
      const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjI4NDZiNWEwLTQ2ZTgtNDRkMi1iNzdjLTg1ZTI5OWUyYjM0OSIsIm9yZ0lkIjoiNTE3MjYwIiwidXNlcklkIjoiNTMyMzIyIiwidHlwZUlkIjoiZTcyMGRiYjUtZTc0NC00Njg0LTk5ZDAtZWIzYmQwOTU0NDg3IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3Nzk2MjEwNDMsImV4cCI6NDkzNTM4MTA0M30.NMC4212fAlCD-e9eR4IO0YWXgeKnLb2uhrjfZRRfUkQ';
      const url = `https://deep-index.moralis.io/api/v2.2/erc20/${contractAddress}/owners?chain=${moralisChain}&order=DESC&limit=10`;
      const response = await fetch(url, { headers: { 'X-API-Key': MORALIS_API_KEY } });
      const data = await response.json();
      if (data && data.result) {
        let totalPercentage = 0;
        const topHolders = data.result.map(holder => {
          const percentage = parseFloat(holder.percentage_relative_to_total_supply);
          totalPercentage += percentage;
          return { address: holder.owner_address, percentage: percentage.toFixed(2) + '%' };
        });
        let riskLevel = totalPercentage > 50 ? 'High Risk' : (totalPercentage > 20 ? 'Medium Risk' : 'Low Risk');
        return { source: 'Moralis API', top10_holder_percentage: totalPercentage.toFixed(2) + '%', risk_level: riskLevel, top_holders: topHolders };
      }
      return { error: 'Gagal ambil data holder dari Moralis' };
    } catch (error) {
      return { error: error.message };
    }
  };

  // JSX Tampilan (Tetap Sama)
  return (
    <div style={{ background: '#0a0a0a', color: '#0f0', minHeight: '100vh', padding: 20, fontFamily: 'monospace' }}>
      <h1 style={{ borderBottom: '2px solid #0f0', display: 'inline-block' }}>KINGDEGEN</h1>
      <p>Security Scanner + Holder Analysis</p>
      <div>
        {['eth', 'bsc', 'base', 'arb', 'solana'].map(net => (
          <button key={net} onClick={() => setNetwork(net)} style={{
            background: network === net ? '#0f0' : '#333', color: network === net ? '#000' : '#0f0',
            margin: 5, padding: '8px 16px', cursor: 'pointer'
          }}>{net.toUpperCase()}</button>
        ))}
      </div>
      <input type="text" placeholder="Paste address" value={address} onChange={e => setAddress(e.target.value)}
        style={{ width: '90%', padding: 12, marginTop: 20, background: '#222', border: '1px solid #0f0', color: '#0f0' }} />
      <button onClick={scanToken} disabled={loading}
        style={{ marginTop: 20, padding: '10px 20px', background: '#0f0', color: '#000', cursor: 'pointer' }}>
        {loading ? 'SCANNING...' : 'SCAN'}
      </button>
      {result && (<pre style={{ background: '#111', padding: 15, marginTop: 20, overflow: 'auto' }}>
        {JSON.stringify(result, null, 2)}
      </pre>)}
    </div>
  );
}
export default App;
