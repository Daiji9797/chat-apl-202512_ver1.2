# Chat Application with React & PHP

React + Vite でビルドされたフロントエンドと PHP バックエンドで構成されたチャットアプリケーションです。

## 機能

- ユーザー認証（登録・ログイン）
- チャットルームの作成・管理
- OpenAI API を使用した AI チャット
- リアルタイムメッセージ送受信
- メッセージ削除機能

## 必要な環境

- PHP 7.4 以上
- MySQL 5.7 以上
- XAMPP（Apache + PHP + MySQL）
- Node.js 18 以上
- OpenAI API キー

## インストール手順

### 1. ファイルをXAMPPのhtdocsディレクトリにコピー

```bash
C:\xampp\htdocs\chatapp        # バックエンド（PHP API）
C:\xampp\htdocs\chatapp-react  # フロントエンド（React）
```

### 2. バックエンドの環境設定

`chatapp` ディレクトリで `.env.example` を `.env` にコピーして編集：

```bash
cd C:\xampp\htdocs\chatapp
cp .env.example .env
```

`.env` ファイルを編集：

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=chatapp

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Session Configuration
SESSION_SECRET=your_session_secret_here
```

### 3. データベースを初期化

ブラウザで以下のURLにアクセス：

```
http://localhost/chatapp/init_db.php
```

または、ターミナルから：

```bash
cd C:\xampp\htdocs\chatapp
php init_db.php
```

### 4. フロントエンドのセットアップ

```bash
cd C:\xampp\htdocs\chatapp-react
npm install
npm run build
```

### 5. アプリケーションにアクセス

ブラウザで以下のURLにアクセス：

```
http://localhost/chatapp-react/dist/
```

## 開発環境

### フロントエンドの開発サーバー起動

```bash
cd C:\xampp\htdocs\chatapp-react
npm run dev
```

開発サーバーが起動したら `http://localhost:5173` にアクセス

### ホットリロード付きビルド＆デプロイ

```bash
npm run watch
```

ファイル変更を自動検知して `dist` ディレクトリにビルド

### 本番ビルド

```bash
npm run build
```

最適化されたファイルが `dist` ディレクトリに出力されます

## APIエンドポイント

### 認証

- `POST /api/register.php` - ユーザー登録
- `POST /api/login.php` - ログイン

### ルーム管理

- `GET /api/rooms.php` - ルーム一覧取得
- `POST /api/rooms.php` - ルーム作成
- `GET /api/room.php?roomId=<id>` - ルーム詳細取得
- `PUT /api/room.php?roomId=<id>` - ルーム更新
- `DELETE /api/room.php?roomId=<id>` - ルーム削除

### チャット

- `POST /api/chat.php` - メッセージ送信（OpenAI API呼び出し）

## リクエスト/レスポンス例

### ログイン

```bash
curl -X POST http://localhost/chatapp/src/api/login.php \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

レスポンス:

```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "User Name"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### チャット送信

```bash
curl -X POST http://localhost/chatapp/src/api/chat.php \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "message": "こんにちは",
    "roomId": 1,
    "history": [
      {"role": "user", "content": "こんにちは"},
      {"role": "assistant", "content": "こんにちは！お手伝いします。"}
    ]
  }'
```

## ディレクトリ構造

### バックエンド（chatapp）

```
chatapp/
├── config/
│   └── config.php              # アプリケーション設定
├── src/
│   ├── api/
│   │   ├── register.php        # ユーザー登録API
│   │   ├── login.php           # ログインAPI
│   │   ├── chat.php            # チャットAPI
│   │   ├── rooms.php           # ルーム一覧API
│   │   └── room.php            # ルーム詳細API
│   ├── models/
│   │   ├── User.php            # ユーザーモデル
│   │   ├── Room.php            # ルームモデル
│   │   └── Message.php         # メッセージモデル
│   └── utils/
│       ├── Database.php        # DB接続クラス
│       ├── Auth.php            # 認証ユーティリティ
│       └── ApiResponse.php     # APIレスポンス
├── .env.example                # 環境設定例
├── .env                        # 環境設定（.gitignore対象）
├── init_db.php                 # DB初期化スクリプト
└── README.md                   # このファイル
```

### フロントエンド（chatapp-react）

```
chatapp-react/
├── src/
│   ├── components/             # Reactコンポーネント
│   │   ├── Auth/               # 認証関連コンポーネント
│   │   ├── Chat/               # チャット画面コンポーネント
│   │   └── Room/               # ルーム管理コンポーネント
│   ├── context/                # Reactコンテキスト
│   │   └── AuthContext.jsx    # 認証状態管理
│   ├── hooks/                  # カスタムフック
│   ├── services/               # API通信サービス
│   │   └── api.js              # APIクライアント
│   ├── App.jsx                 # メインアプリケーション
│   ├── App.css                 # スタイルシート
│   └── main.jsx                # エントリーポイント
├── dist/                       # ビルド出力先
├── scripts/                    # ビルドスクリプト
├── index.html                  # HTMLテンプレート
├── vite.config.js              # Vite設定
├── package.json                # Node.js依存関係
└── package-lock.json
```

## データベーススキーマ

### users テーブル

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### rooms テーブル

```sql
CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### messages テーブル

```sql
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    text LONGTEXT NOT NULL,
    sender VARCHAR(50) NOT NULL,
    delete_flag TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);
```

## トラブルシューティング

### データベースに接続できない

- MySQL が起動しているか確認
- `.env` ファイルのDB設定を確認
- XAMPP のコントロールパネルで MySQL を起動

### OpenAI API エラー

- `.env` ファイルに正しい API キーを設定
- OpenAI アカウントが有効か確認
- API の使用限度に達していないか確認

### PHP エラー

- PHP 7.4 以上を使用しているか確認
- `php.ini` で `allow_url_fopen = On` に設定
- error_log を確認

### フロントエンドのビルドエラー

- Node.js 18 以上がインストールされているか確認
- `npm install` を実行して依存関係をインストール
- `node_modules` を削除して再度 `npm install` を実行

### CORS エラー

- Apache の設定で CORS ヘッダーが適切に設定されているか確認
- ブラウザの開発者ツールでネットワークタブを確認

## 技術スタック

### フロントエンド
- React 18
- Vite 5（ビルドツール）
- CSS Modules / CSS-in-JS

### バックエンド
- PHP 7.4+
- MySQL 5.7+
- OpenAI API

## セキュリティに関する注意

このアプリケーションは学習目的で作成されています。本番環境での使用時は以下の対策をしてください：

- HTTPS を使用
- パスワードを強力に
- CSRF トークンの実装
- SQL インジェクション対策（プリペアドステートメント使用済み）
- XSS 対策（HTMLエスケープ実装済み）
- レート制限の実装
- 入力値の厳密なバリデーション

## ライセンス

MIT License

## 参考資料

- [React 公式ドキュメント](https://react.dev/)
- [Vite 公式ドキュメント](https://vitejs.dev/)
- [PHP 公式ドキュメント](https://www.php.net/manual/)
- [OpenAI API ドキュメント](https://platform.openai.com/docs/)
- [XAMPP](https://www.apachefriends.org/)
