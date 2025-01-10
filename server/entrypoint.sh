#!/bin/sh

set -e

if [ -z "${POSTGRES_DB}" ]; then
    echo "POSTGRES_DB is not set"
    exit 1
fi

echo "Waiting for postgres..."
while ! nc -z $DB_HOST $DB_PORT; do
    sleep 0.1
done

echo "PostgreSQL started"

cd BeatsPongServer/

# Make the init script executable
chmod +x init_db.sh

# Run the initialization script
./init_db.sh

echo "Starting server..."
exec python manage.py runserver 0.0.0.0:8000