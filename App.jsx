const scanToken = async () => {
    // ... (kode untuk validasi address)
    try {
        let data;
        const chain = getNetworkParam();

        let url = `https://api.gopluslabs.io/api/v1/token_security/${chain}?contract_addresses=${address}`;
        
        // Gunakan endpoint khusus Solana yang lebih powerful!
        if (chain === 'solana') {
            url = `https://api.gopluslabs.io/api/v1/solana/token_security?contract_addresses=${address}`;
        }

        // ... (kode fetch API dan pengolahan data)

        if (json.result && json.result[address]) {
            const sec = json.result[address];
            data = {
                chain: chain.toUpperCase(),
                contract: address,
                risk_level: sec.risk_level || 'N/A',
                
                // 👇 Data spesifik untuk Solana ada di sini!
                freeze_authority: sec.freeze_authority === '1' ? '⚠️ Ada otoritas bekuin token' : '✅ Aman',
                mint_authority: sec.mint_authority === '1' ? '⚠️ Masih bisa cetak token baru' : '✅ Aman',
                renounced: sec.mint_authority === '0' && sec.freeze_authority === '0' ? '✅✅✅ SUDAH RENOUNCE! ✅✅✅' : '⚠️ Hak istimewa masih ada',
                is_self_destruct: sec.is_self_destruct === '1' ? '⚠️ Ada fungsi hancurkan diri!' : '✅ Aman',
                is_true_token: sec.is_true_token === '1' ? '✅ Ini token beneran, cuy' : '⚠️ Mungkin cuma akun biasa',

                // 👇 Bagian "Extra Info" untuk detail lebih dalam
                extra_info: {
                    mint: sec.mint_address || 'N/A',
                    decimals: sec.decimals || 'N/A',
                    total_supply: sec.total_supply || 'N/A',
                    token_program: sec.token_program || 'N/A',
                    is_mintable: sec.mintable === '1' ? '⚠️⚠️ MASIH BISA MINT! ⚠️⚠️' : '✅ Tidak bisa mint'
                }
            };
        }

        // ... (kode untuk menampilkan hasil)
    } catch (err) {
        // ... (kode untuk error handling)
    }
};
