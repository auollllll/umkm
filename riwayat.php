<?php
// Mengizinkan request dari berbagai sumber (CORS)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'config.php';

// Method GET untuk mengambil semua riwayat transaksi
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT p.PenjualanID, p.TanggalPenjualan, p.TotalHarga, p.MetodePembayaran, pl.NamaPelanggan 
            FROM kasir_penjualan p 
            LEFT JOIN kasir_pelanggan pl ON p.PelangganID = pl.PelangganID 
            ORDER BY p.TanggalPenjualan DESC";
    
    $result = $conn->query($sql);

    $riwayat = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $riwayat[] = [
                'penjualanId' => $row['PenjualanID'],
                'tanggalPenjualan' => $row['TanggalPenjualan'],
                'namaPelanggan' => $row['NamaPelanggan'],
                'totalHarga' => (float)$row['TotalHarga'],
                'metodePembayaran' => $row['MetodePembayaran']
            ];
        }
    }
    
    response(true, 'Riwayat transaksi berhasil diambil', $riwayat);
}
?>