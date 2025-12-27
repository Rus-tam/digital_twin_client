import React, { useState, useEffect } from 'react';
import '../styles/global.css';

const ManualDataModal = ({ isOpen, onClose, onSave, row, sensor, existingData = [] }) => {
  const [manualEntries, setManualEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({
    date: '',
    time: '',
    value: '',
    notes: ''
  });

  useEffect(() => {
    if (existingData && existingData.length > 0) {
      setManualEntries(existingData.map(item => ({
        ...item,
        date: item.timestamp ? new Date(item.timestamp).toISOString().split('T')[0] : '',
        time: item.timestamp ? new Date(item.timestamp).toTimeString().split(' ')[0].substring(0, 5) : '',
        value: item.value || '',
        notes: item.notes || ''
      })));
    } else {
      setManualEntries([]);
    }
    
    // Устанавливаем текущую дату и время по умолчанию
    const now = new Date();
    setNewEntry({
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0].substring(0, 5),
      value: '',
      notes: ''
    });
  }, [existingData, isOpen]);

  const handleAddEntry = () => {
    if (!newEntry.date || !newEntry.time || !newEntry.value) {
      alert('Пожалуйста, заполните дату, время и значение');
      return;
    }

    const timestamp = new Date(`${newEntry.date}T${newEntry.time}:00`).toISOString();
    const newEntryObject = {
      timestamp,
      value: parseFloat(newEntry.value),
      notes: newEntry.notes,
      enteredBy: 'Оператор', // Можно добавить систему авторизации
      entryDate: new Date().toISOString()
    };

    const updatedEntries = [...manualEntries, newEntryObject];
    setManualEntries(updatedEntries);
    
    // Сброс формы
    const now = new Date();
    setNewEntry({
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0].substring(0, 5),
      value: '',
      notes: ''
    });
  };

  const handleRemoveEntry = (index) => {
    const updatedEntries = manualEntries.filter((_, i) => i !== index);
    setManualEntries(updatedEntries);
  };

  const handleSave = () => {
    if (manualEntries.length === 0) {
      alert('Нет данных для сохранения');
      return;
    }
    onSave(manualEntries);
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ width: '800px', maxHeight: '90vh' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
          <h2>Ручной ввод данных</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Параметр:</div>
              <div style={{ fontSize: '13px', fontWeight: '500' }}>{row?.parameterName}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Датчик:</div>
              <div style={{ fontSize: '13px', fontWeight: '500' }}>{sensor?.name}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Единица измерения:</div>
              <div style={{ fontSize: '13px', fontWeight: '500' }}>{sensor?.unit || row?.unit}</div>
            </div>
          </div>
        </div>

        {/* Форма добавления новой записи */}
        <div style={{ 
          backgroundColor: 'var(--bg-secondary)', 
          padding: 'var(--spacing-md)', 
          borderRadius: 'var(--border-radius)',
          marginBottom: 'var(--spacing-lg)'
        }}>
          <h3 style={{ fontSize: '14px', marginBottom: 'var(--spacing-md)' }}>Добавить новое измерение</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Дата *</div>
              <input
                type="date"
                value={newEntry.date}
                onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                style={{ width: '100%' }}
              />
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Время *</div>
              <input
                type="time"
                value={newEntry.time}
                onChange={(e) => setNewEntry({...newEntry, time: e.target.value})}
                style={{ width: '100%' }}
              />
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Значение *</div>
              <input
                type="number"
                step="0.01"
                value={newEntry.value}
                onChange={(e) => setNewEntry({...newEntry, value: e.target.value})}
                placeholder="Введите значение"
                style={{ width: '100%' }}
              />
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Примечания</div>
              <input
                type="text"
                value={newEntry.notes}
                onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                placeholder="Описание измерения"
                style={{ width: '100%' }}
              />
            </div>
          </div>
          
          <button
            onClick={handleAddEntry}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--accent-blue)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--border-radius)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            Добавить измерение
          </button>
        </div>

        {/* Таблица существующих записей */}
        <div style={{ marginBottom: 'var(--spacing-lg)', maxHeight: '300px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '14px', marginBottom: 'var(--spacing-md)' }}>История измерений</h3>
          
          {manualEntries.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: 'var(--spacing-xl)', 
              color: 'var(--text-tertiary)',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--border-radius)'
            }}>
              Нет данных измерений
            </div>
          ) : (
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: '12px'
            }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <th style={{ padding: '8px', textAlign: 'left', border: '1px solid var(--border-color)' }}>Дата и время</th>
                  <th style={{ padding: '8px', textAlign: 'left', border: '1px solid var(--border-color)' }}>Значение</th>
                  <th style={{ padding: '8px', textAlign: 'left', border: '1px solid var(--border-color)' }}>Примечания</th>
                  <th style={{ padding: '8px', textAlign: 'left', border: '1px solid var(--border-color)' }}>Внесено</th>
                  <th style={{ padding: '8px', textAlign: 'left', border: '1px solid var(--border-color)' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {manualEntries.map((entry, index) => (
                  <tr key={index} style={{ 
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: index % 2 === 0 ? 'white' : 'var(--bg-secondary)'
                  }}>
                    <td style={{ padding: '8px', border: '1px solid var(--border-color)' }}>
                      {formatDateTime(entry.timestamp)}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid var(--border-color)', fontWeight: '600' }}>
                      {entry.value} {sensor?.unit || row?.unit}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid var(--border-color)' }}>
                      {entry.notes || '—'}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      {entry.enteredBy}<br/>
                      {entry.entryDate ? new Date(entry.entryDate).toLocaleDateString('ru-RU') : ''}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                      <button
                        onClick={() => handleRemoveEntry(index)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: 'transparent',
                          color: 'var(--accent-red)',
                          border: '1px solid var(--accent-red)',
                          borderRadius: 'var(--border-radius)',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingTop: 'var(--spacing-md)',
          borderTop: '1px solid var(--border-color)'
        }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Всего записей: <strong>{manualEntries.length}</strong> | 
            Последнее значение: <strong>
              {manualEntries.length > 0 
                ? `${manualEntries[manualEntries.length - 1].value} ${sensor?.unit || row?.unit}` 
                : 'Нет данных'}
            </strong>
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--accent-green)',
                color: 'white',
                border: '1px solid var(--accent-green)',
                borderRadius: 'var(--border-radius)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              Сохранить данные
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualDataModal;