import React, { useState } from "react";
import "../styles/model-page.css";

const ORGS = [
  "ООО «Газпром добыча Оренбург»",
  "ООО «Газпром добыча Ямбург»",
  "ООО «Газпром добыча Астрахань»",
];

export default function ModelModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    org: "",
    modelId: "",
    objectName: "",
    description: "",
  });

  const save = () => {
    if (!form.modelId || !form.org) return;
    onSave(form);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Загрузка расчетной модели</h2>

        <select
          value={form.org}
          onChange={e => setForm({ ...form, org: e.target.value })}
        >
          <option value="">Дочерняя организация</option>
          {ORGS.map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>

        <input
          placeholder="ID расчетной модели"
          value={form.modelId}
          onChange={e => setForm({ ...form, modelId: e.target.value })}
        />

        <input
          placeholder="Наименование объекта подготовки"
          value={form.objectName}
          onChange={e => setForm({ ...form, objectName: e.target.value })}
        />

        <textarea
          placeholder="Описание модели"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />

        <div className="modal-actions">
          <button onClick={onClose}>Отмена</button>
          <button className="primary-btn" onClick={save}>Сохранить</button>
        </div>
      </div>
    </div>
  );
}
