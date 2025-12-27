/**
 * API通信モジュール
 */

const API_BASE_URL = 'http://localhost/chatapp/src/api/';

class APIClient {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  removeToken() {
    localStorage.removeItem('token');
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = API_BASE_URL + endpoint;
    const response = await fetch(url, {
      headers: this.getHeaders(),
      ...options,
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
  }

  // 認証関連
  async register(email, password, name = '') {
    return this.request('register.php', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email, password) {
    return this.request('login.php', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // ルーム関連
  async getRooms(limit = 50, offset = 0) {
    return this.request(`rooms.php?limit=${limit}&offset=${offset}`, {
      method: 'GET',
    });
  }

  async createRoom(name = 'New Chat') {
    return this.request('rooms.php', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async getRoom(roomId) {
    return this.request(`room.php?roomId=${roomId}`, {
      method: 'GET',
    });
  }

  async updateRoom(roomId, data) {
    return this.request(`room.php?roomId=${roomId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRoom(roomId) {
    return this.request(`room.php?roomId=${roomId}`, {
      method: 'POST',
      body: JSON.stringify({ _method: 'DELETE' }),
    });
  }

  // チャット関連
  async sendChat(message, roomId, history = []) {
    return this.request('chat.php', {
      method: 'POST',
      body: JSON.stringify({ message, roomId, history }),
    });
  }

  async deleteMessage(roomId, messageId) {
    return this.request(
      `message.php?roomId=${roomId}&messageId=${messageId}`,
      {
        method: 'POST',
        body: JSON.stringify({ _method: 'DELETE' }),
      }
    );
  }

  // アカウント関連
  async deleteAccount(password) {
    return this.request('user.php', {
      method: 'POST',
      body: JSON.stringify({ _method: 'DELETE', password }),
    });
  }
}

export const api = new APIClient();
