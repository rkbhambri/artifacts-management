#!/bin/sh
set -e

echo "Running database migrations..."
node dist/database/run-migrations.js

echo "Seeding base data (customers/systems)..."
node dist/database/seeds/seed.js

echo "Starting Artifacts API..."
exec node dist/main.js
