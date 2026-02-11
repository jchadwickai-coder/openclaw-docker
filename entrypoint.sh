#!/bin/bash
set -e

gh auth setup-git
echo "Configured git authentication for GitHub CLI"

echo "Running OpenClaw Gateway with arguments: $@"
# Execute the original entrypoint with all arguments
exec /app/docker-entrypoint.sh "$@"
