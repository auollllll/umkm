// Load Produk dari API
async function loadProduk() {
    try {
        const response = await fetch(API_URL + 'produk.php');
        const result = await response.json();
        
        if (result.success) {
            produkList = result.data;
            displayProduk();
            loadStokTable();
        } else {
            showNotification('Gagal memuat data produk', 'error');
        }
    } catch (error) {
        console.error('Error loading produk:', error);
        showNotification('Terjadi kesalahan saat memuat produk', 'error');
    }
}

// Display Produk
function displayProduk() {
    const container = document.getElementById('produk-list');
    container.innerHTML = '';
    
    produkList.forEach(produk => {
        const card = document.createElement('div');
        card.className = `bg-white rounded-lg p-4 shadow hover:shadow-lg transition-all cursor-pointer ${
            produk.stok === 0 ? 'opacity-50' : 'hover:scale-105'
        }`;
        card.onclick = () => tambahKeKeranjang(produk);
        
        card.innerHTML = `
            <h3 class="font-semibold text-gray-800 mb-2">${produk.nama}</h3>
            <p class="text-orange-600 font-bold text-lg">Rp ${produk.harga.toLocaleString('id-ID')}</p>
            <p class="text-sm mt-1 ${produk.stok > 10 ? 'text-green-600' : 'text-red-600'}">
                Stok: ${produk.stok}
            </p>
        `;
        
        container.appendChild(card);
    });
}

// Filter Produk
function filterProduk() {
    const search = document.getElementById('search-produk').value.toLowerCase();
    const cards = document.querySelectorAll('#produk-list > div');
    
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(search) ? 'block' : 'none';
    });
}

// Load Stok Table
function loadStokTable() {
    const tbody = document.getElementById('stok-table');
    tbody.innerHTML = '';
    
    produkList.forEach(produk => {
        const tr = document.createElement('tr');
        tr.className = 'border-b hover:bg-gray-50';
        tr.innerHTML = `
            <td class="px-4 py-3">${produk.nama}</td>
            <td class="px-4 py-3">Rp ${produk.harga.toLocaleString('id-ID')}</td>
            <td class="px-4 py-3">
                <span class="font-semibold ${produk.stok > 10 ? 'text-green-600' : 'text-red-600'}">
                    ${produk.stok}
                </span>
            </td>
            <td class="px-4 py-3">
                <button onclick="tambahStok(${produk.id})" class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 mr-2">
                    + Stok
                </button>
                <button onclick="editProduk(${produk.id})" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2">
                    Edit
                </button>
                <button onclick="hapusProduk(${produk.id})" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                    Hapus
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Tambah Stok (menggunakan prompt)
async function tambahStok(produkId) {
    // === PERBAIKAN ===
    console.log('Fungsi tambahStok dipanggil dengan ID:', produkId);
    const produk = produkList.find(p => p.id == produkId); // Gunakan == agar fleksibel
    
    if (!produk) {
        console.error('Produk tidak ditemukan di dalam produkList untuk tambahStok.');
        showNotification('Produk tidak ditemukan', 'error');
        return;
    }

    const jumlahStr = prompt(`Tambah stok untuk "${produk.nama}" berapa?`);
    const jumlah = parseInt(jumlahStr);
    
    if (jumlahStr && !isNaN(jumlah) && jumlah > 0) {
        try {
            const response = await fetch(API_URL + 'produk.php', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: produkId,
                    action: 'tambah_stok',
                    jumlah: jumlah
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Stok berhasil ditambahkan');
                await loadProduk(); // Reload data
            } else {
                showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Error adding stock:', error);
            showNotification('Terjadi kesalahan saat menambah stok', 'error');
        }
    }
}

// Edit Produk (menggunakan prompt)
async function editProduk(produkId) {
    // === PERBAIKAN ===
    console.log('Fungsi editProduk dipanggil dengan ID:', produkId);
    console.log('Isi produkList saat ini:', produkList);

    if (produkList.length === 0) {
        showNotification('Data produk belum dimuat, silakan refresh halaman.', 'error');
        return;
    }
    
    const produk = produkList.find(p => p.id == produkId); // Gunakan == agar fleksibel
    
    console.log('Hasil pencarian produk:', produk);

    if (!produk) {
        showNotification('Produk tidak ditemukan', 'error');
        return;
    }

    const nama = prompt('Nama produk:', produk.nama);
    if (nama === null) return;

    const hargaStr = prompt('Harga produk:', produk.harga);
    const harga = parseFloat(hargaStr);
    if (hargaStr === null || isNaN(harga) || harga <= 0) {
        showNotification('Harga tidak valid', 'error');
        return;
    }

    const stokStr = prompt('Stok produk:', produk.stok);
    const stok = parseInt(stokStr);
    if (stokStr === null || isNaN(stok) || stok < 0) {
        showNotification('Stok tidak valid', 'error');
        return;
    }

    const keterangan = prompt('Keterangan (opsional):', produk.keterangan || '');
    if (keterangan === null) return;

    try {
        const response = await fetch(API_URL + 'produk.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: produkId,
                action: 'edit',
                nama: nama,
                harga: harga,
                stok: stok,
                keterangan: keterangan
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Produk berhasil diperbarui');
            await loadProduk(); // Reload data
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Error updating product:', error);
        showNotification('Terjadi kesalahan saat memperbarui produk', 'error');
    }
}

// Hapus Produk
async function hapusProduk(produkId) {
    // === PERBAIKAN ===
    console.log('Fungsi hapusProduk dipanggil dengan ID:', produkId);
    const produk = produkList.find(p => p.id == produkId); // Gunakan == agar fleksibel

    if (!produk) {
        console.error('Produk tidak ditemukan di dalam produkList untuk hapusProduk.');
        showNotification('Produk tidak ditemukan', 'error');
        return;
    }
    
    if (confirm(`Apakah Anda yakin ingin menghapus "${produk.nama}"? Produk yang sudah terjual tidak dapat dihapus.`)) {
        try {
            const response = await fetch(API_URL + 'produk.php', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: produkId })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Produk berhasil dihapus');
                await loadProduk(); // Reload data
            } else {
                showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            showNotification('Terjadi kesalahan saat menghapus produk', 'error');
        }
    }
}

// Fungsi Tambah Produk tetap menggunakan modal
function tambahProduk() {
    openModal('produk', 'add');
}