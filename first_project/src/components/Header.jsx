import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/header.css";

export default function Header({ selectedModel }) {
  return (
 <header className="app-header">
      <div className="header-left">
        <div className="app-title">Digital Twin</div>

        <nav className="header-nav">
          <NavLink to="/" end className="nav-item">
            Модели
          </NavLink>
          <NavLink to="/mapping" className="nav-item">
            Маппинг-таблица
          </NavLink>
          <NavLink to="/scheme" className="nav-item">
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

      <div className="header-right">
        {selectedModel ? (
          <div className="model-indicator">
            <div className="model-id">{selectedModel.modelId}</div>
            <div className="model-object">{selectedModel.objectName}</div>
          </div>
        ) : (
          <div className="model-indicator empty">Модель не выбрана</div>
        )}
      </div>
    </header>  
    );
}
