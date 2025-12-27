<?php
/**
 * CORS設定
 */

class Cors {
    /**
     * CORSヘッダーを設定
     */
    public static function setHeaders() {
        // 開発環境用のCORS設定
        header('Access-Control-Allow-Origin: http://localhost:5173');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Credentials: true');
        
        // OPTIONSリクエスト（プリフライト）への対応
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }
}
