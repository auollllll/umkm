// API Base URL
const API_URL = 'api/';

// Data Global
let produkList = [];
let pelangganList = [];
let keranjang = [];
let riwayatTransaksi = [];

// Initialize
window.onload = function() {
    initializeApp();
};

// Initialize App
async function initializeApp() {
    await Promise.all([
        loadProduk(),
        loadPelanggan(),
        loadRiwayatTransfaksi()
    ]);
    
    updateStatistik();
    
    // Event listener untuk metode pembayaran
    document.getElementById('metode-pembayaran').addEventListener('change', function() {
        const inputPembayaran = document.getElementById('input-pembayaran');
        if (this.value === 'Tunai') {
            inputPembayaran.style.display = 'block';
        } else {
            inputPembayaran.style.display = 'none';
        }
    });
}

// Tab Management
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('nav button').forEach(btn => {
        btn.classList.remove('bg-orange-500');
        btn.classList.add('hover:bg-gray-600');
    });
    
    // Show selected tab
    document.getElementById('content-' + tabName).classList.remove('hidden');
    
    // Add active class to button
    document.getElementById('tab-' + tabName).classList.add('bg-orange-500');
    document.getElementById('tab-' + tabName).classList.remove('hover:bg-gray-600');
}

// Update Statistik
function updateStatistik() {
    const today = new Date().toLocaleDateString('id-ID');
    const transaksiHariIni = riwayatTransaksi.filter(t => 
        new Date(t.tanggalPenjualan).toLocaleDateString('id-ID') === today
    );
    
    const totalPendapatan = transaksiHariIni.reduce((sum, t) => sum + parseFloat(t.totalHarga), 0);
    
    document.getElementById('pendapatan-hari-ini').textContent = 'Rp ' + totalPendapatan.toLocaleString('id-ID');
    document.getElementById('jumlah-transaksi').textContent = riwayatTransaksi.length;
}

// ... (kode sebelumnya tetap sama)

