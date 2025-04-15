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
mvn clean package spring-boot:repackage -f frontend-service/pom.xml
docker build -f frontend-service/Dockerfile -t $FRONTEND_IMAGE frontend-service/
docker push $FRONTEND_IMAGE
if [ $? -eq 0 ]; then
    docker rmi "$FRONTEND_IMAGE" #local
fi

# Build and push API service
echo "Building API service..."
export API_IMAGE_NAME=todolistapp-springboot-api
export API_IMAGE=${DOCKER_REGISTRY}/${API_IMAGE_NAME}:${IMAGE_VERSION}
mvn clean package spring-boot:repackage -f api-service/pom.xml
docker build -f api-service/Dockerfile -t $API_IMAGE api-service/
docker push $API_IMAGE
if [ $? -eq 0 ]; then
    docker rmi "$API_IMAGE" #local
fi

# Build and push bot service
echo "Building bot service..."
export BOT_IMAGE_NAME=todolistapp-springboot-bot
export BOT_IMAGE=${DOCKER_REGISTRY}/${BOT_IMAGE_NAME}:${IMAGE_VERSION}
mvn clean package spring-boot:repackage -f bot-service/pom.xml
docker build -f bot-service/Dockerfile -t $BOT_IMAGE bot-service/
docker push $BOT_IMAGE
if [ $? -eq 0 ]; then
    docker rmi "$BOT_IMAGE" #local
fi

echo "Creating springboot deployments and services"
export CURRENTTIME=$( date '+%F_%H:%M:%S' )
echo CURRENTTIME is $CURRENTTIME  ...this will be appended to generated deployment yaml

# Create a simpler filename without timestamp or use a fixed name
export DEPLOYMENT_FILE="todolistapp-springboot-latest.yaml"
cp src/main/resources/todolistapp-springboot.yaml $DEPLOYMENT_FILE

# Replace all variables in the YAML file
sed -i -e "s|%DOCKER_REGISTRY%|${DOCKER_REGISTRY}|g" $DEPLOYMENT_FILE
sed -i -e "s|%TODO_PDB_NAME%|${TODO_PDB_NAME}|g" $DEPLOYMENT_FILE
sed -i -e "s|%OCI_REGION%|${OCI_REGION}|g" $DEPLOYMENT_FILE
sed -i -e "s|%UI_USERNAME%|${UI_USERNAME}|g" $DEPLOYMENT_FILE
sed -i -e "s|%BOT_TOKEN%|${BOT_TOKEN}|g" $DEPLOYMENT_FILE
sed -i -e "s|%BOT_USERNAME%|${BOT_USERNAME}|g" $DEPLOYMENT_FILE

# Apply the configuration
if [ -z "$1" ]; then
    kubectl apply -f $SCRIPT_DIR/$DEPLOYMENT_FILE -n mtdrworkshop
else
    kubectl apply -f <(istioctl kube-inject -f $SCRIPT_DIR/$DEPLOYMENT_FILE) -n mtdrworkshop
fi

# Optionally, keep a timestamped copy for audit purposes
cp $DEPLOYMENT_FILE todolistapp-springboot-$CURRENTTIME.yaml
echo "All microservices built and pushed successfully."