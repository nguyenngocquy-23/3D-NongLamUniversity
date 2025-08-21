import http from "k6/http";
import { sleep, check } from "k6";

// Quick test configuration
export const options = {
  vus: 5, // 5 virtual users
  duration: "2m", // 2 minutes test duration
  thresholds: {
    http_req_duration: ["p(95)<2000"], // 95% of requests should be below 2s
    http_req_failed: ["rate<0.1"], // Error rate should be below 10%
  },
};

// Test data
const testUsers = [
  { username: "vuvanthanh2k3", password: "Admin123@" },
  { username: "testuser1", password: "TestPass123!" },
];

const tourNodes = [5722, 5738, 5740, 5723, 5726];

// Common headers
const baseHeaders = {
  Accept: "application/json, text/plain, */*",
  "Content-Type": "application/json",
  Origin: "http://localhost:5173",
  Referer: "http://localhost:5173/",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
};

// Helper functions
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Main test scenario
export default function () {
  // 1. Authentication
  const user = getRandomElement(testUsers);

  const loginResponse = http.post(
    "http://localhost:8080/app/api/login",
    JSON.stringify({
      username: user.username,
      password: user.password,
    }),
    { headers: baseHeaders }
  );

  check(loginResponse, {
    "login successful": (r) =>
      r.status === 200 && r.json("statusCode") === 1000,
  });

  sleep(getRandomInt(1, 2));

  // 2. Load initial data
  const spaceResponse = http.get("http://localhost:8080/app/api/space", {
    headers: baseHeaders,
  });

  check(spaceResponse, {
    "spaces loaded": (r) => r.status === 200,
  });

  const defaultNodeResponse = http.post(
    "http://localhost:8080/app/api/node/default",
    null,
    { headers: baseHeaders }
  );

  check(defaultNodeResponse, {
    "default node loaded": (r) => r.status === 200,
  });

  sleep(getRandomInt(1, 3));

  // 3. Navigate through 2-3 nodes
  const numNodes = getRandomInt(2, 3);

  for (let i = 0; i < numNodes; i++) {
    const nodeId = getRandomElement(tourNodes);

    // Load node
    const nodeResponse = http.post(
      "http://localhost:8080/app/api/node/byId",
      JSON.stringify({ nodeId: nodeId }),
      { headers: baseHeaders }
    );

    check(nodeResponse, {
      "node loaded successfully": (r) => r.status === 200,
    });

    // Load comments
    const commentResponse = http.post(
      "http://localhost:8080/app/api/comment/getOfNode",
      JSON.stringify({ nodeId: nodeId }),
      { headers: baseHeaders }
    );

    check(commentResponse, {
      "comments loaded": (r) => r.status === 200,
    });

    // Load chat messages (30% chance)
    if (Math.random() < 0.3) {
      const chatResponse = http.get(
        `http://localhost:8080/app/api/chat/messages?nodeId=${nodeId}&page=0&limit=6`,
        { headers: baseHeaders }
      );

      check(chatResponse, {
        "chat messages loaded": (r) => r.status === 200,
      });
    }

    sleep(getRandomInt(2, 4));
  }

  // 4. Load auto tour data
  const autoTourResponse = http.post(
    "http://localhost:8080/app/api/node/getAutoTour",
    JSON.stringify({ page: 0, limit: 6 }),
    { headers: baseHeaders }
  );

  check(autoTourResponse, {
    "auto tour loaded": (r) => r.status === 200,
  });

  sleep(getRandomInt(2, 4));
}

// Setup function
export function setup() {
  console.log("Starting quick k6 load test for 3D Virtual Tour API");

  // Health check
  const healthCheck = http.get("http://localhost:8080/app/api/space");
  if (healthCheck.status !== 200) {
    throw new Error(
      "API is not accessible. Please ensure the backend is running."
    );
  }

  console.log("API health check passed");
}
