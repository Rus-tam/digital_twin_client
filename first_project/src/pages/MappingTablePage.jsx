import React, { useState, useEffect } from "react";
import "../styles/mapping-table.css";
import "../styles/modal-tree.css";
import "../styles/sensor-modal.css";

/* Моковые данные для древовидной структуры */
const STM_MODEL_TREE = {
  modelId: "Модель-001",
  objectName: "Установка подготовки газа №1",
  children: [
    {
      type: "streams",
      name: "Потоки",
      children: [
        {
          id: "stream-1",
          name: "Поток 1 - Вход сырья",
          parameters: [
            { id: "stream-1-temp", name: "Температура", unit: "°C" },
            { id: "stream-1-pressure", name: "Давление", unit: "МПа" },
            { id: "stream-1-flow", name: "Массовый расход", unit: "кг/с" },
            { id: "stream-1-composition", name: "Состав", unit: "мольн.доли" },
          ]
        },
        {
          id: "stream-2",
          name: "Поток 2 - После сепарации",
          parameters: [
            { id: "stream-2-temp", name: "Температура", unit: "°C" },
            { id: "stream-2-pressure", name: "Давление", unit: "МПа" },
            { id: "stream-2-flow", name: "Массовый расход", unit: "кг/с" },
            { id: "stream-2-humidity", name: "Влажность", unit: "г/м³" },
          ]
        },
        {
          id: "stream-3",
          name: "Поток 3 - Товарный газ",
          parameters: [
            { id: "stream-3-temp", name: "Температура", unit: "°C" },
            { id: "stream-3-pressure", name: "Давление", unit: "МПа" },
            { id: "stream-3-flow", name: "Массовый расход", unit: "кг/с" },
            { id: "stream-3-quality", name: "Качество", unit: "%" },
          ]
        }
      ]
    },
    {
      type: "apparatus",
      name: "Аппараты",
      children: [
        {
          id: "sep-1",
          name: "Сепаратор С-1",
          parameters: [
            { id: "sep-1-temp", name: "Температура в аппарате", unit: "°C" },
            { id: "sep-1-pressure", name: "Давление", unit: "МПа" },
            { id: "sep-1-level", name: "Уровень жидкости", unit: "%" },
            { id: "sep-1-efficiency", name: "Эффективность сепарации", unit: "%" },
          ]
        },
        {
          id: "heat-1",
          name: "Теплообменник Т-1",
          parameters: [
            { id: "heat-1-temp-in", name: "Температура на входе", unit: "°C" },
            { id: "heat-1-temp-out", name: "Температура на выходе", unit: "°C" },
            { id: "heat-1-delta-t", name: "Перепад температур", unit: "К" },
            { id: "heat-1-duty", name: "Тепловая нагрузка", unit: "кВт" },
          ]
        },
        {
          id: "comp-1",
          name: "Компрессор К-1",
          parameters: [
            { id: "comp-1-power", name: "Потребляемая мощность", unit: "кВт" },
            { id: "comp-1-efficiency", name: "КПД", unit: "%" },
            { id: "comp-1-speed", name: "Частота вращения", unit: "об/мин" },
          ]
        }
      ]
    }
  ]
};

/* Моковые данные датчиков с текущими значениями и историей */
const SENSORS = [
  { 
    id: "T-101", 
    name: "Датчик температуры T-101", 
    type: "temperature",
    currentValue: 85.3,
    unit: "°C",
    status: "normal",
    lastUpdate: "2024-03-15 14:30:25",
    history: generateMockHistory(85, 90, 24)
  },
  { 
    id: "T-102", 
    name: "Датчик температуры T-102", 
    type: "temperature",
    currentValue: 72.1,
    unit: "°C",
    status: "warning",
    lastUpdate: "2024-03-15 14:29:50",
    history: generateMockHistory(70, 75, 24)
  },
  { 
    id: "P-201", 
    name: "Датчик давления P-201", 
    type: "pressure",
    currentValue: 15.2,
    unit: "МПа",
    status: "normal",
    lastUpdate: "2024-03-15 14:31:10",
    history: generateMockHistory(14.5, 16, 24)
  },
  { 
    id: "P-202", 
    name: "Датчик давления P-202", 
    type: "pressure",
    currentValue: 8.7,
    unit: "МПа",
    status: "normal",
    lastUpdate: "2024-03-15 14:30:45",
    history: generateMockHistory(8, 9.5, 24)
  },
  { 
    id: "F-301", 
    name: "Датчик расхода F-301", 
    type: "flow",
    currentValue: 1250.5,
    unit: "м³/ч",
    status: "normal",
    lastUpdate: "2024-03-15 14:30:15",
    history: generateMockHistory(1200, 1300, 24)
  },
  { 
    id: "F-302", 
    name: "Датчик расхода F-302", 
    type: "flow",
    currentValue: 980.3,
    unit: "м³/ч",
    status: "normal",
    lastUpdate: "2024-03-15 14:29:30",
    history: generateMockHistory(950, 1050, 24)
  },
  { 
    id: "L-401", 
    name: "Датчик уровня L-401", 
    type: "level",
    currentValue: 68.5,
    unit: "%",
    status: "warning",
    lastUpdate: "2024-03-15 14:31:30",
    history: generateMockHistory(65, 70, 24)
  },
  { 
    id: "Q-501", 
    name: "Датчик качества Q-501", 
    type: "quality",
    currentValue: 95.7,
    unit: "%",
    status: "normal",
    lastUpdate: "2024-03-15 14:30:05",
    history: generateMockHistory(94, 97, 24)
  },
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

/* Компонент модального окна с деревом параметров */
function ParameterModal({ isOpen, onClose, onSelectParameter }) {
  const [expandedNodes, setExpandedNodes] = useState([]);

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => 
      prev.includes(nodeId) 
        ? prev.filter(id => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  const handleSelectParameter = (parameter, parentPath) => {
    const paramPath = `${parentPath} - ${parameter.name}`;
    onSelectParameter({
      id: parameter.id,
      name: paramPath,
      unit: parameter.unit
    });
    onClose();
  };

  if (!isOpen) return null;

  const renderTreeNode = (node, level = 0, parentPath = "") => {
    const nodeId = node.id || node.type || `root-${node.modelId}`;
    const isExpanded = expandedNodes.includes(nodeId);
    const currentPath = parentPath 
      ? `${parentPath} > ${node.name || node.objectName}`
      : `${node.modelId} - ${node.objectName}`;

    const hasChildren = node.children || node.parameters;

    return (
      <div key={nodeId} className="tree-node">
        <div 
          className={`tree-item level-${level} ${hasChildren ? "has-children" : "parameter"}`}
          style={{ paddingLeft: `${level * 24 + 12}px` }}
          onClick={() => hasChildren && toggleNode(nodeId)}
        >
          {hasChildren && (
            <span className="expand-icon">
              {isExpanded ? "▼" : "▶"}
            </span>
          )}
          
          {!hasChildren && <span className="param-icon">⚬</span>}
          
          <span className="tree-label">
            {node.modelId && (
              <div className="model-header">
                <div className="model-id">{node.modelId}</div>
                <div className="model-object">{node.objectName}</div>
              </div>
            )}
            {!node.modelId && node.name}
          </span>

          {!hasChildren && (
            <button 
              className="select-param-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectParameter(node, parentPath);
              }}
            >
              Выбрать
            </button>
          )}
        </div>

        {isExpanded && hasChildren && (
          <div className="tree-children">
            {node.children?.map(child => renderTreeNode(child, level + 1, currentPath))}
            {node.parameters?.map(param => renderTreeNode(param, level + 1, currentPath))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-tree">
        <div className="modal-header">
          <h2>Выбор параметра из модели СТМ</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="tree-container">
          {renderTreeNode(STM_MODEL_TREE)}
        </div>

        <div className="modal-footer">
          <button className="secondary-btn" onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

/* Компонент модального окна с графиком датчика */
function SensorChartModal({ isOpen, onClose, sensor }) {
  const [timeRange, setTimeRange] = useState("24h");

  if (!isOpen || !sensor) return null;

  const formatValue = (value) => {
    return `${value} ${sensor.unit}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "normal": return "#10b981";
      case "warning": return "#f59e0b";
      case "error": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "normal": return "Норма";
      case "warning": return "Предупреждение";
      case "error": return "Авария";
      default: return "Неизвестно";
    }
  };

  const values = sensor.history.map(h => h.value);
  const maxValue = Math.max(...values) * 1.1;
  const minValue = Math.min(...values) * 0.9;

  return (
    <div className="modal-backdrop">
      <div className="modal-chart">
        <div className="modal-header">
          <h2>История данных: {sensor.name}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="sensor-info">
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Текущее значение:</span>
              <span className="info-value current-value">
                {formatValue(sensor.currentValue)}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Статус:</span>
              <span 
                className="info-value status-badge"
                style={{ backgroundColor: getStatusColor(sensor.status) + '20', color: getStatusColor(sensor.status) }}
              >
                {getStatusText(sensor.status)}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Последнее обновление:</span>
              <span className="info-value">{sensor.lastUpdate}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Тип датчика:</span>
              <span className="info-value">{sensor.type}</span>
            </div>
          </div>
        </div>

        <div className="chart-controls">
          <div className="time-range-selector">
            <button 
              className={`time-range-btn ${timeRange === "1h" ? "active" : ""}`}
              onClick={() => setTimeRange("1h")}
            >
              1 час
            </button>
            <button 
              className={`time-range-btn ${timeRange === "6h" ? "active" : ""}`}
              onClick={() => setTimeRange("6h")}
            >
              6 часов
            </button>
            <button 
              className={`time-range-btn ${timeRange === "24h" ? "active" : ""}`}
              onClick={() => setTimeRange("24h")}
            >
              24 часа
            </button>
            <button 
              className={`time-range-btn ${timeRange === "7d" ? "active" : ""}`}
              onClick={() => setTimeRange("7d")}
            >
              7 дней
            </button>
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-y-axis">
            <div className="y-max">{formatValue(maxValue.toFixed(1))}</div>
            <div className="y-min">{formatValue(minValue.toFixed(1))}</div>
          </div>
          
          <div className="chart-content">
            <div className="chart-grid">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid-line horizontal" style={{ top: `${i * 25}%` }} />
              ))}
              
              {[...Array(7)].map((_, i) => (
                <div key={i} className="grid-line vertical" style={{ left: `${i * (100/6)}%` }} />
              ))}
              
              <svg className="chart-line" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline
                  points={sensor.history.map((point, index) => 
                    `${(index / (sensor.history.length - 1)) * 100},${100 - ((point.value - minValue) / (maxValue - minValue)) * 100}`
                  ).join(' ')}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />
              </svg>
              
              {sensor.history.filter((_, i) => i % 3 === 0).map((point, index) => (
                <div
                  key={index}
                  className="data-point"
                  style={{
                    left: `${(index * 3 / (sensor.history.length - 1)) * 100}%`,
                    top: `${100 - ((point.value - minValue) / (maxValue - minValue)) * 100}%`
                  }}
                >
                  <div className="point-tooltip">
                    {new Date(point.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    <br />
                    {formatValue(point.value)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="chart-x-axis">
              {sensor.history.filter((_, i) => i % 6 === 0).map((point, index) => (
                <div key={index} className="x-tick">
                  {new Date(point.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-stats">
          <div className="stat-item">
            <span className="stat-label">Среднее:</span>
            <span className="stat-value">
              {formatValue((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2))}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Максимум:</span>
            <span className="stat-value">{formatValue(Math.max(...values).toFixed(2))}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Минимум:</span>
            <span className="stat-value">{formatValue(Math.min(...values).toFixed(2))}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Изменение (24ч):</span>
            <span className={`stat-value ${values[values.length-1] > values[0] ? "positive" : "negative"}`}>
              {values[values.length-1] > values[0] ? "+" : ""}
              {(values[values.length-1] - values[0]).toFixed(2)} {sensor.unit}
            </span>
          </div>
        </div>

        <div className="modal-footer">
          <button className="secondary-btn" onClick={onClose}>
            Закрыть
          </button>
          <button className="primary-btn">
            Экспортировать данные
          </button>
        </div>
      </div>
    </div>
  );
}

/* Основной компонент страницы маппинга */
export default function MappingTablePage({ mappingData = [], onMappingDataChange }) {
  const [parameterModalOpen, setParameterModalOpen] = useState(false);
  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState(null);

  // Используем данные из пропсов
  const mappingRows = mappingData;

  const addParameter = (parameter) => {
    const newRow = {
      id: Date.now(), // временный id
      parameterId: parameter.id,
      parameterName: parameter.name,
      unit: parameter.unit,
      group: "",
      sensorId: "",
    };
    onMappingDataChange([...mappingRows, newRow]);
  };

  const updateRow = (rowId, field, value) => {
    onMappingDataChange(rows =>
      rows.map(row =>
        row.id === rowId ? { ...row, [field]: value } : row
      )
    );
  };

  const removeRow = (rowId) => {
    onMappingDataChange(rows => rows.filter(row => row.id !== rowId));
  };

  const getFilteredSensors = (paramType) => {
    const paramName = mappingRows.find(r => r.id === paramType)?.parameterName || "";
    if (paramName.toLowerCase().includes("температур")) return SENSORS.filter(s => s.type === "temperature");
    if (paramName.toLowerCase().includes("давлен")) return SENSORS.filter(s => s.type === "pressure");
    if (paramName.toLowerCase().includes("расход")) return SENSORS.filter(s => s.type === "flow");
    if (paramName.toLowerCase().includes("уровень")) return SENSORS.filter(s => s.type === "level");
    if (paramName.toLowerCase().includes("качеств")) return SENSORS.filter(s => s.type === "quality");
    return SENSORS;
  };

  const getSensorById = (sensorId) => {
    return SENSORS.find(s => s.id === sensorId);
  };

  const openChartModal = (sensorId) => {
    const sensor = getSensorById(sensorId);
    if (sensor) {
      setSelectedSensor(sensor);
      setChartModalOpen(true);
    }
  };

  const saveMapping = () => {
    const payload = mappingRows.map(row => ({
      parameterId: row.parameterId,
      parameterName: row.parameterName,
      group: row.group,
      sensorId: row.sensorId || null,
    }));

    console.log("Сохранение маппинга в БД:", payload);
    alert(`Маппинг сохранён! Количество записей: ${mappingRows.length}`);
    
    // Также можно сохранить в localStorage для надежности
    localStorage.setItem('mappingData', JSON.stringify(mappingRows));
  };

  // Загружаем данные из localStorage при монтировании
  useEffect(() => {
    const savedData = localStorage.getItem('mappingData');
    if (savedData && mappingRows.length === 0) {
      onMappingDataChange(JSON.parse(savedData));
    }
  }, []);

  return (
    <div className="mapping-page">
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
                const sensors = getFilteredSensors(row.id);
                const selectedSensor = getSensorById(row.sensorId);
                
                return (
                  <tr key={row.id}>
                    <td>
                      <div className="parameter-name">{row.parameterName}</div>
                    </td>
                    
                    <td>
                      <div className="parameter-unit">{row.unit}</div>
                    </td>

                    <td>
                      <select
                        value={row.group}
                        onChange={e => updateRow(row.id, "group", e.target.value)}
                        className="group-select"
                      >
                        <option value="">— выбрать группу —</option>
                        <option value="input">Входные данные</option>
                        <option value="verification">Верификация и контроль</option>
                        {/* <option value="output">Выходные параметры</option>
                        <option value="control">Управляющие параметры</option> */}
                      </select>
                    </td>

                    <td>
                      {row.group && (
                        <div className="sensor-selection">
                          <select
                            value={row.sensorId}
                            onChange={e => updateRow(row.id, "sensorId", e.target.value)}
                            className="sensor-select"
                          >
                            <option value="">— выбрать датчик —</option>
                            {sensors.map(sensor => (
                              <option key={sensor.id} value={sensor.id}>
                                {sensor.name}
                              </option>
                            ))}
                          </select>
                          
                          {selectedSensor && (
                            <div className="sensor-info-row">
                              <div className="current-value-display">
                                <span className="value-label">Текущее значение:</span>
                                <span className="value-number">
                                  {selectedSensor.currentValue} {selectedSensor.unit}
                                </span>
                                <span className={`status-indicator ${selectedSensor.status}`} 
                                      title={selectedSensor.status === "normal" ? "Норма" : 
                                             selectedSensor.status === "warning" ? "Предупреждение" : "Авария"}>
                                  ●
                                </span>
                              </div>
                              <button 
                                className="chart-btn"
                                onClick={() => openChartModal(row.sensorId)}
                                title="Показать график"
                              >
                                📈
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      {!row.group && (
                        <span className="no-group">Сначала выберите группу</span>
                      )}
                    </td>

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

          <div className="summary-info">
            <div className="summary-text">
              Всего параметров: <strong>{mappingRows.length}</strong> | 
              Связано с датчиками: <strong>{mappingRows.filter(r => r.sensorId).length}</strong>
            </div>
            <div className="data-status">
              {localStorage.getItem('mappingData') ? '✅ Данные сохранены' : '⚠️ Данные не сохранены'}
            </div>
          </div>
        </>
      )}

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

      {/* Модальное окно выбора параметра */}
      <ParameterModal
        isOpen={parameterModalOpen}
        onClose={() => setParameterModalOpen(false)}
        onSelectParameter={addParameter}
      />

      {/* Модальное окно с графиком датчика */}
      <SensorChartModal
        isOpen={chartModalOpen}
        onClose={() => setChartModalOpen(false)}
        sensor={selectedSensor}
      />
    </div>
  );
}