import React, { useState } from 'react';
import axios from 'axios';
import Modal from './Modal';

const ObjectDetails = ({ object, onBack, API_BASE, onUpdate, onDelete }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editData, setEditData] = useState({ ...object });

    const handleUpdate = (e) => {
        e.preventDefault();
        axios.put(`${API_BASE}/api/RealEstate/${object.id}`, editData)
            .then(res => {
                alert("Дані оновлено!");
                setIsEditModalOpen(false);
                if (onUpdate) onUpdate(res.data);
            })
            .catch(err => alert("Помилка при оновленні"));
    };

    return (
        <div style={{ padding: '20px', background: 'white', height: '100%', overflowY: 'auto' }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={onBack} style={{ padding: '8px 15px', cursor: 'pointer' }}>← Назад</button>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={() => setIsEditModalOpen(true)} 
                        style={{ padding: '8px 15px', background: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        ✏️ Редагувати
                    </button>
                    <button 
                        onClick={() => { if(window.confirm("Видалити цей об'єкт?")) onDelete(object.id); }}
                        style={{ padding: '8px 15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        🗑️ Видалити
                    </button>
                </div>
            </div>

            <h2>{object.title}</h2>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Редагування об'єкта">
                <form onSubmit={handleUpdate} className="add-object-form">
                    <label>Назва</label>
                    <input value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} required />
                    
                    <label>Ціна ($)</label>
                    <input type="number" value={editData.price} onChange={e => setEditData({...editData, price: e.target.value})} required />
                    
                    <label>Статус</label>
                    <select value={editData.status} onChange={e => setEditData({...editData, status: e.target.value})}>
                        <option value="Доступно">Доступно</option>
                        <option value="Заброньовано">Заброньовано</option>
                        <option value="Продано">Продано</option>
                    </select>

                    <label>Опис</label>
                    <textarea value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} />

                    <div className="modal-footer">
                        <button type="submit" style={{ width: '100%', background: '#28a745', color: 'white', marginTop: '15px' }}>
                            Зберегти зміни
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ObjectDetails;