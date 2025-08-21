import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";
import { SharedArray } from "k6/data";

// Custom metrics
const errorRate = new Rate("errors");
const responseTime = new Trend("response_time");
const hotspotInteractionTime = new Trend("hotspot_interaction_time");
const navigationTime = new Trend("navigation_time");
const successfulInteractions = new Counter("successful_interactions");

// Test configuration - Spike test with sudden load increase
export const options = {
  stages: [
    { duration: "2m", target: 5 }, // Normal load
    { duration: "1m", target: 50 }, // Spike to 50 users
    { duration: "2m", target: 50 }, // Stay at spike level
    { duration: "1m", target: 5 }, // Drop back to normal
    { duration: "2m", target: 5 }, // Normal load
    { duration: "1m", target: 100 }, // Extreme spike to 100 users
    { duration: "1m", target: 100 }, // Stay at extreme spike
    { duration: "1m", target: 5 }, // Drop back to normal
    { duration: "1m", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<3000"], // 95% of requests must complete below 3s
    http_req_failed: ["rate<0.3"], // Error rate must be below 30% during spikes
    errors: ["rate<0.3"],
  },
};

// Test data
const testTours = new SharedArray("tours", function () {
  return JSON.parse(open("./test-data/tours.json"));
});

const testHotspots = new SharedArray("hotspots", function () {
  return JSON.parse(open("./test-data/hotspots.json"));
});

// Helper functions
function getRandomTour() {
  return testTours[Math.floor(Math.random() * testTours.length)];
}

function getRandomHotspot() {
  return testHotspots[Math.floor(Math.random() * testHotspots.length)];
}

function loginUser() {
  const loginData = {
    username: __ENV.TEST_USER_USERNAME || "user@test.com",
    password: __ENV.TEST_USER_PASSWORD || "user123",
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

// Main spike test scenario
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

  // Scenario 1: Rapid tour loading (simulates many users accessing tours simultaneously)
  const tour = getRandomTour();

  const tourLoadResponse = http.post(
    `${baseUrl}/node/nodeListByMasterId`,
    JSON.stringify({
      masterId: tour.id,
    }),
    { headers }
  );

  check(tourLoadResponse, {
    "tour load successful": (r) =>
      r.status === 200 && r.json("statusCode") === 1000,
  });

  responseTime.add(tourLoadResponse.timings.duration);
  errorRate.add(tourLoadResponse.status !== 200);

  sleep(0.5); // Very short sleep to simulate rapid interactions

  // Scenario 2: Rapid node navigation (simulates users clicking through hotspots quickly)
  const nodes = tourLoadResponse.json("data");
  if (nodes && nodes.length > 0) {
    // Navigate through multiple nodes rapidly
    for (let i = 0; i < Math.min(3, nodes.length); i++) {
      const node = nodes[i];

      const navigationResponse = http.post(
        `${baseUrl}/node/preloadNodeList`,
        JSON.stringify({
          nodeId: node.id,
        }),
        { headers }
      );

      check(navigationResponse, {
        "node navigation successful": (r) =>
          r.status === 200 && r.json("statusCode") === 1000,
      });

      navigationTime.add(navigationResponse.timings.duration);
      errorRate.add(navigationResponse.status !== 200);

      // Scenario 3: Hotspot interactions (simulates users clicking hotspots)
      const hotspot = getRandomHotspot();

      const hotspotResponse = http.post(
        `${baseUrl}/v1/admin/hotspot/getModel`,
        JSON.stringify({
          hotspotId: hotspot.id,
        }),
        { headers }
      );

      check(hotspotResponse, {
        "hotspot interaction successful": (r) =>
          r.status === 200 && r.json("statusCode") === 1000,
      });

      hotspotInteractionTime.add(hotspotResponse.timings.duration);
      errorRate.add(hotspotResponse.status !== 200);

      if (hotspotResponse.status === 200) {
        successfulInteractions.add(1);
      }

      sleep(0.2); // Very short sleep for rapid interactions
    }
  }

  // Scenario 4: Concurrent comment posting (simulates many users commenting simultaneously)
  if (nodes && nodes.length > 0) {
    const randomNode = nodes[Math.floor(Math.random() * nodes.length)];

    const commentData = {
      nodeId: randomNode.id,
      content: `Spike test comment ${Date.now()}`,
      rating: Math.floor(Math.random() * 5) + 1,
    };

    const commentResponse = http.post(
      `${baseUrl}/comment/send`,
      JSON.stringify(commentData),
      { headers }
    );

    check(commentResponse, {
      "comment posting successful": (r) =>
        r.status === 200 && r.json("statusCode") === 1000,
    });

    responseTime.add(commentResponse.timings.duration);
    errorRate.add(commentResponse.status !== 200);
  }

  // Scenario 5: Rapid view count updates (simulates many users viewing the same content)
  if (nodes && nodes.length > 0) {
    const randomNode = nodes[Math.floor(Math.random() * nodes.length)];

    const viewResponse = http.post(
      `${baseUrl}/node/increaseView`,
      JSON.stringify({
        nodeId: randomNode.id,
      }),
      { headers }
    );

    check(viewResponse, {
      "view count update successful": (r) =>
        r.status === 200 && r.json("statusCode") === 1000,
    });

    responseTime.add(viewResponse.timings.duration);
    errorRate.add(viewResponse.status !== 200);
  }

  // Very short think time to simulate rapid user interactions during spike
  sleep(Math.random() * 0.5 + 0.1);
}

// Setup function
export function setup() {
  console.log("Setting up spike test...");

  // Verify API is accessible
  const healthCheck = http.get(
    `${__ENV.API_BASE_URL || "http://localhost:8080/app/api"}/node/default`
  );

  if (healthCheck.status !== 200) {
    throw new Error("API is not accessible");
  }

  console.log("Spike test setup completed");
  return { baseUrl: __ENV.API_BASE_URL || "http://localhost:8080/app/api" };
}

// Teardown function
export function teardown(data) {
  console.log("Cleaning up spike test data...");
  // Clean up any test data if needed
}
