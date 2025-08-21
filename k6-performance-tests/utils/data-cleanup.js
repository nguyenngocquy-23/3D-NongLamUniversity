import http from "k6/http";
import { check } from "k6";

/**
 * Data Cleanup Utility for Performance Tests
 *
 * This utility helps manage test data to prevent pollution of the database
 * during performance testing.
 */

export class TestDataManager {
  constructor(baseUrl, adminToken) {
    this.baseUrl = baseUrl;
    this.adminToken = adminToken;
    this.createdTours = [];
    this.createdNodes = [];
    this.createdComments = [];
    this.createdHotspots = [];
  }

  // Helper function to make authenticated requests
  makeRequest(method, endpoint, data = null) {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.adminToken}`,
    };

    const url = `${this.baseUrl}${endpoint}`;

    if (method === "GET") {
      return http.get(url, { headers });
    } else if (method === "POST") {
      return http.post(url, JSON.stringify(data), { headers });
    } else if (method === "DELETE") {
      return http.del(url, JSON.stringify(data), { headers });
    }
  }

  // Track created test data
  trackTour(tourId) {
    this.createdTours.push(tourId);
  }

  trackNode(nodeId) {
    this.createdNodes.push(nodeId);
  }

  trackComment(commentId) {
    this.createdComments.push(commentId);
  }

  trackHotspot(hotspotId) {
    this.createdHotspots.push(hotspotId);
  }

  // Clean up all test data
  async cleanupAll() {
    console.log("Starting test data cleanup...");

    // Clean up in reverse order to handle dependencies
    await this.cleanupComments();
    await this.cleanupHotspots();
    await this.cleanupNodes();
    await this.cleanupTours();

    console.log("Test data cleanup completed");
  }

  // Clean up test tours
  async cleanupTours() {
    console.log(`Cleaning up ${this.createdTours.length} test tours...`);

    for (const tourId of this.createdTours) {
      try {
        const response = this.makeRequest("DELETE", `/v1/admin/node/${tourId}`);

        check(response, {
          "tour cleanup successful": (r) => r.status === 200,
        });

        if (response.status === 200) {
          console.log(`Cleaned up tour ${tourId}`);
        }
      } catch (error) {
        console.error(`Failed to cleanup tour ${tourId}:`, error);
      }
    }

    this.createdTours = [];
  }

  // Clean up test nodes
  async cleanupNodes() {
    console.log(`Cleaning up ${this.createdNodes.length} test nodes...`);

    for (const nodeId of this.createdNodes) {
      try {
        const response = this.makeRequest("DELETE", `/v1/admin/node/${nodeId}`);

        check(response, {
          "node cleanup successful": (r) => r.status === 200,
        });

        if (response.status === 200) {
          console.log(`Cleaned up node ${nodeId}`);
        }
      } catch (error) {
        console.error(`Failed to cleanup node ${nodeId}:`, error);
      }
    }

    this.createdNodes = [];
  }

  // Clean up test comments
  async cleanupComments() {
    console.log(`Cleaning up ${this.createdComments.length} test comments...`);

    for (const commentId of this.createdComments) {
      try {
        const response = this.makeRequest("DELETE", `/comment/remove`, {
          commentId: commentId,
        });

        check(response, {
          "comment cleanup successful": (r) => r.status === 200,
        });

        if (response.status === 200) {
          console.log(`Cleaned up comment ${commentId}`);
        }
      } catch (error) {
        console.error(`Failed to cleanup comment ${commentId}:`, error);
      }
    }

    this.createdComments = [];
  }

  // Clean up test hotspots
  async cleanupHotspots() {
    console.log(`Cleaning up ${this.createdHotspots.length} test hotspots...`);

    for (const hotspotId of this.createdHotspots) {
      try {
        const response = this.makeRequest(
          "DELETE",
          `/v1/admin/hotspot/${hotspotId}`
        );

        check(response, {
          "hotspot cleanup successful": (r) => r.status === 200,
        });

        if (response.status === 200) {
          console.log(`Cleaned up hotspot ${hotspotId}`);
        }
      } catch (error) {
        console.error(`Failed to cleanup hotspot ${hotspotId}:`, error);
      }
    }

    this.createdHotspots = [];
  }

  // Clean up test data by timestamp (for scheduled cleanup)
  async cleanupByTimestamp(timestamp) {
    console.log(`Cleaning up test data older than ${timestamp}...`);

    // This would require additional API endpoints to support timestamp-based cleanup
    // Implementation depends on your backend API design

    try {
      const response = this.makeRequest("POST", `/v1/admin/cleanup/test-data`, {
        timestamp: timestamp,
      });

      check(response, {
        "timestamp cleanup successful": (r) => r.status === 200,
      });

      if (response.status === 200) {
        console.log("Timestamp-based cleanup completed");
      }
    } catch (error) {
      console.error("Failed to perform timestamp-based cleanup:", error);
    }
  }

  // Clean up test data by prefix (for prefix-based identification)
  async cleanupByPrefix(prefix) {
    console.log(`Cleaning up test data with prefix: ${prefix}...`);

    try {
      const response = this.makeRequest("POST", `/v1/admin/cleanup/by-prefix`, {
        prefix: prefix,
      });

      check(response, {
        "prefix cleanup successful": (r) => r.status === 200,
      });

      if (response.status === 200) {
        console.log("Prefix-based cleanup completed");
      }
    } catch (error) {
      console.error("Failed to perform prefix-based cleanup:", error);
    }
  }
}

// Utility functions for test data management

export function createTestDataManager(baseUrl, adminToken) {
  return new TestDataManager(baseUrl, adminToken);
}

export function generateTestPrefix() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `test_${timestamp}_${random}`;
}

export function isTestData(data, prefix = "test_") {
  // Check if data is test data based on naming convention
  if (data.name && data.name.startsWith(prefix)) {
    return true;
  }
  if (data.description && data.description.includes("test")) {
    return true;
  }
  return false;
}

// Scheduled cleanup function (for use in separate scripts)
export function scheduledCleanup(baseUrl, adminToken, hours = 24) {
  const manager = createTestDataManager(baseUrl, adminToken);
  const cutoffTime = Date.now() - hours * 60 * 60 * 1000;

  return manager.cleanupByTimestamp(cutoffTime);
}
