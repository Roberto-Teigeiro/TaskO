#!/bin/bash

# Configuration
export VERSION=0.1

# Error handling
set -e  # Exit on any error

if [ -z "$DOCKER_REGISTRY" ]; then
    export DOCKER_REGISTRY=$(state_get DOCKER_REGISTRY)
    echo "DOCKER_REGISTRY set to: $DOCKER_REGISTRY"
fi
if [ -z "$DOCKER_REGISTRY" ]; then
    echo "Error: DOCKER_REGISTRY env variable needs to be set!"
    exit 1
fi

echo "Building all Docker images for TaskO application..."

# Build all modules from the parent directory at once
cd ..  # Move up to parent directory with main pom.xml
echo "===== Building all Maven modules at once ====="
# Build all modules with one command
mvn clean package -DskipTests
cd backend  # Return to backend directory

# Define service names array
services=("api-service" "bot-service" "frontend-service")
# Define corresponding image names array
image_names=("todolistapp-api" "todolistapp-bot" "todolistapp-frontend")

# Loop through services and build/push Docker images
for i in "${!services[@]}"; do
    service=${services[$i]}
    image=${image_names[$i]}
    
    echo "===== Building ${service} Docker Image ====="
    cd "${service}"
    export SERVICE_IMAGE=${DOCKER_REGISTRY}/${image}:${VERSION}
    echo "Building image: $SERVICE_IMAGE"

    if [ ! -f "Dockerfile" ]; then
        echo "Error: Dockerfile not found in ${service} directory"
        exit 1
    fi

    docker build -f Dockerfile -t $SERVICE_IMAGE .
    docker push $SERVICE_IMAGE
    if [ $? -eq 0 ]; then
        docker rmi "$SERVICE_IMAGE" #local
        echo "${service} built and pushed successfully"
    else
        echo "Error: Failed to build ${service}"
        exit 1
    fi
    cd ..
done

echo "===== All images built and pushed successfully ====="
echo "API Service: ${DOCKER_REGISTRY}/todolistapp-api:${VERSION}"
echo "Bot Service: ${DOCKER_REGISTRY}/todolistapp-bot:${VERSION}" 
echo "Frontend: ${DOCKER_REGISTRY}/todolistapp-frontend:${VERSION}"