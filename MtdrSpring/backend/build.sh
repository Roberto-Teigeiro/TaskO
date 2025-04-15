#!/bin/bash

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

# Use the current directory as the backend directory
BACKEND_DIR=$(pwd)

# Find and process all service directories in backend
for service_dir in "$BACKEND_DIR"/*-service; do
    if [ -d "$service_dir" ] && [ -f "$service_dir/pom.xml" ]; then
        build_service "$service_dir"
    fi
done

echo "Build process completed for all services"