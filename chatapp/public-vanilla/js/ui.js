/**
 * UI コンポーネント管理モジュール
 */

const UI = {
    /**
     * ログイン画面を表示
     */
    showLoginPage(onSubmit) {
        const template = document.getElementById('loginPageTemplate');
        return template.innerHTML;
    },
    
    /**
     * 登録画面を表示
     */
    showRegisterPage(onSubmit) {
        const template = document.getElementById('registerPageTemplate');
        return template.innerHTML;
    },
    
    /**
     * メインチャット画面を表示
     */
    showChatPage(userLabel = '') {
        const template = document.getElementById('chatPageTemplate');
        const clonedTemplate = template.cloneNode(true);
        const userNameDisplay = clonedTemplate.content.querySelector('#userNameDisplay');
        if (userNameDisplay) {
            userNameDisplay.textContent = this.escapeHtml(userLabel || 'Guest');
            userNameDisplay.title = this.escapeHtml(userLabel || 'Guest');
        }
        return clonedTemplate.innerHTML;
    },
    
    /**
     * ルーム選択時の表示
     */
    showRoomChat(room) {
        const template = document.getElementById('roomChatTemplate');
        const clonedTemplate = template.cloneNode(true);
        const roomTitle = clonedTemplate.content.querySelector('#roomTitle');
        if (roomTitle) {
            roomTitle.textContent = this.escapeHtml(room.name);
        }
        const deleteBtn = clonedTemplate.content.querySelector('.btn-danger');
        if (deleteBtn) {
            deleteBtn.onclick = () => App.deleteRoom(room.id);
        }
        return clonedTemplate.innerHTML;
    },
    
    /**
     * メッセージを表示
     */
    showMessage(message) {
        const template = document.getElementById('messageTemplate');
        const clonedTemplate = template.cloneNode(true);
        const messageEl = clonedTemplate.content.querySelector('.message');
        const isBotMessage = message.sender === 'bot';
        
        if (messageEl) {
            messageEl.setAttribute('data-id', message.id);
            if (isBotMessage) {
                messageEl.classList.remove('user-message');
                messageEl.classList.add('bot-message');
            }
        }
        
        const messageContent = clonedTemplate.content.querySelector('.message-content');
        if (messageContent) {
            const textWithLineBreaks = this.escapeHtml(message.text).replace(/\n/g, '<br>');
            messageContent.innerHTML = textWithLineBreaks;
        }
        
        const deleteBtn = clonedTemplate.content.querySelector('.msg-delete-btn');
        if (deleteBtn) {
            deleteBtn.onclick = () => App.deleteMessage(message.id);
        }
        
        const messageTime = clonedTemplate.content.querySelector('.message-time');
        if (messageTime) {
            messageTime.textContent = new Date(message.created_at).toLocaleTimeString();
        }
        
        return clonedTemplate.innerHTML;
    },
    
    /**
     * HTML エスケープ
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    },
    
    /**
     * ローディング表示
     */
    showLoading() {
        return '<div class="loading"><span class="spinner"></span> 読み込み中...</div>';
    },
    
    /**
     * エラーメッセージを表示
     */
    showError(message) {
        const errorEl = document.getElementById('errorMessage');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    }
};
