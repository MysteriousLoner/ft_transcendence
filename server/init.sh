#!/bin/bash
python BeatsPongServer/manage.py makemigrations

python BeatsPongServer/manage.py migrate

echo "Starting SSL server..."
python BeatsPongServer/manage.py runsslserver --certificate /etc/certs/cert.pem --key /etc/certs/key.pem 0.0.0.0:8000 &


echo "Starting Daphne..."
pwd
cd BeatsPongServer/  # Change directory to /app/BeatsPongServer/
pwd
ls

# Set Django settings module and setup Django applications
export DJANGO_SETTINGS_MODULE=BeatsPongServer.settings
export PYTHONPATH=/app
python -c "import django; django.setup()"
sleep 5

daphne -e ssl:8001:privateKey=/etc/certs/key.pem:certKey=/etc/certs/cert.pem BeatsPongServer.asgi:application

echo "Done"
