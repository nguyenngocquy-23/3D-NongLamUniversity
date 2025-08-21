# Optimized k6 Load Testing Script for 3D Virtual Tour API

## Overview

This optimized k6 load testing script focuses exclusively on dynamic API calls that affect the backend, filtering out all static assets (JS bundles, CSS files, fonts, images, icons, etc.). The script simulates realistic user behavior patterns while efficiently testing the backend performance.

## Key Features

### 🎯 **API-Focused Testing**

- **Authentication**: Login and user info retrieval
- **Tour Navigation**: Node loading, preloading, and navigation
- **Chat System**: Message retrieval and simulated interactions
- **Comment System**: Loading comments for tour nodes
- **Auto Tour**: Automated tour exploration
- **Master Nodes**: Administrative tour management

### 🧠 **Realistic User Behavior**

- **Randomized User Selection**: Multiple test user credentials
- **Dynamic Tour Navigation**: Random node selection (3-8 nodes per session)
- **Think Time**: Realistic delays between actions (1-10 seconds)
- **Behavioral Patterns**: Different user types with weighted probabilities
  - 40% Regular tour navigation
  - 30% Auto tour exploration
  - 20% Master node exploration
  - 10% Chat-heavy sessions

### 📊 **Performance Metrics**

- **Custom Metrics**: Login time, node load time, chat time
- **Error Tracking**: Comprehensive error rate monitoring
- **Response Time Thresholds**: Performance SLAs for different operations
- **Real-time Monitoring**: Live performance feedback

## Script Structure

### Test Configuration

```javascript
export const options = {
  stages: [
    { duration: "2m", target: 10 }, // Ramp up to 10 users
    { duration: "5m", target: 10 }, // Stay at 10 users
    { duration: "2m", target: 20 }, // Ramp up to 20 users
    { duration: "5m", target: 20 }, // Stay at 20 users
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
```

### API Endpoints Tested

#### Authentication

- `POST /app/api/login` - User authentication
- `POST /app/api/user` - User information retrieval

#### Tour Management

- `GET /app/api/space` - Load available spaces
- `GET /app/api/v1/admin/icon` - Load tour icons
- `POST /app/api/node/default` - Get default tour node
- `POST /app/api/node/byId` - Load specific tour node
- `POST /app/api/node/preloadNodeList` - Preload connected nodes
- `POST /app/api/node/master` - Load master nodes
- `POST /app/api/node/getAutoTour` - Load auto tour data

#### User Interaction

- `POST /app/api/comment/getOfNode` - Load comments for a node
- `GET /app/api/chat/messages` - Load chat messages

## Usage Instructions

### Prerequisites

1. **k6 installed**: Download and install k6 from [k6.io](https://k6.io/docs/getting-started/installation/)
2. **Backend running**: Ensure your 3D Virtual Tour API is running on `localhost:8080`
3. **Test data**: Verify that the test users and tour nodes exist in your system

### Running the Test

#### Basic Execution

```bash
k6 run optimized_k6_script.js
```

#### With Custom Configuration

```bash
k6 run --env API_BASE_URL=http://your-api-server:8080 optimized_k6_script.js
```

#### With Output to File

```bash
k6 run --out json=results.json optimized_k6_script.js
```

#### With InfluxDB Integration (for monitoring)

```bash
k6 run --out influxdb=http://localhost:8086/k6 optimized_k6_script.js
```

### Customization

#### Adding More Test Users

```javascript
const testUsers = [
  { username: "vuvanthanh2k3", password: "Admin123@" },
  { username: "testuser1", password: "TestPass123!" },
  // Add more users here
  { username: "newuser", password: "NewPass123!" },
];
```

#### Adding More Tour Nodes

```javascript
const tourNodes = [
  5722, 5738, 5740, 5723, 5726, 5727, 5728, 5730, 5751, 5750, 5743, 5747, 5745,
  // Add more node IDs here
  6000, 6001, 6002,
];
```

#### Adjusting Load Patterns

```javascript
export const options = {
  stages: [
    { duration: "1m", target: 5 }, // Faster ramp-up
    { duration: "3m", target: 5 }, // Shorter test duration
    { duration: "1m", target: 0 }, // Faster ramp-down
  ],
  // ... other options
};
```

## Performance Expectations

### Request Count Comparison

- **Original Script**: ~11,651 requests (mostly static assets)
- **Optimized Script**: ~50-100 requests (API calls only)
- **Reduction**: 95%+ reduction in request volume

### Execution Time

- **Original Script**: 30-60 seconds per iteration
- **Optimized Script**: 10-15 seconds per iteration
- **Improvement**: 70-80% faster execution

### Resource Usage

- **Memory**: Significantly reduced due to fewer concurrent requests
- **Network**: Minimal bandwidth usage (no static asset downloads)
- **CPU**: Focused on API processing rather than asset handling

## Monitoring and Analysis

### Key Metrics to Watch

1. **Error Rate**: Should remain below 10%
2. **Response Times**:
   - Login: < 3 seconds
   - Node Loading: < 1.5 seconds
   - Chat Operations: < 1 second
3. **Throughput**: Requests per second
4. **User Experience**: Think time and realistic behavior patterns

### Common Issues and Solutions

#### High Error Rates

- **Check API availability**: Ensure backend is running
- **Verify credentials**: Confirm test users exist
- **Check network**: Ensure connectivity to API server

#### Slow Response Times

- **Database performance**: Check database connection and queries
- **Server resources**: Monitor CPU, memory, and disk usage
- **Network latency**: Check network connectivity

#### Authentication Failures

- **User credentials**: Verify test user accounts exist
- **Password policies**: Ensure passwords meet requirements
- **Account status**: Check if accounts are active

## Best Practices

### Test Environment

- Use a dedicated test environment, not production
- Ensure test data is isolated from production data
- Monitor system resources during testing

### Test Execution

- Start with low user counts and gradually increase
- Monitor system performance during tests
- Have a rollback plan for any issues

### Data Management

- Use realistic but non-production data
- Clean up test data after testing
- Document any data dependencies

## Troubleshooting

### Common Error Messages

#### "API is not accessible"

- Ensure backend server is running on correct port
- Check firewall settings
- Verify API endpoint URLs

#### "Login failed"

- Verify test user credentials
- Check user account status
- Ensure authentication endpoint is working

#### "Node not found"

- Verify tour node IDs exist in database
- Check node data integrity
- Ensure tour data is properly loaded

### Debug Mode

To run with additional logging:

```bash
k6 run --log-level=debug optimized_k6_script.js
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Load Testing
on: [push, pull_request]
jobs:
  k6-load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install k6
        run: |
          sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6
      - name: Run Load Test
        run: k6 run optimized_k6_script.js
```

## Conclusion

This optimized k6 script provides a realistic, efficient way to test your 3D Virtual Tour API backend performance. By focusing only on dynamic API calls and simulating realistic user behavior, you can accurately assess your system's performance under load while minimizing resource usage and test execution time.

The script is designed to be easily customizable and can be integrated into your CI/CD pipeline for continuous performance monitoring.
