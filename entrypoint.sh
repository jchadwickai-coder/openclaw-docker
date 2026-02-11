#!/bin/bash
set -e

gh auth setup-git

# Execute the original entrypoint with all arguments
exec docker-entrypoint.sh "$@"
