#!/bin/bash

# 3D Virtual Tour System - Performance Testing Setup Script
# This script sets up the performance testing environment

set -e

echo "🚀 Setting up 3D Virtual Tour Performance Testing Environment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if K6 is installed
check_k6() {
    print_status "Checking K6 installation..."
    if command -v k6 &> /dev/null; then
        K6_VERSION=$(k6 version | head -n 1)
        print_success "K6 is installed: $K6_VERSION"
    else
        print_error "K6 is not installed. Please install K6 first:"
        echo "  Visit: https://k6.io/docs/getting-started/installation/"
        echo "  Or run: brew install k6 (macOS)"
        echo "  Or run: sudo apt-get install k6 (Ubuntu/Debian)"
        exit 1
    fi
}

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed: $NODE_VERSION"
    else
        print_error "Node.js is not installed. Please install Node.js first:"
        echo "  Visit: https://nodejs.org/"
        exit 1
    fi
}

# Check if Java is installed
check_java() {
    print_status "Checking Java installation..."
    if command -v java &> /dev/null; then
        JAVA_VERSION=$(java -version 2>&1 | head -n 1)
        print_success "Java is installed: $JAVA_VERSION"
    else
        print_error "Java is not installed. Please install Java 21 first:"
        echo "  Visit: https://adoptium.net/"
        exit 1
    fi
}

# Check if Maven is installed
check_maven() {
    print_status "Checking Maven installation..."
    if command -v mvn &> /dev/null; then
        MAVEN_VERSION=$(mvn --version | head -n 1)
        print_success "Maven is installed: $MAVEN_VERSION"
    else
        print_error "Maven is not installed. Please install Maven first:"
        echo "  Visit: https://maven.apache.org/download.cgi"
        exit 1
    fi
}

# Create environment file
create_env_file() {
    print_status "Creating environment configuration..."
    
    if [ ! -f "env" ]; then
        cp env.example env
        print_success "Environment file created from template"
        print_warning "Please edit 'env' file with your actual configuration"
    else
        print_warning "Environment file already exists"
    fi
}

# Create test data directory
create_test_data() {
    print_status "Setting up test data..."
    
    # Create test data directory if it doesn't exist
    mkdir -p test-data
    
    # Check if test data files exist
    if [ ! -f "test-data/tours.json" ]; then
        print_error "Test data files are missing. Please ensure all test data files are present:"
        echo "  - test-data/tours.json"
        echo "  - test-data/nodes.json"
        echo "  - test-data/test-users.json"
        echo "  - test-data/hotspots.json"
        echo "  - test-data/tour-templates.json"
        exit 1
    fi
    
    print_success "Test data files are present"
}

# Create results directory
create_results_dir() {
    print_status "Creating results directory..."
    mkdir -p results
    print_success "Results directory created"
}

# Install Node.js dependencies
install_dependencies() {
    print_status "Installing Node.js dependencies..."
    
    if [ -f "../3d-virtual-nlu/package.json" ]; then
        cd ../3d-virtual-nlu
        npm install
        cd ../k6-performance-tests
        print_success "Node.js dependencies installed"
    else
        print_warning "Frontend package.json not found, skipping Node.js dependencies"
    fi
}

# Build backend
build_backend() {
    print_status "Building backend application..."
    
    if [ -f "../3d-virtual-nlu-api/pom.xml" ]; then
        cd ../3d-virtual-nlu-api
        mvn clean compile -DskipTests
        cd ../k6-performance-tests
        print_success "Backend built successfully"
    else
        print_warning "Backend pom.xml not found, skipping backend build"
    fi
}

# Create sample test images
create_test_images() {
    print_status "Creating sample test images..."
    
    mkdir -p test-data/images
    
    # Create a simple test image (1MB) for testing
    if [ ! -f "test-data/images/sample-360-image.jpg" ]; then
        # Create a simple test file (this is just a placeholder)
        dd if=/dev/zero of=test-data/images/sample-360-image.jpg bs=1M count=1 2>/dev/null || true
        print_success "Sample test image created"
    else
        print_warning "Sample test image already exists"
    fi
}

# Validate configuration
validate_config() {
    print_status "Validating configuration..."
    
    # Check if environment file exists
    if [ ! -f "env" ]; then
        print_error "Environment file 'env' not found. Please run setup again."
        exit 1
    fi
    
    # Load environment variables
    source env
    
    # Check required environment variables
    if [ -z "$API_BASE_URL" ]; then
        print_warning "API_BASE_URL not set in environment file"
    fi
    
    if [ -z "$TEST_USER_USERNAME" ]; then
        print_warning "TEST_USER_USERNAME not set in environment file"
    fi
    
    if [ -z "$TEST_ADMIN_USERNAME" ]; then
        print_warning "TEST_ADMIN_USERNAME not set in environment file"
    fi
    
    print_success "Configuration validation completed"
}

# Create run scripts
create_run_scripts() {
    print_status "Creating run scripts..."
    
    # Create basic load test script
    cat > run-basic-test.sh << 'EOF'
#!/bin/bash
echo "Running basic load test..."
k6 run scenarios/basic-load-test.js
EOF
    chmod +x run-basic-test.sh
    
    # Create stress test script
    cat > run-stress-test.sh << 'EOF'
#!/bin/bash
echo "Running stress test..."
k6 run scenarios/stress-test.js
EOF
    chmod +x run-stress-test.sh
    
    # Create spike test script
    cat > run-spike-test.sh << 'EOF'
#!/bin/bash
echo "Running spike test..."
k6 run scenarios/spike-test.js
EOF
    chmod +x run-spike-test.sh
    
    # Create soak test script
    cat > run-soak-test.sh << 'EOF'
#!/bin/bash
echo "Running soak test..."
k6 run scenarios/soak-test.js
EOF
    chmod +x run-soak-test.sh
    
    # Create cleanup script
    cat > cleanup-test-data.sh << 'EOF'
#!/bin/bash
echo "Cleaning up test data..."
node utils/cleanup-script.js
EOF
    chmod +x cleanup-test-data.sh
    
    print_success "Run scripts created"
}

# Main setup function
main() {
    echo "=========================================="
    echo "3D Virtual Tour Performance Testing Setup"
    echo "=========================================="
    echo ""
    
    # Check prerequisites
    check_k6
    check_node
    check_java
    check_maven
    
    # Setup environment
    create_env_file
    create_test_data
    create_results_dir
    create_test_images
    
    # Install dependencies
    install_dependencies
    build_backend
    
    # Validate configuration
    validate_config
    
    # Create run scripts
    create_run_scripts
    
    echo ""
    echo "=========================================="
    print_success "Setup completed successfully!"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. Edit the 'env' file with your configuration"
    echo "2. Start your backend server"
    echo "3. Run tests using:"
    echo "   - ./run-basic-test.sh"
    echo "   - ./run-stress-test.sh"
    echo "   - ./run-spike-test.sh"
    echo "   - ./run-soak-test.sh"
    echo ""
    echo "For CI/CD integration, see:"
    echo "- .github/workflows/performance-tests.yml"
    echo "- .gitlab-ci.yml"
    echo ""
    echo "Documentation: README.md"
}

# Run main function
main "$@"
