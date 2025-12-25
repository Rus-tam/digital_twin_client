import React, { useState } from "react";
import ModelModal from "../components/ModelModal";
import "../styles/model-page.css";

export default function ModelSelectionPage({ onModelSelect, selectedModel }) {
  const [models, setModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSaveModel = (model) => {
    setModels((prev) => [...prev, model]);
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
          {selectedModel.objectName}
        </div>
      )}

      {/* Список моделей */}
      <div className="model-list">
        {models.length === 0 && (
          <div style={{ color: "#666", fontSize: 13 }}>
            Модели не загружены
          </div>
        )}

        {models.map((model) => (
          <div
            key={model.modelId}
            className={`model-card ${
              selectedModelId === model.modelId ? "active" : ""
            }`}
          >
            <div className="model-data">
              <div><b>ID модели:</b> {model.modelId}</div>
              <div><b>ДО:</b> {model.org}</div>
              <div><b>Объект подготовки:</b> {model.objectName}</div>
              <div className="description">
                {model.description || "—"}
              </div>
            </div>

            <button
              className="secondary-btn"
              onClick={() => {
                setSelectedModelId(model.modelId);
                onModelSelect(model);
              }}
            >
              Выбрать модель
            </button>
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
