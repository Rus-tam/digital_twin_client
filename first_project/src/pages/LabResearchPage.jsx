import React, { useState, useEffect } from "react";
import FileParserModal from "../components/FileParserModal";
import "../styles/lab-research.css";

const LabResearchPage = () => {
  const [labDataEntries, setLabDataEntries] = useState([]);
  const [labParameters, setLabParameters] = useState([]);
  const [fileParserModalOpen, setFileParserModalOpen] = useState(false);
  const [manualEntryModalOpen, setManualEntryModalOpen] = useState(false);
  const [selectedParameter, setSelectedParameter] = useState(null);
  const [loading, setLoading] = useState(true);

  // Загрузка лабораторных параметров из MappingTablePage
  useEffect(() => {
    const loadLabParameters = () => {
      setLoading(true);
      try {
        const savedMapping = localStorage.getItem('mappingData');
        if (savedMapping) {
          const mappingData = JSON.parse(savedMapping);
          
          const labParams = mappingData.filter(row => 
            row.group === "laboratory" && row.parameterName
          ).map(row => ({
            id: row.parameterId || row.id,
            parameterName: row.parameterName,
            unit: row.unit || "",
            group: row.group,
            isLaboratory: true
          }));
          
          setLabParameters(labParams);
          
          const savedLabData = localStorage.getItem('labResearchData');
          if (savedLabData) {
            const labData = JSON.parse(savedLabData);
            setLabDataEntries(labData);
          }
        }
      } catch (error) {
        console.error("Ошибка загрузки лабораторных параметров:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLabParameters();
    
    const handleStorageChange = () => {
      loadLabParameters();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (labDataEntries.length > 0) {
      localStorage.setItem('labResearchData', JSON.stringify(labDataEntries));
    } else {
      localStorage.removeItem('labResearchData');
    }
  }, [labDataEntries]);

  const getLabDataForParameter = (parameterId) => {
    return labDataEntries.find(entry => entry.parameterId === parameterId);
  };

  const createOrUpdateLabData = (parameterId, data) => {
    const existingEntry = getLabDataForParameter(parameterId);
    const parameter = labParameters.find(p => p.id === parameterId);
    
    if (existingEntry) {
      setLabDataEntries(prev => prev.map(entry => 
        entry.parameterId === parameterId 
          ? { 
              ...entry, 
              ...data, 
              parameterName: parameter?.parameterName || entry.parameterName,
              unit: parameter?.unit || entry.unit,
              updatedAt: new Date().toISOString(),
              updatedAtFormatted: new Date().toLocaleDateString('ru-RU')
            }
          : entry
      ));
    } else {
      const newEntry = {
        id: Date.now().toString(),
        parameterId,
        parameterName: parameter?.parameterName || "",
        unit: parameter?.unit || "",
        ...data,
        createdAt: new Date().toISOString(),
        createdAtFormatted: new Date().toLocaleDateString('ru-RU'),
        updatedAt: new Date().toISOString(),
        updatedAtFormatted: new Date().toLocaleDateString('ru-RU')
      };
      
      setLabDataEntries(prev => [...prev, newEntry]);
    }
  };

  const handleParseFile = (parsedData) => {
    if (!selectedParameter) return;
    
    createOrUpdateLabData(selectedParameter.id, {
      value: parsedData.value,
      unit: parsedData.unit,
      source: "file",
      fileName: parsedData.fileName,
      analysisDate: parsedData.analysisDate || new Date().toISOString(),
      analysisDateFormatted: parsedData.analysisDate ? 
        new Date(parsedData.analysisDate).toLocaleDateString('ru-RU') : 
        new Date().toLocaleDateString('ru-RU'),
      labName: parsedData.labName || "Лаборатория",
      method: parsedData.method || "Анализ",
      notes: parsedData.notes || ""
    });
    
    setFileParserModalOpen(false);
    setSelectedParameter(null);
  };

  const handleSaveManualEntry = (data) => {
    if (!selectedParameter) return;
    
    createOrUpdateLabData(selectedParameter.id, {
      value: data.value,
      unit: data.unit,
      source: "manual",
      analysisDate: data.analysisDate || new Date().toISOString(),
      analysisDateFormatted: data.analysisDate ? 
        new Date(data.analysisDate).toLocaleDateString('ru-RU') : 
        new Date().toLocaleDateString('ru-RU'),
      labName: data.labName || "",
      method: data.method || "",
      notes: data.notes || "",
      analyst: data.analyst || ""
    });
    
    setManualEntryModalOpen(false);
    setSelectedParameter(null);
  };

  const handleDeleteLabData = (parameterId) => {
    if (window.confirm("Вы уверены, что хотите удалить результаты для этого параметра?")) {
      setLabDataEntries(prev => prev.filter(entry => entry.parameterId !== parameterId));
    }
  };

  const openManualEntryModal = (parameter) => {
    const existingData = getLabDataForParameter(parameter.id);
    if (existingData) {
      if (window.confirm(`Для параметра "${parameter.parameterName}" уже есть результат (${existingData.value} ${existingData.unit}). Хотите изменить его?`)) {
        setSelectedParameter(parameter);
        setManualEntryModalOpen(true);
      }
    } else {
      setSelectedParameter(parameter);
      setManualEntryModalOpen(true);
    }
  };

  const openFileParserModal = (parameter) => {
    setSelectedParameter(parameter);
    setFileParserModalOpen(true);
  };

  const refreshParameters = () => {
    const savedMapping = localStorage.getItem('mappingData');
    if (savedMapping) {
      const mappingData = JSON.parse(savedMapping);
      const labParams = mappingData.filter(row => 
        row.group === "laboratory" && row.parameterName
      ).map(row => ({
        id: row.parameterId || row.id,
        parameterName: row.parameterName,
        unit: row.unit || "",
        group: row.group,
        isLaboratory: true
      }));
      
      setLabParameters(labParams);
      alert(`Загружено ${labParams.length} лабораторных параметров`);
    } else {
      alert("Нет данных маппинга. Сначала создайте лабораторные параметры на странице маппинга.");
    }
  };

  if (loading) {
    return (
      <div className="lab-research-page loading">
        <div className="loading-spinner">⏳</div>
        <p>Загрузка лабораторных параметров...</p>
      </div>
    );
  }

  return (
    <div className="lab-research-page">
      <div className="lab-research-header">
        <h1>Ввод результатов лабораторных исследований</h1>
        <div className="lab-actions">
          <button
            className="secondary-btn"
            onClick={refreshParameters}
          >
            🔄 Обновить список параметров
          </button>
        </div>
      </div>

      <div className="lab-data-table-container">
        {labParameters.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🧪</div>
            <h3>Нет параметров для лабораторных исследований</h3>
            <p>
              Для отображения параметров на этой странице необходимо 
              пометить их как "Лабораторные исследования" на странице маппинга
            </p>
            <button
              className="primary-btn"
              onClick={refreshParameters}
              style={{ marginTop: "16px" }}
            >
              Проверить наличие параметров
            </button>
          </div>
        ) : (
          <>
            <div className="table-header">
              <h2>Результаты лабораторных исследований ({labParameters.length})</h2>
              <div className="table-subtitle">
                {labDataEntries.length > 0 
                  ? `Заполнено: ${labDataEntries.length} из ${labParameters.length}` 
                  : "Данные не введены"}
              </div>
            </div>
            
            <div className="table-wrapper">
              <table className="lab-data-table">
                <thead>
                  <tr>
                    <th>Параметр расчетной схемы</th>
                    <th>Ед. изм.</th>
                    <th>Результат</th>
                    <th>Информация об анализе</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {labParameters.map(parameter => {
                    const labData = getLabDataForParameter(parameter.id);
                    
                    return (
                      <tr key={parameter.id} className="lab-data-row">
                        <td>
                          <div className="parameter-info">
                            <div className="parameter-name">{parameter.parameterName}</div>
                            <div className="parameter-id">ID: {parameter.id}</div>
                          </div>
                        </td>
                        
                        <td>
                          <div className="parameter-unit">{parameter.unit || "-"}</div>
                        </td>
                        
                        <td>
                          {labData ? (
                            <div className="lab-result">
                              <div className="result-value">
                                {labData.value} {labData.unit || parameter.unit}
                              </div>
                              <div className="result-source">
                                {labData.source === "file" ? "📄 Файл" : "✍️ Ручной"}
                              </div>
                            </div>
                          ) : (
                            <span className="no-data">—</span>
                          )}
                        </td>
                        
                        <td>
                          {labData ? (
                            <div className="analysis-info">
                              <div className="analysis-date">
                                Дата: {labData.analysisDateFormatted || labData.updatedAtFormatted}
                              </div>
                              {labData.labName && (
                                <div className="lab-name">{labData.labName}</div>
                              )}
                              {labData.method && (
                                <div className="method">{labData.method}</div>
                              )}
                            </div>
                          ) : (
                            <span className="no-data">—</span>
                          )}
                        </td>
                        
                        <td>
                          <div className="lab-actions-buttons">
                            <button
                              className="manual-btn btn-sm"
                              onClick={() => openManualEntryModal(parameter)}
                              title="Ввести результат вручную"
                            >
                              ✍️ Вручную
                            </button>
                            
                            <button
                              className="file-btn btn-sm"
                              onClick={() => openFileParserModal(parameter)}
                              title="Загрузить из файла"
                            >
                              📁 Из файла
                            </button>
                            
                            {labData && (
                              <button
                                className="remove-btn btn-sm"
                                onClick={() => handleDeleteLabData(parameter.id)}
                                title="Удалить результаты"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {labParameters.length > 0 && (
        <div className="summary-info">
          <div className="summary-text">
            Всего параметров: <strong>{labParameters.length}</strong> | 
            С результатами: <strong>{labDataEntries.length}</strong> |
            Из файлов: <strong>{labDataEntries.filter(d => d.source === "file").length}</strong> |
            Ручной ввод: <strong>{labDataEntries.filter(d => d.source === "manual").length}</strong>
          </div>
          <div className="data-status">
            {labDataEntries.length > 0 ? '✅ Данные сохранены' : '⚠️ Данные не введены'}
          </div>
        </div>
      )}

      {fileParserModalOpen && (
        <FileParserModal
          isOpen={fileParserModalOpen}
          onClose={() => {
            setFileParserModalOpen(false);
            setSelectedParameter(null);
          }}
          onParse={handleParseFile}
          selectedParameter={selectedParameter}
        />
      )}

      {manualEntryModalOpen && (
        <ManualEntryModal
          isOpen={manualEntryModalOpen}
          onClose={() => {
            setManualEntryModalOpen(false);
            setSelectedParameter(null);
          }}
          onSave={handleSaveManualEntry}
          parameter={selectedParameter}
          existingData={selectedParameter ? getLabDataForParameter(selectedParameter.id) : null}
        />
      )}
    </div>
  );
};

const ManualEntryModal = ({ isOpen, onClose, onSave, parameter, existingData }) => {
  const [formData, setFormData] = useState({
    value: existingData?.value || "",
    unit: existingData?.unit || parameter?.unit || "",
    analysisDate: existingData?.analysisDate?.split('T')[0] || new Date().toISOString().split('T')[0],
    labName: existingData?.labName || "",
    method: existingData?.method || "",
    analyst: existingData?.analyst || "",
    notes: existingData?.notes || ""
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.value || formData.value.trim() === "") {
      alert("Пожалуйста, введите значение");
      return;
    }

    onSave(formData);
  };

  if (!isOpen || !parameter) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal lab-modal">
        <div className="modal-header">
          <h2>
            {existingData ? "Редактирование результата" : "Ввод лабораторного результата"}
          </h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          <div className="parameter-display">
            <div className="param-label">Параметр:</div>
            <div className="param-name">{parameter.parameterName}</div>
            <div className="param-id">ID: {parameter.id}</div>
          </div>

          <div className="form-group">
            <label className="form-label required">Значение</label>
            <div className="value-input-group">
              <input
                type="text"
                value={formData.value}
                onChange={(e) => handleChange("value", e.target.value)}
                className="form-input"
                placeholder="Введите значение..."
              />
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => handleChange("unit", e.target.value)}
                className="form-input unit-input"
                placeholder="Ед. изм."
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Дата анализа</label>
            <input
              type="date"
              value={formData.analysisDate}
              onChange={(e) => handleChange("analysisDate", e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Лаборатория</label>
            <input
              type="text"
              value={formData.labName}
              onChange={(e) => handleChange("labName", e.target.value)}
              className="form-input"
              placeholder="Название лаборатории"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Метод анализа</label>
            <input
              type="text"
              value={formData.method}
              onChange={(e) => handleChange("method", e.target.value)}
              className="form-input"
              placeholder="Метод анализа (ГОСТ, ASTM и т.д.)"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Аналитик</label>
            <input
              type="text"
              value={formData.analyst}
              onChange={(e) => handleChange("analyst", e.target.value)}
              className="form-input"
              placeholder="ФИО аналитика"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Примечания</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="form-input"
              rows="3"
              placeholder="Дополнительная информация..."
            />
          </div>

          <div className="modal-actions">
            <button className="secondary-btn" onClick={onClose}>
              Отмена
            </button>
            <button className="primary-btn" onClick={handleSubmit}>
              {existingData ? "Обновить" : "Сохранить"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabResearchPage;