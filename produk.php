<?php
// Mengizinkan request dari berbagai sumber (CORS)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'config.php';

// Method GET untuk mengambil semua produk
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT * FROM kasir_produk ORDER BY NamaProduk";
    $result = $conn->query($sql);
    
    $produk = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $produk[] = [
                'id' => $row['ProdukID'],
                'nama' => $row['NamaProduk'],
                'harga' => (float)$row['Harga'],
                'stok' => (int)$row['Stok'],
                'keterangan' => $row['Keterangan']
            ];
        }
    }
    
    response(true, 'Produk berhasil diambil', $produk);
}

// Method POST untuk menambah produk baru
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || !isset($data['nama']) || !isset($data['harga']) || !isset($data['stok'])) {
        response(false, 'Data produk tidak lengkap');
    }
    
    $nama = $conn->real_escape_string($data['nama']);
    $harga = (float)$data['harga'];
    $stok = (int)$data['stok'];
    $keterangan = $conn->real_escape_string($data['keterangan'] ?? '');
    
    $sql = "INSERT INTO kasir_produk (NamaProduk, Harga, Stok, Keterangan) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sdis", $nama, $harga, $stok, $keterangan);
    
    if ($stmt->execute()) {
        response(true, 'Produk berhasil ditambahkan');
    } else {
        response(false, 'Gagal menambahkan produk: ' . $stmt->error);
    }
}

// Method PUT untuk mengupdate produk
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || !isset($data['id']) || !isset($data['action'])) {
        response(false, 'Data tidak valid');
    }

    $id = (int)$data['id'];
    $action = $data['action'];
    
    if ($action === 'tambah_stok') {
        if (!isset($data['jumlah'])) response(false, 'Jumlah stok tidak valid');
        
        $jumlah = (int)$data['jumlah'];
        $sql = "UPDATE kasir_produk SET Stok = Stok + ? WHERE ProdukID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", $jumlah, $id);
        
        if ($stmt->execute()) {
            response(true, 'Stok berhasil ditambahkan');
        } else {
            response(false, 'Gagal menambah stok: ' . $stmt->error);
        }
    } else if ($action === 'edit') {
        if (!isset($data['nama']) || !isset($data['harga']) || !isset($data['stok'])) {
            response(false, 'Data produk tidak lengkap');
        }
        
        $nama = $conn->real_escape_string($data['nama']);
        $harga = (float)$data['harga'];
        $stok = (int)$data['stok'];
        $keterangan = $conn->real_escape_string($data['keterangan'] ?? '');
        
        $sql = "UPDATE kasir_produk SET NamaProduk = ?, Harga = ?, Stok = ?, Keterangan = ? WHERE ProdukID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sdisi", $nama, $harga, $stok, $keterangan, $id);
        
        if ($stmt->execute()) {
            response(true, 'Produk berhasil diperbarui');
        } else {
            response(false, 'Gagal memperbarui produk: ' . $stmt->error);
        }
    } else {
        response(false, 'Aksi tidak valid');
    }
}

// Method DELETE untuk menghapus produk
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || !isset($data['id'])) {
        response(false, 'ID produk tidak valid');
    }
    
    $id = (int)$data['id'];
    
    // === PERBAIKAN UTAMA ===
    // Cek apakah produk ada di dalam riwayat transaksi
    $checkSql = "SELECT COUNT(*) as count FROM kasir_detailpenjualan WHERE ProdukID = ?";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("i", $id);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    $count = $checkResult->fetch_assoc()['count'];
    
    if ($count > 0) {
        response(false, 'Produk tidak dapat dihapus karena sudah ada dalam riwayat transaksi.');
    }
    
    // Jika aman, hapus produk
    $sql = "DELETE FROM kasir_produk WHERE ProdukID = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        response(true, 'Produk berhasil dihapus');
    } else {
        response(false, 'Gagal menghapus produk: ' . $stmt->error);
    }
}
?>