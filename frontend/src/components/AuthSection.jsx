// File: frontend/src/components/AuthSection.jsx
import React, { useState } from 'react';

function AuthSection({ onLogin, onRegister }) {
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (authMode === 'login') {
      const success = await onLogin(email, password);
      if (success) {
        setEmail('');
        setPassword('');
      }
    } else {
      const success = await onRegister(email, password);
      if (success) {
        alert('Registration successful! Please login.');
        setAuthMode('login');
        setEmail('');
        setPassword('');
      }
    }
  };

  return (
    <div className="auth-section">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', flex: 1, alignItems: 'center' }}>
        <div className="form-group" style={{ flex: '1 0 150px' }}>
          <label><i className="far fa-envelope"></i> Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
          />
        </div>
        <div className="form-group" style={{ flex: '1 0 120px' }}>
          <label><i className="fas fa-key"></i> Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          <i className={authMode === 'login' ? 'fas fa-sign-in-alt' : 'fas fa-user-plus'}></i>
          {authMode === 'login' ? 'Login' : 'Register'}
        </button>
        <span className="auth-toggle" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
          {authMode === 'login' ? 'Create account' : 'Back to login'}
        </span>
      </form>
    </div>
  );
}

export default AuthSection;