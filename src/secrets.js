const secrets = ["GAPI_API_KEY", "GAPI_CLIENT_ID"];

const secret = (x) =>
  localStorage[x] ?? (localStorage[x] = prompt(`Provide ${x}`));

// always import whole object, directly importing keys will return nulls
export default Object.fromEntries(secrets.map((key) => [key, secret(key)]));
