import React, { useState } from "react";
import "../styles/mapping-table.css";
import "../styles/modal-tree.css";

/* Моковые данные для древовидной структуры */
const STM_MODEL_TREE = {
  modelId: "Модель-001",
  objectName: "Установка подготовки газа №1",
  children: [
    {
      type: "streams",
      name: "Потоки",
      children: [
        {
          id: "stream-1",
          name: "Поток 1 - Вход сырья",
          parameters: [
            { id: "stream-1-temp", name: "Температура", unit: "°C" },
            { id: "stream-1-pressure", name: "Давление", unit: "МПа" },
            { id: "stream-1-flow", name: "Массовый расход", unit: "кг/с" },
            { id: "stream-1-composition", name: "Состав", unit: "мольн.доли" },
          ]
        },
        {
          id: "stream-2",
          name: "Поток 2 - После сепарации",
          parameters: [
            { id: "stream-2-temp", name: "Температура", unit: "°C" },
            { id: "stream-2-pressure", name: "Давление", unit: "МПа" },
            { id: "stream-2-flow", name: "Массовый расход", unit: "кг/с" },
            { id: "stream-2-humidity", name: "Влажность", unit: "г/м³" },
          ]
        },
        {
          id: "stream-3",
          name: "Поток 3 - Товарный газ",
          parameters: [
            { id: "stream-3-temp", name: "Температура", unit: "°C" },
            { id: "stream-3-pressure", name: "Давление", unit: "МПа" },
            { id: "stream-3-flow", name: "Массовый расход", unit: "кг/с" },
            { id: "stream-3-quality", name: "Качество", unit: "%" },
          ]
        }
      ]
    },
    {
      type: "apparatus",
      name: "Аппараты",
      children: [
        {
          id: "sep-1",
          name: "Сепаратор С-1",
          parameters: [
            { id: "sep-1-temp", name: "Температура в аппарате", unit: "°C" },
            { id: "sep-1-pressure", name: "Давление", unit: "МПа" },
            { id: "sep-1-level", name: "Уровень жидкости", unit: "%" },
            { id: "sep-1-efficiency", name: "Эффективность сепарации", unit: "%" },
          ]
        },
        {
          id: "heat-1",
          name: "Теплообменник Т-1",
          parameters: [
            { id: "heat-1-temp-in", name: "Температура на входе", unit: "°C" },
            { id: "heat-1-temp-out", name: "Температура на выходе", unit: "°C" },
            { id: "heat-1-delta-t", name: "Перепад температур", unit: "К" },
            { id: "heat-1-duty", name: "Тепловая нагрузка", unit: "кВт" },
          ]
        },
        {
          id: "comp-1",
          name: "Компрессор К-1",
          parameters: [
            { id: "comp-1-power", name: "Потребляемая мощность", unit: "кВт" },
            { id: "comp-1-efficiency", name: "КПД", unit: "%" },
            { id: "comp-1-speed", name: "Частота вращения", unit: "об/мин" },
          ]
        }
      ]
    }
  ]
};

/* Моковые данные датчиков */
const SENSORS = [
  { id: "T-101", name: "Датчик температуры T-101", type: "temperature" },
  { id: "T-102", name: "Датчик температуры T-102", type: "temperature" },
  { id: "P-201", name: "Датчик давления P-201", type: "pressure" },
  { id: "P-202", name: "Датчик давления P-202", type: "pressure" },
  { id: "F-301", name: "Датчик расхода F-301", type: "flow" },
  { id: "F-302", name: "Датчик расхода F-302", type: "flow" },
  { id: "L-401", name: "Датчик уровня L-401", type: "level" },
  { id: "Q-501", name: "Датчик качества Q-501", type: "quality" },
];

