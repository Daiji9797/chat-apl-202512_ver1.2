<?php
/**
 * アプリケーション設定ファイル
 */

// エラー表示設定
error_reporting(E_ALL);
ini_set('display_errors', 1);

// セッション設定（既に開始されている場合は変更しない）
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.gc_maxlifetime', 3600);
    session_name('chatapp_session');
    session_start();
}

// タイムゾーン設定
date_default_timezone_set('Asia/Tokyo');

// 環境変数の読み込み
$env_file = dirname(__DIR__) . '/.env';
if (file_exists($env_file)) {
    $lines = file($env_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            if (!empty($key)) {
                $_ENV[$key] = $value;
            }
        }
    }
}

// データベース設定
define('DB_HOST', $_ENV['DB_HOST'] ?? 'localhost');
define('DB_USER', $_ENV['DB_USER'] ?? 'root');
define('DB_PASSWORD', $_ENV['DB_PASSWORD'] ?? '');
define('DB_NAME', $_ENV['DB_NAME'] ?? 'chatapp');

// OpenAI API キー
define('OPENAI_API_KEY', $_ENV['OPENAI_API_KEY'] ?? '');

// セッションシークレット
define('SESSION_SECRET', $_ENV['SESSION_SECRET'] ?? 'default_secret_key');

// API基本URL
define('API_BASE_URL', '/api/');

// キャッシュ設定
define('CACHE_ENABLED', true);
define('CACHE_TTL', 3600);
