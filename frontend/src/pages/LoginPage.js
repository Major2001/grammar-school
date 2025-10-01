import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import { isAuthenticated } from '../utils/auth';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLoginSuccess = (user) => {
    console.log('Login successful:', user);
    navigate('/dashboard');
  };

  const handleRegisterSuccess = (user) => {
    console.log('Registration successful:', user);
    navigate('/dashboard');
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
