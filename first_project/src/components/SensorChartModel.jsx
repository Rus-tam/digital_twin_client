/* [file name]: SensorChartModal.jsx - ИСПРАВЛЕННЫЙ */
import React, { useState, useEffect, useRef } from "react";
import "../styles/sensor-chart.css";

const SensorChartModal = ({ isOpen, onClose, sensor }) => {
  const [timeRange, setTimeRange] = useState("24h");
  const [chartData, setChartData] = useState([]);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const chartAreaRef = useRef(null);
  const [dimensions, setDimensions] = useState({ 
    width: 700, 
    height: 350,
    chartPadding: { top: 30, bottom: 40, left: 10, right: 10 }
  });

  const timeRanges = [
    { id: "1h", label: "1 час", hours: 1 },
    { id: "6h", label: "6 часов", hours: 6 },
    { id: "24h", label: "24 часа", hours: 24 },
    { id: "7d", label: "7 дней", hours: 168 },
    { id: "30d", label: "30 дней", hours: 720 }
  ];

  const generateChartData = (sensorData, rangeHours) => {
    if (!sensorData) return [];
    
    const now = new Date();
    
    if (sensorData.history?.length > 0) {
      const filtered = sensorData.history
        .filter(point => {
          const pointTime = new Date(point.timestamp);
          const hoursDiff = (now - pointTime) / (1000 * 60 * 60);
          return hoursDiff <= rangeHours;
        })
        .map(point => ({
          timestamp: new Date(point.timestamp),
          value: point.value,
          x: 0,
          y: 0
        }))
        .sort((a, b) => a.timestamp - b.timestamp);
      
      return filtered.length > 100 
        ? filtered.filter((_, i) => i % Math.ceil(filtered.length / 100) === 0)
        : filtered;
    }
    
    if (sensorData.manualData?.length > 0) {
      return sensorData.manualData
        .map(point => ({
          timestamp: new Date(point.timestamp),
          value: point.value,
          x: 0,
          y: 0
        }))
        .sort((a, b) => a.timestamp - b.timestamp);
    }
    
    const points = 25;
    const baseValue = sensorData.currentValue || 50;
    const minValue = baseValue * 0.8;
    const maxValue = baseValue * 1.2;
    const dataPoints = [];
    
    for (let i = 0; i < points; i++) {
      const timeOffset = (rangeHours * 60 * 60 * 1000) * (i / points);
      const timestamp = new Date(now.getTime() - timeOffset);
      const trend = Math.sin(i * 0.5) * (maxValue - minValue) * 0.1;
      const noise = (Math.random() - 0.5) * (maxValue - minValue) * 0.03;
      const value = baseValue + trend + noise;
      
      dataPoints.push({
        timestamp,
        value: Math.max(minValue, Math.min(maxValue, value)),
        x: 0,
        y: 0
      });
    }
    
    return dataPoints.sort((a, b) => a.timestamp - b.timestamp);
  };

  const calculateChartCoordinates = (data, dims) => {
    if (!data.length) return [];
    
    const { width, height, chartPadding } = dims;
    const chartWidth = width - chartPadding.left - chartPadding.right;
    const chartHeight = height - chartPadding.top - chartPadding.bottom;
    
    if (chartWidth <= 0 || chartHeight <= 0) return [];
    
    const values = data.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    
    const times = data.map(d => d.timestamp.getTime());
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const timeRange = maxTime - minTime || 1; // Защита от деления на 0
    
    const valuePadding = (maxValue - minValue) * 0.1;
    const adjustedMinValue = minValue - valuePadding;
    const adjustedMaxValue = maxValue + valuePadding;
    const adjustedValueRange = adjustedMaxValue - adjustedMinValue || 1;
    
    return data.map(point => ({
      ...point,
      x: chartPadding.left + ((point.timestamp.getTime() - minTime) / timeRange) * chartWidth,
      y: chartPadding.top + chartHeight - ((point.value - adjustedMinValue) / adjustedValueRange) * chartHeight,
      displayValue: point.value
    }));
  };

  useEffect(() => {
    if (!sensor) return;
    
    const selectedRange = timeRanges.find(r => r.id === timeRange);
    const hours = selectedRange ? selectedRange.hours : 24;
    const rawData = generateChartData(sensor, hours);
    setChartData(rawData);
  }, [sensor, timeRange]);

  useEffect(() => {
    const updateDimensions = () => {
      if (chartAreaRef.current) {
        const { width, height } = chartAreaRef.current.getBoundingClientRect();
        
        // Уменьшаем padding, чтобы точки не выходили за границы
        const newChartPadding = {
          top: 30,
          bottom: 40,
          left: 10,   // Уменьшили левый отступ
          right: 10   // Уменьшили правый отступ
        };
        
        setDimensions({
          width: Math.max(500, width),
          height: Math.max(300, height),
          chartPadding: newChartPadding
        });
      }
    };

    if (isOpen) {
      // Небольшая задержка для корректного расчета размеров
      setTimeout(updateDimensions, 100);
      window.addEventListener('resize', updateDimensions);
    }
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isOpen]);

  const chartPoints = calculateChartCoordinates(chartData, dimensions);

  const calculateStatistics = () => {
    if (chartData.length === 0) {
      return { average: 0, min: 0, max: 0, last: 0, change: 0, stdDev: 0 };
    }

    const values = chartData.map(p => p.value);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const last = values[values.length - 1];
    const first = values[0];
    const change = last - first;
    
    const squareDiffs = values.map(value => Math.pow(value - average, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(avgSquareDiff);

    return { average, min, max, last, change, stdDev };
  };

  const stats = calculateStatistics();

  const formatValue = (value) => {
    if (value === null || value === undefined) return "—";
    const formatted = typeof value === 'number' ? value.toFixed(2) : value;
    return `${formatted} ${sensor?.unit || ""}`;
  };

  const formatDateTime = (date) => {
    if (!date) return "—";
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (date) => {
    if (!date) return "—";
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "normal": return "#28A745";
      case "warning": return "#FD7E14";
      case "critical": return "#DC3545";
      case "inactive": return "#6C757D";
      default: return "#6C757D";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "normal": return "Норма";
      case "warning": return "Предупреждение";
      case "critical": return "Авария";
      case "inactive": return "Неактивен";
      default: return "Неизвестно";
    }
  };

  const handleMouseMove = (e) => {
    if (!chartAreaRef.current || chartPoints.length === 0) return;
    
    const rect = chartAreaRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    let closestPoint = null;
    let minDistance = 30;
    
    chartPoints.forEach(point => {
      const distance = Math.sqrt(
        Math.pow(point.x - mouseX, 2) + Math.pow(point.y - mouseY, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    });
    
    setHoveredPoint(closestPoint);
  };

  const handleExportData = () => {
    if (!sensor || chartData.length === 0) {
      alert("Нет данных для экспорта");
      return;
    }

    const csvContent = [
      ["Время", "Значение", "Единица измерения"].join(","),
      ...chartData.map(point => [
        point.timestamp.toISOString(),
        point.value.toFixed(4),
        sensor.unit || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `${sensor.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen || !sensor) return null;

  const values = chartData.map(p => p.value);
  const yMin = values.length > 0 ? Math.min(...values) : 0;
  const yMax = values.length > 0 ? Math.max(...values) : 100;
  
  const yTicks = [];
  const numYTicks = 5;
  for (let i = 0; i <= numYTicks; i++) {
    const value = yMin + ((yMax - yMin) * (i / numYTicks));
    const yPos = dimensions.chartPadding.top + 
      ((dimensions.height - dimensions.chartPadding.top - dimensions.chartPadding.bottom) * 
       (1 - (i / numYTicks)));
    
    yTicks.push({ value, position: yPos });
  }

  const xTicks = [];
  if (chartPoints.length > 0) {
    const numXTicks = Math.min(6, chartPoints.length);
    for (let i = 0; i < numXTicks; i++) {
      const index = Math.floor((i / (numXTicks - 1)) * (chartPoints.length - 1));
      if (chartPoints[index]) {
        const xPos = chartPoints[index].x;
        xTicks.push({
          time: chartPoints[index].timestamp,
          position: xPos
        });
      }
    }
  }

  const polylinePoints = chartPoints
    .map(p => `${p.x},${p.y}`)
    .join(' ');

  return (
    <div className="modal-backdrop">
      <div className="modal-chart">
        <div className="modal-header">
          <h2>История данных: {sensor.name}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="sensor-info">
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Текущее значение:</span>
              <span className="info-value current-value">
                {formatValue(sensor.currentValue)}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Статус:</span>
              <span 
                className="info-value status-badge"
                style={{ 
                  backgroundColor: getStatusColor(sensor.status) + '20', 
                  color: getStatusColor(sensor.status),
                  borderColor: getStatusColor(sensor.status) + '40'
                }}
              >
                {getStatusText(sensor.status)}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Последнее обновление:</span>
              <span className="info-value">
                {sensor.lastUpdate ? formatDateTime(new Date(sensor.lastUpdate)) : "—"}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Тип датчика:</span>
              <span className="info-value">
                {sensor.isManual ? "Ручной ввод - " : ""}{sensor.type || "Не указан"}
              </span>
            </div>
          </div>
        </div>

        <div className="chart-controls">
          <div className="time-range-selector">
            {timeRanges.map(range => (
              <button
                key={range.id}
                className={`time-range-btn ${timeRange === range.id ? "active" : ""}`}
                onClick={() => setTimeRange(range.id)}
              >
                {range.label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "4px" }}>
            Показано точек: {chartPoints.length}
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-y-axis">
            {yTicks.map((tick, i) => (
              <div 
                key={i}
                className="y-tick"
                style={{ 
                  position: "absolute",
                  top: `${tick.position}px`,
                  transform: "translateY(-50%)",
                  right: "10px"
                }}
              >
                {formatValue(tick.value)}
              </div>
            ))}
          </div>
          
          <div 
            className="chart-content"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <div 
              className="chart-area"
              ref={chartAreaRef}
              style={{
                position: "relative",
                width: "100%",
                height: "100%"
              }}
            >
              <div className="chart-grid">
                {yTicks.map((tick, i) => (
                  <div 
                    key={`h-${i}`}
                    className="grid-line horizontal"
                    style={{ top: `${tick.position}px` }}
                  />
                ))}
                
                {xTicks.map((tick, i) => (
                  <div 
                    key={`v-${i}`}
                    className="grid-line vertical"
                    style={{ left: `${tick.position}px` }}
                  />
                ))}
                
                <svg 
                  className="chart-line"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    overflow: "visible"
                  }}
                >
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                  
                  {chartPoints.length > 1 && (
                    <polyline
                      points={polylinePoints}
                      fill="none"
                      stroke="url(#lineGradient)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </svg>
                
                {chartPoints.map((point, index) => (
                  <div
                    key={index}
                    className="data-point"
                    style={{
                      left: `${point.x}px`,
                      top: `${point.y}px`,
                      backgroundColor: hoveredPoint === point ? "#10b981" : "#3b82f6",
                      transform: "translate(-50%, -50%)",
                      zIndex: hoveredPoint === point ? 10 : 1
                    }}
                    onMouseEnter={() => setHoveredPoint(point)}
                  >
                    {hoveredPoint === point && (
                      <div className="point-tooltip">
                        <div style={{ fontWeight: "600", marginBottom: "2px" }}>
                          {formatValue(point.displayValue)}
                        </div>
                        <div style={{ fontSize: "10px", opacity: 0.9 }}>
                          {formatDateTime(point.timestamp)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {hoveredPoint && (
                  <>
                    <div 
                      className="chart-hover-line vertical"
                      style={{
                        left: `${hoveredPoint.x}px`,
                        top: `${dimensions.chartPadding.top}px`,
                        bottom: `${dimensions.height - dimensions.chartPadding.bottom}px`
                      }}
                    />
                    <div 
                      className="chart-hover-line horizontal"
                      style={{
                        top: `${hoveredPoint.y}px`,
                        left: `${dimensions.chartPadding.left}px`,
                        right: `${dimensions.chartPadding.right}px`
                      }}
                    />
                  </>
                )}
              </div>
              
              <div 
                className="chart-boundary"
                style={{
                  top: `${dimensions.chartPadding.top}px`,
                  left: `${dimensions.chartPadding.left}px`,
                  right: `${dimensions.chartPadding.right}px`,
                  bottom: `${dimensions.height - dimensions.chartPadding.bottom}px`
                }}
              />
            </div>
            
            <div className="chart-x-axis">
              {xTicks.map((tick, i) => (
                <div 
                  key={i}
                  className="x-tick"
                  style={{ 
                    left: `${tick.position}px`
                  }}
                >
                  {formatTime(tick.time)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {chartPoints.length > 0 && (
          <div className="chart-stats">
            <div className="stat-item">
              <span className="stat-label">Среднее:</span>
              <span className="stat-value">
                {formatValue(stats.average)}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Максимум:</span>
              <span className="stat-value">{formatValue(stats.max)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Минимум:</span>
              <span className="stat-value">{formatValue(stats.min)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Изменение:</span>
              <span className={`stat-value ${stats.change >= 0 ? "positive" : "negative"}`}>
                {stats.change >= 0 ? "+" : ""}{formatValue(stats.change)}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Отклонение:</span>
              <span className="stat-value">
                {formatValue(stats.stdDev)}
              </span>
            </div>
          </div>
        )}

        <div className="modal-footer">
          <button className="secondary-btn" onClick={onClose}>
            Закрыть
          </button>
          <button 
            className="secondary-btn" 
            onClick={handleExportData}
            disabled={chartPoints.length === 0}
            style={{ marginRight: "8px" }}
          >
            📥 Экспорт CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default SensorChartModal;