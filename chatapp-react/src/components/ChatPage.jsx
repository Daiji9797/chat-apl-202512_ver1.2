import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import RoomChat from './RoomChat';
import { useRooms } from '../hooks/useApi';

const ChatPage = () => {
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const { rooms, loadRooms, createRoom, deleteRoom } = useRooms();

  useEffect(() => {
    loadRooms();
  }, []);

  return (
    <div className="chat-container">
      <Sidebar 
        selectedRoomId={selectedRoomId} 
        onRoomSelect={setSelectedRoomId}
        rooms={rooms}
        createRoom={createRoom}
        loadRooms={loadRooms}
      />
      <div className="chat-area">
        <RoomChat 
          roomId={selectedRoomId} 
          onRoomSelect={setSelectedRoomId}
          rooms={rooms}
          deleteRoom={deleteRoom}
        />
      </div>
    </div>
  );
};

export default ChatPage;
