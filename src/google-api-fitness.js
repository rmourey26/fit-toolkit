import { gapi } from "./google-api";
import secrets from "./secrets";

export function loadClient() {
  gapi.client.setApiKey(secrets.GAPI_API_KEY);
  return gapi.client
    .load("https://content.googleapis.com/discovery/v1/apis/fitness/v1/rest")
    .then(
      function () {
        console.log("GAPI client loaded for API");
      },
      function (err) {
        console.error("Error loading GAPI client for API", err);
      }
    );
}

// Make sure the client is loaded and sign-in is complete before calling this method.
export function getSessions({ startTime, endTime } = {}) {
  return gapi.client.fitness.users.sessions
    .list({
      userId: "me",
      // FIXME looks like the date might have to be in UTC - 2022-06-18 returns prior events
      startTime: startTime && startTime.toISOString(),
      endTime: endTime && endTime.toISOString()
    })
    .then(function (response) {
      // Handle the results here (response.result has the parsed body).
      console.log("Response", response);
      console.table(response.result.session);
      return response.result;
    });
}

export const getDataSources = ({ dataTypeName } = {}) =>
  gapi.client.fitness.users.dataSources
    .list({
      userId: "me",
      dataTypeName
    })
    .then((response) => {
      console.log("Response", response);
      // console.table(response.result.dataSource);
      return response.result;
    });
