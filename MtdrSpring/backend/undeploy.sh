#!/bin/bash
echo "Deleting all tasko deployments and services..."
kubectl -n mtdrworkshop delete deployment tasko-frontend-deployment tasko-api-deployment tasko-bot-deployment
kubectl -n mtdrworkshop delete service tasko-frontend-service tasko-api-service tasko-bot-service