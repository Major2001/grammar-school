import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const handleLoginSuccess = (user) => {
    // Use window.location.href to force a full page reload
    // This ensures the App component re-renders with updated auth state
    window.location.href = '/dashboard';
  };

  const handleRegisterSuccess = (user) => {
    // Use window.location.href to force a full page reload
    // This ensures the App component re-renders with updated auth state
    window.location.href = '/dashboard';
  };

  return (
    <div>
      {isLogin ? (
        <LoginForm 
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={() => setIsLogin(false)}
        />
      ) : (
        <RegisterForm 
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => setIsLogin(true)}
        />
      )}
    </div>
  );
};

export default LoginPage;
