import { check, fail } from "k6";
import http from "k6/http";

export const options = {
  vus: 10,
  duration: "10s",
};
export default function () {
  const uniqueId = new Date().getTime();
  const registerRequest = {
    username: `user-${uniqueId}`,
    password: "rahasia",
    name: "riz-it",
  };

  const registerResponse = http.post(
    "http://localhost:3000/api/users",
    JSON.stringify(registerRequest),
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  const checkRegister = check(registerResponse, {
    "register response status must be 200": (response) =>
      response.status === 200,
    "register response data must not null": (response) =>
      response.json().data != null,
  });

  if (!checkRegister) {
    fail(`Failed to register user-${uniqueId}`);
  }

  const loginRequest = {
    username: `user-${uniqueId}`,
    password: "rahasia",
  };

  const loginResponse = http.post(
    "http://localhost:3000/api/users/login",
    JSON.stringify(loginRequest),
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  const checkLogin = check(loginResponse, {
    "login response status must be 200": (response) => response.status === 200,
    "login response token must exist": (response) =>
      response.json().data.token != null,
  });

  if (!checkLogin) {
    fail(`Failed to login user-${uniqueId}`);
  }

  const isLogin = loginResponse.json();

  const currentResponse = http.get("http://localhost:3000/api/users/current", {
    headers: {
      Accept: "application/json",
      Authorization: isLogin.data.token,
    },
  });

  const checkCurrent = check(currentResponse, {
    "current response status must be 200": (response) =>
      response.status === 200,
    "current response data must not null": (response) =>
      response.json().data != null,
  });

  if (!checkCurrent) {
    fail(`Failed to get current user-${uniqueId}`);
  }
}
