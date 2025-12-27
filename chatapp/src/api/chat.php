<?php
/**
 * Chat API エンドポイント
 */

require_once '../../config/config.php';
require_once '../../src/utils/Database.php';
require_once '../../src/utils/Auth.php';
require_once '../../src/utils/ApiResponse.php';
require_once '../../src/utils/Cors.php';
require_once '../../src/models/Room.php';
require_once '../../src/models/Message.php';

// CORS設定
Cors::setHeaders();

// POSTメソッドのみ許可
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ApiResponse::error('Method not allowed', 405);
}

// ユーザーを認証
$userId = Auth::getCurrentUserId();
if (!$userId) {
    ApiResponse::unauthorized('Authentication required');
}

// リクエストボディを取得
$input = json_decode(file_get_contents('php://input'), true);

// バリデーション
if (!isset($input['message']) || !isset($input['roomId'])) {
    ApiResponse::error('Message and roomId are required', 400);
}

$message = trim($input['message']);
$roomId = intval($input['roomId']);
$providedHistory = $input['history'] ?? null;

if (empty($message)) {
    ApiResponse::error('Message cannot be empty', 400);
}

try {
    $roomModel = new Room();
    $messageModel = new Message();
    
    // ルームが存在するか確認
    $room = $roomModel->findById($roomId);
    if (!$room || $room['user_id'] != $userId) {
        ApiResponse::forbidden('You do not have access to this room');
    }
    
    // ユーザーメッセージをDBに保存
    $messageModel->create($roomId, $message, 'user');
    
    // OpenAI API呼び出し
    $aiResponse = callOpenAIAPI($message, $roomId, $providedHistory);
    
    if (!$aiResponse) {
        ApiResponse::error('Failed to get AI response', 500);
    }
    
    // AIレスポンスをDBに保存
    $messageModel->create($roomId, $aiResponse, 'bot');
    
    ApiResponse::success([
        'response' => $aiResponse
    ], 'Message processed successfully', 200);
    
} catch (Exception $e) {
    error_log('Chat error: ' . $e->getMessage());
    ApiResponse::error('Internal server error', 500);
}

/**
 * OpenAI APIを呼び出す
 */
function callOpenAIAPI($message, $roomId, $providedHistory = null) {
    try {
        $apiKey = OPENAI_API_KEY;
        if (empty($apiKey)) {
            error_log('ERROR: OPENAI_API_KEY is not set in .env file');
            throw new Exception('OpenAI API key not configured');
        }
        error_log('OpenAI API call started for room: ' . $roomId);
        
        // 会話履歴を準備
        $messages = [];
        
        // システムプロンプトを追加（回答の多様性と品質を向上）
        $messages[] = [
            'role' => 'system',
            'content' => 'あなたは親切で知識豊富なアシスタントです。ユーザーの質問に対して、常に新しく、思慮深い、かつユニークな回答を提供してください。単調または繰り返しの回答は避けてください。異なる視点や具体的な例を含めるようにしてください。常に相手の状況や背景を考慮し、より有用で詳細な回答を心がけてください。'
        ];
        
        // クライアントから提供された履歴を優先的に使用
        if (is_array($providedHistory) && !empty($providedHistory)) {
            foreach ($providedHistory as $histItem) {
                if (isset($histItem['role']) && isset($histItem['content'])) {
                    $messages[] = [
                        'role' => $histItem['role'],
                        'content' => $histItem['content']
                    ];
                }
            }
        }
        
        // 現在のメッセージを追加
        $messages[] = [
            'role' => 'user',
            'content' => $message
        ];
        
        error_log('OpenAI API messages count: ' . count($messages));
        
        // OpenAI API呼び出し
        $curlHandle = curl_init();
        
        curl_setopt_array($curlHandle, [
            CURLOPT_URL => 'https://api.openai.com/v1/chat/completions',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $apiKey
            ],
            CURLOPT_POSTFIELDS => json_encode([
                'model' => 'gpt-3.5-turbo',
                'messages' => $messages,
                //回答の多様性を向上させるパラメータ
                'temperature' => 0.85,
                //確率分布の最上位90%から選択（より創造的）
                'top_p' => 0.9,
                //繰り返しの単語を抑制
                'frequency_penalty' => 1.0,
                //新しいトピック導入を促進
                'presence_penalty' => 0.5,
                // 最大トークン数（増加させて回答の途中切れを防止）
                'max_tokens' => 2000
            ])
        ]);
        
        $response = curl_exec($curlHandle);
        $httpCode = curl_getinfo($curlHandle, CURLINFO_HTTP_CODE);
        $curlError = curl_error($curlHandle);
        
        curl_close($curlHandle);
        
        error_log('OpenAI API HTTP Code: ' . $httpCode);
        error_log('OpenAI API Response: ' . substr($response, 0, 500));
        
        if ($curlError) {
            error_log('CURL Error: ' . $curlError);
            throw new Exception('Network error: ' . $curlError);
        }
        
        if ($httpCode !== 200) {
            error_log('OpenAI API error (' . $httpCode . '): ' . $response);
            $errorData = json_decode($response, true);
            $errorMessage = $errorData['error']['message'] ?? 'Unknown error';
            throw new Exception('OpenAI API error (HTTP ' . $httpCode . '): ' . $errorMessage);
        }
        
        $responseData = json_decode($response, true);
        
        if (!$responseData) {
            error_log('Failed to decode JSON response: ' . $response);
            throw new Exception('Invalid JSON response from OpenAI API');
        }
        
        if (!isset($responseData['choices'][0]['message']['content'])) {
            error_log('Unexpected API response structure: ' . json_encode($responseData));
            throw new Exception('Invalid response structure from OpenAI API');
        }
        
        return $responseData['choices'][0]['message']['content'];
        
    } catch (Exception $e) {
        $errorMsg = $e->getMessage();
        error_log('OpenAI API call error: ' . $errorMsg);
        return 'エラー: ' . $errorMsg;
    }
}
?>
