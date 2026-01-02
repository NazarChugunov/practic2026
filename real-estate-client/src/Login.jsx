import React, { useMemo, useState } from 'react';
import axios from 'axios';
import './Login.css';

function Login({ onLoginSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [fullName, setFullName] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => {
    if (isLoginMode) return login.trim() && password.trim();
    return fullName.trim() && login.trim() && password.trim();
  }, [isLoginMode, fullName, login, password]);

  const resetForm = () => {
    setFullName('');
    setLogin('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || loading) return;

    setError('');
    setLoading(true);

    try {
      if (isLoginMode) {
        const res = await axios.post('https://practic2026-production.up.railway.app/api/Auth/login', {
          email: login,
          passwordHash: password
        });
        localStorage.setItem('user', JSON.stringify(res.data));
        onLoginSuccess(res.data);
      } else {
        await axios.post('https://practic2026-production.up.railway.app/api/Auth/register', {
          fullName: fullName,
          email: login,
          passwordHash: password,
          role: 'Worker'
        });
        alert('Реєстрація успішна! Тепер ви можете увійти.');
        setIsLoginMode(true);
        setPassword('');
      }
    } catch (err) {
      console.error('Помилка авторизації:', err);
      setError(isLoginMode
        ? 'Невірний логін або пароль.'
        : 'Помилка реєстрації. Можливо, логін уже зайнятий.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-overlay">
        <div className="auth-card" role="dialog" aria-modal="true">
          <div className="auth-brand">REALESTATE</div>

          <div className="auth-head">
            <div className="auth-title">Вхід / Реєстрація</div>
            <button
              type="button"
              className="auth-close"
              onClick={resetForm}
              aria-label="Close"
              title="Очистити форму"
            >
              ×
            </button>
          </div>

          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${isLoginMode ? 'active' : ''}`}
              onClick={() => { setIsLoginMode(true); setError(''); }}
            >
              Вхід
            </button>
            <button
              type="button"
              className={`auth-tab ${!isLoginMode ? 'active' : ''}`}
              onClick={() => { setIsLoginMode(false); setError(''); }}
            >
              Реєстрація
            </button>
          </div>

          <div className="auth-divider" />

          {error ? <div className="auth-error">{error}</div> : null}

          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLoginMode && (
              <>
                <label className="auth-label">ПІБ працівника</label>
                <input
                  className="auth-input"
                  type="text"
                  placeholder=""
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                />
              </>
            )}

            <label className="auth-label">Логін</label>
            <input
              className="auth-input"
              type="text"
              placeholder=""
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              autoComplete="username"
            />

            <label className="auth-label">Пароль</label>
            <input
              className="auth-input"
              type="password"
              placeholder=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isLoginMode ? 'current-password' : 'new-password'}
            />

            <button className="auth-button" type="submit" disabled={!canSubmit || loading}>
              {loading ? '...' : (isLoginMode ? 'УВІЙТИ' : 'ЗАРЕЄСТРУВАТИСЯ')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
