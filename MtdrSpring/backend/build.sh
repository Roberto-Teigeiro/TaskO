#!/bin/bash
# filepath: c:\Users\ID140\Documents\TaskO\MtdrSpring\build-all.sh

# Source environment variables
if [ -f "$MTDRWORKSHOP_LOCATION/env.sh" ]; then
    source "$MTDRWORKSHOP_LOCATION/env.sh"
fi

# Set default values
export IMAGE_VERSION=0.1

# Check for Docker registry
if [ -z "$DOCKER_REGISTRY" ]; then
    export DOCKER_REGISTRY=$(state_get DOCKER_REGISTRY)
    echo "DOCKER_REGISTRY set from state."
fi
if [ -z "$DOCKER_REGISTRY" ]; then
    echo "Error: DOCKER_REGISTRY env variable needs to be set!"
    exit 1
fi

# Function to build and push a service
build_service() {
    local service_dir=$1
    local service_name=$(basename $service_dir)
    
    echo "===== Building $service_name ====="
    
    # Navigate to service directory
    cd $service_dir
    
    # Check if this is a Spring Boot project
    if [ -f "pom.xml" ]; then
        echo "Building Spring Boot application: $service_name"
        mvn clean package spring-boot:repackage
        
        # Check if Dockerfile exists
        if [ -f "Dockerfile" ]; then
            local IMAGE=${DOCKER_REGISTRY}/${service_name}:${IMAGE_VERSION}
            echo "Building Docker image: $IMAGE"
            docker build -f Dockerfile -t $IMAGE .
            
            echo "Pushing Docker image: $IMAGE"
            docker push $IMAGE
            if [ $? -eq 0 ]; then
                docker rmi "$IMAGE" # clean up local image
                echo "Successfully built and pushed: $service_name"
            else
                echo "Failed to push image for: $service_name"
            fi
        else
            echo "No Dockerfile found for $service_name, skipping Docker build"
        fi
    else
        echo "Not a Spring Boot application, skipping: $service_name"
    fi
    
    cd - > /dev/null # Return to previous directory
    echo ""
}

# Main execution
echo "Starting build process for all services..."

# Search for services in the backend directory
BACKEND_DIR="c:/Users/ID140/Documents/TaskO/MtdrSpring/backend"
if [ -d "$BACKEND_DIR" ]; then
    # Process api-service if it exists
    if [ -d "$BACKEND_DIR/api-service" ]; then
        build_service "$BACKEND_DIR/api-service"
    fi
    
    # Find and build all other direct service directories in backend
    for service_dir in "$BACKEND_DIR"/*; do
        if [ -d "$service_dir" ] && [ -f "$service_dir/pom.xml" ]; then
            if [ "$(basename $service_dir)" != "api-service" ]; then  # Skip if already processed
                build_service "$service_dir"
            fi
        fi
    done
else
    echo "Backend directory not found at $BACKEND_DIR"
fi

echo "Build process completed for all services"