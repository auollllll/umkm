<?php
// Mengizinkan request dari berbagai sumber (CORS)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'config.php';

// Method POST untuk memproses transaksi baru
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    // Validasi input dasar
    if (!$data || !isset($data['pelangganId']) || !isset($data['totalHarga']) || !isset($data['items']) || empty($data['items'])) {
        response(false, 'Data transaksi tidak lengkap');
    }

    $pelangganId = (int)$data['pelangganId'];
    $totalHarga = (float)$data['totalHarga'];
    $metodePembayaran = $conn->real_escape_string($data['metodePembayaran']);
    $jumlahBayar = isset($data['jumlahBayar']) ? (float)$data['jumlahBayar'] : null;
    $kembalian = isset($data['kembalian']) ? (float)$data['kembalian'] : null;
    $items = $data['items'];

    // Mulai transaksi database
    $conn->begin_transaction();

    try {
        // 1. Insert ke tabel penjualan (header)
        $sql = "INSERT INTO kasir_penjualan (PelangganID, TotalHarga, MetodePembayaran, JumlahBayar, Kembalian) VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("idssd", $pelangganId, $totalHarga, $metodePembayaran, $jumlahBayar, $kembalian);
        
        if (!$stmt->execute()) {
            throw new Exception("Gagal menyimpan header transaksi: " . $stmt->error);
        }

        // Dapatkan ID penjualan yang baru saja dibuat
        $penjualanId = $conn->insert_id;

        // 2. Insert ke tabel detail penjualan dan update stok produk
        foreach ($items as $item) {
            $produkId = (int)$item['produkId'];
            $jumlahProduk = (int)$item['jumlahProduk'];
            $hargaSatuan = (float)$item['hargaSatuan'];
            $subtotal = (float)$item['subtotal'];

            // Insert detail penjualan
            $sql = "INSERT INTO kasir_detailpenjualan (PenjualanID, ProdukID, JumlahProduk, HargaSatuan, Subtotal) VALUES (?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("iiidd", $penjualanId, $produkId, $jumlahProduk, $hargaSatuan, $subtotal);
            
            if (!$stmt->execute()) {
                throw new Exception("Gagal menyimpan detail transaksi: " . $stmt->error);
            }

            // Update stok produk
            $sql = "UPDATE kasir_produk SET Stok = Stok - ? WHERE ProdukID = ? AND Stok >= ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("iii", $jumlahProduk, $produkId, $jumlahProduk);
            
            if (!$stmt->execute()) {
                throw new Exception("Gagal mengupdate stok: " . $stmt->error);
            }

            // Cek apakah stok benar-benar berkurang (jika affected_rows = 0, berarti stok tidak cukup)
            if ($stmt->affected_rows === 0) {
                throw new Exception("Stok tidak mencukupi untuk produk ID: $produkId");
            }
        }

        // Jika semua berhasil, commit transaksi
        $conn->commit();
        response(true, 'Transaksi berhasil diproses', ['penjualanId' => $penjualanId]);

    } catch (Exception $e) {
        // Jika ada error, rollback semua perubahan
        $conn->rollback();
        response(false, 'Gagal memproses transaksi: ' . $e->getMessage());
    }
}

// Method GET untuk mengambil detail transaksi berdasarkan ID
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['id'])) {
        $penjualanId = (int)$_GET['id'];

        // Ambil data penjualan (header)
        $sql = "SELECT p.*, pl.NamaPelanggan FROM kasir_penjualan p 
                LEFT JOIN kasir_pelanggan pl ON p.PelangganID = pl.PelangganID 
                WHERE p.PenjualanID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $penjualanId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            response(false, 'Transaksi tidak ditemukan');
        }

        $penjualan = $result->fetch_assoc();

        // Ambil detail penjualan (items)
        $sql = "SELECT dp.*, pr.NamaProduk FROM kasir_detailpenjualan dp 
                JOIN kasir_produk pr ON dp.ProdukID = pr.ProdukID 
                WHERE dp.PenjualanID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $penjualanId);
        $stmt->execute();
        $result = $stmt->get_result();

        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = [
                'produkId' => $row['ProdukID'],
                'namaProduk' => $row['NamaProduk'],
                'jumlahProduk' => $row['JumlahProduk'],
                'hargaSatuan' => (float)$row['HargaSatuan'],
                'subtotal' => (float)$row['Subtotal']
            ];
        }

        $transaksi = [
            'penjualanId' => $penjualan['PenjualanID'],
            'tanggalPenjualan' => $penjualan['TanggalPenjualan'],
            'namaPelanggan' => $penjualan['NamaPelanggan'],
            'totalHarga' => (float)$penjualan['TotalHarga'],
            'metodePembayaran' => $penjualan['MetodePembayaran'],
            'jumlahBayar' => (float)$penjualan['JumlahBayar'],
            'kembalian' => (float)$penjualan['Kembalian'],
            'items' => $items
        ];

        response(true, 'Detail transaksi berhasil diambil', $transaksi);
    }
}
?>