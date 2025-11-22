#!/bin/bash

# Deploy script for Cloud Run
# Usage: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
SERVICE_NAME="ai-content-authenticator"
REGION="us-central1"
PROJECT_ID="notes-sync-472107"

echo "🚀 Deploying to Cloud Run..."
echo "   Environment: $ENVIRONMENT"
echo "   Service: $SERVICE_NAME"
echo "   Region: $REGION"
echo ""

# Set project
gcloud config set project $PROJECT_ID

# Deploy
echo "📦 Building and deploying..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=$ENVIRONMENT \
  --quiet

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --region $REGION \
  --format 'value(status.url)')

echo ""
echo "✅ Deployment complete!"
echo "🌐 Service URL: $SERVICE_URL"
echo ""

# Test health endpoint
echo "🔍 Testing health endpoint..."
curl -s "$SERVICE_URL/health" | jq '.'

echo ""
echo "🎉 All done!"
