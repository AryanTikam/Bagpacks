import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import '../styles/LoginForm.css';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        {isLogin ? (
          <LoginForm switchToRegister={() => setIsLogin(false)} />
        ) : (
          <RegisterForm switchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
};

export default LoginPage;