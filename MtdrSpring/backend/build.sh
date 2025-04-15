#!/bin/bash

# Version for all services
export IMAGE_VERSION=0.1

if [ -z "$DOCKER_REGISTRY" ]; then
    export DOCKER_REGISTRY=$(state_get DOCKER_REGISTRY)
    echo "DOCKER_REGISTRY set."
fi
if [ -z "$DOCKER_REGISTRY" ]; then
    echo "Error: DOCKER_REGISTRY env variable needs to be set!"
    exit 1
fi

# Build and push frontend service
echo "Building frontend service..."
export FRONTEND_IMAGE_NAME=todolistapp-springboot-frontend
export FRONTEND_IMAGE=${DOCKER_REGISTRY}/${FRONTEND_IMAGE_NAME}:${IMAGE_VERSION}
mvn clean package spring-boot:repackage -f frontend/pom.xml
docker build -f frontend/Dockerfile -t $FRONTEND_IMAGE frontend/
docker push $FRONTEND_IMAGE
if [ $? -eq 0 ]; then
    docker rmi "$FRONTEND_IMAGE" #local
fi

# Build and push API service
echo "Building API service..."
export API_IMAGE_NAME=todolistapp-springboot-api
export API_IMAGE=${DOCKER_REGISTRY}/${API_IMAGE_NAME}:${IMAGE_VERSION}
mvn clean package spring-boot:repackage -f api/pom.xml
docker build -f api/Dockerfile -t $API_IMAGE api/
docker push $API_IMAGE
if [ $? -eq 0 ]; then
    docker rmi "$API_IMAGE" #local
fi

# Build and push bot service
echo "Building bot service..."
export BOT_IMAGE_NAME=todolistapp-springboot-bot
export BOT_IMAGE=${DOCKER_REGISTRY}/${BOT_IMAGE_NAME}:${IMAGE_VERSION}
mvn clean package spring-boot:repackage -f bot/pom.xml
docker build -f bot/Dockerfile -t $BOT_IMAGE bot/
docker push $BOT_IMAGE
if [ $? -eq 0 ]; then
    docker rmi "$BOT_IMAGE" #local
fi

echo "All microservices built and pushed successfully."