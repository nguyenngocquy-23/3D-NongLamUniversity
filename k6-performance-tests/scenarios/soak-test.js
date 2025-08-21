import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend, Counter, Gauge } from "k6/metrics";
import { SharedArray } from "k6/data";

// Custom metrics for long-running tests
const errorRate = new Rate("errors");
const responseTime = new Trend("response_time");
const memoryUsage = new Gauge("memory_usage");
const activeConnections = new Gauge("active_connections");
const toursViewed = new Counter("tours_viewed");
const nodesNavigated = new Counter("nodes_navigated");
const commentsPosted = new Counter("comments_posted");

// Test configuration - Soak test for extended period
export const options = {
  stages: [
    { duration: "5m", target: 10 }, // Ramp up to 10 users
    { duration: "30m", target: 10 }, // Stay at 10 users for 30 minutes
    { duration: "5m", target: 20 }, // Increase to 20 users
    { duration: "30m", target: 20 }, // Stay at 20 users for 30 minutes
    { duration: "5m", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<5000"], // 95% of requests must complete below 5s
    http_req_failed: ["rate<0.1"], // Error rate must be below 10%
    errors: ["rate<0.1"],
    // Memory and connection thresholds for long-running tests
    memory_usage: ["value<1000000000"], // Memory usage should stay below 1GB
    active_connections: ["value<1000"], // Active connections should stay below 1000
  },
};

// Test data
const testTours = new SharedArray("tours", function () {
  return JSON.parse(open("./test-data/tours.json"));
});

const testUsers = new SharedArray("users", function () {
  return JSON.parse(open("./test-data/test-users.json"));
});

// Helper functions
function getRandomTour() {
  return testTours[Math.floor(Math.random() * testTours.length)];
}

function getRandomUser() {
  return testUsers[Math.floor(Math.random() * testUsers.length)];
}

function loginUser(username, password) {
  const loginData = { username, password };

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

function simulateUserSession(token, headers) {
  const baseUrl = __ENV.API_BASE_URL || "http://localhost:8080/app/api";

  // Simulate a realistic user session with various activities

  // 1. Browse available tours
  const masterNodesResponse = http.post(
    `${baseUrl}/node/master`,
    JSON.stringify({
      page: 0,
      limit: 20,
    }),
    { headers }
  );

  check(masterNodesResponse, {
    "master nodes loaded": (r) =>
      r.status === 200 && r.json("statusCode") === 1000,
  });

  responseTime.add(masterNodesResponse.timings.duration);
  errorRate.add(masterNodesResponse.status !== 200);

  sleep(2);

  // 2. Select and view a tour
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
  });

  responseTime.add(tourResponse.timings.duration);
  errorRate.add(tourResponse.status !== 200);
  toursViewed.add(1);

  sleep(3);

  // 3. Navigate through nodes in the tour
  const nodes = tourResponse.json("data");
  if (nodes && nodes.length > 0) {
    // Navigate through 2-4 nodes
    const numNodesToVisit = Math.min(
      Math.floor(Math.random() * 3) + 2,
      nodes.length
    );

    for (let i = 0; i < numNodesToVisit; i++) {
      const node = nodes[i];

      const nodeResponse = http.post(
        `${baseUrl}/node/preloadNodeList`,
        JSON.stringify({
          nodeId: node.id,
        }),
        { headers }
      );

      check(nodeResponse, {
        "node navigation successful": (r) =>
          r.status === 200 && r.json("statusCode") === 1000,
      });

      responseTime.add(nodeResponse.timings.duration);
      errorRate.add(nodeResponse.status !== 200);
      nodesNavigated.add(1);

      sleep(2);

      // 4. Interact with hotspots
      const hotspotResponse = http.post(
        `${baseUrl}/v1/admin/hotspot/getAllModel`,
        JSON.stringify({}),
        { headers }
      );

      check(hotspotResponse, {
        "hotspots loaded": (r) =>
          r.status === 200 && r.json("statusCode") === 1000,
      });

      sleep(1);

      // 5. View comments
      const commentsResponse = http.post(
        `${baseUrl}/comment/getOfNode`,
        JSON.stringify({
          nodeId: node.id,
        }),
        { headers }
      );

      check(commentsResponse, {
        "comments loaded": (r) =>
          r.status === 200 && r.json("statusCode") === 1000,
      });

      sleep(1);

      // 6. Occasionally post a comment (20% chance)
      if (Math.random() < 0.2) {
        const commentData = {
          nodeId: node.id,
          content: `Soak test comment at ${new Date().toISOString()}`,
          rating: Math.floor(Math.random() * 5) + 1,
        };

        const postCommentResponse = http.post(
          `${baseUrl}/comment/send`,
          JSON.stringify(commentData),
          { headers }
        );

        check(postCommentResponse, {
          "comment posted successfully": (r) =>
            r.status === 200 && r.json("statusCode") === 1000,
        });

        responseTime.add(postCommentResponse.timings.duration);
        errorRate.add(postCommentResponse.status !== 200);
        commentsPosted.add(1);
      }

      // 7. Update view count
      const viewResponse = http.post(
        `${baseUrl}/node/increaseView`,
        JSON.stringify({
          nodeId: node.id,
        }),
        { headers }
      );

      check(viewResponse, {
        "view count updated": (r) =>
          r.status === 200 && r.json("statusCode") === 1000,
      });

      sleep(1);
    }
  }

  // 8. Search for other tours
  const searchResponse = http.post(
    `${baseUrl}/v1/admin/node/search`,
    JSON.stringify({
      searchKey: "test",
    }),
    { headers }
  );

  check(searchResponse, {
    "search successful": (r) =>
      r.status === 200 && r.json("statusCode") === 1000,
  });

  sleep(2);
}

// Main soak test scenario
export default function () {
  const baseUrl = __ENV.API_BASE_URL || "http://localhost:8080/app/api";

  // Get random user credentials
  const user = getRandomUser();

  // Login with user credentials
  const token = loginUser(user.username, user.password);
  if (!token) {
    console.error("Failed to login");
    return;
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // Simulate a complete user session
  simulateUserSession(token, headers);

  // Simulate user taking a break (think time)
  sleep(Math.random() * 10 + 5); // 5-15 seconds break

  // Simulate another session (users often return)
  if (Math.random() < 0.3) {
    // 30% chance of second session
    simulateUserSession(token, headers);
  }

  // Longer think time between complete sessions
  sleep(Math.random() * 30 + 10); // 10-40 seconds between sessions
}

// Setup function
export function setup() {
  console.log("Setting up soak test...");

  // Verify API is accessible
  const healthCheck = http.get(
    `${__ENV.API_BASE_URL || "http://localhost:8080/app/api"}/node/default`
  );

  if (healthCheck.status !== 200) {
    throw new Error("API is not accessible");
  }

  // Initialize metrics
  memoryUsage.add(0);
  activeConnections.add(0);

  console.log("Soak test setup completed");
  return { baseUrl: __ENV.API_BASE_URL || "http://localhost:8080/app/api" };
}

// Teardown function
export function teardown(data) {
  console.log("Cleaning up soak test data...");

  // Log final metrics
  console.log(`Total tours viewed: ${toursViewed}`);
  console.log(`Total nodes navigated: ${nodesNavigated}`);
  console.log(`Total comments posted: ${commentsPosted}`);

  // Clean up any test data if needed
}

// Handle test iterations
export function handleSummary(data) {
  return {
    "soak-test-results.json": JSON.stringify(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}
