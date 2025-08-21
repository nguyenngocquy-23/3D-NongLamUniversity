import http from "k6/http";
import ws from "k6/ws";
import { sleep, check } from "k6";
import { Rate, Trend } from "k6/metrics";

// Custom metrics
const errorRate = new Rate("errors");
const loginTime = new Trend("login_time");
const nodeLoadTime = new Trend("node_load_time");
const chatTime = new Trend("chat_time");

// Test configuration
export const options = {
  stages: [
    { duration: "2m", target: 50 },
    { duration: "3m", target: 50 },
    { duration: "2m", target: 100 },
    { duration: "5m", target: 100 },
    { duration: "2m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    errors: ["rate<0.1"],
    login_time: ["p(95)<3000"],
    node_load_time: ["p(95)<1500"],
    chat_time: ["p(95)<1000"],
  },
};

// Test data
const testUsers = [];
for (let i = 573; i <= 672; i++) {
  testUsers.push({ username: `user${i}`, password: "Admin123@", id: i });
}
const tourNodes = [
  5722, 5738, 5740, 5723, 5726, 5727, 5728, 5730, 5751, 5750, 5743, 5747, 5745,
];
const chatMessages = [
  "This place looks amazing!",
  "Great virtual tour experience",
  "I can see the details clearly",
  "The navigation is smooth",
  "Wonderful 3D experience",
  "This is very helpful for visitors",
  "I love the panoramic views",
  "Excellent tour guide",
];

// Common headers
const baseHeaders = {
  Accept: "application/json, text/plain, */*",
  "Accept-Encoding": "gzip, deflate, br, zstd",
  "Accept-Language": "vi",
  "Content-Type": "application/json",
  Origin: "http://localhost:5173",
  Referer: "http://localhost:5173/",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
  "sec-ch-ua":
    '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
};

// Helpers
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Authenticate and return token + headers
function authenticate() {
  const user = getRandomElement(testUsers);
  const loginStart = Date.now();
  const loginResponse = http.post(
    "http://localhost:8080/app/api/login",
    JSON.stringify({ username: user.username, password: user.password }),
    { headers: baseHeaders }
  );
  loginTime.add(Date.now() - loginStart);
  const loginCheck = check(loginResponse, {
    "login successful": (r) =>
      r.status === 200 && r.json("statusCode") === 1000,
    "login time < 3s": (r) => r.timings.duration < 3000,
  });

  if (!loginCheck) {
    errorRate.add(1);
    console.log(`Login failed for ${user.username}`);
    return null;
  }
  const token = loginResponse.json("data").token;
  const authHeaders = { ...baseHeaders, Authorization: `${token}` };

  // Get user info
  const userResponse = http.post(
    "http://localhost:8080/app/api/user",
    JSON.stringify({ username: user.username }),
    { headers: authHeaders }
  );
  check(userResponse, { "user info retrieved": (r) => r.status === 200 });
  sleep(getRandomInt(1, 3));
  return { username: user.username, token, authHeaders, id: user.id };
}

// Load initial data
function loadInitialData(authHeaders) {
  check(
    http.get("http://localhost:8080/app/api/space", { headers: authHeaders }),
    {
      "spaces loaded": (r) => r.status === 200,
    }
  );
  check(
    http.get("http://localhost:8080/app/api/v1/admin/icon", {
      headers: authHeaders,
    }),
    { "icons loaded": (r) => r.status === 200 }
  );
  check(
    http.post("http://localhost:8080/app/api/node/default", null, {
      headers: authHeaders,
    }),
    {
      "default node loaded": (r) => r.status === 200,
    }
  );
  sleep(getRandomInt(2, 4));
}

// Navigate tour
function navigateTour(authHeaders) {
  const numNodes = getRandomInt(3, 8);
  const visited = [];
  for (let i = 0; i < numNodes; i++) {
    const nodeId = getRandomElement(tourNodes);
    if (visited.includes(nodeId)) continue;
    visited.push(nodeId);
    const nodeStart = Date.now();
    check(
      http.post(
        "http://localhost:8080/app/api/node/byId",
        JSON.stringify({ nodeId }),
        {
          headers: authHeaders,
        }
      ),
      { "node loaded": (r) => r.status === 200 }
    );
    nodeLoadTime.add(Date.now() - nodeStart);
    http.post(
      "http://localhost:8080/app/api/node/preloadNodeList",
      JSON.stringify({ nodeId }),
      {
        headers: authHeaders,
      }
    );
    http.post(
      "http://localhost:8080/app/api/comment/getOfNode",
      JSON.stringify({ nodeId }),
      {
        headers: authHeaders,
      }
    );
    // Simulate WebSocket chat
    if (Math.random() < 0.3) simulateWebSocketChat(nodeId, authHeaders);
    sleep(getRandomInt(3, 8));
  }
}

// Simulate WebSocket chat

// Main scenario
export default function () {
  const user = authenticate();
  if (!user) return;

  loadInitialData(user.authHeaders);

  const behavior = Math.random();
  if (behavior < 0.4) navigateTour(user);
  else if (behavior < 0.7) {
    loadAutoTour(user.authHeaders);
    navigateTour(user);
  } else if (behavior < 0.9) {
    loadMasterNodes(user.authHeaders);
    navigateTour(user);
  } else {
    navigateTour(user);
    for (let i = 0; i < 3; i++)
      simulateWebSocketChat(getRandomElement(tourNodes), user);
  }

  sleep(getRandomInt(5, 10));
}

// Load auto tour
function loadAutoTour(authHeaders) {
  check(
    http.post(
      "http://localhost:8080/app/api/node/getAutoTour",
      JSON.stringify({ page: 0, limit: 6 }),
      { headers: authHeaders }
    ),
    { "auto tour loaded": (r) => r.status === 200 }
  );
  sleep(getRandomInt(2, 4));
}

// Load master nodes
function loadMasterNodes(authHeaders) {
  check(
    http.post(
      "http://localhost:8080/app/api/node/master",
      JSON.stringify({ page: 0, limit: 7 }),
      { headers: authHeaders }
    ),
    { "master nodes loaded": (r) => r.status === 200 }
  );
  sleep(getRandomInt(1, 3));
}

// Setup
export function setup() {
  console.log(`Starting k6 test with ${testUsers.length} users`);
  const health = http.get("http://localhost:8080/app/api/space");
  if (health.status !== 200) throw new Error("API not accessible");
}

// Teardown
export function teardown() {
  console.log("Load test completed");
}
