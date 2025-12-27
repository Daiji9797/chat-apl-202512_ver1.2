import React, { useState, useEffect } from 'react';
import MessageList from './MessageList';

const RoomChat = ({ roomId, onRoomSelect, rooms, deleteRoom }) => {
  const [room, setRoom] = useState(null);

  useEffect(() => {
    if (roomId && rooms) {
      const currentRoom = rooms.find((r) => r.id === roomId);
      console.log('RoomChat - roomId:', roomId, 'rooms:', rooms, 'found:', currentRoom);
      setRoom(currentRoom);
    } else {
      setRoom(null);
    }
  }, [roomId, rooms]);

  const handleDeleteRoom = async () => {
    if (!window.confirm('このチャットを削除してもよろしいですか？')) return;

    try {
      await deleteRoom(roomId);
      onRoomSelect(null);
    } catch (err) {
      console.error('Failed to delete room:', err);
    }
  };

  if (!room) {
    return (
      <div className="chat-content">
        <div className="chat-placeholder">
          <p>チャットルームを選択してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-content">
      <div className="room-header">
        <h2>{room.name}</h2>
        <button className="btn btn-sm btn-danger" onClick={handleDeleteRoom}>
          削除
        </button>
      </div>
      <MessageList roomId={roomId} />
    </div>
  );
};

export default RoomChat;
