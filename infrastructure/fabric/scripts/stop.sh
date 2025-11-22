#!/bin/bash

set -e

echo "Stopping Hyperledger Fabric network..."

docker-compose down

echo "Fabric network stopped!"

