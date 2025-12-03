// js/dashboard.js

let salesChartInstance = null; // Untuk menyimpan instance Chart

// Load Dashboard Data
async function loadDashboardData() {
    try {
        // Update semua statistik
        updateDashboardStats(); // Statistik Produk & Pelanggan
        updatePendapatanHariIni(); // Pendapatan Hari Ini
        updateStokMenipis(); // Peringatan Stok
        updateTransaksiTerbaru(); // Transaksi Terbaru
        renderSalesChart(); // Grafik
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Update Dashboard Statistics (Total)
function updateDashboardStats() {
    // Total Produk (Mengambil dari produkList yang di-load di main.js)
    document.getElementById('dashboard-total-produk').textContent = produkList.length;
    
    // Total Pelanggan (Mengambil dari pelangganList yang di-load di main.js)
    document.getElementById('dashboard-total-pelanggan').textContent = pelangganList.length;
}

// Update Pendapatan Hari Ini & Jumlah Transaksi Hari Ini
function updatePendapatanHariIni() {
    const today = new Date().toLocaleDateString('id-ID');
    const transaksiHariIni = riwayatTransaksi.filter(t => 
        // Mengambil tanggal dari riwayatTransaksi dan membandingkannya
        new Date(t.tanggalPenjualan).toLocaleDateString('id-ID') === today
    );
    
    const totalPendapatan = transaksiHariIni.reduce((sum, t) => sum + parseFloat(t.totalHarga), 0);
    
    document.getElementById('dashboard-pendapatan-hari-ini').textContent = formatCurrency(totalPendapatan);
    document.getElementById('dashboard-transaksi-hari-ini').textContent = transaksiHariIni.length + ' transaksi';
}

// Update Stok Menipis
function updateStokMenipis() {
    // Stok Menipis: stok <= 10 dan > 0
    const stokMenipis = produkList.filter(p => p.stok <= 10 && p.stok > 0);
    // Stok Habis: stok === 0
    const stokHabis = produkList.filter(p => p.stok === 0);
    
    const container = document.getElementById('dashboard-stok-menipis');
    
    if (stokMenipis.length === 0 && stokHabis.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Semua produk stok aman 👍</p>';
        return;
    }
    
    let html = '';
    
    // Stok habis (prioritas tinggi)
    stokHabis.forEach(produk => {
        html += `
            <div class="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div>
                    <p class="font-semibold text-gray-800">${produk.nama}</p>
                    <p class="text-sm text-red-600 font-bold">Stok Habis!</p>
                </div>
                <button onclick="tambahStok(${produk.id})" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">
                    + Stok
                </button>
            </div>
        `;
    });
    
    // Stok menipis
    stokMenipis.forEach(produk => {
        html += `
            <div class="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div>
                    <p class="font-semibold text-gray-800">${produk.nama}</p>
                    <p class="text-sm text-orange-600">Stok: ${produk.stok}</p>
                </div>
                <button onclick="tambahStok(${produk.id})" class="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm">
                    + Stok
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Update Transaksi Terbaru (5 transaksi terakhir)
function updateTransaksiTerbaru() {
    const tbody = document.getElementById('dashboard-transaksi-terbaru');
    
    if (riwayatTransaksi.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="px-4 py-8 text-center text-gray-500">Belum ada transaksi</td></tr>';
        return;
    }
    
    // Ambil 5 transaksi terbaru
    const transaksiTerbaru = riwayatTransaksi.slice(0, 5);
    
    tbody.innerHTML = '';
    
    transaksiTerbaru.forEach(transaksi => {
        const tr = document.createElement('tr');
        tr.className = 'border-b hover:bg-gray-50';
        const tanggal = new Date(transaksi.tanggalPenjualan);
        const waktu = tanggal.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        
        tr.innerHTML = `
            <td class="px-2 py-3">${transaksi.penjualanId}</td>
            <td class="px-2 py-3 text-sm">${waktu}</td>
            <td class="px-2 py-3 font-semibold text-orange-600">${formatCurrency(transaksi.totalHarga)}</td>
        `;
        
        tbody.appendChild(tr);
    });
}

// Render Grafik Penjualan 7 Hari Terakhir
function renderSalesChart() {
    // 1. Hitung total penjualan per hari selama 7 hari terakhir
    const salesData = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Atur waktu ke awal hari ini

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        salesData[dateString] = 0;
    }

    riwayatTransaksi.forEach(t => {
        const tDate = new Date(t.tanggalPenjualan);
        const dateString = tDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        
        // Hanya hitung transaksi dalam 7 hari terakhir
        if (salesData.hasOwnProperty(dateString)) {
            salesData[dateString] += parseFloat(t.totalHarga);
        }
    });

    const labels = Object.keys(salesData);
    const data = Object.values(salesData);

    // Hancurkan instance chart yang lama jika ada
    if (salesChartInstance) {
        salesChartInstance.destroy();
    }

    // Buat chart baru
    const ctx = document.getElementById('salesChart').getContext('2d');
    salesChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pendapatan',
                data: data,
                borderColor: '#f97316',
                backgroundColor: 'rgba(249, 115, 22, 0.2)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value, index, values) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += formatCurrency(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// Refresh Dashboard (dipanggil setiap kali tab dashboard dibuka)
function refreshDashboard() {
    loadDashboardData();
}

// Fungsi formatCurrency dari main.js (agar bisa diakses di dashboard.js)
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}