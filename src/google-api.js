import secrets from "./secrets";

// loaded via script tag
export const gapi = window.gapi;
export const google = window.google; // XXX might be a problem because of async defer?

const fitnessScopes = [
  "https://www.googleapis.com/auth/fitness.activity.read",
  "https://www.googleapis.com/auth/fitness.activity.write",
  "https://www.googleapis.com/auth/fitness.blood_glucose.read",
  "https://www.googleapis.com/auth/fitness.blood_glucose.write",
  "https://www.googleapis.com/auth/fitness.blood_pressure.read",
  "https://www.googleapis.com/auth/fitness.blood_pressure.write",
  "https://www.googleapis.com/auth/fitness.body.read",
  "https://www.googleapis.com/auth/fitness.body.write",
  "https://www.googleapis.com/auth/fitness.body_temperature.read",
  "https://www.googleapis.com/auth/fitness.body_temperature.write",
  "https://www.googleapis.com/auth/fitness.heart_rate.read",
  "https://www.googleapis.com/auth/fitness.heart_rate.write",
  "https://www.googleapis.com/auth/fitness.location.read",
  "https://www.googleapis.com/auth/fitness.location.write",
  "https://www.googleapis.com/auth/fitness.nutrition.read",
  "https://www.googleapis.com/auth/fitness.nutrition.write",
  "https://www.googleapis.com/auth/fitness.oxygen_saturation.read",
  "https://www.googleapis.com/auth/fitness.oxygen_saturation.write",
  "https://www.googleapis.com/auth/fitness.reproductive_health.read",
  "https://www.googleapis.com/auth/fitness.reproductive_health.write",
  "https://www.googleapis.com/auth/fitness.sleep.read",
  "https://www.googleapis.com/auth/fitness.sleep.write"
];

const scopes = fitnessScopes.filter((s) => s.endsWith(".read"));

const tokenClient = google.accounts.oauth2.initTokenClient({
  client_id: secrets.GAPI_CLIENT_ID,
  scope: scopes.join(" "),
  callback: (tokenResponse) => {}
});

async function requestAccessTokenAsync() {
  return new Promise((resolve, reject) => {
    // probably needs some locking to prevent overriding callbacks on concurrent requets?
    tokenClient.callback = (tokenResponse) => {
      console.debug("requestAccessToken:callback", tokenResponse);

      if (tokenResponse.error) {
        reject(tokenResponse);
      }

      resolve(tokenResponse);
    };
    tokenClient.requestAccessToken();
  });
}

const localStorageKey = "GOOGLE_ACCESS_TOKEN_DATA";

async function getTokenData() {
  const tokenDataJson = localStorage.getItem(localStorageKey);
  let tokenData = tokenDataJson && JSON.parse(tokenDataJson);
  if (tokenData && tokenData.expirationTime > Date.now()) {
    gapi.client.setToken(tokenData);
  } else {
    const response = await requestAccessTokenAsync();
    tokenData = {
      ...response,
      expirationTime: response.expires_in * 1000 + Date.now()
    };
    localStorage.setItem(localStorageKey, JSON.stringify(tokenData));
  }
  return tokenData;
}

async function getToken() {
  return (await getTokenData()).access_token;
}

async function authenticate() {
  return getToken();
}

// TODO add function to handle expired tokens

export function gapiLoadAsync(libraries) {
  return new Promise((resolve, reject) => {
    gapi.load(libraries, {
      callback: resolve,
      onerror: reject
    });
  });
}

export async function login() {
  await gapiLoadAsync("client");
  if (gapi.client.getToken() == null) {
    await authenticate();
  }
}
