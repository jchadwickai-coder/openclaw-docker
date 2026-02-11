#!/bin/bash
set -e

echo "Starting entrypoint script for OpenClaw Gateway"

gh auth setup-git
echo "Configured git authentication for GitHub CLI"

echo "Running OpenClaw Gateway with arguments: $@"
# Execute the original entrypoint with all arguments
exec /usr/local/bin/docker-entrypoint.sh "$@"
