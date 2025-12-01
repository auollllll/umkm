<?php
// Mengizinkan request dari berbagai sumber (CORS)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'config.php';

// Method GET untuk mengambil semua pelanggan
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT PelangganID, NamaPelanggan, Alamat, NomorTelepon FROM kasir_pelanggan ORDER BY NamaPelanggan";
    $result = $conn->query($sql);
    
    $pelanggan = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $pelanggan[] = [
                'id' => (int)$row['PelangganID'],
                'nama' => $row['NamaPelanggan'],
                'alamat' => $row['Alamat'],
                'telepon' => $row['NomorTelepon']
            ];
        }
    }
    
    response(true, 'Pelanggan berhasil diambil', $pelanggan);
}

// Method POST untuk menambah pelanggan baru
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validasi input
    if (!$data || empty($data['nama']) || empty($data['alamat']) || empty($data['telepon'])) {
        response(false, 'Data pelanggan tidak lengkap. Nama, alamat, dan telepon wajib diisi.');
    }
    
    $nama = $conn->real_escape_string(trim($data['nama']));
    $alamat = $conn->real_escape_string(trim($data['alamat']));
    $telepon = $conn->real_escape_string(trim($data['telepon']));
    
    $sql = "INSERT INTO kasir_pelanggan (NamaPelanggan, Alamat, NomorTelepon) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    
    if ($stmt) {
        $stmt->bind_param("sss", $nama, $alamat, $telepon);
        if ($stmt->execute()) {
            response(true, 'Pelanggan berhasil ditambahkan');
        } else {
            response(false, 'Gagal menambahkan pelanggan: ' . $stmt->error);
        }
        $stmt->close();
    } else {
        response(false, 'Gagal mempersiapkan query: ' . $conn->error);
    }
}

// Method PUT untuk mengupdate pelanggan
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validasi input
    if (!$data || empty($data['id']) || empty($data['nama']) || empty($data['alamat']) || empty($data['telepon'])) {
        response(false, 'Data tidak lengkap untuk update.');
    }
    
    $id = (int)$data['id'];
    $nama = $conn->real_escape_string(trim($data['nama']));
    $alamat = $conn->real_escape_string(trim($data['alamat']));
    $telepon = $conn->real_escape_string(trim($data['telepon']));
    
    $sql = "UPDATE kasir_pelanggan SET NamaPelanggan = ?, Alamat = ?, NomorTelepon = ? WHERE PelangganID = ?";
    $stmt = $conn->prepare($sql);
    
    if ($stmt) {
        $stmt->bind_param("sssi", $nama, $alamat, $telepon, $id);
        if ($stmt->execute()) {
            response(true, 'Pelanggan berhasil diperbarui');
        } else {
            response(false, 'Gagal memperbarui pelanggan: ' . $stmt->error);
        }
        $stmt->close();
    } else {
        response(false, 'Gagal mempersiapkan query: ' . $conn->error);
    }
}

// Method DELETE untuk menghapus pelanggan
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || empty($data['id'])) {
        response(false, 'ID tidak valid untuk dihapus.');
    }
    
    $id = (int)$data['id'];
    
    // Cek apakah pelanggan memiliki transaksi
    $checkSql = "SELECT COUNT(*) as count FROM kasir_penjualan WHERE PelangganID = ?";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("i", $id);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    $count = $checkResult->fetch_assoc()['count'];
    $checkStmt->close();
    
    if ($count > 0) {
        response(false, 'Pelanggan tidak dapat dihapus karena memiliki riwayat transaksi.');
    }
    
    $sql = "DELETE FROM kasir_pelanggan WHERE PelangganID = ?";
    $stmt = $conn->prepare($sql);
    
    if ($stmt) {
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            response(true, 'Pelanggan berhasil dihapus');
        } else {
            response(false, 'Gagal menghapus pelanggan: ' . $stmt->error);
        }
        $stmt->close();
    } else {
        response(false, 'Gagal mempersiapkan query: ' . $conn->error);
    }
}
?>