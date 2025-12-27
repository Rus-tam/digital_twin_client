import React, { useState } from "react";
import "../styles/modal-tree.css";

/* Полная древовидная структура модели СТМ */
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
            { id: "stream-1-temp", name: "Температура", unit: "°C", type: "temperature" },
            { id: "stream-1-pressure", name: "Давление", unit: "МПа", type: "pressure" },
            { id: "stream-1-flow", name: "Массовый расход", unit: "кг/с", type: "flow" },
            { id: "stream-1-composition", name: "Состав", unit: "мольн.доли", type: "composition" },
          ]
        },
        {
          id: "stream-2",
          name: "Поток 2 - После сепарации",
          parameters: [
            { id: "stream-2-temp", name: "Температура", unit: "°C", type: "temperature" },
            { id: "stream-2-pressure", name: "Давление", unit: "МПа", type: "pressure" },
            { id: "stream-2-flow", name: "Массовый расход", unit: "кг/с", type: "flow" },
            { id: "stream-2-humidity", name: "Влажность", unit: "г/м³", type: "humidity" },
          ]
        },
        {
          id: "stream-3",
          name: "Поток 3 - Товарный газ",
          parameters: [
            { id: "stream-3-temp", name: "Температура", unit: "°C", type: "temperature" },
            { id: "stream-3-pressure", name: "Давление", unit: "МПа", type: "pressure" },
            { id: "stream-3-flow", name: "Массовый расход", unit: "кг/с", type: "flow" },
            { id: "stream-3-quality", name: "Качество", unit: "%", type: "quality" },
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
            { id: "sep-1-temp", name: "Температура в аппарате", unit: "°C", type: "temperature" },
            { id: "sep-1-pressure", name: "Давление", unit: "МПа", type: "pressure" },
            { id: "sep-1-level", name: "Уровень жидкости", unit: "%", type: "level" },
            { id: "sep-1-efficiency", name: "Эффективность сепарации", unit: "%", type: "efficiency" },
          ]
        },
        {
          id: "heat-1",
          name: "Теплообменник Т-1",
          parameters: [
            { id: "heat-1-temp-in", name: "Температура на входе", unit: "°C", type: "temperature" },
            { id: "heat-1-temp-out", name: "Температура на выходе", unit: "°C", type: "temperature" },
            { id: "heat-1-delta-t", name: "Перепад температур", unit: "К", type: "temperature" },
            { id: "heat-1-duty", name: "Тепловая нагрузка", unit: "кВт", type: "power" },
          ]
        },
        {
          id: "comp-1",
          name: "Компрессор К-1",
          parameters: [
            { id: "comp-1-power", name: "Потребляемая мощность", unit: "кВт", type: "power" },
            { id: "comp-1-efficiency", name: "КПД", unit: "%", type: "efficiency" },
            { id: "comp-1-speed", name: "Частота вращения", unit: "об/мин", type: "speed" },
            { id: "comp-1-vibration", name: "Вибрация", unit: "мм/с", type: "vibration" },
          ]
        }
      ]
    },
    {
      type: "equipment",
      name: "Оборудование",
      children: [
        {
          id: "pump-1",
          name: "Насос Н-1",
          parameters: [
            { id: "pump-1-flow", name: "Подача", unit: "м³/ч", type: "flow" },
            { id: "pump-1-pressure", name: "Напор", unit: "МПа", type: "pressure" },
            { id: "pump-1-power", name: "Мощность", unit: "кВт", type: "power" },
            { id: "pump-1-temp", name: "Температура подшипников", unit: "°C", type: "temperature" },
          ]
        },
        {
          id: "valve-1",
          name: "Клапан КЛ-1",
          parameters: [
            { id: "valve-1-position", name: "Положение", unit: "%", type: "position" },
            { id: "valve-1-flow", name: "Расход через клапан", unit: "м³/ч", type: "flow" },
            { id: "valve-1-dp", name: "Перепад давления", unit: "МПа", type: "pressure" },
          ]
        }
      ]
    }
  ]
};

