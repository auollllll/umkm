<?php
// Mengizinkan request dari berbagai sumber (CORS)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'config.php';

// Memulai session
session_start();

// Method POST untuk Login
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || !isset($data['username']) || !isset($data['password'])) {
        response(false, 'Username dan password wajib diisi.');
    }

    $username = $conn->real_escape_string($data['username']);
    $password = $data['password'];

    $sql = "SELECT KasirID, Username, Password, NamaKasir FROM kasir_kasir WHERE Username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $kasir = $result->fetch_assoc();
        
        // Verifikasi password
        if (password_verify($password, $kasir['Password'])) {
            // Password benar, buat session
            $_SESSION['kasir_logged_in'] = true;
            $_SESSION['kasir_id'] = $kasir['KasirID'];
            $_SESSION['kasir_nama'] = $kasir['NamaKasir'];

            // Regenerasi ID session untuk keamanan
            session_regenerate_id(true);
            
            response(true, 'Login berhasil!', [
                'id' => $kasir['KasirID'],
                'nama' => $kasir['NamaKasir']
            ]);
        } else {
            response(false, 'Username atau password salah.');
        }
    } else {
        response(false, 'Username atau password salah.');
    }
}

// Method GET untuk Cek Status Login
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_SESSION['kasir_logged_in']) && $_SESSION['kasir_logged_in'] === true) {
        response(true, 'User sudah login.', [
            'id' => $_SESSION['kasir_id'],
            'nama' => $_SESSION['kasir_nama']
        ]);
    } else {
        response(false, 'User belum login.');
    }
}
// ... (kode lain di auth.php tetap sama) ...

// Method POST untuk Logout (dengan parameter aksi)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'logout') {
    error_log("LOGOUT: Permintaan logout diterima."); // Tambahkan log di server
    
    // Hancurkan semua data session
    session_unset();
    session_destroy();
    
    error_log("LOGOUT: Session telah dihancurkan."); // Tambahkan log di server
    
    response(true, 'Logout berhasil.');
}
?>