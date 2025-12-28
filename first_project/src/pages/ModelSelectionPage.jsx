import React, { useState, useEffect } from "react";
import ModelModal from "../components/ModelModal";
import "../styles/model-page.css";

export default function ModelSelectionPage({ onModelSelect, selectedModel }) {
  const [models, setModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Ключ для localStorage
  const STORAGE_KEY = "digital_twin_models";

  // Загрузка моделей из localStorage при монтировании
  useEffect(() => {
    const savedModels = localStorage.getItem(STORAGE_KEY);
    if (savedModels) {
      try {
        const parsedModels = JSON.parse(savedModels);
        setModels(parsedModels);
        
        // Если есть выбранная модель, восстанавливаем ее
        const savedSelectedModel = localStorage.getItem(`${STORAGE_KEY}_selected`);
        if (savedSelectedModel) {
          const parsedSelected = JSON.parse(savedSelectedModel);
          setSelectedModelId(parsedSelected.id);
          onModelSelect(parsedSelected);
        }
      } catch (error) {
        console.error("Ошибка загрузки моделей из localStorage:", error);
        // Если ошибка, очищаем localStorage
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(`${STORAGE_KEY}_selected`);
      }
    }
  }, []);

  // Сохранение моделей в localStorage при изменении
  useEffect(() => {
    if (models.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(models));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [models]);

  // Сохранение выбранной модели в localStorage
  useEffect(() => {
    if (selectedModelId) {
      const selectedModel = models.find(model => model.id === selectedModelId);
      if (selectedModel) {
        localStorage.setItem(`${STORAGE_KEY}_selected`, JSON.stringify(selectedModel));
      }
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_selected`);
    }
  }, [selectedModelId, models]);

  const handleSaveModel = (model) => {
    const newModel = {
      ...model,
      id: Date.now().toString(), // Уникальный ID
      engineLabel: model.engine === "stm" ? "СТМ" : "ЭРА:ИСКРА",
      createdAt: new Date().toLocaleDateString('ru-RU'),
      createdAtFull: new Date().toISOString()
    };
    
    setModels((prev) => [...prev, newModel]);
  };

  const handleDeleteModel = (modelId, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    // Если модель выбрана, снимаем выбор
    if (selectedModelId === modelId) {
      setSelectedModelId(null);
      onModelSelect(null);
    }
    
    setModels(prev => prev.filter(model => model.id !== modelId));
  };

  const handleSelectModel = (model, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    setSelectedModelId(model.id);
    onModelSelect(model);
  };

  const confirmDeleteModel = (modelId, modelName, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    if (window.confirm(`Вы уверены, что хотите удалить модель "${modelName}"?`)) {
      handleDeleteModel(modelId);
    }
  };

  const getEngineBadgeClass = (engine) => {
    return engine === "stm" ? "engine-badge stm" : "engine-badge era";
  };

  // Очистка всех моделей
  const handleClearAllModels = () => {
    if (window.confirm("Вы уверены, что хотите удалить все модели?")) {
      setModels([]);
      setSelectedModelId(null);
      onModelSelect(null);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(`${STORAGE_KEY}_selected`);
    }
  };

  return (
    <div className="page">
      {/* Заголовок страницы */}
      <div className="page-header">
        <h1>Расчетные модели цифрового двойника</h1>
        <div className="header-actions" style={{ display: "flex", gap: "8px" }}>
          {models.length > 0 && (
            <button
              className="secondary-btn"
              onClick={handleClearAllModels}
              title="Удалить все модели"
            >
              🗑️ Очистить все
            </button>
          )}
          <button
            className="primary-btn"
            onClick={() => setModalOpen(true)}
          >
            Загрузить модель
          </button>
        </div>
      </div>

      {/* Информация о выбранной модели */}
      {selectedModel && (
        <div className="selected-info">
          Текущая модель:
          <strong> {selectedModel.modelId}</strong> —{" "}
          {selectedModel.objectName} ({selectedModel.engineLabel})
          <div style={{ 
            fontSize: "11px", 
            color: "var(--text-tertiary)", 
            marginTop: "4px",
            fontStyle: "italic"
          }}>
            Модели сохраняются автоматически
          </div>
        </div>
      )}

      {/* Список моделей */}
      <div className="model-list">
        {models.length === 0 ? (
          <div style={{ 
            color: "#666", 
            fontSize: 13, 
            padding: "var(--spacing-lg)",
            textAlign: "center",
            backgroundColor: "white",
            border: "1px dashed var(--border-color)",
            borderRadius: "var(--border-radius)"
          }}>
            Загруженные модели отсутствуют. Нажмите "Загрузить модель" для добавления.
          </div>
        ) : (
          <>
            {models.map((model) => (
              <div
                key={model.id}
                className={`model-card ${
                  selectedModelId === model.id ? "active" : ""
                }`}
                onClick={() => handleSelectModel(model)}
                style={{ cursor: "pointer" }}
              >
                <div className="model-data">
                  <div>
                    <b>ID модели:</b> {model.modelId}
                    <span className={getEngineBadgeClass(model.engine)}>
                      {model.engineLabel}
                    </span>
                  </div>
                  <div><b>Объект подготовки:</b> {model.objectName}</div>
                  <div style={{ fontSize: "11px", color: "#6C757D" }}>
                    <b>Загружено:</b> {model.createdAt}
                  </div>
                  {model.description && (
                    <div className="description">
                      {model.description}
                    </div>
                  )}
                </div>

                <div className="model-actions">
                  <button
                    className={`select-model-btn ${selectedModelId === model.id ? "selected" : ""}`}
                    onClick={(e) => handleSelectModel(model, e)}
                    title={selectedModelId === model.id ? "Модель выбрана" : "Выбрать модель"}
                  >
                    {selectedModelId === model.id ? "✓ Выбрана" : "Выбрать"}
                  </button>
                  
                  <button
                    className="delete-model-btn"
                    onClick={(e) => confirmDeleteModel(model.id, model.modelId, e)}
                    title="Удалить модель"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
            
            {/* Статистика сохранения */}
            <div style={{ 
              marginTop: "var(--spacing-md)",
              padding: "var(--spacing-sm)",
              backgroundColor: "white",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--border-radius)",
              fontSize: "11px",
              color: "var(--text-tertiary)",
              textAlign: "center"
            }}>
              Сохранено моделей: {models.length} | 
              Последнее сохранение: {new Date().toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </>
        )}
      </div>

      {/* Модальное окно */}
      {modalOpen && (
        <ModelModal
          onClose={() => setModalOpen(false)}
          onSave={handleSaveModel}
        />
      )}
    </div>
  );
}