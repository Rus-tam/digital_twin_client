import React, { useState, useEffect } from "react";
import "../styles/process-scheme.css";

const ProcessSchemePage = () => {
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [viewMode, setViewMode] = useState("overview");
  const [realTimeData, setRealTimeData] = useState({});
  const [alarms, setAlarms] = useState([]);

  // Моковые данные оборудования
  const equipmentData = [
    {
      id: "sep-101",
      name: "Сепаратор Г-1",
      type: "separator",
      location: { x: 150, y: 100 },
      status: "normal",
      parameters: [
        { name: "Давление", value: 1.2, unit: "МПа", status: "normal" },
        { name: "Температура", value: 45, unit: "°C", status: "normal" },
        { name: "Уровень", value: 65, unit: "%", status: "warning" }
      ]
    },
    {
      id: "comp-201",
      name: "Компрессор К-1",
      type: "compressor",
      location: { x: 350, y: 150 },
      status: "normal",
      parameters: [
        { name: "Обороты", value: 2850, unit: "об/мин", status: "normal" },
        { name: "Темп. нагн.", value: 85, unit: "°C", status: "warning" }
      ]
    },
    {
      id: "pump-301",
      name: "Насос Н-1",
      type: "pump",
      location: { x: 550, y: 200 },
      status: "normal",
      parameters: [
        { name: "Расход", value: 120, unit: "м³/ч", status: "normal" },
        { name: "Напор", value: 85, unit: "м", status: "normal" }
      ]
    }
  ];

  // Матричные данные для визуализации
  const processMatrix = {
    // Линии потока
    flows: [
      { id: "flow-1", from: "inlet", to: "sep-101", type: "gas_oil" },
      { id: "flow-2", from: "sep-101", to: "comp-201", type: "gas" },
      { id: "flow-3", from: "sep-101", to: "pump-301", type: "oil" }
    ],
    
    // Зоны процесса
    zones: [
      { id: "inlet", name: "Прием сырья", type: "input", equipment: [] },
      { id: "separation", name: "Сепарация", type: "process", equipment: ["sep-101"] },
      { id: "gas_treatment", name: "Обработка газа", type: "process", equipment: ["comp-201"] },
      { id: "oil_treatment", name: "Подготовка нефти", type: "process", equipment: ["pump-301"] },
      { id: "storage", name: "Хранение", type: "output", equipment: [] }
    ]
  };

  return (
    <div className="process-scheme-page">
      {/* Панель управления */}
      <div className="scheme-controls">
        <div className="view-mode-selector">
          <button 
            className={viewMode === "overview" ? "active" : ""}
            onClick={() => setViewMode("overview")}
          >
            📋 Общая схема
          </button>
          <button 
            className={viewMode === "gas" ? "active" : ""}
            onClick={() => setViewMode("gas")}
          >
            💨 Зона газа
          </button>
          <button 
            className={viewMode === "oil" ? "active" : ""}
            onClick={() => setViewMode("oil")}
          >
            🛢️ Зона нефти
          </button>
        </div>
        
        <div className="scheme-tools">
          <button className="tool-btn" title="Приблизить">🔍 +</button>
          <button className="tool-btn" title="Отдалить">🔍 -</button>
          <button className="tool-btn" title="Полный экран">📺</button>
          <button className="tool-btn" title="Печать">🖨️</button>
        </div>
      </div>

      {/* Основная схема */}
      <div className="scheme-container">
        <svg className="process-scheme" width="100%" height="600">
          {/* Линии потока */}
          {processMatrix.flows.map(flow => (
            <line
              key={flow.id}
              className={`flow-line ${flow.type}`}
              x1="100" y1="50"
              x2="700" y2="500"
              strokeWidth="2"
            />
          ))}
          
          {/* Оборудование */}
          {equipmentData.map(eq => (
            <g 
              key={eq.id}
              className={`equipment ${eq.type} ${eq.status}`}
              onClick={() => setSelectedEquipment(eq)}
              transform={`translate(${eq.location.x}, ${eq.location.y})`}
            >
              <rect width="80" height="60" rx="4" className="eq-body" />
              <text x="40" y="15" textAnchor="middle" className="eq-name">
                {eq.name}
              </text>
              
              {/* Индикатор статуса */}
              <circle cx="70" cy="10" r="4" className={`status-dot ${eq.status}`} />
            </g>
          ))}
          
          {/* Узлы */}
          <circle cx="100" cy="50" r="6" className="node input" />
          <circle cx="700" cy="500" r="6" className="node output" />
        </svg>
      </div>

      {/* Панель выбранного оборудования */}
      {selectedEquipment && (
        <div className="equipment-panel">
          <div className="panel-header">
            <h3>{selectedEquipment.name}</h3>
            <button onClick={() => setSelectedEquipment(null)}>✕</button>
          </div>
          
          <div className="equipment-status">
            <span className={`status-badge ${selectedEquipment.status}`}>
              {selectedEquipment.status === "normal" ? "Норма" : 
               selectedEquipment.status === "warning" ? "Внимание" : "Авария"}
            </span>
          </div>
          
          <div className="parameters-list">
            {selectedEquipment.parameters.map(param => (
              <div key={param.name} className="parameter-item">
                <div className="param-name">{param.name}</div>
                <div className={`param-value ${param.status}`}>
                  {param.value} {param.unit}
                </div>
                <div className="param-trend">
                  <span className="trend-icon">↗️</span>
                  +0.5%
                </div>
              </div>
            ))}
          </div>
          
          <button className="action-btn">
            📊 Показать график
          </button>
        </div>
      )}

      {/* Панель тревог */}
      <div className="alarms-panel">
        <h4>🔔 Активные тревоги ({alarms.length})</h4>
        {alarms.length === 0 ? (
          <div className="no-alarms">Нет активных тревог</div>
        ) : (
          <div className="alarms-list">
            {/* Список тревог */}
          </div>
        )}
      </div>

      {/* Легенда */}
      <div className="scheme-legend">
        <div className="legend-item">
          <div className="color-box normal"></div>
          <span>Норма</span>
        </div>
        <div className="legend-item">
          <div className="color-box warning"></div>
          <span>Внимание</span>
        </div>
        <div className="legend-item">
          <div className="color-box critical"></div>
          <span>Авария</span>
        </div>
      </div>
    </div>
  );
};

export default ProcessSchemePage;