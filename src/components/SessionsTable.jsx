import { gapi } from "../google-api";
import {
  formatActivityType,
  formatDate,
  formatDuration,
  formatTime
} from "../google-fit-helpers";

async function handleGetDataSet(session, filters) {
  console.log("Get dataset for session %o with filters %o", session, filters);
  const response = await gapi.client.fitness.users.dataset.aggregate({
    userId: "me",
    startTimeMillis: session.startTimeMillis,
    endTimeMillis: session.endTimeMillis,
    aggregateBy: {
      dataTypeName: filters.dataType?.name
    }
  });
  console.log("Response", response);
}

const showEndTime = false;
const showDescription = false;

const isNewDay = (a, b) => {
  const d1 = new Date(Number(a.startTimeMillis));
  const d2 = new Date(Number(b.startTimeMillis));
  return d1.getDay() !== d2.getDay();
};

export default function SessionsTable({ sessions, filters }) {
  const sortedSessions = sessions.session.sort(
    (a, b) => b.startTimeMillis - a.startTimeMillis
  );
  return (
    <table cellspacing="0" cellpadding="0">
      <thead>
        <tr>
          <th></th>
          <th>Day</th>
          <th>Start time</th>
          <th>Length</th>
          {showEndTime && <th>End time</th>}
          <th>Type</th>
          <th>Name</th>
          {showDescription && <th>Description</th>}
          <th>Application</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {sortedSessions.map((s, i) => (
          <tr
            key={s.id}
            className={
              i > 0 && isNewDay(s, sortedSessions[i - 1]) ? "new-day" : ""
            }
          >
            <td>
              {false && (
                <details>
                  <summary></summary>
                </details>
              )}
            </td>
            <td className="date">{formatDate(s.startTimeMillis)}</td>
            <td className="time">{formatTime(s.startTimeMillis)}</td>
            <td className="duration">
              {formatDuration(s.endTimeMillis - s.startTimeMillis)}
            </td>
            {showEndTime && (
              <td className="time">{formatTime(s.endTimeMillis)}</td>
            )}
            <td className="activityType">
              {formatActivityType(s.activityType)}
            </td>
            <td>{s.name}</td>
            {showDescription && <td>{s.description}</td>}
            <td>{s.application.packageName}</td>
            <td>
              <button onClick={() => handleGetDataSet(s, filters)}>
                Dataset
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
