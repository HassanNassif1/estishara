import React, { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';

const LoginPage = ({ onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        const success = await onLogin(email, password);
        if (success) {
          if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
          } else {
            localStorage.removeItem('rememberedEmail');
          }
        }
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        const success = await onRegister(email, password);
        if (success) {
          setSuccessMessage('Registration successful! Please login.');
          setIsLogin(true);
          setPassword('');
          setConfirmPassword('');
        }
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccessMessage('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className={`${isDarkMode ? 'dark' : 'light'}`}>
      {/* Animated Background */}
      <div className="login-bg-animated">
        <div className="login-bg-shape shape-1"></div>
        <div className="login-bg-shape shape-2"></div>
        <div className="login-bg-shape shape-3"></div>
        <div className="login-bg-shape shape-4"></div>
      </div>

      {/* Dark Mode Toggle */}
      <button 
        className="login-theme-toggle" 
        onClick={toggleTheme}
        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
        <span className="login-theme-tooltip">
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </span>
      </button>

      <div className="login-container">
        {/* Left side - Brand Section */}
        <div className="login-brand-section">
          <div className="login-brand-glow"></div>
          <div className="login-brand-content">
            <div className="login-brand-icon">
              <i className="fas fa-passport"></i>
              <div className="login-brand-icon-ring"></div>
            </div>
            <h1 className="login-brand-title">
              Estishara <span>· visa</span>
            </h1>
            <p className="login-brand-description">
              Your trusted partner for Spain visa consultation and appointment management.
            </p>
            
            <div className="login-features">
              <div className="login-feature">
                <div className="login-feature-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div>
                  <h4>Easy Booking</h4>
                  <p>Schedule your visa appointments in minutes</p>
                </div>
              </div>
              <div className="login-feature">
                <div className="login-feature-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <div>
                  <h4>Real-time Updates</h4>
                  <p>Track your appointment status instantly</p>
                </div>
              </div>
              <div className="login-feature">
                <div className="login-feature-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <div>
                  <h4>Secure & Safe</h4>
                  <p>Your data is protected with enterprise-grade security</p>
                </div>
              </div>
            </div>

            <div className="login-testimonial">
              <div className="login-testimonial-avatars">
                <div className="login-avatar" style={{ background: '#4f46e5' }}>JD</div>
                <div className="login-avatar" style={{ background: '#7c3aed' }}>SM</div>
                <div className="login-avatar" style={{ background: '#0891b2' }}>AK</div>
                <div className="login-avatar login-avatar-more">+</div>
              </div>
              <p className="login-testimonial-text">
                "Estishara made my visa application process seamless. Highly recommended!"
              </p>
              <div className="login-testimonial-author">
                <span>— John Doe</span>
                <div className="login-stars">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login/Register Form */}
        <div className="login-form-section">
          <div className="login-form-card">
            <div className="login-form-header">
              <div className="login-form-welcome">
                <span className="login-form-welcome-text">Welcome back</span>
                <h2>{isLogin ? 'Sign In' : 'Create Account'}</h2>
                <p>{isLogin ? 'Login to manage your visa appointments' : 'Register to get started with Estishara'}</p>
              </div>
            </div>

            {/* Toggle tabs */}
            <div className="login-tabs">
              <button
                className={`login-tab ${isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(true)}
              >
                <i className="fas fa-sign-in-alt"></i>
                Sign In
              </button>
              <button
                className={`login-tab ${!isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(false)}
              >
                <i className="fas fa-user-plus"></i>
                Register
              </button>
            </div>

            {error && (
              <div className="login-error">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            {successMessage && (
              <div className="login-success">
                <i className="fas fa-check-circle"></i>
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-form-group">
                <label htmlFor="email">
                  <i className="fas fa-envelope"></i>
                  Email Address
                </label>
                <div className="login-input-wrapper">
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="login-input"
                  />
                  <span className="login-input-icon">
                    <i className="fas fa-envelope"></i>
                  </span>
                </div>
              </div>

              <div className="login-form-group">
                <label htmlFor="password">
                  <i className="fas fa-lock"></i>
                  Password
                </label>
                <div className="login-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    minLength={6}
                    className="login-input"
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {isLogin && (
                  <div className="login-forgot-password">
                    <a href="#">Forgot password?</a>
                  </div>
                )}
              </div>

              {!isLogin && (
                <div className="login-form-group">
                  <label htmlFor="confirmPassword">
                    <i className="fas fa-check-circle"></i>
                    Confirm Password
                  </label>
                  <div className="login-input-wrapper">
                    <input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      minLength={6}
                      className="login-input"
                    />
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="login-remember">
                  <label className="login-checkbox">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="login-checkbox-custom"></span>
                    Remember me
                  </label>
                </div>
              )}

              <button
                type="submit"
                className="login-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="login-spinner"></span>
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <i className="fas fa-arrow-right"></i>
                  </>
                )}
              </button>

              <div className="login-divider">
                <span>or continue with</span>
              </div>

              <div className="login-social">
                <button type="button" className="login-social-btn google">
                  <i className="fab fa-google"></i>
                  Google
                </button>
                <button type="button" className="login-social-btn github">
                  <i className="fab fa-github"></i>
                  GitHub
                </button>
              </div>
            </form>

            <div className="login-footer">
              <p>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button onClick={toggleMode} className="login-switch-mode">
                  {isLogin ? 'Register now' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;