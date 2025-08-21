# 3D Virtual Tour System - Performance Testing Guide

## Overview

This guide provides comprehensive instructions for performance testing the 3D Virtual Tour system using K6. The testing framework covers load testing, stress testing, spike testing, and soak testing scenarios.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Test Scenarios](#test-scenarios)
3. [Environment Setup](#environment-setup)
4. [Running Tests](#running-tests)
5. [Data Management](#data-management)
6. [CI/CD Integration](#cicd-integration)
7. [Monitoring and Analysis](#monitoring-and-analysis)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Quick Start

### Prerequisites

- **K6**: [Install K6](https://k6.io/docs/getting-started/installation/)
- **Node.js**: Version 18 or higher
- **Java**: Version 21
- **Maven**: Version 3.9 or higher

### Setup

1. **Clone and setup**:

   ```bash
   cd k6-performance-tests
   chmod +x setup.sh
   ./setup.sh
   ```

2. **Configure environment**:

   ```bash
   cp env.example env
   # Edit env file with your configuration
   ```

3. **Run a basic test**:
   ```bash
   ./run-basic-test.sh
   ```

## Test Scenarios

### 1. Basic Load Test (`basic-load-test.js`)

**Purpose**: Test normal user behavior under expected load.

**Configuration**:

- **Duration**: 9 minutes
- **Users**: 0 → 10 → 10 → 0
- **Target**: 10 concurrent users
- **Thresholds**:
  - P95 response time < 2s
  - Error rate < 10%

**Scenarios Tested**:

- User login
- Tour browsing
- Node navigation
- Comment viewing
- View count updates

**Usage**:

```bash
k6 run scenarios/basic-load-test.js
```

### 2. Stress Test (`stress-test.js`)

**Purpose**: Test system behavior under high load, especially tour creation with image uploads.

**Configuration**:

- **Duration**: 15 minutes
- **Users**: 0 → 5 → 10 → 20 → 20 → 0
- **Target**: 20 concurrent users
- **Thresholds**:
  - P95 response time < 10s (for uploads)
  - Error rate < 20%
  - Upload success rate > 80%

**Scenarios Tested**:

- Admin login
- Image uploads to Cloudinary
- Tour creation with multiple nodes
- Hotspot creation
- Concurrent file processing

**Usage**:

```bash
k6 run scenarios/stress-test.js
```

### 3. Spike Test (`spike-test.js`)

**Purpose**: Test system response to sudden load increases.

**Configuration**:

- **Duration**: 12 minutes
- **Users**: 5 → 50 → 50 → 5 → 5 → 100 → 100 → 5 → 0
- **Target**: Up to 100 concurrent users
- **Thresholds**:
  - P95 response time < 3s
  - Error rate < 30% during spikes

**Scenarios Tested**:

- Rapid tour loading
- Quick node navigation
- Concurrent hotspot interactions
- Simultaneous comment posting
- View count updates

**Usage**:

```bash
k6 run scenarios/spike-test.js
```

### 4. Soak Test (`soak-test.js`)

**Purpose**: Test system stability over extended periods.

**Configuration**:

- **Duration**: 75 minutes
- **Users**: 0 → 10 → 10 → 20 → 20 → 0
- **Target**: 10-20 concurrent users for extended periods
- **Thresholds**:
  - P95 response time < 5s
  - Error rate < 10%
  - Memory usage < 1GB
  - Active connections < 1000

**Scenarios Tested**:

- Extended user sessions
- Multiple tour interactions
- Comment posting over time
- Search functionality
- Realistic user behavior patterns

**Usage**:

```bash
k6 run scenarios/soak-test.js
```

## Environment Setup

### Configuration Files

1. **Environment Variables** (`env`):

   ```bash
   # API Configuration
   API_BASE_URL=http://localhost:8080/app/api
   STAGING_API_BASE_URL=https://staging.3dtour.io.vn/app/api

   # Test Credentials
   TEST_USER_USERNAME=user@test.com
   TEST_USER_PASSWORD=user123
   TEST_ADMIN_USERNAME=admin@test.com
   TEST_ADMIN_PASSWORD=admin123

   # Test Data
   TEST_TOUR_IDS=1,2,3,4,5
   TEST_NODE_IDS=10,11,12,13,14,15
   ```

2. **Test Data Files**:
   - `test-data/tours.json`: Sample tour data
   - `test-data/nodes.json`: Sample node data
   - `test-data/test-users.json`: Test user credentials
   - `test-data/hotspots.json`: Sample hotspot data
   - `test-data/tour-templates.json`: Tour creation templates

### Staging Environment

For production-like testing, set up a staging environment:

1. **Database**: Use a separate test database
2. **Cloudinary**: Use a test Cloudinary account
3. **API**: Deploy backend to staging server
4. **Frontend**: Deploy frontend to staging server

## Running Tests

### Local Testing

1. **Start your backend server**:

   ```bash
   cd 3d-virtual-nlu-api
   mvn wildfly:run
   ```

2. **Run specific tests**:

   ```bash
   # Basic load test
   k6 run scenarios/basic-load-test.js

   # Stress test
   k6 run scenarios/stress-test.js

   # Spike test
   k6 run scenarios/spike-test.js

   # Soak test
   k6 run scenarios/soak-test.js
   ```

3. **Run with custom parameters**:
   ```bash
   k6 run --env API_BASE_URL=http://localhost:8080/app/api \
          --env TEST_USER_USERNAME=test@example.com \
          scenarios/basic-load-test.js
   ```

### Output Formats

K6 supports multiple output formats:

```bash
# JSON output
k6 run --out json=results/test-results.json scenarios/basic-load-test.js

# InfluxDB for real-time monitoring
k6 run --out influxdb=http://localhost:8086/k6 scenarios/basic-load-test.js

# Multiple outputs
k6 run --out json=results/results.json \
       --out influxdb=http://localhost:8086/k6 \
       scenarios/basic-load-test.js
```

## Data Management

### Test Data Isolation

To prevent test data pollution:

1. **Use Test Prefixes**: All test data uses `test_` prefix
2. **Separate Database**: Use staging/test database
3. **Cleanup Scripts**: Automated cleanup after tests

### Data Cleanup Strategies

1. **Immediate Cleanup**:

   ```bash
   ./cleanup-test-data.sh
   ```

2. **Scheduled Cleanup**:

   ```bash
   # Clean up data older than 24 hours
   node utils/cleanup-script.js --hours=24
   ```

3. **Prefix-based Cleanup**:
   ```bash
   # Clean up all test data
   node utils/cleanup-script.js --prefix=test_
   ```

### Mock External Services

For testing without external dependencies:

1. **Cloudinary Mock**: Use local file storage
2. **Email Mock**: Disable email sending
3. **Payment Mock**: Use test payment providers

## CI/CD Integration

### GitHub Actions

The workflow runs on:

- Push to main/develop branches
- Pull requests
- Scheduled daily runs
- Manual triggers

**Configuration**:

```yaml
# .github/workflows/performance-tests.yml
name: Performance Tests
on: [push, pull_request, schedule]
jobs:
  performance-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        test-scenario: [basic-load-test, stress-test, spike-test, soak-test]
```

**Secrets Required**:

- `STAGING_API_URL`: Staging environment URL
- `TEST_USER_USERNAME`: Test user credentials
- `TEST_ADMIN_USERNAME`: Test admin credentials
- `INFLUXDB_URL`: InfluxDB connection string

### GitLab CI

**Configuration**:

```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - performance-test
  - report

performance-tests:
  stage: performance-test
  image: grafana/k6:latest
  parallel:
    matrix:
      - TEST_SCENARIO: basic-load-test
      - TEST_SCENARIO: stress-test
      - TEST_SCENARIO: spike-test
      - TEST_SCENARIO: soak-test
```

**Variables Required**:

- `STAGING_API_URL`: Staging environment URL
- `TEST_USER_USERNAME`: Test user credentials
- `TEST_ADMIN_USERNAME`: Test admin credentials
- `INFLUXDB_URL`: InfluxDB connection string

## Monitoring and Analysis

### Key Metrics

1. **Response Time**:

   - P50, P95, P99 percentiles
   - Average response time
   - Min/Max response times

2. **Throughput**:

   - Requests per second
   - Iterations per second
   - Data transfer rates

3. **Error Rates**:

   - HTTP error rates
   - Custom error metrics
   - Timeout rates

4. **Resource Usage**:
   - Memory consumption
   - CPU usage
   - Database connections

### Monitoring Tools

1. **InfluxDB + Grafana**:

   ```bash
   # Start InfluxDB
   docker run -d -p 8086:8086 influxdb:latest

   # Start Grafana
   docker run -d -p 3000:3000 grafana/grafana:latest
   ```

2. **K6 Cloud** (commercial):

   ```bash
   k6 cloud scenarios/basic-load-test.js
   ```

3. **Custom Dashboards**:
   - Create Grafana dashboards
   - Set up alerts
   - Monitor trends

### Result Analysis

1. **Performance Trends**:

   - Compare results over time
   - Identify performance regressions
   - Track improvements

2. **Bottleneck Analysis**:

   - Database query performance
   - API response times
   - File upload performance

3. **Capacity Planning**:
   - Determine system limits
   - Plan for scaling
   - Resource requirements

## Best Practices

### Test Design

1. **Realistic Scenarios**:

   - Simulate actual user behavior
   - Use realistic data
   - Include think times

2. **Gradual Load Increase**:

   - Start with low load
   - Gradually increase
   - Monitor system behavior

3. **Comprehensive Coverage**:
   - Test all critical paths
   - Include error scenarios
   - Test edge cases

### Environment Management

1. **Isolation**:

   - Use separate test environments
   - Isolate test data
   - Mock external services

2. **Consistency**:

   - Use same environment for all tests
   - Consistent test data
   - Stable network conditions

3. **Monitoring**:
   - Monitor system resources
   - Track application logs
   - Set up alerts

### Data Management

1. **Cleanup**:

   - Clean up after each test
   - Use automated cleanup
   - Monitor data growth

2. **Backup**:

   - Backup test data
   - Version control test data
   - Document data changes

3. **Security**:
   - Use test credentials
   - Secure sensitive data
   - Follow security best practices

## Troubleshooting

### Common Issues

1. **Connection Errors**:

   ```bash
   # Check if API is accessible
   curl http://localhost:8080/app/api/node/default

   # Check network connectivity
   ping your-api-server.com
   ```

2. **Authentication Failures**:

   ```bash
   # Verify credentials
   curl -X POST http://localhost:8080/app/api/login \
        -H "Content-Type: application/json" \
        -d '{"username":"test@example.com","password":"password"}'
   ```

3. **Memory Issues**:

   ```bash
   # Monitor memory usage
   k6 run --max-memory=1GB scenarios/soak-test.js
   ```

4. **Timeout Issues**:
   ```bash
   # Increase timeout
   k6 run --http-debug scenarios/stress-test.js
   ```

### Debugging

1. **Enable Debug Logging**:

   ```bash
   k6 run --http-debug scenarios/basic-load-test.js
   ```

2. **Check K6 Logs**:

   ```bash
   k6 run --log-level=debug scenarios/basic-load-test.js
   ```

3. **Monitor System Resources**:

   ```bash
   # Monitor CPU and memory
   top -p $(pgrep k6)

   # Monitor network
   netstat -i
   ```

### Performance Optimization

1. **Database Optimization**:

   - Add database indexes
   - Optimize queries
   - Use connection pooling

2. **API Optimization**:

   - Implement caching
   - Use pagination
   - Optimize response sizes

3. **File Upload Optimization**:
   - Use chunked uploads
   - Implement progress tracking
   - Optimize image processing

## Support and Resources

### Documentation

- [K6 Documentation](https://k6.io/docs/)
- [K6 JavaScript API](https://k6.io/docs/javascript-api/)
- [K6 Examples](https://github.com/grafana/k6-examples)

### Community

- [K6 Community](https://community.k6.io/)
- [GitHub Issues](https://github.com/grafana/k6/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/k6)

### Tools

- [K6 Cloud](https://k6.io/cloud/) - Commercial K6 platform
- [Grafana](https://grafana.com/) - Monitoring and visualization
- [InfluxDB](https://www.influxdata.com/) - Time series database

---

**Note**: This guide is specifically designed for the 3D Virtual Tour system. Adjust configurations and scenarios based on your specific requirements and infrastructure.
