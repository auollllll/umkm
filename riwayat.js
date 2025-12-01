// Load Riwayat Transaksi dari API
async function loadRiwayatTransaksi() {
    try {
        const response = await fetch(API_URL + 'riwayat.php');
        const result = await response.json();
        
        if (result.success) {
            riwayatTransaksi = result.data;
            loadRiwayatTable();
        } else {
            console.error('Error loading riwayat:', result.message);
            showNotification('Gagal memuat riwayat transaksi', 'error');
        }
    } catch (error) {
        console.error('Error loading riwayat:', error);
        showNotification('Terjadi kesalahan saat memuat riwayat', 'error');
        riwayatTransaksi = [];
        loadRiwayatTable();
    }
}

// Load Riwayat Table
function loadRiwayatTable() {
    const tbody = document.getElementById('riwayat-table');
    tbody.innerHTML = '';
    
    if (riwayatTransaksi.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">Belum ada transaksi</td></tr>';
        return;
    }
    
    riwayatTransaksi.forEach(transaksi => {
        const tr = document.createElement('tr');
        tr.className = 'border-b hover:bg-gray-50';
        const tanggal = new Date(transaksi.tanggalPenjualan);
        tr.innerHTML = `
            <td class="px-4 py-3">${transaksi.penjualanId}</td>
            <td class="px-4 py-3">${tanggal.toLocaleString('id-ID')}</td>
            <td class="px-4 py-3">${transaksi.namaPelanggan || 'Pelanggan Umum'}</td>
            <td class="px-4 py-3">${transaksi.metodePembayaran}</td>
            <td class="px-4 py-3 font-semibold text-orange-600">
                Rp ${transaksi.totalHarga.toLocaleString('id-ID')}
            </td>
            <td class="px-4 py-3">
                <button onclick="lihatDetail(${transaksi.penjualanId})" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Detail
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Lihat Detail Transaksi
async function lihatDetail(penjualanId) {
    try {
        const response = await fetch(API_URL + `transaksi.php?id=${penjualanId}`);
        const result = await response.json();
        
        if (result.success) {
            tampilkanStruk(result.data);
        } else {
            showNotification(`Gagal memuat detail: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Error loading transaction detail:', error);
        showNotification('Terjadi kesalahan saat memuat detail transaksi', 'error');
    }
}