import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Login from './Login';
import Profile from './Profile';
import Contacts from './Contacts';
import Modal from './Modal';
import ObjectDetails from './ObjectDetails';
import './App.css';

const API_BASE = 'https://practic2026-production.up.railway.app';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [objects, setObjects] = useState([]);
  const [activeTab, setActiveTab] = useState('objects');

  const [filters, setFilters] = useState({
    search: '',
    city: '',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: '',
    status: ''
  });

  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newObject, setNewObject] = useState({
    title: '',
    price: '',
    city: '',
    street: '',
    houseNumber: '',
    area: '',
    floor: '',
    description: '',
    status: 'Доступно'
  });
  const [uploadPhotos, setUploadPhotos] = useState([]);

  const [selectedObject, setSelectedObject] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editObject, setEditObject] = useState(null);
  const [editPhotos, setEditPhotos] = useState([]);

  const formatNum = (v) => (v || v === 0 ? String(v).replace(',', '.') : '0');

  const resetNewObjectForm = () => {
    setNewObject({
      title: '',
      price: '',
      city: '',
      street: '',
      houseNumber: '',
      area: '',
      floor: '',
      description: '',
      status: 'Доступно'
    });
    setUploadPhotos([]);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditObject(null);
    setEditPhotos([]);
  };

  useEffect(() => {
    if (user && activeTab === 'objects') {
      axios
        .get(`${API_BASE}/api/RealEstate`)
        .then((res) => setObjects(res.data))
        .catch((err) => console.error(err));
    }
  }, [user, activeTab]);

  const filteredObjects = useMemo(() => {
    return objects.filter((obj) => {
      const searchText = (filters.search || '').toLowerCase();

      const matchesSearch =
        (obj.title && obj.title.toLowerCase().includes(searchText)) ||
        (obj.street && obj.street.toLowerCase().includes(searchText));

      const matchesCity =
        filters.city === '' ||
        (obj.city && obj.city.toLowerCase().includes(filters.city.toLowerCase()));

      const price = obj.price || 0;
      const matchesMinPrice = filters.minPrice === '' || price >= parseFloat(filters.minPrice);
      const matchesMaxPrice = filters.maxPrice === '' || price <= parseFloat(filters.maxPrice);

      const area = obj.area || 0;
      const matchesMinArea = filters.minArea === '' || area >= parseFloat(filters.minArea);
      const matchesMaxArea = filters.maxArea === '' || area <= parseFloat(filters.maxArea);

      const matchesStatus = filters.status === '' || obj.status === filters.status;

      return (
        matchesSearch &&
        matchesCity &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesMinArea &&
        matchesMaxArea &&
        matchesStatus
      );
    });
  }, [objects, filters]);

  const handleAddObject = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', newObject.title);
    formData.append('city', newObject.city || '-');
    formData.append('street', newObject.street || '-');
    formData.append('houseNumber', newObject.houseNumber || '-');
    formData.append('description', newObject.description || '');
    formData.append('status', newObject.status);
    formData.append('price', formatNum(newObject.price));
    formData.append('area', formatNum(newObject.area));
    formData.append('floor', newObject.floor || '0');

    for (let i = 0; i < uploadPhotos.length; i++) {
      formData.append('photos', uploadPhotos[i]);
    }

    axios
      .post(`${API_BASE}/api/RealEstate`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then((res) => {
        setObjects((prev) => [res.data, ...prev]);
        setIsAddModalOpen(false);
        resetNewObjectForm();
        alert('Успішно додано!');
      })
      .catch((err) => alert('Помилка: ' + (err.response?.data?.title || err.message)));
  };

  const openEditModal = (obj) => {
    setEditObject({
      id: obj.id,
      title: obj.title || '',
      price: obj.price ?? '',
      city: obj.city || '',
      street: obj.street || '',
      houseNumber: obj.houseNumber || '',
      area: obj.area ?? '',
      floor: obj.floor ?? '',
      description: obj.description || '',
      status: obj.status || 'Доступно'
    });
    setEditPhotos([]);
    setIsEditModalOpen(true);
  };

  const handleUpdateObject = (e) => {
    e.preventDefault();
    if (!editObject?.id) return;

    const formData = new FormData();
    formData.append('title', editObject.title);
    formData.append('city', editObject.city || '-');
    formData.append('street', editObject.street || '-');
    formData.append('houseNumber', editObject.houseNumber || '-');
    formData.append('description', editObject.description || '');
    formData.append('status', editObject.status);
    formData.append('price', formatNum(editObject.price));
    formData.append('area', formatNum(editObject.area));
    formData.append('floor', editObject.floor || '0');

    for (let i = 0; i < editPhotos.length; i++) {
      formData.append('photos', editPhotos[i]);
    }

    axios
      .put(`${API_BASE}/api/RealEstate/${editObject.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then((res) => {
        setObjects((prev) => prev.map((o) => (o.id === editObject.id ? res.data : o)));
        setSelectedObject((prev) => (prev?.id === editObject.id ? res.data : prev));

        closeEditModal();
        alert('Успішно оновлено!');
      })
      .catch((err) => alert('Помилка: ' + (err.response?.data?.title || err.message)));
  };

  const handleDeleteObject = (objId) => {
    const ok = window.confirm("Точно видалити цей об'єкт?");
    if (!ok) return;

    axios
      .delete(`${API_BASE}/api/RealEstate/${objId}`)
      .then(() => {
        setObjects((prev) => prev.filter((o) => o.id !== objId));
        setSelectedObject((prev) => (prev?.id === objId ? null : prev));
        alert('Видалено!');
      })
      .catch((err) => alert('Помилка: ' + (err.response?.data?.title || err.message)));
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) return <Login onLoginSuccess={setUser} />;

  const styles = {
    filterInput: {
      width: '100%',
      padding: '8px 12px',
      marginBottom: '15px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px'
    },
    filterLabel: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: '600',
      fontSize: '14px',
      color: '#333'
    },
    iconBtn: {
      width: '34px',
      height: '34px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid rgba(255,255,255,0.25)',
      borderRadius: '10px',
      background: 'rgba(0,0,0,0.55)',
      color: 'white',
      cursor: 'pointer',
      backdropFilter: 'blur(6px)'
    }
  };

  return (
    <div className="crm-container">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; background: transparent; }
        .objects-grid-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          width: 100%;
        }
      `}</style>

      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">{!isSidebarCollapsed && <span className="logo-text">RealEstate</span>}</div>
          <button className="toggle-btn" onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}>
            ☰
          </button>
        </div>

        <nav className="sidebar-nav">
          <div
            className={`menu-item ${activeTab === 'objects' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('objects');
              setSelectedObject(null);
            }}
          >
            <span className="menu-icon">🏠</span>
            {!isSidebarCollapsed && <span className="menu-text">Об'єкти</span>}
          </div>

          <div className={`menu-item ${activeTab === 'contacts' ? 'active' : ''}`} onClick={() => setActiveTab('contacts')}>
            <span className="menu-icon">👥</span>
            {!isSidebarCollapsed && <span className="menu-text">Клієнти</span>}
          </div>

          <div className={`menu-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <span className="menu-icon">👤</span>
            {!isSidebarCollapsed && <span className="menu-text">Профіль</span>}
          </div>
        </nav>
      </aside>

      <main className="main-viewport">
        <header className="top-navbar">
          <div className="user-name" style={{ fontWeight: 'bold' }}>
            {user.fullName}
          </div>
        </header>

        <div className="workspace-layout" style={{ padding: 0, height: 'calc(100vh - 60px)' }}>
          {activeTab === 'objects' && (
            selectedObject ? (
              <ObjectDetails object={selectedObject} onBack={() => setSelectedObject(null)} API_BASE={API_BASE} />
            ) : (
              <div style={{ display: 'flex', height: '100%', width: '100%' }}>
                <div
                  className="filters-sidebar custom-scrollbar"
                  style={{
                    width: '280px',
                    background: 'white',
                    padding: '20px',
                    borderRight: '1px solid #eee',
                    overflowY: 'auto',
                    flexShrink: 0
                  }}
                >
                  <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Фільтри</h3>

                  <div>
                    <label style={styles.filterLabel}>Пошук</label>
                    <input
                      placeholder="Назва, вулиця..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      style={styles.filterInput}
                    />
                  </div>

                  <div>
                    <label style={styles.filterLabel}>Місто</label>
                    <input
                      placeholder="Введіть місто"
                      value={filters.city}
                      onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                      style={styles.filterInput}
                    />
                  </div>

                  <div>
                    <label style={styles.filterLabel}>Статус</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      style={styles.filterInput}
                    >
                      <option value="">Всі статуси</option>
                      <option value="Доступно">Доступно</option>
                      <option value="Заброньовано">Заброньовано</option>
                      <option value="Продано">Продано</option>
                    </select>
                  </div>

                  <label style={styles.filterLabel}>Ціна ($)</label>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <input
                      placeholder="Від"
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      style={{ ...styles.filterInput, marginBottom: 0 }}
                    />
                    <input
                      placeholder="До"
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      style={{ ...styles.filterInput, marginBottom: 0 }}
                    />
                  </div>

                  <label style={styles.filterLabel}>Площа (м²)</label>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <input
                      placeholder="Від"
                      type="number"
                      value={filters.minArea}
                      onChange={(e) => setFilters({ ...filters, minArea: e.target.value })}
                      style={{ ...styles.filterInput, marginBottom: 0 }}
                    />
                    <input
                      placeholder="До"
                      type="number"
                      value={filters.maxArea}
                      onChange={(e) => setFilters({ ...filters, maxArea: e.target.value })}
                      style={{ ...styles.filterInput, marginBottom: 0 }}
                    />
                  </div>

                  <button
                    onClick={() => setFilters({ search: '', city: '', minPrice: '', maxPrice: '', minArea: '', maxArea: '', status: '' })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#333',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginTop: '10px',
                      fontWeight: 'bold',
                      transition: 'background 0.3s'
                    }}
                    onMouseOver={(e) => (e.target.style.background = '#555')}
                    onMouseOut={(e) => (e.target.style.background = '#333')}
                  >
                    Скинути фільтри
                  </button>
                </div>

                <div
                  className="objects-content-area custom-scrollbar"
                  style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#f4f7f6' }}
                >
                  <div
                    className="list-header-row"
                    style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <h2 style={{ margin: 0 }}>Об'єкти ({filteredObjects.length})</h2>
                    <button className="add-btn-main" onClick={() => setIsAddModalOpen(true)}>
                      + ДОДАТИ
                    </button>
                  </div>

                  <div className="objects-grid-container">
                    {filteredObjects.length > 0 ? (
                      filteredObjects.map((obj) => (
                        <div
                          key={obj.id}
                          className="object-item"
                          onClick={() => setSelectedObject(obj)}
                          style={{
                            background: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                          }}
                        >
                          <div className="obj-preview" style={{ height: '200px', background: '#e0e0e0', position: 'relative' }}>
                            {obj.imageUrls?.[0] ? (
                              <img
                                src={`${API_BASE}${obj.imageUrls[0]}`}
                                alt=""
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#999'
                                }}
                              >
                                Без фото
                              </div>
                            )}

                            <span
                              style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}
                            >
                              {obj.status}
                            </span>

                            <div style={{ position: 'absolute', bottom: '10px', right: '10px', display: 'flex', gap: '8px' }}>
                              <button
                                type="button"
                                title="Редагувати"
                                style={styles.iconBtn}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditModal(obj);
                                }}
                              >
                                ✏️
                              </button>

                              <button
                                type="button"
                                title="Видалити"
                                style={styles.iconBtn}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteObject(obj.id);
                                }}
                              >
                                🗑
                              </button>
                            </div>
                          </div>

                          <div className="obj-info" style={{ padding: '15px' }}>
                            <strong
                              style={{
                                display: 'block',
                                marginBottom: '5px',
                                fontSize: '16px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {obj.title}
                            </strong>
                            <div style={{ color: '#28a745', fontWeight: 'bold', fontSize: '20px', marginBottom: '5px' }}>
                              ${obj.price}
                            </div>
                            <div style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>
                              📍 {obj.city}
                              {obj.street && obj.street !== '-' ? `, ${obj.street}` : ''}
                            </div>
                            <div style={{ color: '#888', fontSize: '13px' }}>
                              📐 {obj.area} м² • Поверх {obj.floor}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div
                        style={{
                          gridColumn: '1 / -1',
                          padding: '40px',
                          textAlign: 'center',
                          width: '100%',
                          color: '#888',
                          background: 'white',
                          borderRadius: '8px'
                        }}
                      >
                        <h3>Нічого не знайдено</h3>
                        <p>Спробуйте змінити параметри фільтрації.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          )}

          {activeTab === 'contacts' && <Contacts />}
          {activeTab === 'profile' && <Profile user={user} onLogout={handleLogout} />}
        </div>
      </main>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Новий об'єкт">
        <form onSubmit={handleAddObject} className="add-object-form">
          <input
            placeholder="Назва оголошення"
            value={newObject.title}
            onChange={(e) => setNewObject({ ...newObject, title: e.target.value })}
            required
          />
          <input
            placeholder="Ціна ($)"
            type="number"
            value={newObject.price}
            onChange={(e) => setNewObject({ ...newObject, price: e.target.value })}
            required
          />

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              placeholder="Місто"
              value={newObject.city}
              onChange={(e) => setNewObject({ ...newObject, city: e.target.value })}
              style={{ flex: 1 }}
            />
            <input
              placeholder="Вулиця"
              value={newObject.street}
              onChange={(e) => setNewObject({ ...newObject, street: e.target.value })}
              style={{ flex: 1 }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              placeholder="№ Будинку"
              value={newObject.houseNumber}
              onChange={(e) => setNewObject({ ...newObject, houseNumber: e.target.value })}
              style={{ flex: 1 }}
            />
            <input
              placeholder="Поверх"
              type="number"
              value={newObject.floor}
              onChange={(e) => setNewObject({ ...newObject, floor: e.target.value })}
              style={{ flex: 1 }}
            />
          </div>

          <input
            placeholder="Площа (м²)"
            type="number"
            value={newObject.area}
            onChange={(e) => setNewObject({ ...newObject, area: e.target.value })}
          />

          <select
            value={newObject.status}
            onChange={(e) => setNewObject({ ...newObject, status: e.target.value })}
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="Доступно">Доступно</option>
            <option value="Заброньовано">Заброньовано</option>
            <option value="Продано">Продано</option>
          </select>

          <textarea
            placeholder="Опис"
            value={newObject.description}
            onChange={(e) => setNewObject({ ...newObject, description: e.target.value })}
            style={{ width: '100%', padding: '10px', marginTop: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />

          <div style={{ marginTop: '10px' }}>
            <label>Фотографії:</label>
            <input type="file" multiple onChange={(e) => setUploadPhotos(e.target.files)} />
          </div>

          <div className="modal-footer">
            <button type="submit" style={{ width: '100%', marginTop: '15px' }}>
              Зберегти
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title="Редагування об'єкта">
        {editObject && (
          <form onSubmit={handleUpdateObject} className="add-object-form">
            <input
              placeholder="Назва оголошення"
              value={editObject.title}
              onChange={(e) => setEditObject({ ...editObject, title: e.target.value })}
              required
            />
            <input
              placeholder="Ціна ($)"
              type="number"
              value={editObject.price}
              onChange={(e) => setEditObject({ ...editObject, price: e.target.value })}
              required
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                placeholder="Місто"
                value={editObject.city}
                onChange={(e) => setEditObject({ ...editObject, city: e.target.value })}
                style={{ flex: 1 }}
              />
              <input
                placeholder="Вулиця"
                value={editObject.street}
                onChange={(e) => setEditObject({ ...editObject, street: e.target.value })}
                style={{ flex: 1 }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                placeholder="№ Будинку"
                value={editObject.houseNumber}
                onChange={(e) => setEditObject({ ...editObject, houseNumber: e.target.value })}
                style={{ flex: 1 }}
              />
              <input
                placeholder="Поверх"
                type="number"
                value={editObject.floor}
                onChange={(e) => setEditObject({ ...editObject, floor: e.target.value })}
                style={{ flex: 1 }}
              />
            </div>

            <input
              placeholder="Площа (м²)"
              type="number"
              value={editObject.area}
              onChange={(e) => setEditObject({ ...editObject, area: e.target.value })}
            />

            <select
              value={editObject.status}
              onChange={(e) => setEditObject({ ...editObject, status: e.target.value })}
              style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="Доступно">Доступно</option>
              <option value="Заброньовано">Заброньовано</option>
              <option value="Продано">Продано</option>
            </select>

            <textarea
              placeholder="Опис"
              value={editObject.description}
              onChange={(e) => setEditObject({ ...editObject, description: e.target.value })}
              style={{ width: '100%', padding: '10px', marginTop: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            />

            <div style={{ marginTop: '10px' }}>
              <label>Нові фото (необов'язково):</label>
              <input type="file" multiple onChange={(e) => setEditPhotos(e.target.files)} />
              <div style={{ marginTop: '6px', fontSize: '12px', color: '#777' }}>
                Якщо бекенд додає/замінює фото — тут підхопиться. Якщо бекенд ігнорує фото при PUT — просто не вплине.
              </div>
            </div>

            <div className="modal-footer">
              <button type="submit" style={{ width: '100%', marginTop: '15px' }}>
                Зберегти зміни
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default App;
