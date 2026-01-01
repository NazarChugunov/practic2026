import React, { useState, useRef } from 'react';
import axios from 'axios';

function Profile({ user, onUpdate, onLogout }) {
  const [fullName, setFullName] = useState(user.fullName || '');
  const [password, setPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState(null); 
  const [avatarPreview, setAvatarPreview] = useState(null); 
  const fileInputRef = useRef(null);

  const translateRole = (role) => {
    const roles = { 'Admin': 'Адміністратор', 'Worker': 'Працівник', 'CEO': 'Керівник' };
    return roles[role] || role;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      let updatedUser = { ...user, fullName };

      if (avatarFile) {
        const formData = new FormData();
        formData.append('Login', user.email); 
        formData.append('File', avatarFile);

        const res = await axios.post('https://localhost:7178/api/Auth/upload-avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        updatedUser = res.data; 
      }

      localStorage.setItem('user', JSON.stringify(updatedUser));
      onUpdate(updatedUser);
      alert("Профіль успішно оновлено!");
    } catch (err) {
      console.error("Помилка 400. Перевірте консоль браузера або відповідність ключів у DTO.");
    }
  };

  const userInitials = fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase() : '??';

  const getAvatarSrc = () => {
    if (avatarPreview) return avatarPreview;
    if (user.avatarUrl) return `https://localhost:7178${user.avatarUrl}`;
    return null;
  };

  return (
    <div className="profile-container custom-scrollbar">
      <div className="profile-card">
        <h2 className="main-title" style={{ textAlign: 'center', marginBottom: '30px' }}>
          Особистий кабінет
        </h2>
        
        <div className="profile-content">
          <div className="avatar-section">
            <div className="profile-avatar-view">
              {getAvatarSrc() ? (
                <img src={getAvatarSrc()} alt="" className="avatar-img-circle" />
              ) : (
                <span className="initials-text">{userInitials}</span>
              )}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
            
            <button 
              className="add-pill-btn" 
              style={{ marginTop: '15px' }}
              onClick={() => fileInputRef.current.click()}
            >
              Змінити фото
            </button>
          </div>
          
          <div className="info-section">
            <div className="filter-field">
              <label>ПІБ (Повне ім'я)</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>

            <div className="filter-field">
              <label>Рівень допуску</label>
              <input type="text" value={translateRole(user.role)} disabled className="readonly-input" />
            </div>

            <div className="filter-field">
              <label>Зміна паролю</label>
              <input type="password" placeholder="Введіть новий пароль" value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            <div className="profile-actions">
              <button className="logout-btn-profile" onClick={onLogout}>ВИЙТИ З АККАУНТУ</button>
              <button className="auth-button" onClick={handleSave}>ЗБЕРЕГТИ ЗМІНИ</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;