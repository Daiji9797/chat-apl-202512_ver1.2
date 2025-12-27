<?php
/**
 * アカウント削除 API エンドポイント
 */

require_once '../../config/config.php';
require_once '../../src/utils/Database.php';
require_once '../../src/utils/Auth.php';
require_once '../../src/utils/ApiResponse.php';
require_once '../../src/utils/Cors.php';
require_once '../../src/models/User.php';

// CORS設定
Cors::setHeaders();

// ユーザー認証
$userId = Auth::getCurrentUserId();
if (!$userId) {
    ApiResponse::unauthorized('Authentication required');
}

$rawInput = file_get_contents('php://input');
$inputData = json_decode($rawInput, true);

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST' && isset($inputData['_method'])) {
    $method = strtoupper($inputData['_method']);
}

if ($method !== 'DELETE') {
    ApiResponse::error('Method not allowed', 405);
}

// パスワード確認（本人確認）
$password = $inputData['password'] ?? '';
if (empty($password)) {
    ApiResponse::error('Password is required for account deletion', 400);
}

try {
    $userModel = new User();
    $user = $userModel->findById($userId);
    
    if (!$user) {
        ApiResponse::notFound('User not found');
    }

    // パスワード確認
    require_once '../../src/utils/Auth.php';
    if (!Auth::verifyPassword($password, $user['password'])) {
        ApiResponse::error('Invalid password', 401);
    }

    // ユーザーを削除（ユーザー削除時は紐付く全てのルームも削除）
    $result = $userModel->delete($userId);
    if (!$result) {
        ApiResponse::error('Failed to delete account', 500);
    }

    ApiResponse::success(null, 'Account deleted successfully');
} catch (Exception $e) {
    error_log('Account deletion error: ' . $e->getMessage());
    ApiResponse::error('Internal server error', 500);
}
?>
