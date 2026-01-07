import React, { useState, useEffect } from 'react';
import '../styles/manual-data-entry.css';

const ManualDataEntryPage = () => {
  // Состояние для хранения списка ручных датчиков
  const [manualSensors, setManualSensors] = useState([]);

  // Состояние для текущих значений ввода
  const [currentInputs, setCurrentInputs] = useState({});

  // Состояние для истории ввода
  const [entryHistory, setEntryHistory] = useState([]);

  // Состояние для фильтров
  const [filters, setFilters] = useState({
    sensorType: 'all',
    showActiveOnly: true,
  });

  // Состояние для группового ввода
  const [groupEntry, setGroupEntry] = useState({
    date: '',
    time: '',
    notes: '',
  });

  // Загрузка ручных датчиков из localStorage
  useEffect(() => {
    loadManualSensors();
    loadEntryHistory();

    // Устанавливаем текущую дату и время по умолчанию
    const now = new Date();
    setGroupEntry(prev => ({
      ...prev,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0].substring(0, 5),
    }));
  }, []);

  // Загрузка датчиков из localStorage
  const loadManualSensors = () => {
    try {
      const savedSensors = localStorage.getItem('manualSensors');
      if (savedSensors) {
        const parsedSensors = JSON.parse(savedSensors);

        // Инициализируем текущие значения ввода для каждого датчика
        const initialInputs = {};
        parsedSensors.forEach(sensor => {
          if (sensor.isActive) {
            initialInputs[sensor.id] = '';
          }
        });

        setManualSensors(parsedSensors.filter(s => s.isActive));
        setCurrentInputs(initialInputs);
      }
    } catch (error) {
      console.error('Ошибка загрузки ручных датчиков:', error);
    }
  };

  // Загрузка истории ввода из localStorage
  const loadEntryHistory = () => {
    try {
      const savedHistory = localStorage.getItem('manualDataEntryHistory');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setEntryHistory(parsedHistory);
      }
    } catch (error) {
      console.error('Ошибка загрузки истории ввода:', error);
    }
  };

  // Сохранение истории ввода в localStorage
  const saveEntryHistory = history => {
    try {
      localStorage.setItem('manualDataEntryHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Ошибка сохранения истории ввода:', error);
    }
  };

  // Фильтрация датчиков
  const getFilteredSensors = () => {
    let filtered = manualSensors;

    if (filters.sensorType !== 'all') {
      filtered = filtered.filter(sensor => sensor.type === filters.sensorType);
    }

    if (filters.showActiveOnly) {
      filtered = filtered.filter(sensor => sensor.isActive);
    }

    return filtered;
  };

  // Обработка изменения значения для конкретного датчика
  const handleValueChange = (sensorId, value) => {
    setCurrentInputs(prev => ({
      ...prev,
      [sensorId]: value,
    }));
  };

  // Сохранение значения для одного датчика
  const handleSaveSingle = sensorId => {
    const value = currentInputs[sensorId];
    const sensor = manualSensors.find(s => s.id === sensorId);

    if (!value || isNaN(parseFloat(value))) {
      alert(`Пожалуйста, введите корректное значение для датчика "${sensor.name}"`);
      return;
    }

    // Проверка диапазона значений
    const numericValue = parseFloat(value);
    if (sensor.minValue !== undefined && numericValue < sensor.minValue) {
      if (
        !confirm(
          `Значение ${numericValue} меньше минимального ${sensor.minValue}. Продолжить сохранение?`
        )
      ) {
        return;
      }
    }

    if (sensor.maxValue !== undefined && numericValue > sensor.maxValue) {
      if (
        !confirm(
          `Значение ${numericValue} больше максимального ${sensor.maxValue}. Продолжить сохранение?`
        )
      ) {
        return;
      }
    }

    // Создание записи
    const timestamp = new Date().toISOString();
    const entry = {
      id: Date.now(),
      sensorId,
      sensorName: sensor.name,
      sensorUnit: sensor.unit,
      value: numericValue,
      timestamp,
      notes: '',
      enteredBy: 'Оператор',
      date: new Date().toLocaleDateString('ru-RU'),
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };

    // Сохранение в историю
    const newHistory = [entry, ...entryHistory];
    setEntryHistory(newHistory);
    saveEntryHistory(newHistory);

    // Сохранение в хранилище данных датчика
    saveSensorData(sensorId, entry);

    // Сброс поля ввода
    setCurrentInputs(prev => ({
      ...prev,
      [sensorId]: '',
    }));

    // Уведомление
    alert(`Значение ${numericValue} ${sensor.unit} сохранено для датчика "${sensor.name}"`);
  };

  // Сохранение всех значений (групповое сохранение)
  const handleSaveAll = () => {
    if (!groupEntry.date || !groupEntry.time) {
      alert('Пожалуйста, укажите дату и время для группового сохранения');
      return;
    }

    const entries = [];
    const sensorsToSave = getFilteredSensors();

    // Проверяем, есть ли данные для сохранения
    const hasData = sensorsToSave.some(sensor => {
      const value = currentInputs[sensor.id];
      return value && !isNaN(parseFloat(value));
    });

    if (!hasData) {
      alert('Нет данных для сохранения. Введите значения для хотя бы одного датчика.');
      return;
    }

    // Создаем timestamp для группового сохранения
    const groupTimestamp = new Date(`${groupEntry.date}T${groupEntry.time}:00`).toISOString();

    // Обрабатываем каждый датчик
    sensorsToSave.forEach(sensor => {
      const value = currentInputs[sensor.id];

      if (value && !isNaN(parseFloat(value))) {
        const numericValue = parseFloat(value);

        // Проверка диапазона
        let isValid = true;
        if (sensor.minValue !== undefined && numericValue < sensor.minValue) {
          if (
            !confirm(
              `Значение ${numericValue} для датчика "${sensor.name}" меньше минимального ${sensor.minValue}. Продолжить сохранение?`
            )
          ) {
            isValid = false;
          }
        }

        if (isValid && sensor.maxValue !== undefined && numericValue > sensor.maxValue) {
          if (
            !confirm(
              `Значение ${numericValue} для датчика "${sensor.name}" больше максимального ${sensor.maxValue}. Продолжить сохранение?`
            )
          ) {
            isValid = false;
          }
        }

        if (isValid) {
          const entry = {
            id: Date.now() + sensor.id, // Уникальный ID
            sensorId: sensor.id,
            sensorName: sensor.name,
            sensorUnit: sensor.unit,
            value: numericValue,
            timestamp: groupTimestamp,
            notes: groupEntry.notes,
            enteredBy: 'Оператор',
            date: new Date(groupTimestamp).toLocaleDateString('ru-RU'),
            time: new Date(groupTimestamp).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          };

          entries.push(entry);

          // Сохраняем данные датчика
          saveSensorData(sensor.id, entry);

          // Сбрасываем поле ввода
          setCurrentInputs(prev => ({
            ...prev,
            [sensor.id]: '',
          }));
        }
      }
    });

    if (entries.length > 0) {
      // Сохраняем в историю
      const newHistory = [...entries, ...entryHistory];
      setEntryHistory(newHistory);
      saveEntryHistory(newHistory);

      alert(
        `Сохранено ${entries.length} значений для ${new Date(groupTimestamp).toLocaleDateString('ru-RU')}`
      );

      // Сброс группового ввода
      const now = new Date();
      setGroupEntry({
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0].substring(0, 5),
        notes: '',
      });
    }
  };

  // Сохранение данных в хранилище датчика
  const saveSensorData = (sensorId, entry) => {
    try {
      const sensorDataKey = `manualSensorData_${sensorId}`;
      const existingData = localStorage.getItem(sensorDataKey);
      const data = existingData ? JSON.parse(existingData) : [];

      // Добавляем новую запись
      const newData = [
        {
          timestamp: entry.timestamp,
          value: entry.value,
          notes: entry.notes,
          enteredBy: entry.enteredBy,
          entryDate: new Date().toISOString(),
        },
        ...data,
      ];

      // Сохраняем (максимум 1000 записей)
      const trimmedData = newData.slice(0, 1000);
      localStorage.setItem(sensorDataKey, JSON.stringify(trimmedData));
    } catch (error) {
      console.error('Ошибка сохранения данных датчика:', error);
    }
  };

  // Удаление записи из истории
  const handleDeleteHistoryEntry = entryId => {
    if (!window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      return;
    }

    const updatedHistory = entryHistory.filter(entry => entry.id !== entryId);
    setEntryHistory(updatedHistory);
    saveEntryHistory(updatedHistory);
  };

  // Очистка всей истории
  const handleClearHistory = () => {
    if (!window.confirm('Вы уверены, что хотите очистить всю историю ввода?')) {
      return;
    }

    setEntryHistory([]);
    saveEntryHistory([]);
    alert('История ввода очищена');
  };

  // Экспорт истории в CSV
  const handleExportHistory = () => {
    if (entryHistory.length === 0) {
      alert('Нет данных для экспорта');
      return;
    }

    const csvContent = [
      ['Дата', 'Время', 'Датчик', 'Значение', 'Единица измерения', 'Примечания', 'Внесено'].join(
        ','
      ),
      ...entryHistory.map(entry =>
        [
          entry.date,
          entry.time,
          `"${entry.sensorName}"`,
          entry.value.toFixed(4),
          entry.sensorUnit,
          `"${entry.notes || ''}"`,
          entry.enteredBy,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `manual_data_entries_${new Date().toISOString().slice(0, 10)}.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Получение типа датчика на русском
  const getSensorTypeLabel = type => {
    const types = {
      temperature: 'Температура',
      pressure: 'Давление',
      flow: 'Расход',
      level: 'Уровень',
      quality: 'Качество',
      composition: 'Состав',
      other: 'Другое',
    };
    return types[type] || type;
  };

  // Форматирование даты и времени
  const formatDateTime = dateString => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredSensors = getFilteredSensors();

  return (
    <div className="manual-data-entry-page">
      <div className="page-header">
        <h1>📝 Ручной ввод показателей локальных датчиков</h1>
        <div className="header-actions">
          <button
            className="secondary-btn"
            onClick={loadManualSensors}
            title="Обновить список датчиков"
          >
            🔄 Обновить
          </button>
          <button
            className="primary-btn"
            onClick={handleExportHistory}
            disabled={entryHistory.length === 0}
          >
            📥 Экспорт CSV
          </button>
        </div>
      </div>

      {/* Фильтры */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Тип датчика:</label>
          <select
            value={filters.sensorType}
            onChange={e => setFilters(prev => ({ ...prev, sensorType: e.target.value }))}
          >
            <option value="all">Все типы</option>
            <option value="temperature">Температура</option>
            <option value="pressure">Давление</option>
            <option value="flow">Расход</option>
            <option value="level">Уровень</option>
            <option value="quality">Качество</option>
            <option value="composition">Состав</option>
            <option value="other">Другое</option>
          </select>
        </div>

        <div className="filter-group">
          <label>
            <input
              type="checkbox"
              checked={filters.showActiveOnly}
              onChange={e => setFilters(prev => ({ ...prev, showActiveOnly: e.target.checked }))}
            />
            Только активные датчики
          </label>
        </div>

        <div className="filter-stats">
          Всего датчиков: <strong>{manualSensors.length}</strong> | Отфильтровано:{' '}
          <strong>{filteredSensors.length}</strong>
        </div>
      </div>

      {/* Групповые настройки */}
      <div className="group-entry-section">
        <h3>📅 Групповое сохранение</h3>
        <div className="group-entry-controls">
          <div className="input-group">
            <label>Дата:</label>
            <input
              type="date"
              value={groupEntry.date}
              onChange={e => setGroupEntry(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>

          <div className="input-group">
            <label>Время:</label>
            <input
              type="time"
              value={groupEntry.time}
              onChange={e => setGroupEntry(prev => ({ ...prev, time: e.target.value }))}
            />
          </div>

          <div className="input-group">
            <label>Примечания:</label>
            <input
              type="text"
              value={groupEntry.notes}
              onChange={e => setGroupEntry(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Общее примечание для всех записей"
            />
          </div>

          <button
            className="primary-btn"
            onClick={handleSaveAll}
            disabled={filteredSensors.length === 0}
          >
            💾 Сохранить все
          </button>
        </div>
      </div>

      {/* Таблица ввода данных */}
      <div className="data-entry-table-container">
        <h3>📋 Ввод значений</h3>

        {filteredSensors.length === 0 ? (
          <div className="empty-state">
            <p>
              Нет активных датчиков для отображения. Добавьте датчики на странице "Локальные
              датчики".
            </p>
          </div>
        ) : (
          <table className="data-entry-table">
            <thead>
              <tr>
                <th style={{ width: '25%' }}>Датчик</th>
                <th style={{ width: '15%' }}>Тип</th>
                <th style={{ width: '10%' }}>Ед. изм.</th>
                <th style={{ width: '15%' }}>Диапазон</th>
                <th style={{ width: '20%' }}>Значение</th>
                <th style={{ width: '15%' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredSensors.map(sensor => (
                <tr key={sensor.id}>
                  <td>
                    <div className="sensor-name">{sensor.name}</div>
                    <div className="sensor-location">
                      {sensor.location || 'Местоположение не указано'}
                    </div>
                  </td>
                  <td>
                    <span className={`sensor-type ${sensor.type}`}>
                      {getSensorTypeLabel(sensor.type)}
                    </span>
                  </td>
                  <td>
                    <span className="sensor-unit">{sensor.unit}</span>
                  </td>
                  <td>
                    <div className="sensor-range">
                      {sensor.minValue !== undefined && sensor.maxValue !== undefined ? (
                        <>
                          {sensor.minValue} ... {sensor.maxValue}
                          <div className="range-info">±{sensor.accuracy || 0.5}</div>
                        </>
                      ) : (
                        <span className="no-range">Не задан</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="value-input-container">
                      <input
                        type="number"
                        step="0.01"
                        value={currentInputs[sensor.id] || ''}
                        onChange={e => handleValueChange(sensor.id, e.target.value)}
                        placeholder="Введите значение"
                        className="value-input"
                      />
                      <span className="unit-label">{sensor.unit}</span>
                    </div>
                  </td>
                  <td>
                    <button
                      className="save-btn"
                      onClick={() => handleSaveSingle(sensor.id)}
                      disabled={
                        !currentInputs[sensor.id] || isNaN(parseFloat(currentInputs[sensor.id]))
                      }
                      title="Сохранить значение"
                    >
                      💾 Сохранить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* История ввода */}
      <div className="history-section">
        <div className="history-header">
          <h3>📜 История ввода ({entryHistory.length} записей)</h3>
          <button
            className="secondary-btn"
            onClick={handleClearHistory}
            disabled={entryHistory.length === 0}
          >
            🗑️ Очистить историю
          </button>
        </div>

        {entryHistory.length === 0 ? (
          <div className="empty-state">
            <p>
              История ввода пуста. Введите и сохраните значения датчиков, чтобы они появились здесь.
            </p>
          </div>
        ) : (
          <div className="history-table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th style={{ width: '20%' }}>Дата и время</th>
                  <th style={{ width: '25%' }}>Датчик</th>
                  <th style={{ width: '15%' }}>Значение</th>
                  <th style={{ width: '25%' }}>Примечания</th>
                  <th style={{ width: '15%' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {entryHistory.slice(0, 50).map(entry => (
                  <tr key={entry.id}>
                    <td>
                      <div className="entry-datetime">
                        <div className="entry-date">{entry.date}</div>
                        <div className="entry-time">{entry.time}</div>
                      </div>
                    </td>
                    <td>
                      <div className="entry-sensor">
                        <div className="entry-sensor-name">{entry.sensorName}</div>
                        <div className="entry-sensor-type">
                          {getSensorTypeLabel(
                            manualSensors.find(s => s.id === entry.sensorId)?.type || 'other'
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="entry-value">
                        <span className="value-number">{entry.value.toFixed(2)}</span>
                        <span className="value-unit">{entry.sensorUnit}</span>
                      </div>
                    </td>
                    <td>
                      <div className="entry-notes">
                        {entry.notes || <span className="no-notes">—</span>}
                      </div>
                    </td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteHistoryEntry(entry.id)}
                        title="Удалить запись"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {entryHistory.length > 50 && (
              <div className="history-footer">
                Показаны последние 50 записей из {entryHistory.length}. Для просмотра полной истории
                используйте экспорт CSV.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManualDataEntryPage;
