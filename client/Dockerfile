FROM nginx:1.15.8-alpine

# Install OpenSSL
RUN apk add --no-cache openssl

# Create the directory for the SSL certificates
RUN mkdir -p /etc/nginx/ssl

# Generate self-signed SSL certificate
RUN openssl req -newkey rsa:4096 -x509 -sha256 -days 365 -nodes \
    -out /etc/nginx/ssl/transcendence.crt \
    -keyout /etc/nginx/ssl/transcendence.key \
    -subj "/O=transcendence/OU=transcendence/CN=transcendence/"

# Set appropriate permissions for the SSL key (to be accessible by Nginx)
RUN chmod 644 /etc/nginx/ssl/transcendence.key
RUN chmod 644 /etc/nginx/ssl/transcendence.crt

#config
COPY ./conf/nginx.conf /etc/nginx/nginx.conf

#content, comment out the ones you dont need!
COPY ./static/html /usr/share/nginx/html/
COPY ./static/css /usr/share/nginx//html/css/
COPY ./static/js /usr/share/nginx/html/js/