import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useApi';

const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
};

const MessageList = ({ roomId }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { getRoom, sendMessage, deleteMessage } = useChat();
  const messagesEndRef = useRef(null);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const result = await getRoom(roomId);
      console.log('Loaded messages:', result.data.messages);
      setMessages(result.data.messages || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      loadMessages();
    }
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    try {
      const history = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      await sendMessage(messageText, roomId, history);
      await loadMessages();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('このメッセージを削除しますか？')) return;

    try {
      await deleteMessage(roomId, messageId);
      await loadMessages();
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  if (loading) {
    return <div className="messages-container">読み込み中...</div>;
  }

  if (!roomId) {
    return <div className="messages-container">ルームが選択されていません</div>;
  }

  return (
    <>
      <div className="messages-container">
        {messages.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
            まだメッセージがありません
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}
            >
              <div className="message-content-row">
                <div 
                  className="message-content"
                  dangerouslySetInnerHTML={{ 
                    __html: escapeHtml(msg.text).replace(/\n/g, '<br>') 
                  }}
                />
                <button
                  className="msg-delete-btn"
                  onClick={() => handleDeleteMessage(msg.id)}
                  title="削除"
                >
                  ×
                </button>
              </div>
              <div className="message-time">
                {new Date(msg.created_at).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="message-input-area">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.target.elements.messageInput;
            handleSendMessage(input.value);
            input.value = '';
            input.focus();
          }}
          id="messageForm"
        >
          <input
            type="text"
            id="messageInput"
            placeholder="メッセージを入力..."
            required
          />
          <button type="submit" className="btn btn-primary">
            送信
          </button>
        </form>
      </div>
    </>
  );
};

export default MessageList;
