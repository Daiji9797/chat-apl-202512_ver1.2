/**
 * メインアプリケーションロジック
 */

const App = {
    currentRoom: null,
    messageHistory: [],
    
    /**
     * アプリケーションを初期化
     */
    async init() {
        const appContainer = document.getElementById('app');
        
        if (Auth.isLoggedIn()) {
            const user = Auth.getUser();
            const displayName = user?.name || user?.email || '';
            appContainer.innerHTML = UI.showChatPage(displayName);
            await this.loadRooms();
        } else {
            appContainer.innerHTML = UI.showLoginPage();
            this.attachLoginFormListener();
        }
    },
    
    /**
     * ログインフォームリスナーを設定
     */
    attachLoginFormListener() {
        const form = document.getElementById('loginForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                try {
                    const response = await API.login(email, password);
                    Auth.setUser(response.data.user, response.data.token);
                    await this.init();
                } catch (error) {
                    UI.showError(error.message);
                }
            });
        }
    },
    
    /**
     * 登録画面を表示
     */
    showRegisterPage() {
        const appContainer = document.getElementById('app');
        appContainer.innerHTML = UI.showRegisterPage();
        this.attachRegisterFormListener();
    },
    
    /**
     * 登録フォームリスナーを設定
     */
    attachRegisterFormListener() {
        const form = document.getElementById('registerForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const name = document.getElementById('name').value;
                
                try {
                    const response = await API.register(email, password, name);
                    Auth.setUser(response.data.user, response.data.token);
                    await this.init();
                } catch (error) {
                    UI.showError(error.message);
                }
            });
        }
    },
    
    /**
     * ログインページを表示
     */
    showLoginPage() {
        const appContainer = document.getElementById('app');
        appContainer.innerHTML = UI.showLoginPage();
        this.attachLoginFormListener();
    },
    
    /**
     * ルーム一覧を読み込む
     */
    async loadRooms() {
        try {
            const response = await API.getRooms();
            const rooms = response.data;
            
            const roomsList = document.getElementById('roomsList');
            if (roomsList) {
                roomsList.innerHTML = rooms.map(room => `
                    <div class="room-item ${this.currentRoom?.id === room.id ? 'active' : ''}" onclick="App.selectRoom(${room.id})">
                        <div class="room-name">${UI.escapeHtml(room.name)}</div>
                        <div class="room-date">${new Date(room.updated_at).toLocaleDateString()}</div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Failed to load rooms:', error);
        }
    },
    
    /**
     * 新しいルームを作成
     */
    async createNewRoom() {
        try {
            const nameInput = prompt('チャットルーム名を入力してください', 'New Chat');
            const roomName = nameInput && nameInput.trim() !== '' ? nameInput.trim() : 'New Chat';

            const response = await API.createRoom(roomName);
            await this.loadRooms();
            await this.selectRoom(response.data.id);
        } catch (error) {
            UI.showError('Failed to create room: ' + error.message);
        }
    },
    
    /**
     * ルームを選択
     */
    async selectRoom(roomId) {
        try {
            const response = await API.getRoom(roomId);
            const room = response.data.room;
            const messages = response.data.messages;
            
            this.currentRoom = room;
            this.messageHistory = messages;
            
            const chatContent = document.getElementById('chatContent');
            if (chatContent) {
                chatContent.innerHTML = UI.showRoomChat(room);
                this.displayMessages(messages);
                this.attachMessageFormListener();
            }
            
            await this.loadRooms();
        } catch (error) {
            UI.showError('Failed to load room: ' + error.message);
        }
    },
    
    /**
     * メッセージを表示
     */
    displayMessages(messages) {
        const container = document.getElementById('messagesContainer');
        if (container) {
            container.innerHTML = messages.map(msg => UI.showMessage(msg)).join('');
            // スクロール
            container.scrollTop = container.scrollHeight;
        }
    },
    
    /**
     * メッセージフォームリスナーを設定
     */
    attachMessageFormListener() {
        const form = document.getElementById('messageForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.sendMessage(e);
            });
        }
    },
    
    /**
     * メッセージを送信
     */
    async sendMessage(e) {
        e.preventDefault();
        
        if (!this.currentRoom) {
            return;
        }
        
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        
        if (!message) {
            return;
        }
        
        try {
            const container = document.getElementById('messagesContainer');
            
            // ユーザーメッセージを表示（暫定）
            container.innerHTML += UI.showMessage({
                id: 'temp',
                text: message,
                sender: 'user',
                created_at: new Date().toISOString()
            });
            
            messageInput.value = '';
            messageInput.disabled = true;
            
            // ローディング表示
            container.innerHTML += UI.showLoading();
            container.scrollTop = container.scrollHeight;
            
            // メッセージを送信（会話履歴をサーバーに送信）
            const history = this.messageHistory.map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
            }));
            
            const response = await API.sendChat(message, this.currentRoom.id, history);
            
            // ルームを再度読み込む
            await this.selectRoom(this.currentRoom.id);
            messageInput.disabled = false;
            messageInput.focus();
        } catch (error) {
            console.error('Failed to send message:', error);
            UI.showError('Failed to send message: ' + error.message);
            messageInput.disabled = false;
            messageInput.focus();
        }
    },
    
    /**
     * ルームを削除
     */
    async deleteRoom(roomId) {
        if (!confirm('このチャットを削除してもよろしいですか？')) {
            return;
        }
        
        try {
            await API.deleteRoom(roomId);
            if (this.currentRoom?.id === roomId) {
                this.currentRoom = null;
                document.getElementById('chatContent').innerHTML = `
                    <div class="chat-placeholder">
                        <p>チャットルームを選択してください</p>
                    </div>
                `;
            }
            await this.loadRooms();
        } catch (error) {
            UI.showError('Failed to delete room: ' + error.message);
        }
    },

    /**
     * メッセージ削除
     */
    async deleteMessage(messageId) {
        if (!this.currentRoom) return;
        if (!confirm('このメッセージを削除しますか？')) return;

        try {
            await API.deleteMessage(this.currentRoom.id, messageId);
            await this.selectRoom(this.currentRoom.id);
        } catch (error) {
            UI.showError('Failed to delete message: ' + error.message);
        }
    },
    
    /**
     * ログアウト
     */
    logout() {
        if (confirm('ログアウトしてもよろしいですか？')) {
            Auth.logout();
            this.init();
        }
    },

    /**
     * アカウント削除
     */
    async deleteAccount() {
        if (!confirm('本当にアカウントを削除しますか？\nこの操作は取り消せません。')) {
            return;
        }

        const password = prompt('確認のため、パスワードを入力してください:');
        if (!password) {
            return;
        }

        try {
            await API.deleteAccount(password);
            alert('アカウントが削除されました。');
            Auth.logout();
            await this.init();
        } catch (error) {
            UI.showError('Failed to delete account: ' + error.message);
        }
    }
};

// ページロード時に初期化
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
