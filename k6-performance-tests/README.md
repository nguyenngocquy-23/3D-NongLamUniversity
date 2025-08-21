# 3D Virtual Tour System - Performance Testing with K6

This directory contains comprehensive performance tests for the 3D Virtual Tour system using K6.

## System Overview

The system consists of:

- **Frontend**: React + Three.js + Vite (3D visualization)
- **Backend**: Java EE + JDBI + MySQL (REST API)
- **External Services**: Cloudinary (image storage), Google OAuth

## Test Scenarios

### 1. Tour Viewing Load Tests

- Concurrent users viewing existing tours
- Image and asset loading performance
- Node navigation performance

### 2. Tour Creation Stress Tests

- Image upload performance (360° panoramas)
- Metadata creation and storage
- Concurrent tour creation

### 3. Navigation and Hotspot Interaction Tests

- Node-to-node navigation
- Hotspot interaction (info, media, links)
- Real-time user experience simulation

### 4. Authentication and User Management

- Login/logout performance
- Token refresh handling
- User session management

## Test Environment Setup

### Prerequisites

- K6 installed (https://k6.io/docs/getting-started/installation/)
- Node.js for test data generation
- Access to staging environment

### Environment Variables

```bash
# Copy and modify for your environment
cp .env.example .env
```

### Test Data Management

- Use staging database with test data
- Implement data cleanup strategies
- Mock external services where appropriate

## Running Tests

### Basic Load Test

```bash
k6 run scenarios/basic-load-test.js
```

### Stress Test

```bash
k6 run scenarios/stress-test.js
```

### Spike Test

```bash
k6 run scenarios/spike-test.js
```

### Soak Test

```bash
k6 run scenarios/soak-test.js
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/performance-tests.yml
name: Performance Tests
on: [push, pull_request]
jobs:
  k6-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: grafana/k6-action@v0.3.0
        with:
          filename: k6-performance-tests/scenarios/basic-load-test.js
```

### GitLab CI

```yaml
# .gitlab-ci.yml
performance_tests:
  stage: test
  image: grafana/k6:latest
  script:
    - k6 run k6-performance-tests/scenarios/basic-load-test.js
```

## Monitoring and Metrics

### Key Performance Indicators (KPIs)

- Response Time (p95, p99)
- Throughput (requests/second)
- Error Rate
- Resource Utilization (CPU, Memory, Database)

### K6 Output Formats

- InfluxDB for real-time monitoring
- JSON for detailed analysis
- CSV for spreadsheet analysis

## Best Practices

1. **Test Data Isolation**: Use separate test databases
2. **External Service Mocking**: Mock Cloudinary uploads in tests
3. **Gradual Load Increase**: Start with low load, gradually increase
4. **Realistic User Behavior**: Simulate actual user journeys
5. **Resource Monitoring**: Monitor system resources during tests
6. **Test Result Analysis**: Document and analyze results

## Troubleshooting

### Common Issues

- Database connection limits
- File upload timeouts
- Memory leaks during long tests
- Network latency impact

### Solutions

- Implement connection pooling
- Use chunked file uploads
- Monitor memory usage
- Use distributed testing for network simulation
