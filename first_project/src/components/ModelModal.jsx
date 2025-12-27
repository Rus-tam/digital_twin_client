import React, { useState } from "react";
import "../styles/model-page.css";

// Опции расчетных движков
const ENGINE_OPTIONS = [
  { value: "stm", label: "СТМ" },
  { value: "era", label: "ЭРА:ИСКРА" }
];

export default function ModelModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    engine: "stm", // По умолчанию СТМ
    modelId: "",
    objectName: "",
    description: "",
  });

  const save = () => {
    if (!form.modelId || !form.objectName) {
      alert("Пожалуйста, заполните обязательные поля: ID модели и Наименование объекта");
      return;
    }
    onSave(form);
    onClose();
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Загрузка расчетной модели</h2>

        {/* Выбор расчетного движка */}
        <div style={{ marginBottom: "var(--spacing-md)" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "var(--spacing-xs)",
            fontSize: "12px",
            color: "var(--text-secondary)",
            fontWeight: "500"
          }}>
            Расчетный движок:
          </label>
          <div style={{ 
            display: "flex", 
            gap: "var(--spacing-sm)",
            marginTop: "var(--spacing-xs)"
          }}>
            {ENGINE_OPTIONS.map((engine) => (
              <button
                key={engine.value}
                type="button"
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  border: `1px solid ${form.engine === engine.value ? "#0066CC" : "#DEE2E6"}`,
                  backgroundColor: form.engine === engine.value ? "#E3F2FD" : "white",
                  color: form.engine === engine.value ? "#0066CC" : "var(--text-primary)",
                  borderRadius: "2px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: form.engine === engine.value ? "600" : "400",
                  transition: "all 0.15s",
                  textAlign: "center"
                }}
                onClick={() => handleChange("engine", engine.value)}
              >
                {engine.label}
              </button>
            ))}
          </div>
        </div>

        {/* ID расчетной модели */}
        <div style={{ marginBottom: "var(--spacing-md)" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "var(--spacing-xs)",
            fontSize: "12px",
            color: "var(--text-secondary)",
            fontWeight: "500"
          }}>
            ID расчетной модели *
          </label>
          <input
            placeholder="Например: Модель-001"
            value={form.modelId}
            onChange={e => handleChange("modelId", e.target.value)}
            style={{ width: "100%" }}
            required
          />
        </div>

        {/* Наименование объекта подготовки */}
        <div style={{ marginBottom: "var(--spacing-md)" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "var(--spacing-xs)",
            fontSize: "12px",
            color: "var(--text-secondary)",
            fontWeight: "500"
          }}>
            Наименование объекта подготовки *
          </label>
          <input
            placeholder="Например: Установка подготовки газа №1"
            value={form.objectName}
            onChange={e => handleChange("objectName", e.target.value)}
            style={{ width: "100%" }}
            required
          />
        </div>

        {/* Описание модели */}
        <div style={{ marginBottom: "var(--spacing-lg)" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "var(--spacing-xs)",
            fontSize: "12px",
            color: "var(--text-secondary)",
            fontWeight: "500"
          }}>
            Описание модели (необязательно)
          </label>
          <textarea
            placeholder="Дополнительная информация о модели..."
            value={form.description}
            onChange={e => handleChange("description", e.target.value)}
            rows="3"
          />
        </div>

        {/* Информация о выбранном движке */}
        <div style={{ 
          marginBottom: "var(--spacing-md)",
          padding: "var(--spacing-sm)",
          backgroundColor: "#F8F9FA",
          border: "1px solid #E9ECEF",
          borderRadius: "2px",
          fontSize: "11px",
          color: "var(--text-secondary)"
        }}>
          <div style={{ fontWeight: "500", marginBottom: "2px" }}>
            {form.engine === "stm" ? "СТМ" : "ЭРА:ИСКРА"}
          </div>
          <div>
            {form.engine === "stm" 
              ? "Среда для построения и расчета технологических моделей нефтегазовых объектов" 
              : "Платформа для инженерных расчетов и моделирования процессов"}
          </div>
        </div>

        <div className="modal-actions">
          <button 
            onClick={onClose}
            style={{
              padding: "8px 16px",
              border: "1px solid #DEE2E6",
              backgroundColor: "white",
              color: "var(--text-primary)",
              borderRadius: "2px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500"
            }}
          >
            Отмена
          </button>
          <button 
            className="primary-btn" 
            onClick={save}
            style={{
              padding: "8px 16px",
              border: "1px solid #0066CC",
              backgroundColor: "#0066CC",
              color: "white",
              borderRadius: "2px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500",
              marginLeft: "var(--spacing-sm)"
            }}
          >
            Загрузить модель
          </button>
        </div>
      </div>
    </div>
  );
}