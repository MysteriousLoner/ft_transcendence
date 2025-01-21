#!/bin/bash

echo "Starting SSL server..."
python server/BeatsPongServer/manage.py runsslserver --certificate /etc/certs/cert.pem --key /etc/certs/key.pem 0.0.0.0:8000 &

sleep 5

echo "Starting Daphne..."
daphne -e ssl:8001:privateKey=/etc/certs/key.pem:certKey=/etc/certs/cert.pem backend.asgi:application

echo "Done"