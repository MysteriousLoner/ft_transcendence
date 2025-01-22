#!/bin/bash
CERT_FILE="cert.pem"
KEY_FILE="key.pem"

CERT_DIR="/etc/certs"

# IP address of the backend server
BACKEND_IP="http://localhost:8000"

CERT_COMMON_NAME="bpong.com" 
CERT_COUNTRY="MY" 
CERT_STATE="Selangor"
CERT_LOCATION="Petaling" 
CERT_ORG="YourOrganization" 
CERT_ORG_UNIT="YourOrgUnit"

# Check if certificate and key exist
if [ ! -f "$CERT_DIR/$CERT_FILE" ] || [ ! -f "$CERT_DIR/$KEY_FILE" ]; then
    if [ -n "$CERT_COMMON_NAME" ]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout "$CERT_DIR/$KEY_FILE" -out "$CERT_DIR/$CERT_FILE" \
        -subj "/C=$CERT_COUNTRY/ST=$CERT_STATE/L=$CERT_LOCATION/O=$CERT_ORG/OU=$CERT_ORG_UNIT/CN=$CERT_COMMON_NAME" \
        -addext "subjectAltName=DNS:$CERT_COMMON_NAME"
    else
        echo "Environment variable CERT_COMMON_NAME is not set."
        exit 1
    fi
fi

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
sleep 10

daphne -e ssl:8001:privateKey=/etc/certs/key.pem:certKey=/etc/certs/cert.pem BeatsPongServer.asgi:application

echo "Done"
