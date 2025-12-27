import React, { useState, useEffect } from "react";
import "../styles/mapping-table.css";
import "../styles/modal-tree.css";
import "../styles/sensor-modal.css";
import ManualDataModal from "../components/ManualDataModal";
import ParameterModal from "../components/ParameterModal";
import SensorChartModal from "../components/SensorChartModel";

/* Моковые данные датчиков */
const SENSORS = [
  { 
    id: "T-101", 
    name: "Датчик температуры T-101", 
    type: "temperature",
    currentValue: 85.3,
    unit: "°C",
    status: "normal",
    lastUpdate: "2024-03-15 14:30:25",
    history: generateMockHistory(85, 90, 24),
    isManual: false
  },
  { 
    id: "T-102", 
    name: "Датчик температуры T-102", 
    type: "temperature",
    currentValue: 72.1,
    unit: "°C",
    status: "warning",
    lastUpdate: "2024-03-15 14:29:50",
    history: generateMockHistory(70, 75, 24),
    isManual: false
  },
  { 
    id: "P-201", 
    name: "Датчик давления P-201", 
    type: "pressure",
    currentValue: 15.2,
    unit: "МПа",
    status: "normal",
    lastUpdate: "2024-03-15 14:31:10",
    history: generateMockHistory(14.5, 16, 24),
    isManual: false
  },
  { 
    id: "manual-temp-001", 
    name: "Термометр ручной №1", 
    type: "temperature",
    currentValue: null,
    unit: "°C",
    status: "inactive",
    lastUpdate: null,
    history: [],
    isManual: true,
    manualData: []
  },
  { 
    id: "manual-pressure-001", 
    name: "Манометр ручной №1", 
    type: "pressure",
    currentValue: null,
    unit: "МПа",
    status: "inactive",
    lastUpdate: null,
    history: [],
    isManual: true,
    manualData: []
  },
  { 
    id: "manual-flow-001", 
    name: "Расходомер ручной №1", 
    type: "flow",
    currentValue: null,
    unit: "м³/ч",
    status: "inactive",
    lastUpdate: null,
    history: [],
    isManual: true,
    manualData: []
  }
];

/* Группы для выбора */
const GROUP_OPTIONS = [
  { value: "", label: "— выбрать группу —" },
  { value: "input", label: "Входные данные" },
  { value: "input_manual", label: "Входные данные (ручной ввод)" },
  { value: "verification", label: "Верификация и контроль" },
  { value: "verification_manual", label: "Верификация и контроль (ручной ввод)" },
  { value: "output", label: "Выходные параметры" },
  { value: "control", label: "Управляющие параметры" }
];

/* Функция генерации моковых исторических данных */
function generateMockHistory(min, max, points) {
  return Array.from({ length: points }, (_, i) => {
    const timestamp = new Date();
    timestamp.setHours(timestamp.getHours() - (points - i - 1));
    
    const base = min + (max - min) * (i / points);
    const randomDeviation = (Math.random() - 0.5) * (max - min) * 0.1;
    const value = Math.max(min, Math.min(max, base + randomDeviation));
    
    return {
      timestamp: timestamp.toISOString(),
      value: parseFloat(value.toFixed(2))
    };
  });
}

