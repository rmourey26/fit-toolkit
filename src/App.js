import { useEffect, useReducer, useState } from "react";
import "./styles.css";

import { login } from "./google-api";
import { loadClient, getSessions, getDataSources } from "./google-api-fitness";
import SessionsTable from "./components/SessionsTable";
import usePersistentState from "./components/usePersistentState";

async function handleLogin(refresh) {
  await login();
  refresh();
}

async function execute(fn) {
  await login();
  await loadClient();
  return await fn();
}

const inputDateToLocal = (v) =>
  new Date(Date.parse(v) + new Date().getTimezoneOffset() * 60 * 1000);

const dateToIsoDateString = (d) => d.toISOString().slice(0, 10);

const truncate = (s, n) => (s.length > n ? s.substring(0, n - 3) + "..." : s);

export default function App() {
  const [, forceUpdate] = useReducer((i) => i + 1, 0);

  const [startDate, setStartDate] = usePersistentState("startDate");
  const [endDate, setEndDate] = usePersistentState("endDate");

  const [sessions, setSessions] = useState();
  const [dataSources, setDataSources] = useState();
  const [dataTypes, setDataTypes] = useState();
  const [dataType, setDataType] = useState();

  useEffect(() => {
    if (!dataSources) {
      execute(getDataSources).then((res) => {
        setDataSources(res);
        const dts = {};
        for (const ds of res.dataSource) {
          dts[ds.dataType.name] = ds.dataType;
        }
        setDataTypes(dts);
      });
    }
  }, [dataSources]);

  return (
    <div className="App">
      <button onClick={() => handleLogin(forceUpdate)}>Login</button>
      <button
        onClick={() =>
          execute(() =>
            getSessions({ startTime: startDate, endTime: endDate })
          ).then(setSessions)
        }
      >
        Get sessions
      </button>
      <button onClick={() => execute(getDataSources).then(setDataSources)}>
        Get Data Sources
      </button>
      <label>
        From:
        <input
          type="date"
          value={startDate ? dateToIsoDateString(startDate) : ""}
          onChange={(ev) =>
            setStartDate(
              ev.currentTarget.value
                ? inputDateToLocal(ev.currentTarget.value)
                : undefined
            )
          }
        />
      </label>
      <label>
        To:
        <input
          type="date"
          value={endDate ? dateToIsoDateString(endDate) : ""}
          onChange={(ev) =>
            setEndDate(
              ev.currentTarget.value
                ? inputDateToLocal(ev.currentTarget.value)
                : undefined
            )
          }
        />
      </label>
      <label>
        Data type:
        <select
          value={dataType?.name}
          onChange={(ev) => setDataType(dataTypes[ev.currentTarget.value])}
        >
          {dataTypes &&
            Object.values(dataTypes).map((dt) => (
              <option
                key={dt.name}
                value={dt.name}
                title={dt.field.map((f) => `${f.name}: ${f.format}`).join("\n")}
              >
                {dt.name} (
                {truncate(dt.field.map((f) => f.name).join(", "), 20)})
              </option>
            ))}
        </select>
      </label>
      {!sessions ? null : (
        <SessionsTable sessions={sessions} filters={{ dataType }} />
      )}
    </div>
  );
}
