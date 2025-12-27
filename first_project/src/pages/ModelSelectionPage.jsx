import React, { useState } from "react";
import ModelModal from "../components/ModelModal";
import "../styles/model-page.css";

export default function ModelSelectionPage({ onModelSelect, selectedModel }) {
  const [models, setModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState(null);

  const handleSaveModel = (model) => {
    const newModel = {
      ...model,
      id: Date.now().toString(),
      engineLabel: model.engine === "stm" ? "СТМ" : "ЭРА:ИСКРА",
      createdAt: new Date().toLocaleDateString('ru-RU'),
      createdAtFull: new Date().toISOString()
    };
    setModels((prev) => [...prev, newModel]);
  };

  const handleDeleteModel = (modelId, event) => {
    if (event) {
      event.stopPropagation(); // Предотвращаем всплытие
    }
    
    // Если модель выбрана, снимаем выбор
    if (selectedModelId === modelId) {
      setSelectedModelId(null);
      onModelSelect(null);
    }
    
    setModels(models.filter(model => model.id !== modelId));
  };

  const handleSelectModel = (model, event) => {
    if (event) {
      event.stopPropagation(); // Предотвращаем всплытие
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

  return (
    <div className="page">
      {/* Заголовок страницы */}
      <div className="page-header">
        <h1>Расчетные модели цифрового двойника</h1>
        <button
          className="primary-btn"
          onClick={() => setModalOpen(true)}
        >
          Загрузить модель
        </button>
      </div>

      {/* Информация о выбранной модели */}
      {selectedModel && (
        <div className="selected-info">
          Текущая модель:
          <strong> {selectedModel.modelId}</strong> —{" "}
          {selectedModel.objectName} ({selectedModel.engineLabel})
        </div>
      )}

      {/* Список моделей */}
      <div className="model-list">
        {models.length === 0 && (
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
        )}

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