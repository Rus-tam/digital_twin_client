import React, { useState, useEffect } from "react";
import "../styles/footer.css";

const Footer = () => {
  const [indicators, setIndicators] = useState([
    { 
      id: "oil", 
      label: "Нефть", 
      value: 1250, 
      unit: "т/сут", 
      status: "normal",
      min: 1000,
      max: 1500,
      current: 1250,
      tooltip: "Суточная добыча нефти"
    },
    { 
      id: "liquid", 
      label: "Жидкость", 
      value: 2850, 
      unit: "м³/сут", 
      status: "warning",
      min: 2000,
      max: 3000,
      current: 2850,
      tooltip: "Общий объем жидкости"
    },
    { 
      id: "gas", 
      label: "Газ", 
      value: 450, 
      unit: "тыс.м³/сут", 
      status: "normal",
      min: 300,
      max: 500,
      current: 450,
      tooltip: "Суточная добыча газа"
    },
    { 
      id: "losses", 
      label: "Потери", 
      value: 15.2, 
      unit: "т/сут", 
      status: "critical",
      min: 0,
      max: 10,
      current: 15.2,
      tooltip: "Технологические потери"
    }
  ]);

  const [currentTime, setCurrentTime] = useState("");
  const [updatingIndicator, setUpdatingIndicator] = useState(null);

  // Обновление времени
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Симуляция обновления показателей
  useEffect(() => {
    const updateIndicators = () => {
      setIndicators(prev => prev.map(indicator => {
        // Генерируем небольшое случайное изменение
        const change = (Math.random() - 0.5) * indicator.max * 0.05;
        let newValue = indicator.current + change;
        
        // Ограничиваем значения
        newValue = Math.max(indicator.min * 0.8, Math.min(indicator.max * 1.2, newValue));
        
        // Определяем статус
        let status = "normal";
        const normalized = (newValue - indicator.min) / (indicator.max - indicator.min);
        
        if (normalized < 0.1 || normalized > 0.9) {
          status = "warning";
        }
        if (normalized < 0 || normalized > 1) {
          status = "critical";
        }
        
        return {
          ...indicator,
          value: newValue.toFixed(1),
          status,
          current: newValue
        };
      }));
    };

    const interval = setInterval(updateIndicators, 5000);
    return () => clearInterval(interval);
  }, []);

  // Анимация обновления значения
  const handleIndicatorUpdate = (indicatorId) => {
    setUpdatingIndicator(indicatorId);
    setTimeout(() => setUpdatingIndicator(null), 500);
  };

  // Форматирование значения
  const formatValue = (value) => {
    const num = parseFloat(value);
    return num.toFixed(num < 10 ? 1 : 0);
  };

  // Получение класса статуса
  const getStatusClass = (status) => {
    switch (status) {
      case "normal": return "indicator-normal";
      case "warning": return "indicator-warning";
      case "critical": return "indicator-critical";
      default: return "";
    }
  };

  // Получение текста статуса
  const getStatusText = (status) => {
    switch (status) {
      case "normal": return "Норма";
      case "warning": return "Внимание";
      case "critical": return "Критично";
      default: return "";
    }
  };

  // Получение цвета статуса
  const getStatusColor = (status) => {
    switch (status) {
      case "normal": return "#28A745";
      case "warning": return "#FD7E14";
      case "critical": return "#DC3545";
      default: return "#6C757D";
    }
  };

  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-indicators">
          {indicators.map(indicator => (
            <div 
              key={indicator.id}
              className={`indicator ${getStatusClass(indicator.status)} ${
                updatingIndicator === indicator.id ? 'indicator-updating' : ''
              }`}
              onClick={() => handleIndicatorUpdate(indicator.id)}
              style={{ cursor: "pointer" }}
            >
              {/* Надпись слева от окошка */}
              <div className="indicator-label">{indicator.label}</div>
              
              {/* Окошко с значением */}
              <div className="indicator-box">
                <div className="indicator-value">
                  {formatValue(indicator.value)}
                  <span className="indicator-unit">{indicator.unit}</span>
                </div>
                <div className="indicator-tooltip">
                  <div style={{ fontWeight: "600", marginBottom: "2px" }}>
                    {indicator.label}: {formatValue(indicator.value)} {indicator.unit}
                  </div>
                  <div style={{ fontSize: "10px", opacity: 0.9 }}>
                    Статус: {getStatusText(indicator.status)}
                  </div>
                  <div style={{ fontSize: "10px", opacity: 0.9, marginTop: "2px" }}>
                    Диапазон: {indicator.min} - {indicator.max} {indicator.unit}
                  </div>
                  <div style={{ 
                    fontSize: "9px", 
                    color: getStatusColor(indicator.status),
                    marginTop: "4px",
                    fontWeight: "500"
                  }}>
                    {indicator.tooltip}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="footer-info">
          <div className="system-time">
            {currentTime}
          </div>
          <div className="system-status">
            ✅ Система активна
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;