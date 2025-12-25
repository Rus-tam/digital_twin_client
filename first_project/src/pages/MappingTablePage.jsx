import React, { useState } from "react";
import "../styles/mapping-table.css";

/* MOCK ДАННЫЕ — потом заменишь API */

const PARAMETERS = [
  { id: 1, name: "Температура входа", type: "temperature" },
  { id: 2, name: "Давление входа", type: "pressure" },
  { id: 3, name: "Расход сырья", type: "flow" },
  { id: 4, name: "Температура выхода", type: "temperature" },
];

const SENSORS = [
  { id: "T-101", name: "Датчик T-101", type: "temperature" },
  { id: "T-102", name: "Датчик T-102", type: "temperature" },
  { id: "P-201", name: "Датчик P-201", type: "pressure" },
  { id: "F-301", name: "Датчик F-301", type: "flow" },
];

export default function MappingTablePage() {
  const [classification, setClassification] = useState({});
  const [mapping, setMapping] = useState({});

  const setGroup = (paramId, group) => {
    setClassification(prev => ({
      ...prev,
      [paramId]: group,
    }));
  };

  const setSensor = (paramId, sensorId) => {
    setMapping(prev => ({
      ...prev,
      [paramId]: sensorId || null,
    }));
  };

  const getFilteredSensors = (type) =>
    SENSORS.filter(sensor => sensor.type === type);

  const saveMapping = () => {
    const payload = PARAMETERS.map(p => ({
      parameterId: p.id,
      group: classification[p.id],
      sensorId: mapping[p.id] || null,
    }));

    console.log("Сохранение в БД:", payload);
    alert("Маппинг сохранён (mock)");
  };

  return (
    <div className="mapping-page">
      <h1>Маппинг параметров и датчиков</h1>

      <table className="mapping-table">
        <thead>
          <tr>
            <th>Параметр расчетной схемы</th>
            <th>Группа</th>
            <th>Датчик объекта подготовки</th>
          </tr>
        </thead>

        <tbody>
          {PARAMETERS.map(param => {
            const group = classification[param.id];
            const sensors = getFilteredSensors(param.type);

            return (
              <tr key={param.id}>
                <td>{param.name}</td>

                <td>
                  <select
                    value={group || ""}
                    onChange={e => setGroup(param.id, e.target.value)}
                  >
                    <option value="">— выбрать —</option>
                    <option value="input">Входные данные</option>
                    <option value="verification">
                      Верификация и контроль
                    </option>
                  </select>
                </td>

                <td>
                  {group === "verification" && (
                    <select
                      value={mapping[param.id] || ""}
                      onChange={e =>
                        setSensor(param.id, e.target.value || null)
                      }
                    >
                      <option value="">
                        Без привязки к датчику
                      </option>

                      {sensors.map(sensor => (
                        <option key={sensor.id} value={sensor.id}>
                          {sensor.name}
                        </option>
                      ))}
                    </select>
                  )}

                  {group === "input" && (
                    <select
                      value={mapping[param.id] || ""}
                      onChange={e =>
                        setSensor(param.id, e.target.value)
                      }
                    >
                      <option value="">— выбрать датчик —</option>

                      {sensors.map(sensor => (
                        <option key={sensor.id} value={sensor.id}>
                          {sensor.name}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="actions">
        <button className="primary-btn" onClick={saveMapping}>
          Сохранить маппинг
        </button>
      </div>
    </div>
  );
}