/* Компонент модального окна с деревом параметров */
export default function ParameterModal({ isOpen, onClose, onSelectParameter }) {
  const [expandedNodes, setExpandedNodes] = useState(["root", "streams", "apparatus", "equipment"]);
  const [searchTerm, setSearchTerm] = useState("");

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
      unit: parameter.unit,
      type: parameter.type
    });
    onClose();
  };

  // Функция для рекурсивного рендеринга дерева
  const renderTreeNode = (node, level = 0, parentPath = "", searchFilter = "") => {
    const nodeId = node.id || node.type || `root-${node.modelId}`;
    const isExpanded = expandedNodes.includes(nodeId);
    const currentPath = parentPath 
      ? `${parentPath} > ${node.name || node.objectName}`
      : `${node.modelId} - ${node.objectName}`;

    const hasChildren = node.children || node.parameters;
    const isParameter = node.parameters === undefined && !node.children;

    // Фильтрация для поиска
    const nodeText = (node.name || node.modelId || "").toLowerCase();
    const searchText = searchFilter.toLowerCase();
    
    if (searchFilter && !nodeText.includes(searchText) && !isParameter) {
      // Проверяем детей на соответствие поиску
      const childrenMatch = hasChildren ? 
        (node.children?.some(child => child.name.toLowerCase().includes(searchText)) ||
         node.parameters?.some(param => param.name.toLowerCase().includes(searchText))) 
        : false;
      
      if (!childrenMatch) return null;
    }

    return (
      <div key={nodeId} className="tree-node">
        <div 
          className={`tree-item level-${Math.min(level, 4)} ${hasChildren ? "has-children" : "parameter"}`}
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
            {!node.modelId && (
              <>
                <div style={{ fontWeight: hasChildren ? 600 : 400 }}>
                  {node.name}
                  {isParameter && (
                    <span style={{ 
                      fontSize: "11px", 
                      color: "var(--text-tertiary)",
                      marginLeft: "8px",
                      fontFamily: "'Consolas', monospace"
                    }}>
                      {node.unit}
                    </span>
                  )}
                </div>
                {isParameter && node.type && (
                  <div style={{ 
                    fontSize: "10px", 
                    color: "var(--text-tertiary)",
                    marginTop: "2px"
                  }}>
                    Тип: {node.type}
                  </div>
                )}
              </>
            )}
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
            {node.children?.map(child => renderTreeNode(child, level + 1, currentPath, searchFilter))}
            {node.parameters?.map(param => renderTreeNode(param, level + 1, currentPath, searchFilter))}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-tree">
        <div className="modal-header">
          <h2>Выбор параметра из модели СТМ</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Поиск по параметрам */}
        <div style={{ 
          padding: "0 var(--spacing-md) var(--spacing-md)",
          borderBottom: "1px solid var(--border-color)"
        }}>
          <input
            type="text"
            placeholder="Поиск параметров..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--border-radius)",
              fontSize: "12px",
              backgroundColor: "white"
            }}
          />
          <div style={{ 
            fontSize: "11px", 
            color: "var(--text-tertiary)",
            marginTop: "4px",
            display: "flex",
            justifyContent: "space-between"
          }}>
            <span>Найдено в: Потоки, Аппараты, Оборудование</span>
            <button 
              onClick={() => setSearchTerm("")}
              style={{
                background: "none",
                border: "none",
                color: "var(--accent-blue)",
                cursor: "pointer",
                fontSize: "11px"
              }}
            >
              Сбросить
            </button>
          </div>
        </div>

        {/* Информация о модели */}
        <div style={{ 
          padding: "var(--spacing-md)",
          backgroundColor: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border-color)"
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: "13px" }}>{STM_MODEL_TREE.modelId}</div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                {STM_MODEL_TREE.objectName}
              </div>
            </div>
            <div style={{ 
              fontSize: "11px", 
              color: "var(--text-tertiary)",
              textAlign: "right"
            }}>
              <div>Параметров: 23</div>
              <div>Уровней: 4</div>
            </div>
          </div>
        </div>

        {/* Дерево параметров */}
        <div className="tree-container">
          {searchTerm ? (
            // Режим поиска - показываем все подходящие параметры
            <div>
              {STM_MODEL_TREE.children.flatMap(section => 
                section.children.flatMap(item => 
                  item.parameters.filter(param => 
                    param.name.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map(param => (
                    <div 
                      key={param.id}
                      className="tree-item parameter"
                      style={{ paddingLeft: "12px", margin: "4px 0" }}
                      onClick={() => handleSelectParameter(param, `${section.name} > ${item.name}`)}
                    >
                      <span className="param-icon">⚬</span>
                      <span className="tree-label">
                        <div style={{ fontWeight: 400 }}>
                          {param.name}
                          <span style={{ 
                            fontSize: "11px", 
                            color: "var(--text-tertiary)",
                            marginLeft: "8px",
                            fontFamily: "'Consolas', monospace"
                          }}>
                            {param.unit}
                          </span>
                        </div>
                        <div style={{ 
                          fontSize: "10px", 
                          color: "var(--text-tertiary)",
                          marginTop: "2px"
                        }}>
                          {section.name} &gt; {item.name}
                        </div>
                      </span>
                      <button 
                        className="select-param-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectParameter(param, `${section.name} > ${item.name}`);
                        }}
                      >
                        Выбрать
                      </button>
                    </div>
                  ))
                )
              )}
            </div>
          ) : (
            // Обычный режим - полное дерево
            renderTreeNode(STM_MODEL_TREE, 0, "", "")
          )}
          
          {searchTerm && 
            STM_MODEL_TREE.children.flatMap(section => 
              section.children.flatMap(item => 
                item.parameters.filter(param => 
                  param.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
              )
            ).length === 0 && (
              <div style={{ 
                textAlign: "center", 
                padding: "40px 20px",
                color: "var(--text-tertiary)"
              }}>
                Параметры не найдены
              </div>
            )
          }
        </div>

        {/* Статистика и действия */}
        <div className="modal-footer">
          <div style={{ 
            fontSize: "11px", 
            color: "var(--text-tertiary)",
            flex: 1
          }}>
            Выберите параметр для добавления в таблицу маппинга
          </div>
          <button className="secondary-btn" onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}