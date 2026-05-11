#!/bin/sh
set -e

# Load .env if present
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

if [ -z "$DOCKERHUB_USERNAME" ] || [ "$DOCKERHUB_USERNAME" = "your-dockerhub-username" ]; then
  echo "ERROR: Set DOCKERHUB_USERNAME in .env before running this script."
  exit 1
fi

TAG="${IMAGE_TAG:-latest}"
APP_IMAGE="$DOCKERHUB_USERNAME/physio-tracker:$TAG"

echo "Building and pushing as: $DOCKERHUB_USERNAME  tag: $TAG"
echo ""

# Build for linux/amd64 (common server architecture)
# Change --platform if your server is ARM (e.g. Raspberry Pi uses linux/arm64)
docker buildx build \
  --platform linux/amd64 \
  --push \
  -t "$APP_IMAGE" \
  .

echo "✓ App pushed: $APP_IMAGE"
echo ""
echo "Done! On your server run:"
echo "  docker compose pull"
echo "  docker compose up -d"
