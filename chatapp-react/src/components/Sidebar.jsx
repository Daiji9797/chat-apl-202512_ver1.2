import React from 'react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ selectedRoomId, onRoomSelect, rooms, createRoom, loadRooms }) => {
  const { user, logout, deleteAccount } = useAuth();

  const handleCreateRoom = async () => {
    const name = window.prompt('チャットルーム名を入力してください', 'New Chat');
    if (name && name.trim()) {
      try {
        const newRoom = await createRoom(name);
        onRoomSelect(newRoom.id);
      } catch (err) {
        console.error('Failed to create room:', err);
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        '本当にアカウントを削除しますか？\nこの操作は取り消せません。'
      )
    ) {
      return;
    }

    const password = window.prompt('確認のため、パスワードを入力してください:');
    if (!password) {
      return;
    }

    try {
      await deleteAccount(password);
      alert('アカウントが削除されました。');
    } catch (err) {
      alert('Failed to delete account: ' + err.message);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Chat App</h2>
        <button
          className="btn btn-sm btn-primary"
          onClick={handleCreateRoom}
          style={{ width: '100%' }}
        >
          + 新しいチャット
        </button>
      </div>

      <div className="rooms-list">
        {rooms.map((room) => (
          <div
            key={room.id}
            className={`room-item ${selectedRoomId === room.id ? 'active' : ''}`}
            onClick={() => onRoomSelect(room.id)}
          >
            <div className="room-name">{room.name}</div>
            <div className="room-date">
              {new Date(room.updated_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="user-meta user-meta-footer">
          <div className="user-label">ログイン中</div>
          <div className="user-name" title={user?.email}>
            {user?.name || user?.email || 'Guest'}
          </div>
        </div>
        <button
          className="btn btn-sm btn-danger"
          onClick={handleDeleteAccount}
          style={{ width: '100%' }}
        >
          アカウント削除
        </button>
        <button className="btn btn-logout" onClick={logout}>
          ログアウト
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
