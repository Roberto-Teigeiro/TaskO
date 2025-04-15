#!/bin/bash

# Checking Docker registry configuration
if [ -z "$DOCKER_REGISTRY" ]; then
    export DOCKER_REGISTRY=mx-queretaro-1.ocir.io
    echo "DOCKER_REGISTRY set to mx-queretaro-1.ocir.io"
fi

# Set Docker credentials for Oracle Cloud Infrastructure Registry
export DOCKER_USERNAME="axuo1dsetmvp/a01643651"
# You'll need an Auth Token from your Oracle Cloud account
read -sp "Enter your Oracle Cloud Auth Token: " DOCKER_PASSWORD
echo ""
export DOCKER_PASSWORD

# Authenticate with Docker registry
echo "Authenticating with Docker registry..."
echo "$DOCKER_PASSWORD" | docker login $DOCKER_REGISTRY -u $DOCKER_USERNAME --password-stdin
if [ $? -ne 0 ]; then
    echo "Docker login failed! Please check your credentials."
    echo "For Oracle Cloud, username should be: <tenancy-namespace>/<username>"
    echo "Password should be your Auth Token, not your Oracle Cloud password"
    exit 1
fi
echo "Authentication successful."

# Base image name and version
export BASE_NAME=todolistapp-springboot
export IMAGE_VERSION=0.1

# Rest of your script remains unchanged

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

# Log out from Docker registry
docker logout $DOCKER_REGISTRY

echo "All services built and pushed successfully."