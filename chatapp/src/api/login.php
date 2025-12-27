<?php
/**
 * ログイン API エンドポイント
 */

require_once '../../config/config.php';
require_once '../../src/utils/Database.php';
require_once '../../src/utils/Auth.php';
require_once '../../src/utils/ApiResponse.php';
require_once '../../src/utils/Cors.php';
require_once '../../src/models/User.php';

// CORS設定
Cors::setHeaders();

// POSTメソッドのみ許可
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ApiResponse::error('Method not allowed', 405);
}

// リクエストボディを取得
$input = json_decode(file_get_contents('php://input'), true);

// バリデーション
if (!isset($input['email']) || !isset($input['password'])) {
    ApiResponse::error('Email and password are required', 400);
}

$email = trim($input['email']);
$password = trim($input['password']);

try {
    $userModel = new User();
    
    // ユーザーを検索
    $user = $userModel->findByEmail($email);
    
    if (!$user) {
        ApiResponse::error('Invalid email or password', 400);
    }
    
    // パスワードを検証
    if (!Auth::verifyPassword($password, $user['password'])) {
        ApiResponse::error('Invalid email or password', 400);
    }
    
    // トークンを生成
    $token = Auth::generateToken($user['id']);
    
    ApiResponse::success([
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['name']
        ],
        'token' => $token
    ], 'Logged in successfully', 200);
    
} catch (Exception $e) {
    error_log('Login error: ' . $e->getMessage());
    ApiResponse::error('Internal server error', 500);
}
?>
