#!/bin/bash

# Checking Docker registry configuration
if [ -z "$DOCKER_REGISTRY" ]; then
    export DOCKER_REGISTRY=$(state_get DOCKER_REGISTRY)
    echo "DOCKER_REGISTRY set."
fi
if [ -z "$DOCKER_REGISTRY" ]; then
    echo "Error: DOCKER_REGISTRY env variable needs to be set!"
    exit 1
fi

# Base image name and version
export BASE_NAME=todolistapp-springboot
export IMAGE_VERSION=0.1

# Build and push for api-service
echo "Building api-service..."
cd api-service
mvn clean package spring-boot:repackage
export API_IMAGE=${DOCKER_REGISTRY}/${BASE_NAME}-api:${IMAGE_VERSION}
docker build -f Dockerfile -t $API_IMAGE .
docker push $API_IMAGE
if [ $? -eq 0 ]; then
    docker rmi "$API_IMAGE" #local
    echo "api-service image built and pushed successfully."
else
    echo "Failed to push api-service image."
    exit 1
fi
cd ..

# Build and push for bot-service
echo "Building bot-service..."
cd bot-service
mvn clean package spring-boot:repackage
export BOT_IMAGE=${DOCKER_REGISTRY}/${BASE_NAME}-bot:${IMAGE_VERSION}
docker build -f Dockerfile -t $BOT_IMAGE .
docker push $BOT_IMAGE
if [ $? -eq 0 ]; then
    docker rmi "$BOT_IMAGE" #local
    echo "bot-service image built and pushed successfully."
else
    echo "Failed to push bot-service image."
    exit 1
fi
cd ..

# Build and push for frontend-service
echo "Building frontend-service..."
cd frontend-service
mvn clean package
export FRONTEND_IMAGE=${DOCKER_REGISTRY}/${BASE_NAME}-frontend:${IMAGE_VERSION}
docker build -f Dockerfile -t $FRONTEND_IMAGE .
docker push $FRONTEND_IMAGE
if [ $? -eq 0 ]; then
    docker rmi "$FRONTEND_IMAGE" #local
    echo "frontend-service image built and pushed successfully."
else
    echo "Failed to push frontend-service image."
    exit 1
fi
cd ..

echo "All services built and pushed successfully."