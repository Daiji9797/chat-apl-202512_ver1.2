import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ChatPage from './components/ChatPage';
import './App.css';

function AppContent() {
  const { isLoggedIn, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (loading) {
    return <div className="auth-container">読み込み中...</div>;
  }

  if (!isLoggedIn) {
    return showRegister ? (
      <RegisterForm />
    ) : (
      <LoginForm />
    );
  }

  return <ChatPage />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
