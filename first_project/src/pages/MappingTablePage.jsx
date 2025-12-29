import React, { useState, useEffect } from "react";
import "../styles/mapping-table.css";
import "../styles/modal-tree.css";
import "../styles/sensor-modal.css";
import ManualDataModal from "../components/ManualDataModal";
import ParameterModal from "../components/ParameterModal";
import SensorChartModal from "../components/SensorChartModel";

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

const GROUP_OPTIONS = [
  { value: "", label: "— выбрать группу —" },
  { value: "input", label: "Входные данные" },
  { value: "input_manual", label: "Входные данные (ручной ввод)" },
  { value: "verification", label: "Верификация и контроль" },
  { value: "verification_manual", label: "Верификация и контроль (ручной ввод)" },
  { value: "laboratory", label: "Лабораторные исследования" },
  { value: "output", label: "Выходные параметры" },
  { value: "control", label: "Управляющие параметры" }
];

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

export default function MappingTablePage({ mappingData = [], onMappingDataChange }) {
  const [parameterModalOpen, setParameterModalOpen] = useState(false);
  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [manualDataModalOpen, setManualDataModalOpen] = useState(false);
  
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [selectedRowForManual, setSelectedRowForManual] = useState(null);
  
  const mappingRows = mappingData;

  const addParameter = (parameter) => {
    const newRow = {
      id: Date.now().toString(),
      parameterId: parameter.id,
      parameterName: parameter.name,
      unit: parameter.unit,
      group: "",
      sensorId: "",
      manualData: [],
      isLaboratory: false
    };
    onMappingDataChange([...mappingRows, newRow]);
  };

  const updateRow = (rowId, field, value) => {
    onMappingDataChange(rows =>
      rows.map(row => {
        if (row.id === rowId) {
          const updatedRow = { ...row, [field]: value };
          
          updatedRow.isLaboratory = value === "laboratory";

          if (field === "group" && !isManualGroup(value) && value !== "laboratory") {
            updatedRow.manualData = [];
            if (!getSensorById(updatedRow.sensorId)?.isManual) {
              updatedRow.sensorId = "";
            }
          }
       
          if (field === "group" && value === "laboratory") {
            updatedRow.sensorId = "";
          }
          
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

  const removeRow = (rowId) => {
    onMappingDataChange(rows => rows.filter(row => row.id !== rowId));
  };

  const getAllSensors = () => {
    return SENSORS;
  };

  const getSensorById = (sensorId) => {
    return getAllSensors().find(s => s.id === sensorId);
  };

  const getFilteredSensors = (rowId, groupType) => {
    if (groupType === "laboratory") {
      return [];
    }
    
    const row = mappingRows.find(r => r.id === rowId);
    if (!row) return getAllSensors();
    
    const paramName = row.parameterName || "";
    let filteredSensors = getAllSensors();
    
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
    
    if (isManualGroup(groupType)) {
      filteredSensors = filteredSensors.filter(s => s.isManual);
    } else if (groupType && !isManualGroup(groupType) && groupType !== "laboratory") {
      filteredSensors = filteredSensors.filter(s => !s.isManual);
    }
    
    return filteredSensors;
  };

  const isManualGroup = (group) => {
    return group && (group === "input_manual" || group === "verification_manual");
  };

  const isLaboratoryGroup = (group) => {
    return group === "laboratory";
  };

  const openManualDataModal = (row) => {
    setSelectedRowForManual(row);
    setManualDataModalOpen(true);
  };

  const handleSaveManualData = (newManualData) => {
    if (!selectedRowForManual) return;
    
    updateRow(selectedRowForManual.id, "manualData", newManualData);
    
    const sensor = getSensorById(selectedRowForManual.sensorId);
    if (sensor && sensor.isManual) {
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
      unit: row.unit,
      group: row.group,
      isLaboratory: row.isLaboratory,
      sensorId: row.sensorId || null,
      manualData: row.manualData || []
    }));

    console.log("Сохранение маппинга в БД:", payload);
    alert(`Маппинг сохранён! Количество записей: ${mappingRows.length}\nЛабораторные исследования: ${mappingRows.filter(r => r.isLaboratory).length}`);
    
    localStorage.setItem('mappingData', JSON.stringify(mappingRows));
  };

  useEffect(() => {
    const savedData = localStorage.getItem('mappingData');
    if (savedData && mappingRows.length === 0) {
      try {
        const parsedData = JSON.parse(savedData);
        const updatedData = parsedData.map(row => ({
          ...row,
          isLaboratory: row.group === "laboratory"
        }));
        onMappingDataChange(updatedData);
      } catch (error) {
        console.error("Ошибка загрузки данных из localStorage:", error);
      }
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
                const sensors = getFilteredSensors(row.id, row.group);
                const selectedSensor = getSensorById(row.sensorId);
                const isManualGroupSelected = isManualGroup(row.group);
                const isLaboratoryGroupSelected = isLaboratoryGroup(row.group);
                const lastManualValue = row.manualData?.length > 0 
                  ? row.manualData[row.manualData.length - 1] 
                  : null;
                
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
                        {GROUP_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      {!row.group ? (
                        <span className="no-group">Сначала выберите группу</span>
                      ) : isLaboratoryGroupSelected ? (
                        <div className="laboratory-info">
                          <div className="laboratory-label">
                            <span className="lab-icon">🧪</span>
                            <span>Лабораторные исследования</span>
                          </div>
                          <div className="laboratory-hint">
                            Значения будут вводиться на отдельной странице лабораторных данных
                          </div>
                        </div>
                      ) : (
                        <div className="sensor-selection">
                          <select
                            value={row.sensorId}
                            onChange={e => updateRow(row.id, "sensorId", e.target.value)}
                            className="sensor-select"
                            disabled={isLaboratoryGroupSelected}
                          >
                            <option value="">— выбрать датчик —</option>
                            {sensors.map(sensor => (
                              <option key={sensor.id} value={sensor.id}>
                                {sensor.name} {sensor.isManual ? "(ручной)" : ""}
                              </option>
                            ))}
                          </select>
                          
                          {selectedSensor && !isLaboratoryGroupSelected && (
                            <div className="sensor-info-row">
                              <div className="current-value-display">
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
              Связано с датчиками: <strong>{mappingRows.filter(r => r.sensorId && !r.isLaboratory).length}</strong> |
              Ручной ввод: <strong>{mappingRows.filter(r => isManualGroup(r.group)).length}</strong> |
              Лабораторные исследования: <strong>{mappingRows.filter(r => r.isLaboratory).length}</strong>
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

      {parameterModalOpen && (
        <ParameterModal
          isOpen={parameterModalOpen}
          onClose={() => setParameterModalOpen(false)}
          onSelectParameter={addParameter}
        />
      )}


      {chartModalOpen && (
        <SensorChartModal
          isOpen={chartModalOpen}
          onClose={() => setChartModalOpen(false)}
          sensor={selectedSensor}
        />
      )}

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