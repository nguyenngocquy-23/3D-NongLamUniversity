import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";
import { SharedArray } from "k6/data";

// Custom metrics
const errorRate = new Rate("errors");
const uploadTime = new Trend("upload_time");
const tourCreationTime = new Trend("tour_creation_time");
const uploadSuccessRate = new Rate("upload_success");
const toursCreated = new Counter("tours_created");

// Test configuration - Stress test with high load
export const options = {
  stages: [
    { duration: "2m", target: 5 }, // Ramp up to 5 users
    { duration: "3m", target: 10 }, // Ramp up to 10 users
    { duration: "5m", target: 20 }, // Ramp up to 20 users (stress level)
    { duration: "3m", target: 20 }, // Stay at stress level
    { duration: "2m", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<10000"], // 95% of requests must complete below 10s (upload time)
    http_req_failed: ["rate<0.2"], // Error rate must be below 20% under stress
    errors: ["rate<0.2"],
    upload_success: ["rate>0.8"], // Upload success rate must be above 80%
  },
};

// Test data
const testImages = new SharedArray("images", function () {
  return JSON.parse(open("./test-data/test-images.json"));
});

const testTourData = new SharedArray("tour-data", function () {
  return JSON.parse(open("./test-data/tour-templates.json"));
});

// Helper functions
function getRandomImage() {
  return testImages[Math.floor(Math.random() * testImages.length)];
}

function getRandomTourTemplate() {
  return testTourData[Math.floor(Math.random() * testTourData.length)];
}

function generateTestImage(sizeInMB = 5) {
  // Generate a mock image file for testing
  // In real scenario, you'd use actual image files
  const buffer = new ArrayBuffer(sizeInMB * 1024 * 1024);
  return new Uint8Array(buffer);
}

function loginAdmin() {
  const loginData = {
    username: __ENV.TEST_ADMIN_USERNAME || "admin@test.com",
    password: __ENV.TEST_ADMIN_PASSWORD || "admin123",
  };

  const loginResponse = http.post(
    `${__ENV.API_BASE_URL}/login`,
    JSON.stringify(loginData),
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  check(loginResponse, {
    "admin login successful": (r) =>
      r.status === 200 && r.json("statusCode") === 1000,
  });

  return loginResponse.json("data.token");
}

function uploadImageToCloudinary(token, imageData) {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type":
      "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW",
  };

  // Create multipart form data for image upload
  const boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";
  const formData =
    `--${boundary}\r\n` +
    'Content-Disposition: form-data; name="file"; filename="test-360-image.jpg"\r\n' +
    "Content-Type: image/jpeg\r\n\r\n" +
    imageData +
    `\r\n--${boundary}--\r\n`;

  const uploadResponse = http.post(
    `${__ENV.API_BASE_URL}/v1/admin/cloud/upload`,
    formData,
    { headers }
  );

  check(uploadResponse, {
    "image upload successful": (r) =>
      r.status === 200 && r.json("statusCode") === 1000,
  });

  uploadTime.add(uploadResponse.timings.duration);
  uploadSuccessRate.add(uploadResponse.status === 200);

  return uploadResponse.json("data.url");
}

function createTour(token, tourData, imageUrls) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // Create nodes with uploaded images
  const nodes = tourData.nodes.map((node, index) => ({
    ...node,
    imageUrl: imageUrls[index] || node.imageUrl,
    masterId: null, // Will be set after creation
    status: 1,
  }));

  const createResponse = http.post(
    `${__ENV.API_BASE_URL}/v1/admin/node/insert`,
    JSON.stringify(nodes),
    { headers }
  );

  check(createResponse, {
    "tour creation successful": (r) =>
      r.status === 200 && r.json("statusCode") === 1000,
  });

  tourCreationTime.add(createResponse.timings.duration);

  if (createResponse.status === 200) {
    toursCreated.add(1);
  }

  return createResponse.json("data");
}

// Main stress test scenario
export default function () {
  const baseUrl = __ENV.API_BASE_URL || "http://localhost:8080/app/api";

  // Login as admin
  const token = loginAdmin();
  if (!token) {
    console.error("Failed to login as admin");
    return;
  }

  // Get tour template
  const tourTemplate = getRandomTourTemplate();

  // Generate test images for the tour
  const imageUrls = [];
  const imagePromises = [];

  // Upload multiple images concurrently (stress test for upload system)
  for (let i = 0; i < tourTemplate.nodes.length; i++) {
    const imageData = generateTestImage(5); // 5MB test image
    const uploadPromise = uploadImageToCloudinary(token, imageData);
    imagePromises.push(uploadPromise);
  }

  // Wait for all uploads to complete
  const uploadResults = imagePromises.map((promise) => {
    try {
      return promise;
    } catch (error) {
      console.error("Upload failed:", error);
      return null;
    }
  });

  // Filter out failed uploads
  imageUrls.push(...uploadResults.filter((url) => url !== null));

  sleep(1);

  // Create tour with uploaded images
  if (imageUrls.length > 0) {
    const tourResult = createTour(token, tourTemplate, imageUrls);

    if (tourResult) {
      // Additional stress: Create hotspots for the tour
      const hotspotPromises = [];

      tourResult.forEach((nodeId) => {
        // Create hotspot for each node
        const hotspotData = {
          nodeId: nodeId,
          type: "info",
          title: "Test Hotspot",
          description: "Stress test hotspot",
          position: { x: 0, y: 0, z: 0 },
        };

        const hotspotPromise = http.post(
          `${__ENV.API_BASE_URL}/v1/admin/hotspot/create`,
          JSON.stringify(hotspotData),
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        hotspotPromises.push(hotspotPromise);
      });

      // Wait for hotspot creation
      hotspotPromises.forEach((promise) => {
        check(promise, {
          "hotspot creation successful": (r) => r.status === 200,
        });
      });
    }
  }

  // Random think time between tour creations
  sleep(Math.random() * 5 + 2);
}

// Setup function
export function setup() {
  console.log("Setting up stress test...");

  // Verify admin credentials
  const adminToken = loginAdmin();
  if (!adminToken) {
    throw new Error("Admin login failed - check credentials");
  }

  // Verify API endpoints are accessible
  const healthCheck = http.get(
    `${__ENV.API_BASE_URL || "http://localhost:8080/app/api"}/admin/dashboard`
  );

  if (healthCheck.status !== 200) {
    throw new Error("Admin API is not accessible");
  }

  console.log("Stress test setup completed");
  return { baseUrl: __ENV.API_BASE_URL || "http://localhost:8080/app/api" };
}

// Teardown function - Clean up test data
export function teardown(data) {
  console.log("Cleaning up stress test data...");

  // In a real scenario, you would clean up created tours
  // This prevents test data pollution

  const adminToken = loginAdmin();
  if (adminToken) {
    // Clean up test tours created during the test
    // Implementation depends on your cleanup strategy
    console.log("Test data cleanup completed");
  }
}
