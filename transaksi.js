// Tambah ke Keranjang
function tambahKeKeranjang(produk) {
    if (produk.stok <= 0) {
        showNotification('Stok produk habis!', 'error');
        return;
    }

    const existingItem = keranjang.find(item => item.id === produk.id);
    
    if (existingItem) {
        if (existingItem.jumlah >= produk.stok) {
            showNotification('Jumlah melebihi stok yang tersedia!', 'error');
            return;
        }
        existingItem.jumlah++;
        existingItem.subtotal = existingItem.jumlah * existingItem.harga;
    } else {
        keranjang.push({
            id: produk.id,
            nama: produk.nama,
            harga: produk.harga,
            stok: produk.stok,
            jumlah: 1,
            subtotal: produk.harga
        });
    }
    
    updateKeranjang();
}

// Update Keranjang Display
function updateKeranjang() {
    const container = document.getElementById('keranjang-items');
    
    if (keranjang.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Keranjang kosong</p>';
        document.getElementById('total-harga').textContent = 'Rp 0';
        return;
    }
    
    container.innerHTML = '';
    let total = 0;
    
    keranjang.forEach(item => {
        total += item.subtotal;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'border border-gray-200 rounded-lg p-3';
        itemDiv.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <h4 class="font-medium text-sm">${item.nama}</h4>
                <button onclick="hapusDariKeranjang(${item.id})" class="text-red-500 hover:text-red-700">
                    🗑️
                </button>
            </div>
            <p class="text-orange-600 font-semibold mb-2">Rp ${item.subtotal.toLocaleString('id-ID')}</p>
            <div class="flex items-center gap-2">
                <button onclick="updateJumlah(${item.id}, -1)" class="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300">
                    -
                </button>
                <span class="w-12 text-center font-medium">${item.jumlah}</span>
                <button onclick="updateJumlah(${item.id}, 1)" class="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300">
                    +
                </button>
            </div>
        `;
        
        container.appendChild(itemDiv);
    });
    
    document.getElementById('total-harga').textContent = 'Rp ' + total.toLocaleString('id-ID');
}

// Update Jumlah Item
function updateJumlah(produkId, perubahan) {
    const item = keranjang.find(i => i.id === produkId);
    if (!item) return;
    
    const jumlahBaru = item.jumlah + perubahan;
    
    if (jumlahBaru <= 0) {
        hapusDariKeranjang(produkId);
        return;
    }
    
    if (jumlahBaru > item.stok) {
        showNotification('Jumlah melebihi stok!', 'error');
        return;
    }
    
    item.jumlah = jumlahBaru;
    item.subtotal = item.jumlah * item.harga;
    updateKeranjang();
}

// Hapus dari Keranjang
function hapusDariKeranjang(produkId) {
    keranjang = keranjang.filter(item => item.id !== produkId);
    updateKeranjang();
}
// ... (kode sebelumnya tetap sama)

// Proses Pembayaran
async function prosesPembayaran() {
    if (keranjang.length === 0) {
        showNotification('Keranjang masih kosong!', 'error');
        return;
    }

    const pelangganId = document.getElementById('select-pelanggan').value;
    const metodePembayaran = document.getElementById('metode-pembayaran').value;
    const total = keranjang.reduce((sum, item) => sum + item.subtotal, 0);
    
    let jumlahBayar = total;
    let kembalian = 0;
    
    // Validasi pembayaran tunai
    if (metodePembayaran === 'Tunai') {
        jumlahBayar = parseFloat(document.getElementById('jumlah-bayar').value) || 0;
        
        if (jumlahBayar < total) {
            showNotification('Jumlah pembayaran kurang dari total!', 'error');
            return;
        }
        
        kembalian = jumlahBayar - total;
    }
    
    // Siapkan data transaksi
    const transaksiData = {
        pelangganId: pelangganId,
        totalHarga: total,
        metodePembayaran: metodePembayaran,
        jumlahBayar: jumlahBayar,
        kembalian: kembalian,
        items: keranjang.map(item => ({
            produkId: item.id,
            jumlahProduk: item.jumlah,
            hargaSatuan: item.harga,
            subtotal: item.subtotal
        }))
    };
    
    try {
        // Kirim data ke API
        const response = await fetch(API_URL + 'transaksi.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transaksiData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Ambil detail transaksi untuk struk
            const detailResponse = await fetch(API_URL + `transaksi.php?id=${result.data.penjualanId}`);
            const detailResult = await detailResponse.json();
            
            if (detailResult.success) {
                // === PERUBAAN DIMULAI DI SINI ===
                // Set flag untuk menandakan bahwa ini adalah checkout baru
                // dan kita harus pindah ke riwayat setelah struk ditutup
                window.isNewCheckout = true;
                
                // Tampilkan struk
                tampilkanStruk(detailResult.data);
                // === PERUBAIAN SELESAI DI SINI ===
            }
            
            // Reset keranjang
            keranjang = [];
            updateKeranjang();
            
            // Reload data
            await Promise.all([
                loadProduk(),
                loadRiwayatTransaksi()
            ]);
            
            updateStatistik();
            
            // Reset form pembayaran
            document.getElementById('jumlah-bayar').value = '';
            
            showNotification('Pembayaran berhasil!');
        } else {
            showNotification(`Gagal memproses transaksi: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        showNotification('Terjadi kesalahan saat memproses pembayaran', 'error');
    }
}

// ... (kode lainnya tetap sama)