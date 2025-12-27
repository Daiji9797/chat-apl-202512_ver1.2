<?php
/**
 * 登録 API エンドポイント
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
$name = trim($input['name'] ?? '');

// メールアドレスのバリデーション
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    ApiResponse::error('Invalid email address', 400);
}

// パスワードの長さをチェック
if (strlen($password) < 6) {
    ApiResponse::error('Password must be at least 6 characters', 400);
}

try {
    $userModel = new User();
    
    // メールアドレスが既に存在するか確認
    if ($userModel->emailExists($email)) {
        ApiResponse::error('Email already exists', 400);
    }
    
    // ユーザーを作成
    $userId = $userModel->create($email, $password, $name);
    
    if (!$userId) {
        ApiResponse::error('Failed to create user', 500);
    }
    
    // トークンを生成
    $token = Auth::generateToken($userId);
    
    // ユーザー情報を取得
    $user = $userModel->findById($userId);
    
    ApiResponse::success([
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['name']
        ],
        'token' => $token
    ], 'User registered successfully', 201);
    
} catch (Exception $e) {
    error_log('Registration error: ' . $e->getMessage());
    ApiResponse::error('Internal server error', 500);
}
?>
