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

# Add bot credentials validation
if [ -z "$BOT_TOKEN" ]; then
    echo "BOT_TOKEN not set. Will get it with state_get"
    export BOT_TOKEN=$(state_get BOT_TOKEN)
fi
if [ -z "$BOT_TOKEN" ]; then
    echo "Error: BOT_TOKEN env variable needs to be set!"
    exit 1
fi

if [ -z "$BOT_USERNAME" ]; then
    echo "BOT_USERNAME not set. Will get it with state_get"
    export BOT_USERNAME=$(state_get BOT_USERNAME)
fi
if [ -z "$BOT_USERNAME" ]; then
    echo "Error: BOT_USERNAME env variable needs to be set!"
    exit 1
fi

echo "Creating springboot deployments and services"
export CURRENTTIME=$( date '+%F_%H:%M:%S' )
echo CURRENTTIME is $CURRENTTIME  ...this will be appended to generated deployment yaml
cp src/main/resources/todolistapp-springboot.yaml todolistapp-springboot-$CURRENTTIME.yaml

# Replace all variables in the YAML file
sed -e "s|%DOCKER_REGISTRY%|${DOCKER_REGISTRY}|g" todolistapp-springboot-${CURRENTTIME}.yaml > /tmp/todolistapp-springboot-${CURRENTTIME}.yaml
mv -- /tmp/todolistapp-springboot-$CURRENTTIME.yaml todolistapp-springboot-$CURRENTTIME.yaml
sed -e "s|%TODO_PDB_NAME%|${TODO_PDB_NAME}|g" todolistapp-springboot-${CURRENTTIME}.yaml > /tmp/todolistapp-springboot-${CURRENTTIME}.yaml
mv -- /tmp/todolistapp-springboot-$CURRENTTIME.yaml todolistapp-springboot-$CURRENTTIME.yaml
sed -e "s|%OCI_REGION%|${OCI_REGION}|g" todolistapp-springboot-${CURRENTTIME}.yaml > /tmp/todolistapp-springboot-$CURRENTTIME.yaml
mv -- /tmp/todolistapp-springboot-$CURRENTTIME.yaml todolistapp-springboot-$CURRENTTIME.yaml
sed -e "s|%UI_USERNAME%|${UI_USERNAME}|g" todolistapp-springboot-${CURRENTTIME}.yaml > /tmp/todolistapp-springboot-$CURRENTTIME.yaml
mv -- /tmp/todolistapp-springboot-$CURRENTTIME.yaml todolistapp-springboot-$CURRENTTIME.yaml
sed -e "s|%BOT_TOKEN%|${BOT_TOKEN}|g" todolistapp-springboot-${CURRENTTIME}.yaml > /tmp/todolistapp-springboot-$CURRENTTIME.yaml
mv -- /tmp/todolistapp-springboot-$CURRENTTIME.yaml todolistapp-springboot-$CURRENTTIME.yaml
sed -e "s|%BOT_USERNAME%|${BOT_USERNAME}|g" todolistapp-springboot-${CURRENTTIME}.yaml > /tmp/todolistapp-springboot-$CURRENTTIME.yaml
mv -- /tmp/todolistapp-springboot-$CURRENTTIME.yaml todolistapp-springboot-$CURRENTTIME.yaml

# Apply the configuration
if [ -z "$1" ]; then
    kubectl apply -f $SCRIPT_DIR/todolistapp-springboot-$CURRENTTIME.yaml -n mtdrworkshop
else
    kubectl apply -f <(istioctl kube-inject -f $SCRIPT_DIR/todolistapp-springboot-$CURRENTTIME.yaml) -n mtdrworkshop
fi