import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";
import { SharedArray } from "k6/data";

// Custom metrics
const errorRate = new Rate("errors");
const tourLoadTime = new Trend("tour_load_time");
const nodeNavigationTime = new Trend("node_navigation_time");

// Test configuration
export const options = {
  stages: [
    { duration: "2m", target: 10 }, // Ramp up to 10 users
    { duration: "5m", target: 10 }, // Stay at 10 users
    { duration: "2m", target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"], // 95% of requests must complete below 2s
    http_req_failed: ["rate<0.1"], // Error rate must be below 10%
    errors: ["rate<0.1"],
  },
};

// Test data
const testTours = new SharedArray("tours", function () {
  return JSON.parse(open("./test-data/tours.json"));
});

const testNodes = new SharedArray("nodes", function () {
  return JSON.parse(open("./test-data/nodes.json"));
});

// Helper functions
function getRandomTour() {
  return testTours[Math.floor(Math.random() * testTours.length)];
}

function getRandomNode() {
  return testNodes[Math.floor(Math.random() * testNodes.length)];
}

// Login
function loginUser() {
  const loginData = {
    username: __ENV.TEST_USER_USERNAME || "vuvanthanh2k3@gmail.com",
    password: __ENV.TEST_USER_PASSWORD || "Admin123@",
  };

  const loginResponse = http.post(
    `${__ENV.API_BASE_URL}/login`,
    JSON.stringify(loginData),
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  check(loginResponse, {
    "login successful": (r) =>
      r.status === 200 && r.json("statusCode") === 1000,
  });

  return loginResponse.json("data.token");
}

// Main test scenario
export default function () {
  const baseUrl = __ENV.API_BASE_URL || "http://localhost:8080/app/api";

  // Login and get token
  const token = loginUser();
  if (!token) {
    console.error("Failed to login");
    return;
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // Scenario 1: Load master nodes (tour list)
  const masterNodesResponse = http.post(
    `${baseUrl}/node/master`,
    JSON.stringify({
      page: 0,
      limit: 10,
    }),
    { headers }
  );

  check(masterNodesResponse, {
    "master nodes loaded": (r) =>
      r.status === 200 && r.json("statusCode") === 1000,
  });

  tourLoadTime.add(masterNodesResponse.timings.duration);
  errorRate.add(masterNodesResponse.status !== 200);

  sleep(1);

  // Scenario 2: Load a specific tour
  const tour = getRandomTour();
  const tourResponse = http.post(
    `${baseUrl}/node/nodeListByMasterId`,
    JSON.stringify({
      masterId: tour.id,
    }),
    { headers }
  );

  check(tourResponse, {
    "tour loaded successfully": (r) =>
      r.status === 200 && r.json("statusCode") === 1000,
    "tour has nodes": (r) => r.json("data") && r.json("data").length > 0,
  });

  tourLoadTime.add(tourResponse.timings.duration);
  errorRate.add(tourResponse.status !== 200);

  sleep(2);

  // Scenario 3: Navigate between nodes
  const nodes = tourResponse.json("data");
  if (nodes && nodes.length > 0) {
    // Navigate to a random node
    const randomNode = nodes[Math.floor(Math.random() * nodes.length)];

    const nodeResponse = http.post(
      `${baseUrl}/node/preloadNodeList`,
      JSON.stringify({
        nodeId: randomNode.id,
      }),
      { headers }
    );

    check(nodeResponse, {
      "node navigation successful": (r) =>
        r.status === 200 && r.json("statusCode") === 1000,
    });

    nodeNavigationTime.add(nodeResponse.timings.duration);
    errorRate.add(nodeResponse.status !== 200);

    sleep(1);

    // Scenario 4: Get node comments
    const commentsResponse = http.post(
      `${baseUrl}/comment/getOfNode`,
      JSON.stringify({
        nodeId: randomNode.id,
      }),
      { headers }
    );

    check(commentsResponse, {
      "comments loaded": (r) =>
        r.status === 200 && r.json("statusCode") === 1000,
    });

    sleep(1);

    // Scenario 5: Increase node view count
    const viewResponse = http.post(
      `${baseUrl}/node/increaseView`,
      JSON.stringify({
        nodeId: randomNode.id,
      }),
      { headers }
    );

    check(viewResponse, {
      "view count increased": (r) =>
        r.status === 200 && r.json("statusCode") === 1000,
    });
  }

  // Random think time between actions
  sleep(Math.random() * 3 + 1);
}

// Setup function to prepare test data
export function setup() {
  console.log("Setting up test data...");

  // Verify API is accessible
  const healthCheck = http.get(
    `${__ENV.API_BASE_URL || "http://localhost:8080/app/api"}/node/default`
  );

  if (healthCheck.status !== 200) {
    throw new Error("API is not accessible");
  }

  console.log("Test setup completed");
  return { baseUrl: __ENV.API_BASE_URL || "http://localhost:8080/app/api" };
}

// Teardown function
export function teardown(data) {
  console.log("Cleaning up test data...");
  // Add cleanup logic here if needed
}