/* Компонент модального окна с деревом параметров */
function ParameterModal({ isOpen, onClose, onSelectParameter }) {
  const [expandedNodes, setExpandedNodes] = useState([]);

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => 
      prev.includes(nodeId) 
        ? prev.filter(id => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  const handleSelectParameter = (parameter, parentPath) => {
    const paramPath = `${parentPath} - ${parameter.name}`;
    onSelectParameter({
      id: parameter.id,
      name: paramPath,
      unit: parameter.unit
    });
    onClose();
  };

  if (!isOpen) return null;

  const renderTreeNode = (node, level = 0, parentPath = "") => {
    const nodeId = node.id || node.type || `root-${node.modelId}`;
    const isExpanded = expandedNodes.includes(nodeId);
    const currentPath = parentPath 
      ? `${parentPath} > ${node.name || node.objectName}`
      : `${node.modelId} - ${node.objectName}`;

    const hasChildren = node.children || node.parameters;

    return (
      <div key={nodeId} className="tree-node">
        <div 
          className={`tree-item level-${level} ${hasChildren ? "has-children" : "parameter"}`}
          style={{ paddingLeft: `${level * 24 + 12}px` }}
          onClick={() => hasChildren && toggleNode(nodeId)}
        >
          {hasChildren && (
            <span className="expand-icon">
              {isExpanded ? "▼" : "▶"}
            </span>
          )}
          
          {!hasChildren && <span className="param-icon">⚬</span>}
          
          <span className="tree-label">
            {node.modelId && (
              <div className="model-header">
                <div className="model-id">{node.modelId}</div>
                <div className="model-object">{node.objectName}</div>
              </div>
            )}
            {!node.modelId && node.name}
          </span>

          {!hasChildren && (
            <button 
              className="select-param-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectParameter(node, parentPath);
              }}
            >
              Выбрать
            </button>
          )}
        </div>

        {isExpanded && hasChildren && (
          <div className="tree-children">
            {node.children?.map(child => renderTreeNode(child, level + 1, currentPath))}
            {node.parameters?.map(param => renderTreeNode(param, level + 1, currentPath))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-tree">
        <div className="modal-header">
          <h2>Выбор параметра из модели СТМ</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="tree-container">
          {renderTreeNode(STM_MODEL_TREE)}
        </div>

        <div className="modal-footer">
          <button className="secondary-btn" onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

/* Основной компонент страницы маппинга */
export default function MappingTablePage() {
  const [mappingRows, setMappingRows] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const addParameter = (parameter) => {
    const newRow = {
      id: Date.now(), // временный id
      parameterId: parameter.id,
      parameterName: parameter.name,
      unit: parameter.unit,
      group: "",
      sensorId: "",
    };
    setMappingRows([...mappingRows, newRow]);
  };

  const updateRow = (rowId, field, value) => {
    setMappingRows(rows =>
      rows.map(row =>
        row.id === rowId ? { ...row, [field]: value } : row
      )
    );
  };

  const removeRow = (rowId) => {
    setMappingRows(rows => rows.filter(row => row.id !== rowId));
  };

  const getFilteredSensors = (paramType) => {
    // Определяем тип датчика по названию параметра
    const paramName = mappingRows.find(r => r.id === paramType)?.parameterName || "";
    if (paramName.toLowerCase().includes("температур")) return SENSORS.filter(s => s.type === "temperature");
    if (paramName.toLowerCase().includes("давлен")) return SENSORS.filter(s => s.type === "pressure");
    if (paramName.toLowerCase().includes("расход")) return SENSORS.filter(s => s.type === "flow");
    if (paramName.toLowerCase().includes("уровень")) return SENSORS.filter(s => s.type === "level");
    if (paramName.toLowerCase().includes("качеств")) return SENSORS.filter(s => s.type === "quality");
    return SENSORS;
  };

  const saveMapping = () => {
    const payload = mappingRows.map(row => ({
      parameterId: row.parameterId,
      parameterName: row.parameterName,
      group: row.group,
      sensorId: row.sensorId || null,
    }));

    console.log("Сохранение маппинга в БД:", payload);
    alert(`Маппинг сохранён! Количество записей: ${mappingRows.length}`);
  };

  return (
    <div className="mapping-page">
      <div className="page-header">
        <h1>Маппинг параметров и датчиков</h1>
        <button
          className="primary-btn"
          onClick={() => setModalOpen(true)}
        >
          + Добавить параметр
        </button>
      </div>

      {mappingRows.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>Таблица маппинга пуста</h3>
          <p>Добавьте параметры из модели СТМ, используя кнопку "Добавить параметр"</p>
        </div>
      ) : (
        <>
          <table className="mapping-table">
            <thead>
              <tr>
                <th>Параметр расчетной схемы</th>
                <th>Единица измерения</th>
                <th>Группа</th>
                <th>Датчик объекта подготовки</th>
                <th>Действия</th>
              </tr>
            </thead>

            <tbody>
              {mappingRows.map(row => {
                const sensors = getFilteredSensors(row.id);
                
                return (
                  <tr key={row.id}>
                    <td>
                      <div className="parameter-name">{row.parameterName}</div>
                    </td>
                    
                    <td>
                      <div className="parameter-unit">{row.unit}</div>
                    </td>

                    <td>
                      <select
                        value={row.group}
                        onChange={e => updateRow(row.id, "group", e.target.value)}
                        className="group-select"
                      >
                        <option value="">— выбрать группу —</option>
                        <option value="input">Входные данные</option>
                        <option value="verification">Верификация и контроль</option>
                        <option value="output">Выходные параметры</option>
                        <option value="control">Управляющие параметры</option>
                      </select>
                    </td>

                    <td>
                      {row.group && (
                        <select
                          value={row.sensorId}
                          onChange={e => updateRow(row.id, "sensorId", e.target.value)}
                          className="sensor-select"
                        >
                          <option value="">— выбрать датчик —</option>
                          {sensors.map(sensor => (
                            <option key={sensor.id} value={sensor.id}>
                              {sensor.name}
                            </option>
                          ))}
                        </select>
                      )}
                      {!row.group && (
                        <span className="no-group">Сначала выберите группу</span>
                      )}
                    </td>

                    <td>
                      <button
                        className="remove-btn"
                        onClick={() => removeRow(row.id)}
                        title="Удалить параметр"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="summary-info">
            <div className="summary-text">
              Всего параметров: <strong>{mappingRows.length}</strong> | 
              Связано с датчиками: <strong>{mappingRows.filter(r => r.sensorId).length}</strong>
            </div>
          </div>
        </>
      )}

      {mappingRows.length > 0 && (
        <div className="actions">
          <button className="secondary-btn" onClick={() => setMappingRows([])}>
            Очистить таблицу
          </button>
          <button className="primary-btn" onClick={saveMapping}>
            Сохранить маппинг
          </button>
        </div>
      )}

      {/* Модальное окно выбора параметра */}
      <ParameterModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelectParameter={addParameter}
      />
    </div>
  );
}