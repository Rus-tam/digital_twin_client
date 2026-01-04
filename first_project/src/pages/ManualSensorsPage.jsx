import React, { useState, useEffect } from 'react';
import '../styles/manual-sensors.css';

const ManualSensorsPage = () => {
  const [sensors, setSensors] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Типы датчиков для фильтрации
  const sensorTypes = [
    { value: 'all', label: 'Все типы' },
    { value: 'temperature', label: 'Температура' },
    { value: 'pressure', label: 'Давление' },
    { value: 'flow', label: 'Расход' },
    { value: 'level', label: 'Уровень' },
    { value: 'quality', label: 'Качество' },
    { value: 'composition', label: 'Состав' },
    { value: 'other', label: 'Прочие' },
  ];

  // Форма для создания/редактирования датчика
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    code: '',
    type: 'temperature',
    unit: '',
    location: '',
    description: '',
    minValue: '',
    maxValue: '',
    accuracy: '',
    installationDate: '',
    lastCalibration: '',
    isActive: true,
  });

  // Загрузка датчиков из localStorage при монтировании
  useEffect(() => {
    loadSensors();
  }, []);

  const loadSensors = () => {
    try {
      const savedSensors = localStorage.getItem('manualSensors');
      if (savedSensors) {
        setSensors(JSON.parse(savedSensors));
      }
    } catch (error) {
      console.error('Ошибка загрузки датчиков:', error);
    }
  };

  // Сохранение датчиков в localStorage
  useEffect(() => {
    if (sensors.length > 0) {
      localStorage.setItem('manualSensors', JSON.stringify(sensors));
    } else {
      localStorage.removeItem('manualSensors');
    }
  }, [sensors]);

  // Фильтрация датчиков
  const filteredSensors = sensors.filter(sensor => {
    const matchesSearch =
      sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sensor.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sensor.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || sensor.type === filterType;

    return matchesSearch && matchesType;
  });

  // Генерация кода датчика
  const generateSensorCode = type => {
    const prefixMap = {
      temperature: 'T',
      pressure: 'P',
      flow: 'F',
      level: 'L',
      quality: 'Q',
      composition: 'C',
      other: 'M',
    };

    const prefix = prefixMap[type] || 'M';
    const existingCodes = sensors.map(s => s.code);
    let number = 1;

    while (existingCodes.includes(`${prefix}-${String(number).padStart(3, '0')}`)) {
      number++;
    }

    return `${prefix}-${String(number).padStart(3, '0')}`;
  };

  // Получение стандартных единиц измерения по типу датчика
  const getDefaultUnit = type => {
    const units = {
      temperature: '°C',
      pressure: 'МПа',
      flow: 'м³/ч',
      level: '%',
      quality: 'ед.',
      composition: '%',
      other: 'ед.',
    };
    return units[type] || 'ед.';
  };

  // Получение единиц измерения для отображения
  const getDisplayUnit = sensor => {
    return sensor.unit || getDefaultUnit(sensor.type);
  };

  // Сброс формы
  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      code: '',
      type: 'temperature',
      unit: '',
      location: '',
      description: '',
      minValue: '',
      maxValue: '',
      accuracy: '',
      installationDate: '',
      lastCalibration: '',
      isActive: true,
    });
    setIsEditing(false);
    setSelectedSensor(null);
  };

  // Обработка изменения формы
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Автогенерация кода при изменении типа или названия
    if (field === 'type' && !formData.code) {
      const newCode = generateSensorCode(value);
      setFormData(prev => ({ ...prev, code: newCode }));
    }

    // Автозаполнение единиц измерения при изменении типа
    if (field === 'type' && !formData.unit) {
      const defaultUnit = getDefaultUnit(value);
      setFormData(prev => ({ ...prev, unit: defaultUnit }));
    }
  };

  // Установка стандартных единиц измерения
  const handleSetDefaultUnit = () => {
    const defaultUnit = getDefaultUnit(formData.type);
    setFormData(prev => ({ ...prev, unit: defaultUnit }));
  };

  // Сохранение датчика
  const handleSaveSensor = () => {
    // Валидация
    if (!formData.name.trim()) {
      alert('Введите название датчика');
      return;
    }

    if (!formData.code.trim()) {
      alert('Введите код датчика');
      return;
    }

    if (!formData.type) {
      alert('Выберите тип датчика');
      return;
    }

    const newSensor = {
      ...formData,
      id: formData.id || Date.now().toString(),
      createdAt: isEditing ? formData.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isManual: true, // Флаг для ручного датчика
    };

    if (isEditing) {
      // Редактирование существующего датчика
      setSensors(prev => prev.map(s => (s.id === newSensor.id ? newSensor : s)));
    } else {
      // Добавление нового датчика
      setSensors(prev => [...prev, newSensor]);
    }

    resetForm();
    alert(`Датчик "${newSensor.name}" ${isEditing ? 'обновлен' : 'добавлен'}`);
  };

  // Редактирование датчика
  const handleEditSensor = sensor => {
    setFormData(sensor);
    setIsEditing(true);
    setSelectedSensor(sensor);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Удаление датчика
  const handleDeleteSensor = sensorId => {
    if (window.confirm('Вы уверены, что хотите удалить этот датчик?')) {
      setSensors(prev => prev.filter(s => s.id !== sensorId));

      if (selectedSensor?.id === sensorId) {
        resetForm();
      }

      alert('Датчик удален');
    }
  };

  // Массовое удаление неактивных датчиков
  const handleCleanupInactive = () => {
    const inactiveSensors = sensors.filter(s => !s.isActive);
    if (inactiveSensors.length === 0) {
      alert('Нет неактивных датчиков');
      return;
    }

    if (window.confirm(`Удалить ${inactiveSensors.length} неактивных датчиков?`)) {
      setSensors(prev => prev.filter(s => s.isActive));
      alert(`${inactiveSensors.length} датчиков удалено`);
    }
  };

  // Экспорт датчиков
  const handleExportSensors = () => {
    const dataStr = JSON.stringify(sensors, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `manual-sensors-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  // Импорт датчиков
  const handleImportSensors = event => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const importedSensors = JSON.parse(e.target.result);

        // Базовая валидация структуры
        if (!Array.isArray(importedSensors)) {
          throw new Error('Некорректный формат файла');
        }

        const validSensors = importedSensors.filter(s => s.name && s.code && s.type);

        if (validSensors.length === 0) {
          throw new Error('В файле нет валидных датчиков');
        }

        if (
          window.confirm(
            `Импортировать ${validSensors.length} датчиков? Существующие датчики будут сохранены.`
          )
        ) {
          // Объединяем существующие и импортированные датчики
          const mergedSensors = [...sensors];

          validSensors.forEach(newSensor => {
            const exists = mergedSensors.some(s => s.code === newSensor.code);
            if (!exists) {
              mergedSensors.push({
                ...newSensor,
                id: newSensor.id || Date.now().toString(),
                createdAt: newSensor.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isManual: true,
              });
            }
          });

          setSensors(mergedSensors);
          alert(
            `Импортировано ${validSensors.length} датчиков. Всего датчиков: ${mergedSensors.length}`
          );
        }
      } catch (error) {
        alert(`Ошибка импорта: ${error.message}`);
      }
    };

    reader.readAsText(file);
    event.target.value = ''; // Сброс input
  };

  // Получение названия типа датчика
  const getTypeName = typeValue => {
    const type = sensorTypes.find(t => t.value === typeValue);
    return type ? type.label : typeValue;
  };

  // Получение иконки для типа датчика
  const getTypeIcon = type => {
    const icons = {
      temperature: '🌡️',
      pressure: '📊',
      flow: '💧',
      level: '📈',
      quality: '⭐',
      composition: '🧪',
      other: '📌',
    };
    return icons[type] || '📌';
  };

  return (
    <div className="manual-sensors-page">
      {/* Заголовок */}
      <div className="page-header">
        <div>
          <h1>Локальные датчики для ручных замеров</h1>
          <p className="page-subtitle">
            Управление перечнем датчиков и узлов для ручного ввода данных
          </p>
        </div>
        <div className="header-actions">
          <button
            className="secondary-btn"
            onClick={handleExportSensors}
            title="Экспортировать все датчики"
          >
            📤 Экспорт
          </button>
          <label className="secondary-btn" style={{ cursor: 'pointer' }}>
            📥 Импорт
            <input
              type="file"
              accept=".json"
              onChange={handleImportSensors}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {/* Основной контент - две колонки */}
      <div className="sensors-container">
        {/* Левая колонка - форма */}
        <div className="form-column">
          <div className="form-card">
            <h2>{isEditing ? 'Редактирование датчика' : 'Добавление нового датчика'}</h2>

            <div className="form-group">
              <label className="form-label required">Название датчика/узла</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => handleFormChange('name', e.target.value)}
                placeholder="Например: Термометр ручной №1"
                className="form-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">Код датчика</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={e => handleFormChange('code', e.target.value)}
                  placeholder="Например: T-001"
                  className="form-input"
                />
                <div className="form-hint">
                  Уникальный идентификатор. Будет использоваться в выпадающих списках
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required">Тип датчика</label>
                <select
                  value={formData.type}
                  onChange={e => handleFormChange('type', e.target.value)}
                  className="form-input"
                >
                  {sensorTypes
                    .filter(t => t.value !== 'all')
                    .map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Единица измерения</label>
                <div className="unit-input-container">
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={e => handleFormChange('unit', e.target.value)}
                    placeholder={`Например: ${getDefaultUnit(formData.type)}`}
                    className="form-input"
                  />
                  <button
                    type="button"
                    className="auto-unit-btn"
                    onClick={handleSetDefaultUnit}
                    title="Использовать стандартные единицы измерения"
                  >
                    Авто
                  </button>
                </div>
                <div className="form-hint">
                  Стандартные единицы для {getTypeName(formData.type)}:{' '}
                  {getDefaultUnit(formData.type)}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Местоположение</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => handleFormChange('location', e.target.value)}
                  placeholder="Например: Вход сепаратора С-101"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Описание</label>
              <textarea
                value={formData.description}
                onChange={e => handleFormChange('description', e.target.value)}
                placeholder="Дополнительная информация о датчике, методе измерений и т.д."
                className="form-input"
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Диапазон измерений (мин)</label>
                <input
                  type="number"
                  value={formData.minValue}
                  onChange={e => handleFormChange('minValue', e.target.value)}
                  placeholder="0"
                  className="form-input"
                  step="any"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Диапазон измерений (макс)</label>
                <input
                  type="number"
                  value={formData.maxValue}
                  onChange={e => handleFormChange('maxValue', e.target.value)}
                  placeholder="100"
                  className="form-input"
                  step="any"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Точность/погрешность</label>
                <input
                  type="text"
                  value={formData.accuracy}
                  onChange={e => handleFormChange('accuracy', e.target.value)}
                  placeholder="Например: ±0.5%"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Дата установки</label>
                <input
                  type="date"
                  value={formData.installationDate}
                  onChange={e => handleFormChange('installationDate', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Дата последней поверки</label>
                <input
                  type="date"
                  value={formData.lastCalibration}
                  onChange={e => handleFormChange('lastCalibration', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={e => handleFormChange('isActive', e.target.checked)}
                />
                <span>Активный (доступен для выбора)</span>
              </label>
              <div className="form-hint">
                Неактивные датчики не будут отображаться в выпадающих списках
              </div>
            </div>

            <div className="form-actions">
              {isEditing && (
                <button className="secondary-btn" onClick={resetForm}>
                  Отмена
                </button>
              )}
              <button className="primary-btn" onClick={handleSaveSensor}>
                {isEditing ? 'Обновить датчик' : 'Добавить датчик'}
              </button>
            </div>
          </div>

          {/* Статистика */}
          <div className="stats-card">
            <h3>📊 Статистика</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{sensors.length}</div>
                <div className="stat-label">Всего датчиков</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{sensors.filter(s => s.isActive).length}</div>
                <div className="stat-label">Активных</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{sensors.filter(s => !s.isActive).length}</div>
                <div className="stat-label">Неактивных</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {
                    sensorTypes
                      .filter(t => t.value !== 'all')
                      .map(type => sensors.filter(s => s.type === type.value).length)
                      .filter(count => count > 0).length
                  }
                </div>
                <div className="stat-label">Типов датчиков</div>
              </div>
            </div>

            {sensors.filter(s => !s.isActive).length > 0 && (
              <div className="cleanup-section">
                <button className="danger-btn" onClick={handleCleanupInactive}>
                  🗑️ Удалить все неактивные датчики
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Правая колонка - список датчиков */}
        <div className="list-column">
          <div className="list-header">
            <h2>Список датчиков ({filteredSensors.length})</h2>

            <div className="list-controls">
              <div className="search-box">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Поиск по названию, коду или местоположению..."
                  className="search-input"
                />
                {searchTerm && (
                  <button className="clear-search" onClick={() => setSearchTerm('')}>
                    ✕
                  </button>
                )}
              </div>

              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="filter-select"
              >
                {sensorTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredSensors.length === 0 ? (
            <div className="empty-list">
              <div className="empty-icon">📡</div>
              <h3>Датчики не найдены</h3>
              <p>
                {sensors.length === 0
                  ? 'Добавьте первый датчик с помощью формы слева'
                  : 'Попробуйте изменить условия поиска или фильтрации'}
              </p>
            </div>
          ) : (
            <div className="sensors-list">
              {filteredSensors.map(sensor => (
                <div
                  key={sensor.id}
                  className={`sensor-card ${selectedSensor?.id === sensor.id ? 'selected' : ''} ${sensor.isActive ? '' : 'inactive'}`}
                  onClick={() => setSelectedSensor(sensor)}
                >
                  <div className="sensor-header">
                    <div className="sensor-icon">{getTypeIcon(sensor.type)}</div>
                    <div className="sensor-title">
                      <div className="sensor-name">{sensor.name}</div>
                      <div className="sensor-code">{sensor.code}</div>
                    </div>
                    <div className="sensor-status">
                      {sensor.isActive ? (
                        <span className="status-active">● Активен</span>
                      ) : (
                        <span className="status-inactive">○ Неактивен</span>
                      )}
                    </div>
                  </div>

                  <div className="sensor-details">
                    <div className="sensor-info">
                      <div className="info-item">
                        <span className="info-label">Тип:</span>
                        <span className="info-value">{getTypeName(sensor.type)}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Ед. изм.:</span>
                        <span className="info-value">
                          {getDisplayUnit(sensor)}
                          <span className="unit-value">
                            {getDisplayUnit(sensor) !== 'ед.' ? ` (${getDisplayUnit(sensor)})` : ''}
                          </span>
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Местоположение:</span>
                        <span className="info-value">{sensor.location || '-'}</span>
                      </div>
                    </div>

                    {sensor.description && (
                      <div className="sensor-description">{sensor.description}</div>
                    )}

                    <div className="sensor-actions">
                      <button
                        className="edit-btn"
                        onClick={e => {
                          e.stopPropagation();
                          handleEditSensor(sensor);
                        }}
                      >
                        ✏️ Редактировать
                      </button>
                      <button
                        className="delete-btn"
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteSensor(sensor.id);
                        }}
                      >
                        🗑️ Удалить
                      </button>
                    </div>

                    <div className="sensor-meta">
                      {sensor.updatedAt && (
                        <div className="meta-item">
                          Обновлен: {new Date(sensor.updatedAt).toLocaleDateString('ru-RU')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Информация о выбранном датчике */}
      {selectedSensor && (
        <div className="selected-sensor-info">
          <h3>Информация о выбранном датчике</h3>
          <div className="info-grid">
            <div className="info-item-grid">
              <strong>Код:</strong> {selectedSensor.code}
            </div>
            <div className="info-item-grid">
              <strong>Тип:</strong> {getTypeName(selectedSensor.type)}
            </div>
            <div className="info-item-grid">
              <strong>Статус:</strong> {selectedSensor.isActive ? 'Активен' : 'Неактивен'}
            </div>
            <div className="info-item-grid">
              <strong>Местоположение:</strong> {selectedSensor.location || 'Не указано'}
            </div>
            <div className="info-item-grid">
              <strong>Единицы измерения:</strong> {getDisplayUnit(selectedSensor)}
            </div>
            {selectedSensor.minValue && selectedSensor.maxValue && (
              <div className="info-item-grid">
                <strong>Диапазон:</strong> {selectedSensor.minValue} - {selectedSensor.maxValue}{' '}
                <span className="unit-value">{getDisplayUnit(selectedSensor)}</span>
              </div>
            )}
          </div>
          <div className="integration-info">
            <p>
              <strong>Использование:</strong> Этот датчик будет доступен в выпадающем списке на
              странице "Маппинг параметров и датчиков" при выборе группы "Ручной ввод"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualSensorsPage;
