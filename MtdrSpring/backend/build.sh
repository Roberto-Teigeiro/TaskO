
if [ -z "$DOCKER_REGISTRY" ]; then
    export DOCKER_REGISTRY=$(state_get DOCKER_REGISTRY)
    echo "DOCKER_REGISTRY set from state."
fi
if [ -z "$DOCKER_REGISTRY" ]; then
    echo "Error: DOCKER_REGISTRY env variable needs to be set!"
    exit 1
fi

if [ -z "$IMAGE_VERSION" ]; then
    export IMAGE_VERSION="latest"
    echo "IMAGE_VERSION not set, defaulting to 'latest'"
else
    echo "Using IMAGE_VERSION: $IMAGE_VERSION"
fi

echo "Building all modules..."
mvn clean package

# Add debugging for frontend-service
echo "Checking frontend-service build results..."
ls -la frontend-service/target/ || echo "No target directory in frontend-service"
ls -la frontend-service/target/frontend-static/ || echo "No frontend-static directory"

echo "Building and pushing api-service image..."
cd api-service
export API_IMAGE=${DOCKER_REGISTRY}/api-service:${IMAGE_VERSION}
docker build -t $API_IMAGE .
docker push $API_IMAGE
if [ $? -eq 0 ]; then
    echo "api-service image pushed successfully"
    #docker rmi "$API_IMAGE" #remove local image
else
    echo "Failed to push api-service image"
    exit 1
fi
cd ..

echo "Building and pushing bot-service image..."
cd bot-service
export BOT_IMAGE=${DOCKER_REGISTRY}/bot-service:${IMAGE_VERSION}
docker build -t $BOT_IMAGE .
docker push $BOT_IMAGE
if [ $? -eq 0 ]; then
    echo "bot-service image pushed successfully"
    #docker rmi "$BOT_IMAGE" #remove local image
else
    echo "Failed to push bot-service image"
    exit 1
fi
cd ..

echo "Building and pushing frontend-service image..."
cd frontend-service
export FRONTEND_IMAGE=${DOCKER_REGISTRY}/frontend-service:${IMAGE_VERSION}
docker build -t $FRONTEND_IMAGE .
docker push $FRONTEND_IMAGE
if [ $? -eq 0 ]; then
    echo "frontend-service image pushed successfully"
    #docker rmi "$FRONTEND_IMAGE" #remove local image
else
    echo "Failed to push frontend-service image"
    exit 1
fi
cd ..

echo "All services built and pushed successfully!"