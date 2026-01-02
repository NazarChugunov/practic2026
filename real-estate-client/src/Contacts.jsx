import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal';
import './App.css';

const API_BASE = 'https://practic2026-production.up.railway.app'; 

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '', 
    email: '', 
    workerComment: '', 
    status: 'Новий' 
  });

  const fetchContacts = () => {
    setIsLoading(true);
    axios.get(`${API_BASE}/api/Clients`)
      .then(res => {
        setContacts(res.data);
        setIsLoading(false);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', phone: '', email: '', workerComment: '', status: 'Новий' });
    setIsModalOpen(true);
  };


  const handleOpenEdit = (client) => {
    setEditingId(client.id);
    setFormData({
      name: client.name,
      phone: client.phone || '',
      email: client.email || '',
      workerComment: client.workerComment || '',
      status: client.status || 'Новий'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingId) {
      const updatedClient = { ...formData, id: editingId };

      axios.put(`${API_BASE}/api/Clients/${editingId}`, updatedClient)
        .then(() => {
          setContacts(contacts.map(c => c.id === editingId ? { ...updatedClient, createdAt: c.createdAt } : c));
          setIsModalOpen(false);
        })
        .catch(err => alert("Помилка при оновленні: " + err.message));

    } else {
      axios.post(`${API_BASE}/api/Clients`, formData)
        .then(res => {
          setContacts([res.data, ...contacts]);
          setIsModalOpen(false);
        })
        .catch(err => alert("Помилка при створенні: " + err.message));
    }
  };

  return (
    <section className="list-content-area">
      <div className="list-header-row">
        <h2 className="main-title">Клієнти ({contacts.length})</h2>
        <button className="add-btn-main" onClick={handleOpenAdd}>+ ДОДАТИ КЛІЄНТА</button>
      </div>

      <div className="objects-grid custom-scrollbar">
        {isLoading ? (
            <div style={{padding: '20px', color: '#888'}}>Завантаження...</div>
        ) : (
            contacts.map(contact => (
            <div key={contact.id} className="object-item" style={{ minHeight: 'auto' }}>
                <div className="obj-info">
                  <div className="obj-title">{contact.name}</div>
                  
                  <div className="obj-sub">
                    {contact.email || 'Email відсутній'} 
                    {contact.workerComment && <span style={{display:'block', fontSize:'11px', color:'#999', marginTop:'4px'}}>📝 {contact.workerComment}</span>}
                  </div>

                  <div className="obj-tags" style={{marginTop: '5px'}}>
                      <span>{contact.phone}</span> • <span style={{color: 'var(--primary)', fontWeight: 'bold'}}>{contact.status}</span>
                  </div>
                  
                  <div className="obj-actions">
                      <button 
                        className="edit-pill-btn" 
                        onClick={(e) => { 
                          e.stopPropagation();
                          handleOpenEdit(contact); 
                        }}
                      >
                        Редагувати
                      </button>
                  </div>
                </div>
            </div>
            ))
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingId ? "Редагування клієнта" : "Новий клієнт"}
      >
        <form onSubmit={handleSubmit}>
          
          <div className="filter-field">
            <label>ПІБ Клієнта <span style={{color:'red'}}>*</span></label>
            <input 
              type="text" 
              placeholder="Введіть ім'я"
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="filter-field">
            <label>Телефон</label>
            <input 
              type="tel" 
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div className="filter-field">
            <label>Email</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="filter-field">
            <label>Коментар / Нотатки</label>
            <textarea 
              style={{minHeight: '60px'}}
              value={formData.workerComment}
              onChange={e => setFormData({...formData, workerComment: e.target.value})}
            />
          </div>

          <div className="filter-field">
            <label>Статус</label>
            <select 
              value={formData.status} 
              onChange={e => setFormData({...formData, status: e.target.value})}
            >
              <option value="Новий">Новий</option>
              <option value="Активний">Активний</option>
              <option value="Архів">Архів</option>
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Скасувати</button>
            <button type="submit" className="auth-button">
              {editingId ? "Зберегти зміни" : "Створити"}
            </button>
          </div>
        </form>
      </Modal>

    </section>
  );
};

export default Contacts;