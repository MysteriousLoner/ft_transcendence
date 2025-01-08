#!/bin/sh

set -e

echo "Waiting for postgres..."

# Wait for postgres
until PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USERNAME" -d "$DB_NAME" -c '\q'; do
  echo "Postgres is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL started"

echo "Running migrations..."
python BeatsPongServer/manage.py makemigrations --noinput
python BeatsPongServer/manage.py migrate --noinput

echo "Starting server..."
python BeatsPongServer/manage.py runserver 0.0.0.0:8000
exec "$@"