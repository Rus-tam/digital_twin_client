import React, { useState } from "react";

const LabDataModal = ({ isOpen, onClose, onSave, researchTypes }) => {
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    object: "",
    sampleDate: "",
    sampleLocation: "",
    labName: "",
    standard: "",
    description: "",
    analyst: ""
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.type || !formData.object) {
      alert("Пожалуйста, заполните тип исследования и объект");
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ width: "600px" }}>
        <div className="modal-header">
          <h2>Новое лабораторное исследование</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="lab-data-form">
          <div className="form-section">
            <h3>Основная информация</h3>
            <div className="form-row">
              <div className="form-group full-width">
                <label className="form-label required">Название исследования</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="form-input"
                  placeholder="Например: Анализ газа с УКПГ-1"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">Тип исследования</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                  className="form-input"
                >
                  <option value="">— Выберите тип —</option>
                  {researchTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({type.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label required">Объект</label>
                <input
                  type="text"
                  value={formData.object}
                  onChange={(e) => handleChange("object", e.target.value)}
                  className="form-input"
                  placeholder="Например: УКПГ-1, скв. №123"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Дата отбора пробы</label>
                <input
                  type="date"
                  value={formData.sampleDate}
                  onChange={(e) => handleChange("sampleDate", e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Место отбора</label>
                <input
                  type="text"
                  value={formData.sampleLocation}
                  onChange={(e) => handleChange("sampleLocation", e.target.value)}
                  className="form-input"
                  placeholder="Например: вход сепаратора"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Информация о лаборатории</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Название лаборатории</label>
                <input
                  type="text"
                  value={formData.labName}
                  onChange={(e) => handleChange("labName", e.target.value)}
                  className="form-input"
                  placeholder="Например: ЦЛ Газпром"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Стандарт/метод</label>
                <input
                  type="text"
                  value={formData.standard}
                  onChange={(e) => handleChange("standard", e.target.value)}
                  className="form-input"
                  placeholder="Например: ГОСТ, ASTM"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Аналитик</label>
                <input
                  type="text"
                  value={formData.analyst}
                  onChange={(e) => handleChange("analyst", e.target.value)}
                  className="form-input"
                  placeholder="ФИО ответственного"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Дополнительная информация</h3>
            <div className="form-row">
              <div className="form-group full-width">
                <label className="form-label">Примечания</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="form-input"
                  rows="3"
                  placeholder="Дополнительная информация об исследовании..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="secondary-btn" onClick={onClose}>
            Отмена
          </button>
          <button className="primary-btn" onClick={handleSubmit}>
            Создать исследование
          </button>
        </div>
      </div>
    </div>
  );
};

export default LabDataModal;