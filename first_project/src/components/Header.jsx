import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Calendar from '../components/Calendar';
import '../styles/header.css';

// Моковые данные для выпадающих меню
const ORG_OPTIONS = [
  'ООО «Газпром добыча Оренбург»',
  'ООО «Газпром добыча Ямбург»',
  'ООО «Газпром добыча Астрахань»',
  'ООО «Газпром добыча Уренгой»',
  'ООО «Газпром добыча Надым»',
];

export default function Header({ selectedModel }) {
  const [activeMode, setActiveMode] = useState('Цифровой двойник');
  const [selectedOrg, setSelectedOrg] = useState(ORG_OPTIONS[0]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = date => {
    setSelectedDate(date);
    console.log('Выбрана дата:', date.toLocaleDateString('ru-RU'));
    // Здесь можно добавить логику для обновления данных по выбранной дате
  };

  return (
    <header className="app-header">
      {/* ВЕРХНИЙ УРОВЕНЬ */}
      <div className="header-top">
        {/* Левая часть - кнопки режимов */}
        <div className="header-top-left">
          <button
            className={`mode-btn ${activeMode === 'Сеть' ? 'active' : ''}`}
            onClick={() => setActiveMode('Сеть')}
          >
            Сеть
          </button>
          <button
            className={`mode-btn ${activeMode === 'Цифровой двойник' ? 'active' : ''}`}
            onClick={() => setActiveMode('Цифровой двойник')}
          >
            Цифровой двойник
          </button>
        </div>

        {/* Правая часть - выпадающие меню */}
        <div className="header-top-right">
          <select
            className="org-select"
            value={selectedOrg}
            onChange={e => setSelectedOrg(e.target.value)}
          >
            {ORG_OPTIONS.map(org => (
              <option key={org} value={org}>
                {org}
              </option>
            ))}
          </select>

          <Calendar value={selectedDate} onChange={handleDateChange} placeholder="Выберите дату" />
        </div>
      </div>

      {/* НИЖНИЙ УРОВЕНЬ */}
      <div className="header-bottom">
        <div className="header-bottom-left">
          <div className="app-title">Digital Twin</div>

          <nav className="header-nav">
            <NavLink to="/" end className="nav-item">
              Модели
            </NavLink>
            <NavLink to="/mapping" className="nav-item">
              Маппинг-таблица
            </NavLink>
            <NavLink to="/lab-research" className="nav-item">
              Лабораторные исследования
            </NavLink>

            <NavLink to="/schema" className="nav-item">
              Схема
            </NavLink>
            <NavLink to="/calculation" className="nav-item">
              Расчёт
            </NavLink>
            <NavLink to="/analytics" className="nav-item">
              Аналитика
            </NavLink>
          </nav>
        </div>

        <div className="header-bottom-right">
          {selectedModel ? (
            <div className="model-indicator">
              <div className="model-id">{selectedModel.modelId}</div>
              <div className="model-object">{selectedModel.objectName}</div>
            </div>
          ) : (
            <div className="model-indicator empty">Модель не выбрана</div>
          )}
        </div>
      </div>
    </header>
  );
}
