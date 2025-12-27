<?php
/**
 * データベース初期化スクリプト
 * 最初に実行して、テーブルを作成してください
 */

require_once __DIR__ . '/config/config.php';

$connection = new mysqli(DB_HOST, DB_USER, DB_PASSWORD);

if ($connection->connect_error) {
    die('Connection failed: ' . $connection->connect_error);
}

// データベースを作成
$sql = 'CREATE DATABASE IF NOT EXISTS ' . DB_NAME;
if (!$connection->query($sql)) {
    die('Error creating database: ' . $connection->error);
}

// データベースを選択
if (!$connection->select_db(DB_NAME)) {
    die('Error selecting database: ' . $connection->error);
}

$connection->set_charset('utf8mb4');

// テーブル作成SQL
$tables = [
    // ユーザーテーブル
    'CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
    
    // ルームテーブル
    'CREATE TABLE IF NOT EXISTS rooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
    
    // メッセージテーブル
    'CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id INT NOT NULL,
        text LONGTEXT NOT NULL,
        sender VARCHAR(50) NOT NULL,
        delete_flag TINYINT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
        INDEX idx_room_id (room_id),
        INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
];

// テーブルを作成
foreach ($tables as $sql) {
    if (!$connection->query($sql)) {
        die('Error creating table: ' . $connection->error);
    }
}

$connection->close();

echo "Database initialized successfully!";
?>