// Tampilkan Struk
function tampilkanStruk(transaksi) {
    const modal = document.getElementById('modal-struk');
    const content = document.getElementById('struk-content');
    
    const tanggal = new Date(transaksi.tanggalPenjualan);
    const waktu = tanggal.toLocaleString('id-ID', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    let itemsHtml = '';
    transaksi.items.forEach(item => {
        itemsHtml += `
            <div class="struk-item">
                <span class="struk-item-name">${item.namaProduk}</span>
                <span class="struk-item-qty">${item.jumlahProduk}</span>
                <span class="struk-item-price">Rp ${item.subtotal.toLocaleString('id-ID')}</span>
            </div>
        `;
    });
    
    content.innerHTML = `
        <div class="struk">
            <div class="struk-header">
                <div class="struk-title">TOKO UMKM</div>
                <div class="struk-subtitle">Jl. Contoh No. 123, Kota</div>
                <div class="struk-subtitle">Telp: 08123456789</div>
            </div>
            
            <div class="struk-info">
                <div>No. Nota: ${transaksi.penjualanId}</div>
                <div>Tanggal: ${waktu}</div>
                <div>Kasir: Admin</div>
                <div>Pelanggan: ${transaksi.namaPelanggan || 'Pelanggan Umum'}</div>
            </div>
            
            <div class="struk-items">
                ${itemsHtml}
            </div>
            
            <div class="struk-total">
                <div class="struk-total-item">
                    <span>Subtotal:</span>
                    <span>Rp ${transaksi.totalHarga.toLocaleString('id-ID')}</span>
                </div>
                ${transaksi.metodePembayaran === 'Tunai' ? `
                    <div class="struk-total-item">
                        <span>Tunai:</span>
                        <span>Rp ${transaksi.jumlahBayar.toLocaleString('id-ID')}</span>
                    </div>
                    <div class="struk-total-item">
                        <span>Kembalian:</span>
                        <span>Rp ${transaksi.kembalian.toLocaleString('id-ID')}</span>
                    </div>
                ` : `
                    <div class="struk-total-item">
                        <span>Metode:</span>
                        <span>${transaksi.metodePembayaran}</span>
                    </div>
                `}
                <div class="struk-grand-total">
                    <span>TOTAL:</span>
                    <span>Rp ${transaksi.totalHarga.toLocaleString('id-ID')}</span>
                </div>
            </div>
            
            <div class="struk-footer">
                <div>Terima kasih atas kunjungan Anda</div>
                <div>Barang yang sudah dibeli tidak dapat dikembalikan</div>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

// Tutup Struk
function tutupStruk() {
    document.getElementById('modal-struk').classList.add('hidden');
    
    // === PERUBAAN DIMULAI DI SINI ===
    // Periksa apakah struk ini berasal dari checkout baru
    if (window.isNewCheckout) {
        // Pindah ke tab riwayat
        showTab('riwayat');
        
        // Reset flag agar tidak mempengaruhi penutupan struk lainnya
        window.isNewCheckout = false;
    }
    // === PERUBAIAN SELESAI DI SINI ===
}

// ... (kode lainnya tetap sama)
// Helper Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

function showNotification(message, type = 'success') {
    // Buat elemen notifikasi
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Hapus setelah 3 detik
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
// ... (kode sebelumnya tetap sama) ...

// Fungsi untuk membuka modal
function openModal(type, mode, data = null) {
    const modal = document.getElementById('modal-form');
    const title = document.getElementById('modal-title');
    const dataId = document.getElementById('data-id');
    const dataType = document.getElementById('data-type');
    const produkFields = document.getElementById('produk-fields');
    const pelangganFields = document.getElementById('pelanggan-fields');

    // Reset form
    document.getElementById('form-data').reset();
    
    // Set tipe data
    dataType.value = type;
    
    if (type === 'produk') {
        title.textContent = mode === 'edit' ? 'Edit Produk' : 'Tambah Produk';
        produkFields.classList.remove('hidden');
        pelangganFields.classList.add('hidden');
        
        if (mode === 'edit' && data) {
            dataId.value = data.id;
            document.getElementById('produk-nama').value = data.nama;
            document.getElementById('produk-harga').value = data.harga;
            document.getElementById('produk-stok').value = data.stok;
            document.getElementById('produk-keterangan').value = data.keterangan || '';
        } else {
            dataId.value = '';
        }
    } else if (type === 'pelanggan') {
        title.textContent = mode === 'edit' ? 'Edit Pelanggan' : 'Tambah Pelanggan';
        pelangganFields.classList.remove('hidden');
        produkFields.classList.add('hidden');
        
        if (mode === 'edit' && data) {
            dataId.value = data.id;
            document.getElementById('pelanggan-nama').value = data.nama;
            document.getElementById('pelanggan-alamat').value = data.alamat;
            document.getElementById('pelanggan-telepon').value = data.telepon;
        } else {
            dataId.value = '';
        }
    }
    
    modal.classList.remove('hidden');
}

// Fungsi untuk menutup modal
function closeModal() {
    document.getElementById('modal-form').classList.add('hidden');
}

// Fungsi yang dipanggil saat form disubmit
// ... (kode lain di main.js tetap sama) ...

// Fungsi yang dipanggil saat form disubmit (SUPER-DEBUG VERSION)
async function saveFormData(event) {
    event.preventDefault(); // Cegah form reload halaman
    
    console.log('🟢 DEBUG: Tombol Simpan DITEKAN!');
    
    const type = document.getElementById('data-type').value;
    const id = document.getElementById('data-id').value;
    
    console.log('🟢 DEBUG: Tipe Data =', type);
    console.log('🟢 DEBUG: ID =', id);

    if (type === 'produk') {
        console.log('🟢 DEBUG: Memanggil saveProduk...');
        await saveProduk(id);
    } else if (type === 'pelanggan') {
        console.log('🟢 DEBUG: Memanggil savePelanggan...');
        await savePelanggan(id);
    } else {
        console.error('🔴 DEBUG ERROR: Tipe data tidak dikenal!', type);
        showNotification('Tipe data tidak valid', 'error');
    }
    
    console.log('🟢 DEBUG: Proses Simpan SELESAI.');
}

// ... (kode lainnya tetap sama) ...
// ... (kode sebelumnya tetap sama) ...

// Fungsi untuk mengupdate tampilan kembalian
function updateKembalian() {
    const metodePembayaran = document.getElementById('metode-pembayaran').value;
    const displayKembalian = document.getElementById('display-kembalian');
    const nilaiKembalianSpan = document.getElementById('nilai-kembalian');
    
    // Hanya tampilkan jika metode pembayaran adalah Tunai
    if (metodePembayaran !== 'Tunai') {
        displayKembalian.classList.add('hidden');
        return;
    }
    
    const totalHarga = keranjang.reduce((sum, item) => sum + item.subtotal, 0);
    const jumlahBayar = parseFloat(document.getElementById('jumlah-bayar').value) || 0;
    
    if (jumlahBayar >= totalHarga) {
        const kembalian = jumlahBayar - totalHarga;
        nilaiKembalianSpan.textContent = 'Rp ' + kembalian.toLocaleString('id-ID');
        nilaiKembalianSpan.className = 'font-bold text-lg text-green-600';
        displayKembalian.classList.remove('hidden');
    } else if (jumlahBayar > 0) {
        const kekurangan = totalHarga - jumlahBayar;
        nilaiKembalianSpan.textContent = 'Kurang: Rp ' + kekurangan.toLocaleString('id-ID');
        nilaiKembalianSpan.className = 'font-bold text-lg text-red-600';
        displayKembalian.classList.remove('hidden');
    } else {
        displayKembalian.classList.add('hidden');
    }
}

// ... (kode showTab, initializeApp, dll tetap sama) ...

// Tampilkan Struk (DIPERBARUI)
function tampilkanStruk(transaksi) {
    const modal = document.getElementById('modal-struk');
    const content = document.getElementById('struk-content');
    
    const tanggal = new Date(transaksi.tanggalPenjualan);
    const waktu = tanggal.toLocaleString('id-ID', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    let itemsHtml = '';
    transaksi.items.forEach(item => {
        itemsHtml += `
            <div class="struk-item-row">
                <span class="struk-item-name">${item.namaProduk}</span>
                <span class="struk-item-qty">${item.jumlahProduk}x</span>
                <span class="struk-item-price">${formatCurrency(item.hargaSatuan)}</span>
                <span class="struk-item-subtotal">${formatCurrency(item.subtotal)}</span>
            </div>
        `;
    });
    
    content.innerHTML = `
        <div class="struk">
            <div class="struk-header">
                <div class="struk-logo">VALIEE STORE</div>
                <div class="struk-address">Jl. Karanggayam Trisono, Babadan, Ponorogo</div>
                <div class="struk-phone">Telp: 089505439282</div>
                <hr class="struk-divider">
            </div>
            
            <div class="struk-body">
                <div class="struk-info">
                    <div class="struk-info-row">
                        <span>No. Nota:</span>
                        <span>${transaksi.penjualanId}</span>
                    </div>
                    <div class="struk-info-row">
                        <span>Tanggal:</span>
                        <span>${waktu}</span>
                    </div>
                    <div class="struk-info-row">
                        <span>Kasir:</span>
                        <span>Admin</span>
                    </div>
                    <div class="struk-info-row">
                        <span>Pelanggan:</span>
                        <span>${transaksi.namaPelanggan || 'Pelanggan Umum'}</span>
                    </div>
                </div>
                
                <hr class="struk-divider">

                <div class="struk-items">
                    <div class="struk-items-header">
                        <span>Produk</span>
                        <span>Qty</span>
                        <span>Harga</span>
                        <span>Subtotal</span>
                    </div>
                    ${itemsHtml}
                </div>
                
                <hr class="struk-divider">

                <div class="struk-total">
                    <div class="struk-total-row">
                        <span>Total:</span>
                        <span>${formatCurrency(transaksi.totalHarga)}</span>
                    </div>
                    ${transaksi.metodePembayaran === 'Tunai' ? `
                        <div class="struk-total-row">
                            <span>Tunai:</span>
                            <span>${formatCurrency(transaksi.jumlahBayar)}</span>
                        </div>
                        <div class="struk-total-row grand-total">
                            <span>Kembalian:</span>
                            <span>${formatCurrency(transaksi.kembalian)}</span>
                        </div>
                    ` : `
                        <div class="struk-total-row">
                            <span>Metode:</span>
                            <span>${transaksi.metodePembayaran}</span>
                        </div>
                    `}
                </div>
            </div>
            
            <div class="struk-footer">
                <hr class="struk-divider">
                <div class="struk-footer-message">Terima kasih atas kunjungan Anda</div>
                <div class="struk-footer-note">Barang yang sudah dibeli tidak dapat dikembalikan</div>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

// ... (kode tutupStruk, dll tetap sama) ...

// Helper Function untuk format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}
// ... (kode lain di main.js tetap sama) ...

// Fungsi untuk logout (SUPER-DEBUG VERSION)
async function logout() {
    console.log('🟢 DEBUG: Tombol Logout DITEKAN!');
    
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        console.log('🟢 DEBUG: User mengkonfirmasi logout. Mengirim request ke server...');
        
        try {
            const response = await fetch(API_URL + 'auth.php?action=logout', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('🟢 DEBUG: Response dari server diterima.');
            console.log('🟢 DEBUG: Response Status:', response.status);
            console.log('🟢 DEBUG: Response OK:', response.ok);

            const result = await response.json();
            console.log('🟢 DEBUG: Response JSON dari server:', result);

            if (result.success) {
                console.log('🟢 DEBUG: Logout SUKSES! Mengarahkan ke halaman login...');
                window.location.href = 'login.html';
            } else {
                console.error('🔴 DEBUG ERROR: Server mengembalikan error:', result.message);
                alert('Gagal logout: ' + result.message);
            }
        } catch (error) {
            console.error('🔴 DEBUG ERROR: Terjadi error jaringan atau lainnya:', error);
            alert('Terjadi kesalahan saat logout. Periksa console untuk detail.');
        }
    } else {
        console.log('🟡 DEBUG: User membatalkan logout.');
    }
}