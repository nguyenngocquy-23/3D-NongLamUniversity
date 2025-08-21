import http from "k6/http";
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
    { duration: "2m", target: 50 }, // Ramp up to 50 users
    { duration: "3m", target: 50 }, // Stay at 50 users
    { duration: "2m", target: 100 }, // Ramp up to 100 users
    { duration: "5m", target: 100 }, // Stay at 100 users
    { duration: "2m", target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"], // 95% of requests should be below 2s
    errors: ["rate<0.1"], // Error rate should be below 10%
    login_time: ["p(95)<3000"], // Login should complete within 3s
    node_load_time: ["p(95)<1500"], // Node loading should complete within 1.5s
    chat_time: ["p(95)<1000"], // Chat operations should complete within 1s
  },
};

// Test data - realistic user credentials and tour data
const testUsers = [
  { username: "vuvanthanh2k3", password: "Admin123@" },
  { username: "testuser1", password: "TestPass123!" },
  { username: "testuser2", password: "TestPass456!" },
  { username: "visitor1", password: "VisitorPass123!" },
  { username: "admin1", password: "AdminPass456!" },
];

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

// Common headers for API requests
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

// Helper function to get random element from array
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random number between min and max
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Authentication function
function authenticate() {
  const user = getRandomElement(testUsers);

  const loginStart = Date.now();

  const loginResponse = http.post(
    "http://localhost:8080/app/api/login",
    JSON.stringify({
      username: user.username,
      password: user.password,
    }),
    { headers: baseHeaders }
  );

  const loginDuration = Date.now() - loginStart;
  loginTime.add(loginDuration);

  const loginCheck = check(loginResponse, {
    "login successful": (r) =>
      r.status === 200 && r.json("statusCode") === 1000,
    "login response time < 3s": (r) => r.timings.duration < 3000,
  });

  if (!loginCheck) {
    errorRate.add(1);
    console.log(
      `Login failed for user ${user.username}: ${loginResponse.status}`
    );
    return null;
  }

  // Get user info
  const userResponse = http.post(
    "http://localhost:8080/app/api/user",
    JSON.stringify({ username: user.username }),
    { headers: baseHeaders }
  );

  check(userResponse, {
    "user info retrieved": (r) => r.status === 200,
  });

  sleep(getRandomInt(1, 3)); // Think time after login

  return user;
}

// Load initial tour data
function loadInitialData() {
  // Load spaces
  const spaceResponse = http.get("http://localhost:8080/app/api/space", {
    headers: baseHeaders,
  });

  check(spaceResponse, {
    "spaces loaded": (r) => r.status === 200,
  });

  // Load icons
  const iconResponse = http.get("http://localhost:8080/app/api/v1/admin/icon", {
    headers: baseHeaders,
  });

  check(iconResponse, {
    "icons loaded": (r) => r.status === 200,
  });

  // Get default node
  const defaultNodeResponse = http.post(
    "http://localhost:8080/app/api/node/default",
    null,
    { headers: baseHeaders }
  );

  check(defaultNodeResponse, {
    "default node loaded": (r) => r.status === 200,
  });

  sleep(getRandomInt(2, 4)); // Think time after loading initial data
}

// Navigate through tour nodes
function navigateTour() {
  const numNodesToVisit = getRandomInt(3, 8); // Visit 3-8 nodes per session
  const visitedNodes = [];

  for (let i = 0; i < numNodesToVisit; i++) {
    const nodeId = getRandomElement(tourNodes);

    // Avoid visiting the same node twice in one session
    if (visitedNodes.includes(nodeId)) {
      continue;
    }
    visitedNodes.push(nodeId);

    const nodeStart = Date.now();

    // Load specific node
    const nodeResponse = http.post(
      "http://localhost:8080/app/api/node/byId",
      JSON.stringify({ nodeId: nodeId }),
      { headers: baseHeaders }
    );

    const nodeDuration = Date.now() - nodeStart;
    nodeLoadTime.add(nodeDuration);

    check(nodeResponse, {
      "node loaded successfully": (r) => r.status === 200,
      "node response time < 1.5s": (r) => r.timings.duration < 1500,
    });

    // Preload connected nodes
    const preloadResponse = http.post(
      "http://localhost:8080/app/api/node/preloadNodeList",
      JSON.stringify({ nodeId: nodeId }),
      { headers: baseHeaders }
    );

    check(preloadResponse, {
      "node preload successful": (r) => r.status === 200,
    });

    // Load comments for this node
    const commentResponse = http.post(
      "http://localhost:8080/app/api/comment/getOfNode",
      JSON.stringify({ nodeId: nodeId }),
      { headers: baseHeaders }
    );

    check(commentResponse, {
      "comments loaded": (r) => r.status === 200,
    });

    // Simulate chat activity (30% chance)
    if (Math.random() < 0.3) {
      simulateChat(nodeId);
    }

    // Think time between nodes (realistic navigation)
    sleep(getRandomInt(3, 8));
  }
}

