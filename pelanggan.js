// Load Pelanggan dari API
async function loadPelanggan() {
    try {
        const response = await fetch(API_URL + 'pelanggan.php');
        const result = await response.json();
        
        if (result.success) {
            pelangganList = result.data;
            loadPelangganDropdown();
            loadPelangganTable();
        } else {
            showNotification('Gagal memuat data pelanggan: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error loading pelanggan:', error);
        showNotification('Terjadi kesalahan saat memuat pelanggan', 'error');
    }
}

// Load Pelanggan Dropdown
function loadPelangganDropdown() {
    const select = document.getElementById('select-pelanggan');
    select.innerHTML = '';
    
    pelangganList.forEach(pelanggan => {
        const option = document.createElement('option');
        option.value = pelanggan.id;
        option.textContent = pelanggan.nama;
        select.appendChild(option);
    });
}

// Load Pelanggan Table
function loadPelangganTable() {
    const tbody = document.getElementById('pelanggan-table');
    tbody.innerHTML = '';
    
    pelangganList.forEach(pelanggan => {
        const tr = document.createElement('tr');
        tr.className = 'border-b hover:bg-gray-50';
        tr.innerHTML = `
            <td class="px-4 py-3">${pelanggan.nama}</td>
            <td class="px-4 py-3">${pelanggan.alamat}</td>
            <td class="px-4 py-3">${pelanggan.telepon}</td>
            <td class="px-4 py-3">
                <button onclick="editPelanggan(${pelanggan.id})" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2">
                    Edit
                </button>
                <button onclick="hapusPelanggan(${pelanggan.id})" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                    Hapus
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Tambah Pelanggan (buka modal)
function tambahPelanggan() {
    openModal('pelanggan', 'add');
}

// Edit Pelanggan (menggunakan prompt, seperti tambahStok)
async function editPelanggan(pelangganId) {
    const pelanggan = pelangganList.find(p => p.id == pelangganId); // Gunakan == agar fleksibel
    if (!pelanggan) {
        showNotification('Pelanggan tidak ditemukan', 'error');
        return;
    }

    // Gunakan prompt untuk setiap field, isi dengan data lama
    const nama = prompt('Nama Pelanggan:', pelanggan.nama);
    if (nama === null || nama.trim() === '') return; // User batal atau input kosong

    const alamat = prompt('Alamat Pelanggan:', pelanggan.alamat);
    if (alamat === null || alamat.trim() === '') return; // User batal atau input kosong

    const telepon = prompt('Nomor Telepon:', pelanggan.telepon);
    if (telepon === null || telepon.trim() === '') return; // User batal atau input kosong

    // Kirim data ke API untuk update
    try {
        const response = await fetch(API_URL + 'pelanggan.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: pelangganId,
                nama: nama.trim(),
                alamat: alamat.trim(),
                telepon: telepon.trim()
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Pelanggan berhasil diperbarui');
            await loadPelanggan(); // Reload data
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Error updating customer:', error);
        showNotification('Terjadi kesalahan saat memperbarui pelanggan', 'error');
    }
}

// Hapus Pelanggan
async function hapusPelanggan(pelangganId) {
    const pelanggan = pelangganList.find(p => p.id == pelangganId);
    if (!pelanggan) return;
    
    if (confirm(`Apakah Anda yakin ingin menghapus "${pelanggan.nama}"? Pelanggan yang memiliki transaksi tidak dapat dihapus.`)) {
        try {
            const response = await fetch(API_URL + 'pelanggan.php', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: pelangganId })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Pelanggan berhasil dihapus');
                await loadPelanggan(); // Reload data
            } else {
                showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Error deleting customer:', error);
            showNotification('Terjadi kesalahan saat menghapus pelanggan', 'error');
        }
    }
}

// Simpan Pelanggan (hanya untuk TAMBAH, dipanggil dari main.js)
// ... (kode lain di pelanggan.js tetap sama) ...

// Simpan Pelanggan (SUPER-DEBUG VERSION - HANYA UNTUK TAMBAH)
async function savePelanggan(id) {
    console.log('🟢 DEBUG savePelanggan: Fungsi DIMULAI.');
    console.log('🟢 DEBUG savePelanggan: ID yang diterima =', id);

    // Ambil data dari form
    const nama = document.getElementById('pelanggan-nama').value;
    const alamat = document.getElementById('pelanggan-alamat').value;
    const telepon = document.getElementById('pelanggan-telepon').value;
    
    const dataForm = { nama, alamat, telepon };
    console.log('🟢 DEBUG savePelanggan: Data dari form =', dataForm);

    // Validasi sederhana
    if (!nama || !alamat || !telepon) {
        console.log('🔴 DEBUG ERROR: Form tidak lengkap!');
        showNotification('Semua field wajib diisi!', 'error');
        return;
    }

    // Siapkan request API
    const url = API_URL + 'pelanggan.php';
    const method = 'POST';
    const body = JSON.stringify(dataForm);

    console.log('🟢 DEBUG savePelanggan: Mengirim request...');
    console.log('🟢 DEBUG savePelanggan: URL =', url);
    console.log('🟢 DEBUG savePelanggan: Method =', method);
    console.log('🟢 DEBUG savePelanggan: Body =', body);

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: body
        });
        
        console.log('🟢 DEBUG savePelanggan: Response diterima.');
        console.log('🟢 DEBUG savePelanggan: Response Status =', response.status);
        console.log('🟢 DEBUG savePelanggan: Response OK =', response.ok);

        const result = await response.json();
        console.log('🟢 DEBUG savePelanggan: Response JSON =', result); // INI PALING PENTING!
        
        if (result.success) {
            console.log('🟢 DEBUG savePelanggan: SUKSES! Menutup modal dan reload data.');
            closeModal();
            await loadPelanggan();
            showNotification('Pelanggan berhasil ditambahkan');
        } else {
            console.log('🔴 DEBUG ERROR: Server mengembalikan error.');
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('🔴 DEBUG ERROR: Terjadi error jaringan atau parsing.', error);
        showNotification('Terjadi kesalahan. Periksa console.', 'error');
    }
}