/* Основной компонент страницы маппинга */
export default function MappingTablePage({ mappingData = [], onMappingDataChange }) {
  // Состояния для модальных окон
  const [parameterModalOpen, setParameterModalOpen] = useState(false);
  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [manualDataModalOpen, setManualDataModalOpen] = useState(false);
  
  // Состояния для выбранных элементов
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [selectedRowForManual, setSelectedRowForManual] = useState(null);
  
  // Используем данные из пропсов
  const mappingRows = mappingData;

  /* === ФУНКЦИИ ДЛЯ РАБОТЫ С ДАННЫМИ === */

  // Добавление нового параметра
  const addParameter = (parameter) => {
    const newRow = {
      id: Date.now().toString(),
      parameterId: parameter.id,
      parameterName: parameter.name,
      unit: parameter.unit,
      group: "",
      sensorId: "",
      manualData: []
    };
    onMappingDataChange([...mappingRows, newRow]);
  };

  // Обновление строки
  const updateRow = (rowId, field, value) => {
    onMappingDataChange(rows =>
      rows.map(row => {
        if (row.id === rowId) {
          const updatedRow = { ...row, [field]: value };
          
          // Если изменилась группа на не-ручной ввод, сбрасываем ручные данные
          if (field === "group" && !isManualGroup(value)) {
            updatedRow.manualData = [];
            if (!getSensorById(updatedRow.sensorId)?.isManual) {
              updatedRow.sensorId = "";
            }
          }
          
          // Если изменился сенсор, обновляем данные
          if (field === "sensorId" && value) {
            const sensor = getSensorById(value);
            if (sensor?.isManual && sensor.manualData) {
              updatedRow.manualData = [...sensor.manualData];
            }
          }
          
          return updatedRow;
        }
        return row;
      })
    );
  };

  // Удаление строки
  const removeRow = (rowId) => {
    onMappingDataChange(rows => rows.filter(row => row.id !== rowId));
  };

  /* === ФУНКЦИИ ДЛЯ РАБОТЫ С ДАТЧИКАМИ === */

  // Получение всех датчиков
  const getAllSensors = () => {
    return SENSORS;
  };

  // Получение датчика по ID
  const getSensorById = (sensorId) => {
    return getAllSensors().find(s => s.id === sensorId);
  };

  // Фильтрация датчиков по типу и группе
  const getFilteredSensors = (rowId, groupType) => {
    const row = mappingRows.find(r => r.id === rowId);
    if (!row) return getAllSensors();
    
    const paramName = row.parameterName || "";
    let filteredSensors = getAllSensors();
    
    // Фильтрация по типу датчика
    if (paramName.toLowerCase().includes("температур")) {
      filteredSensors = filteredSensors.filter(s => s.type === "temperature");
    } else if (paramName.toLowerCase().includes("давлен")) {
      filteredSensors = filteredSensors.filter(s => s.type === "pressure");
    } else if (paramName.toLowerCase().includes("расход")) {
      filteredSensors = filteredSensors.filter(s => s.type === "flow");
    } else if (paramName.toLowerCase().includes("уровень")) {
      filteredSensors = filteredSensors.filter(s => s.type === "level");
    } else if (paramName.toLowerCase().includes("качеств")) {
      filteredSensors = filteredSensors.filter(s => s.type === "quality");
    }
    
    // Фильтрация по типу ввода для группы
    if (isManualGroup(groupType)) {
      filteredSensors = filteredSensors.filter(s => s.isManual);
    } else if (groupType && !isManualGroup(groupType)) {
      filteredSensors = filteredSensors.filter(s => !s.isManual);
    }
    
    return filteredSensors;
  };

  /* === ФУНКЦИИ ДЛЯ РАБОТЫ С РУЧНЫМ ВВОДОМ === */

  // Проверка, является ли группа ручным вводом
  const isManualGroup = (group) => {
    return group && (group === "input_manual" || group === "verification_manual");
  };

  // Открытие модального окна ручного ввода
  const openManualDataModal = (row) => {
    setSelectedRowForManual(row);
    setManualDataModalOpen(true);
  };

  // Сохранение ручных данных
  const handleSaveManualData = (newManualData) => {
    if (!selectedRowForManual) return;
    
    // Обновляем данные в строке
    updateRow(selectedRowForManual.id, "manualData", newManualData);
    
    // Обновляем данные в сенсоре
    const sensor = getSensorById(selectedRowForManual.sensorId);
    if (sensor && sensor.isManual) {
      // Обновляем глобальные данные датчика
      const sensorIndex = SENSORS.findIndex(s => s.id === sensor.id);
      if (sensorIndex !== -1) {
        SENSORS[sensorIndex] = {
          ...SENSORS[sensorIndex],
          manualData: newManualData,
          currentValue: newManualData.length > 0 ? newManualData[newManualData.length - 1].value : null,
          lastUpdate: newManualData.length > 0 ? newManualData[newManualData.length - 1].timestamp : null
        };
      }
    }
    
    setManualDataModalOpen(false);
    setSelectedRowForManual(null);
  };

  /* === ФУНКЦИИ ДЛЯ РАБОТЫ С ГРАФИКОМ === */

  // Открытие модального окна графика
  const openChartModal = (sensorId) => {
    const sensor = getSensorById(sensorId);
    if (sensor) {
      setSelectedSensor(sensor);
      setChartModalOpen(true);
    }
  };

  /* === ФУНКЦИИ ДЛЯ СОХРАНЕНИЯ === */

  // Сохранение маппинга
  const saveMapping = () => {
    const payload = mappingRows.map(row => ({
      parameterId: row.parameterId,
      parameterName: row.parameterName,
      group: row.group,
      sensorId: row.sensorId || null,
      manualData: row.manualData || []
    }));

    console.log("Сохранение маппинга в БД:", payload);
    alert(`Маппинг сохранён! Количество записей: ${mappingRows.length}`);
    
    localStorage.setItem('mappingData', JSON.stringify(mappingRows));
  };

  // Загрузка данных из localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('mappingData');
    if (savedData && mappingRows.length === 0) {
      try {
        onMappingDataChange(JSON.parse(savedData));
      } catch (error) {
        console.error("Ошибка загрузки данных из localStorage:", error);
      }
    }
  }, []);

  /* === РЕНДЕРИНГ === */

  return (
    <div className="mapping-page">
      {/* Заголовок страницы */}
      <div className="page-header">
        <h1>Маппинг параметров и датчиков</h1>
        <div className="header-actions">
          <button
            className="secondary-btn"
            onClick={() => {
              localStorage.setItem('mappingData', JSON.stringify(mappingRows));
              alert('Данные сохранены в localStorage');
            }}
          >
            💾 Сохранить локально
          </button>
          <button
            className="primary-btn"
            onClick={() => setParameterModalOpen(true)}
          >
            + Добавить параметр
          </button>
        </div>
      </div>

      {/* Основная таблица */}
      {mappingRows.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>Таблица маппинга пуста</h3>
          <p>Добавьте параметры из модели СТМ, используя кнопку "Добавить параметр"</p>
        </div>
      ) : (
        <>
          <table className="mapping-table">
            <thead>
              <tr>
                <th>Параметр расчетной схемы</th>
                <th>Единица измерения</th>
                <th>Группа</th>
                <th>Датчик объекта подготовки</th>
                <th>Действия</th>
              </tr>
            </thead>

            <tbody>
              {mappingRows.map(row => {
                const sensors = getFilteredSensors(row.id, row.group);
                const selectedSensor = getSensorById(row.sensorId);
                const isManualGroupSelected = isManualGroup(row.group);
                const lastManualValue = row.manualData?.length > 0 
                  ? row.manualData[row.manualData.length - 1] 
                  : null;
                
                return (
                  <tr key={row.id}>
                    {/* Колонка 1: Параметр */}
                    <td>
                      <div className="parameter-name">{row.parameterName}</div>
                    </td>
                    
                    {/* Колонка 2: Единица измерения */}
                    <td>
                      <div className="parameter-unit">{row.unit}</div>
                    </td>

                    {/* Колонка 3: Группа */}
                    <td>
                      <select
                        value={row.group}
                        onChange={e => updateRow(row.id, "group", e.target.value)}
                        className="group-select"
                      >
                        {GROUP_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Колонка 4: Датчик */}
                    <td>
                      {row.group ? (
                        <div className="sensor-selection">
                          <select
                            value={row.sensorId}
                            onChange={e => updateRow(row.id, "sensorId", e.target.value)}
                            className="sensor-select"
                          >
                            <option value="">— выбрать датчик —</option>
                            {sensors.map(sensor => (
                              <option key={sensor.id} value={sensor.id}>
                                {sensor.name} {sensor.isManual ? "(ручной)" : ""}
                              </option>
                            ))}
                          </select>
                          
                          {selectedSensor && (
                            <div className="sensor-info-row">
                              <div className="current-value-display">
                                {/* Отображение значения в зависимости от типа */}
                                {isManualGroupSelected ? (
                                  <>
                                    <span className="value-label">Последнее значение:</span>
                                    {lastManualValue ? (
                                      <>
                                        <span className="value-number">
                                          {lastManualValue.value} {selectedSensor.unit}
                                        </span>
                                        <span className="value-label" style={{ marginLeft: "8px" }}>
                                          ({new Date(lastManualValue.timestamp).toLocaleDateString('ru-RU')})
                                        </span>
                                      </>
                                    ) : (
                                      <span className="no-data">Нет данных</span>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <span className="value-label">Текущее значение:</span>
                                    <span className="value-number">
                                      {selectedSensor.currentValue} {selectedSensor.unit}
                                    </span>
                                    <span className={`status-indicator ${selectedSensor.status}`} 
                                          title={selectedSensor.status === "normal" ? "Норма" : 
                                                 selectedSensor.status === "warning" ? "Предупреждение" : "Авария"}>
                                      ●
                                    </span>
                                  </>
                                )}
                              </div>
                              
                              {/* Кнопки действий */}
                              <div className="action-buttons">
                                {isManualGroupSelected && (
                                  <button 
                                    className="manual-input-btn"
                                    onClick={() => openManualDataModal(row)}
                                    title="Ввести данные вручную"
                                  >
                                    📝
                                  </button>
                                )}
                                
                                <button 
                                  className="chart-btn"
                                  onClick={() => openChartModal(row.sensorId)}
                                  title="Показать график"
                                >
                                  📈
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="no-group">Сначала выберите группу</span>
                      )}
                    </td>

                    {/* Колонка 5: Действия */}
                    <td>
                      <button
                        className="remove-btn"
                        onClick={() => removeRow(row.id)}
                        title="Удалить параметр"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Сводная информация */}
          <div className="summary-info">
            <div className="summary-text">
              Всего параметров: <strong>{mappingRows.length}</strong> | 
              Связано с датчиками: <strong>{mappingRows.filter(r => r.sensorId).length}</strong> |
              Ручной ввод: <strong>{mappingRows.filter(r => isManualGroup(r.group)).length}</strong>
            </div>
            <div className="data-status">
              {localStorage.getItem('mappingData') ? '✅ Данные сохранены' : '⚠️ Данные не сохранены'}
            </div>
          </div>
        </>
      )}

      {/* Кнопки действий внизу страницы */}
      {mappingRows.length > 0 && (
        <div className="actions">
          <button 
            className="secondary-btn" 
            onClick={() => {
              if (window.confirm('Вы уверены, что хотите очистить всю таблицу?')) {
                onMappingDataChange([]);
                localStorage.removeItem('mappingData');
              }
            }}
          >
            Очистить таблицу
          </button>
          <button className="primary-btn" onClick={saveMapping}>
            Сохранить маппинг в БД
          </button>
        </div>
      )}

      {/* Модальные окна */}
      
      {/* Окно выбора параметра */}
      {parameterModalOpen && (
        <ParameterModal
          isOpen={parameterModalOpen}
          onClose={() => setParameterModalOpen(false)}
          onSelectParameter={addParameter}
        />
      )}

      {/* Окно графика датчика */}
      {chartModalOpen && (
        <SensorChartModal
          isOpen={chartModalOpen}
          onClose={() => setChartModalOpen(false)}
          sensor={selectedSensor}
        />
      )}

      {/* Окно ручного ввода данных */}
      {manualDataModalOpen && (
        <ManualDataModal
          isOpen={manualDataModalOpen}
          onClose={() => {
            setManualDataModalOpen(false);
            setSelectedRowForManual(null);
          }}
          onSave={handleSaveManualData}
          row={selectedRowForManual}
          sensor={selectedRowForManual ? getSensorById(selectedRowForManual.sensorId) : null}
          existingData={selectedRowForManual ? selectedRowForManual.manualData : []}
        />
      )}
    </div>
  );
}