// Simulate chat functionality
function simulateChat(nodeId) {
  const chatStart = Date.now();

  // Get chat messages
  const chatResponse = http.get(
    `http://localhost:8080/app/api/chat/messages?nodeId=${nodeId}&page=0&limit=6`,
    { headers: baseHeaders }
  );

  const chatDuration = Date.now() - chatStart;
  chatTime.add(chatDuration);

  check(chatResponse, {
    "chat messages loaded": (r) => r.status === 200,
    "chat response time < 1s": (r) => r.timings.duration < 1000,
  });

  // Simulate sending a message (20% chance)
  if (Math.random() < 0.2) {
    const message = getRandomElement(chatMessages);

    // Note: WebSocket connections would be handled differently in a real scenario
    // For this test, we're just simulating the chat message retrieval
    console.log(`Simulated sending message: "${message}" to node ${nodeId}`);
  }

  sleep(getRandomInt(1, 3)); // Think time for chat
}

// Load auto tour data
function loadAutoTour() {
  const autoTourResponse = http.post(
    "http://localhost:8080/app/api/node/getAutoTour",
    JSON.stringify({ page: 0, limit: 6 }),
    { headers: baseHeaders }
  );

  check(autoTourResponse, {
    "auto tour loaded": (r) => r.status === 200,
  });

  sleep(getRandomInt(2, 4)); // Think time after loading auto tour
}

// Load master node data
function loadMasterNodes() {
  const masterResponse = http.post(
    "http://localhost:8080/app/api/node/master",
    JSON.stringify({ page: 0, limit: 7 }),
    { headers: baseHeaders }
  );

  check(masterResponse, {
    "master nodes loaded": (r) => r.status === 200,
  });

  sleep(getRandomInt(1, 3)); // Think time after loading master nodes
}

// Main test scenario
export default function () {
  // Start with authentication
  const user = authenticate();
  if (!user) {
    console.log("Authentication failed, skipping test iteration");
    return;
  }

  // Load initial application data
  loadInitialData();

  // Simulate different user behaviors with weighted probabilities
  const behavior = Math.random();

  if (behavior < 0.4) {
    // 40% - Regular tour navigation
    navigateTour();
  } else if (behavior < 0.7) {
    // 30% - Auto tour exploration
    loadAutoTour();
    navigateTour(); // Still do some navigation
  } else if (behavior < 0.9) {
    // 20% - Master node exploration
    loadMasterNodes();
    navigateTour();
  } else {
    // 10% - Chat-heavy session
    navigateTour();
    // Simulate more chat activity
    for (let i = 0; i < 3; i++) {
      const randomNode = getRandomElement(tourNodes);
      simulateChat(randomNode);
    }
  }

  // Final think time before next iteration
  sleep(getRandomInt(5, 10));
}

// Setup function (runs once at the beginning)
export function setup() {
  console.log("Starting k6 load test for 3D Virtual Tour API");
  console.log(
    `Testing with ${testUsers.length} test users and ${tourNodes.length} tour nodes`
  );

  // Verify API is accessible
  const healthCheck = http.get("http://localhost:8080/app/api/space");
  if (healthCheck.status !== 200) {
    throw new Error(
      "API is not accessible. Please ensure the backend is running."
    );
  }

  console.log("API health check passed");
}

// Teardown function (runs once at the end)
export function teardown(data) {
  console.log("Load test completed");
  console.log("Summary:");
  console.log(
    `- Total requests: ${data.metrics.http_reqs?.values?.count || "N/A"}`
  );
  console.log(`- Error rate: ${data.metrics.errors?.values?.rate || "N/A"}`);
  console.log(
    `- Average response time: ${
      data.metrics.http_req_duration?.values?.avg || "N/A"
    }ms`
  );
}
