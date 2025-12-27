import { useState, useCallback } from 'react';
import { api } from '../services/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (fn) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, request };
};

export const useRooms = () => {
  const [rooms, setRooms] = useState([]);
  const { loading, error, request } = useApi();

  const loadRooms = useCallback(async () => {
    const result = await request(() => api.getRooms());
    setRooms(result.data || []);
    return result.data;
  }, [request]);

  const createRoom = useCallback(
    async (name) => {
      const result = await request(() => api.createRoom(name));
      setRooms((prev) => [result.data, ...prev]);
      return result.data;
    },
    [request]
  );

  const deleteRoom = useCallback(
    async (roomId) => {
      await request(() => api.deleteRoom(roomId));
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
    },
    [request]
  );

  return { rooms, loading, error, loadRooms, createRoom, deleteRoom };
};

export const useChat = () => {
  const { loading, error, request } = useApi();

  const getRoom = useCallback(
    (roomId) => request(() => api.getRoom(roomId)),
    [request]
  );

  const sendMessage = useCallback(
    (message, roomId, history) =>
      request(() => api.sendChat(message, roomId, history)),
    [request]
  );

  const deleteMessage = useCallback(
    (roomId, messageId) =>
      request(() => api.deleteMessage(roomId, messageId)),
    [request]
  );

  return { loading, error, getRoom, sendMessage, deleteMessage };
};
