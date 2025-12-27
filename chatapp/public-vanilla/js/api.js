/**
 * API通信モジュール
 */

const API = {
    // API は /chatapp/src/api/ 配下に配置
    baseURL: '/chatapp/src/api/',
    
    /**
     * トークンを保存
     */
    setToken(token) {
        localStorage.setItem('token', token);
    },
    
    /**
     * トークンを取得
     */
    getToken() {
        return localStorage.getItem('token');
    },
    
    /**
     * トークンを削除
     */
    removeToken() {
        localStorage.removeItem('token');
    },
    
    /**
     * ヘッダーを取得
     */
    getHeaders() {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        }
        
        return headers;
    },
    
    /**
     * リクエストを送信
     */
    async request(endpoint, options = {}) {
        const url = this.baseURL + endpoint;
        const response = await fetch(url, {
            headers: this.getHeaders(),
            ...options
        });

        const rawText = await response.text();
        let data;
        try {
            data = rawText ? JSON.parse(rawText) : {};
        } catch (err) {
            console.error('API response is not JSON:', rawText);
            throw new Error('サーバー応答の解析に失敗しました');
        }

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    },
    
    /**
     * ユーザー登録
     */
    async register(email, password, name = '') {
        return this.request('register.php', {
            method: 'POST',
            body: JSON.stringify({ email, password, name })
        });
    },
    
    /**
     * ログイン
     */
    async login(email, password) {
        return this.request('login.php', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },
    
    /**
     * ルーム一覧を取得
     */
    async getRooms(limit = 50, offset = 0) {
        return this.request(`rooms.php?limit=${limit}&offset=${offset}`, {
            method: 'GET'
        });
    },
    
    /**
     * ルームを作成
     */
    async createRoom(name = 'New Chat') {
        return this.request('rooms.php', {
            method: 'POST',
            body: JSON.stringify({ name })
        });
    },
    
    /**
     * ルーム詳細を取得
     */
    async getRoom(roomId) {
        return this.request(`room.php?roomId=${roomId}`, {
            method: 'GET'
        });
    },
    
    /**
     * ルームを更新
     */
    async updateRoom(roomId, data) {
        return this.request(`room.php?roomId=${roomId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    /**
     * ルームを削除
     */
    async deleteRoom(roomId) {
        // DELETE がブロックされる環境向けに POST + _method=DELETE を使用
        return this.request(`room.php?roomId=${roomId}`, {
            method: 'POST',
            body: JSON.stringify({ _method: 'DELETE' })
        });
    },
    
    /**
     * チャットメッセージを送信
     */
    async sendChat(message, roomId, history = []) {
        return this.request('chat.php', {
            method: 'POST',
            body: JSON.stringify({ message, roomId, history })
        });
    },

    /**
     * メッセージを削除
     */
    async deleteMessage(roomId, messageId) {
        // DELETE が制限される環境向けに POST + _method
        return this.request(`message.php?roomId=${roomId}&messageId=${messageId}`, {
            method: 'POST',
            body: JSON.stringify({ _method: 'DELETE' })
        });
    },

    /**
     * アカウントを削除
     */
    async deleteAccount(password) {
        // DELETE が制限される環境向けに POST + _method
        return this.request('user.php', {
            method: 'POST',
            body: JSON.stringify({ _method: 'DELETE', password })
        });
    }
};
