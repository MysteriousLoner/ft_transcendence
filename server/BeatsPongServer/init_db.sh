#!/bin/bash

echo "Running initial migrations..."
python manage.py migrate auth --noinput
python manage.py migrate contenttypes --noinput
python manage.py migrate admin --noinput
python manage.py migrate sessions --noinput

echo "Making migrations..."
python manage.py makemigrations

echo "Running all migrations..."
python manage.py migrate --noinput