#!/bin/bash
SCRIPT_DIR=$(pwd)

#Validation
if [ -z "$DOCKER_REGISTRY" ]; then
    export DOCKER_REGISTRY=mx-queretaro-1.ocir.io
    echo "DOCKER_REGISTRY set to mx-queretaro-1.ocir.io"
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
    export OCI_REGION=mx-queretaro-1
    echo "OCI_REGION set to mx-queretaro-1"
fi

if [ -z "$UI_USERNAME" ]; then
    export UI_USERNAME=a01643651
    echo "UI_USERNAME set to a01643651"
fi

if [ -z "$BOT_TOKEN" ]; then
    echo "BOT_TOKEN not set. Will get it with state_get"
    export BOT_TOKEN=$(state_get BOT_TOKEN)
fi
if [ -z "$BOT_TOKEN" ]; then
    echo "Warning: BOT_TOKEN env variable not set. Bot service may not work properly."
    # Not exiting as this might be optional
    export BOT_TOKEN="sample-token"
fi

if [ -z "$BOT_USERNAME" ]; then
    export BOT_USERNAME="samplebot"
    echo "BOT_USERNAME set to samplebot"
fi

export CURRENTTIME=$( date '+%F_%H:%M:%S' )
echo "Deployment timestamp: $CURRENTTIME"

# Check for base deployment YAML
if [ ! -f "todolistapp-springboot.yaml" ]; then
    echo "Error: todolistapp-springboot.yaml not found."
    echo "Available YAML files:"
    ls -la *.yaml
    exit 1
fi

# Create deployment files
echo "===== Creating deployment files ====="
cp todolistapp-springboot.yaml todolistapp-springboot-$CURRENTTIME.yaml

# Replace variables in the deployment file
echo "===== Configuring deployment ====="
sed -i "s|%DOCKER_REGISTRY%|${DOCKER_REGISTRY}|g" todolistapp-springboot-$CURRENTTIME.yaml
sed -i "s|%TODO_PDB_NAME%|${TODO_PDB_NAME}|g" todolistapp-springboot-$CURRENTTIME.yaml
sed -i "s|%OCI_REGION%|${OCI_REGION}|g" todolistapp-springboot-$CURRENTTIME.yaml
sed -i "s|%UI_USERNAME%|${UI_USERNAME}|g" todolistapp-springboot-$CURRENTTIME.yaml
sed -i "s|%BOT_TOKEN%|${BOT_TOKEN}|g" todolistapp-springboot-$CURRENTTIME.yaml
sed -i "s|%BOT_USERNAME%|${BOT_USERNAME}|g" todolistapp-springboot-$CURRENTTIME.yaml

# Add image namespace and repo to deployment file
sed -i "s|image: mx-queretaro-1.ocir.io/todolistapp-springboot|image: mx-queretaro-1.ocir.io/axuo1dsetmvp/todoapp/todolistapp-springboot|g" todolistapp-springboot-$CURRENTTIME.yaml

echo "Deployment file created: todolistapp-springboot-$CURRENTTIME.yaml"

# Apply Kubernetes resources
if [ -z "$1" ]; then
    echo "Applying deployment..."
    kubectl apply -f $SCRIPT_DIR/todolistapp-springboot-$CURRENTTIME.yaml -n mtdrworkshop
else
    echo "Applying deployment with Istio sidecar injection..."
    kubectl apply -f <(istioctl kube-inject -f $SCRIPT_DIR/todolistapp-springboot-$CURRENTTIME.yaml) -n mtdrworkshop
fi

echo "===== Deployment completed ====="
echo "Checking pod status..."
kubectl get pods -n mtdrworkshop

# Wait for pods to be running
echo "Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod --all -n mtdrworkshop --timeout=300s
if [ $? -eq 0 ]; then
    echo "All pods are running successfully."
else
    echo "Warning: Some pods may not be ready yet. Check status with: kubectl get pods -n mtdrworkshop"
fi

echo "Deployment completed at $(date)"