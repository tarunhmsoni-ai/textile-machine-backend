import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../services/apiClient';
import GearLogo from '../components/GearLogo';
import '../styles/Login.css';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      return 'Please fill in all fields';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const { data } = await apiClient.post('/auth/login', {
        username: username.trim(),
        password,
      });
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userRole', data.role || '');
      localStorage.setItem('userFullName', data.fullName || '');
      onLoginSuccess?.();
      setAccessGranted(true);
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 700);
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || 'Login failed. Please try again.');
      } else if (err.request) {
        setError('Could not reach the server. Please try again later.');
      } else {
        setError('Login failed. Please try again.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="ind-login">
      <div className="ind-login__grid" />

      {/* Left — cinematic branding panel */}
      <div className="ind-login__left">
        <div className="ind-login__left-gear">
          <GearLogo size={340} animate className="ind-login__gear-mark" />
        </div>
        <div className="ind-login__left-content">
          <div className="ind-login__brand">
            <GearLogo size={36} showWordmark />
          </div>
          <h1 className="ind-login__headline">
            WELCOME
            <br />
            BACK TO THE
            <br />
            <span className="ind-login__headline-accent">MACHINE FLOOR.</span>
          </h1>
          <p className="ind-login__subcopy">
            Access your machinery listings, enquiries and marketplace dashboard.
          </p>
        </div>
      </div>

      {/* Right — login form */}
      <div className="ind-login__right">
        <div className="ind-login__form-wrap">
          <div className="ind-login__mobile-brand">
            <GearLogo size={44} />
          </div>

          <h2 className="ind-login__form-title">WELCOME BACK</h2>
          <p className="ind-login__form-subtitle">Sign in to continue to your account.</p>

          <form onSubmit={handleSubmit} className="ind-login__form" noValidate>
            <AnimatePresence>
              {error && (
                <motion.div
                  className="ind-login__error"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  role="alert"
                >
                  <span aria-hidden="true">⚠</span>
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="ind-field">
              <label htmlFor="username">USERNAME</label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="ind-field__input"
                disabled={isLoading}
              />
            </div>

            <div className="ind-field">
              <label htmlFor="password">PASSWORD</label>
              <div className="ind-field__password-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="ind-field__input"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="ind-field__toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={isLoading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div className="ind-login__options">
              <label className="ind-login__remember">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#forgot" className="ind-login__forgot">
                Forgot password?
              </a>
            </div>

            <button type="submit" className="ind-login__submit" disabled={isLoading}>
              <AnimatePresence mode="wait" initial={false}>
                {accessGranted ? (
                  <motion.span
                    key="granted"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ind-login__submit-state"
                  >
                    ACCESS GRANTED
                  </motion.span>
                ) : isLoading ? (
                  <motion.span
                    key="authenticating"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ind-login__submit-state"
                  >
                    <GearLogo size={16} animate className="ind-login__submit-gear" />
                    AUTHENTICATING...
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ind-login__submit-state"
                  >
                    SIGN IN <span className="ind-login__submit-arrow">→</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
