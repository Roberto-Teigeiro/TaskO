#!/bin/bash
SCRIPT_DIR=$(pwd)

#Validation
if [ -z "$DOCKER_REGISTRY" ]; then
    export DOCKER_REGISTRY=$(state_get DOCKER_REGISTRY)
    echo "DOCKER_REGISTRY set."
fi
if [ -z "$DOCKER_REGISTRY" ]; then
    echo "Error: DOCKER_REGISTRY env variable needs to be set!"
    exit 1
fi

if [ -z "$TODO_PDB_NAME" ]; then
    export TODO_PDB_NAME=$(state_get MTDR_DB_NAME)
    echo "TODO_PDB_NAME set."
fi
if [ -z "$TODO_PDB_NAME" ]; then
    echo "Error: TODO_PDB_NAME env variable needs to be set!"
    exit 1
fi

if [ -z "$OCI_REGION" ]; then
    echo "OCI_REGION not set. Will get it with state_get"
    export OCI_REGION=$(state_get REGION)
fi
if [ -z "$OCI_REGION" ]; then
    echo "Error: OCI_REGION env variable needs to be set!"
    exit 1
fi

if [ -z "$UI_USERNAME" ]; then
    echo "UI_USERNAME not set. Will get it with state_get"
    export UI_USERNAME=$(state_get UI_USERNAME)
fi
if [ -z "$UI_USERNAME" ]; then
    echo "Error: UI_USERNAME env variable needs to be set!"
    exit 1
fi

if [ -z "$BOT_TOKEN" ]; then
    echo "BOT_TOKEN not set. Will get it with state_get"
    export BOT_TOKEN=$(state_get BOT_TOKEN)
fi
if [ -z "$BOT_TOKEN" ]; then
    echo "Warning: BOT_TOKEN env variable not set. Bot service may not work properly."
    # Not exiting as this might be optional
fi

if [ -z "$BOT_USERNAME" ]; then
    echo "BOT_USERNAME not set. Will get it with state_get"
    export BOT_USERNAME=$(state_get BOT_USERNAME)
fi
if [ -z "$BOT_USERNAME" ]; then
    echo "Warning: BOT_USERNAME env variable not set. Bot service may not work properly."
    # Not exiting as this might be optional
fi

export CURRENTTIME=$( date '+%F_%H:%M:%S' )
echo "Deployment timestamp: $CURRENTTIME"

# Deploy API Service
echo "===== Deploying API Service ====="
cp api-service/src/main/resources/api-service.yaml api-service-$CURRENTTIME.yaml

sed -i "s|%DOCKER_REGISTRY%|${DOCKER_REGISTRY}|g" api-service-$CURRENTTIME.yaml
sed -e "s|%TODO_PDB_NAME%|${TODO_PDB_NAME}|g" api-service-${CURRENTTIME}.yaml > /tmp/api-service-${CURRENTTIME}.yaml
mv -- /tmp/api-service-$CURRENTTIME.yaml api-service-$CURRENTTIME.yaml
sed -e "s|%OCI_REGION%|${OCI_REGION}|g" api-service-${CURRENTTIME}.yaml > /tmp/api-service-$CURRENTTIME.yaml
mv -- /tmp/api-service-$CURRENTTIME.yaml api-service-$CURRENTTIME.yaml
sed -e "s|%UI_USERNAME%|${UI_USERNAME}|g" api-service-${CURRENTTIME}.yaml > /tmp/api-service-$CURRENTTIME.yaml
mv -- /tmp/api-service-$CURRENTTIME.yaml api-service-$CURRENTTIME.yaml

# Deploy Bot Service
echo "===== Deploying Bot Service ====="
cp bot-service/src/main/resources/bot-service.yaml bot-service-$CURRENTTIME.yaml

sed -i "s|%DOCKER_REGISTRY%|${DOCKER_REGISTRY}|g" bot-service-$CURRENTTIME.yaml
sed -e "s|%BOT_TOKEN%|${BOT_TOKEN}|g" bot-service-${CURRENTTIME}.yaml > /tmp/bot-service-${CURRENTTIME}.yaml
mv -- /tmp/bot-service-$CURRENTTIME.yaml bot-service-$CURRENTTIME.yaml
sed -e "s|%BOT_USERNAME%|${BOT_USERNAME}|g" bot-service-${CURRENTTIME}.yaml > /tmp/bot-service-$CURRENTTIME.yaml
mv -- /tmp/bot-service-$CURRENTTIME.yaml bot-service-$CURRENTTIME.yaml

# Deploy Frontend Service
echo "===== Deploying Frontend Service ====="
cp frontend-service/src/main/resources/frontend-service.yaml frontend-service-$CURRENTTIME.yaml

sed -i "s|%DOCKER_REGISTRY%|${DOCKER_REGISTRY}|g" frontend-service-$CURRENTTIME.yaml

# Apply Kubernetes resources
if [ -z "$1" ]; then
    echo "Applying API Service..."
    kubectl apply -f $SCRIPT_DIR/api-service-$CURRENTTIME.yaml -n mtdrworkshop
    
    echo "Applying Bot Service..."
    kubectl apply -f $SCRIPT_DIR/bot-service-$CURRENTTIME.yaml -n mtdrworkshop
    
    echo "Applying Frontend Service..."
    kubectl apply -f $SCRIPT_DIR/frontend-service-$CURRENTTIME.yaml -n mtdrworkshop
else
    echo "Applying API Service with Istio sidecar injection..."
    kubectl apply -f <(istioctl kube-inject -f $SCRIPT_DIR/api-service-$CURRENTTIME.yaml) -n mtdrworkshop
    
    echo "Applying Bot Service with Istio sidecar injection..."
    kubectl apply -f <(istioctl kube-inject -f $SCRIPT_DIR/bot-service-$CURRENTTIME.yaml) -n mtdrworkshop
    
    echo "Applying Frontend Service with Istio sidecar injection..."
    kubectl apply -f <(istioctl kube-inject -f $SCRIPT_DIR/frontend-service-$CURRENTTIME.yaml) -n mtdrworkshop
fi

echo "===== All services deployed ====="
echo "Checking pod status..."
kubectl get pods -n mtdrworkshop