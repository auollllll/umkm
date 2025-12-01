<?php
// Konfigurasi Database
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'db_kasir_umkm');

// Buat koneksi
 $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Cek koneksi
if ($conn->connect_error) {
    response(false, "Koneksi gagal: " . $conn->connect_error);
}

// Set charset ke utf8mb4
 $conn->set_charset("utf8mb4");

// Fungsi untuk response JSON
function response($status, $message, $data = null) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $status,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}
?>