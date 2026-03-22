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
BACKEND_IMAGE="$DOCKERHUB_USERNAME/physio-tracker-backend:$TAG"
FRONTEND_IMAGE="$DOCKERHUB_USERNAME/physio-tracker-frontend:$TAG"

echo "Building and pushing as: $DOCKERHUB_USERNAME  tag: $TAG"
echo ""

# Build for linux/amd64 (common server architecture)
# Change --platform if your server is ARM (e.g. Raspberry Pi uses linux/arm64)
docker buildx build \
  --platform linux/amd64 \
  --push \
  -t "$BACKEND_IMAGE" \
  ./backend

echo "✓ Backend pushed: $BACKEND_IMAGE"

docker buildx build \
  --platform linux/amd64 \
  --push \
  -t "$FRONTEND_IMAGE" \
  ./frontend

echo "✓ Frontend pushed: $FRONTEND_IMAGE"
echo ""
echo "Done! On your server run:"
echo "  docker compose -f docker-compose.server.yml pull"
echo "  docker compose -f docker-compose.server.yml up -d"
