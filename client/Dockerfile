FROM debian:bullseye

# Install dependencies
RUN apt-get update \
    && apt-get install -y nginx openssl \
    && mkdir -p /var/www/ /etc/nginx/ssl/ /run/nginx

# Generate self-signed SSL certificate
RUN openssl req -newkey rsa:4096 -x509 -sha256 -days 365 -nodes \
    -out /etc/nginx/ssl/transcendence.crt \
    -keyout /etc/nginx/ssl/transcendence.key \
    -subj "/O=transcendence/OU=transcendence/CN=transcendence/"

# Set appropriate permissions for the SSL key (to be accessible by Nginx)
RUN chmod 644 /etc/nginx/ssl/transcendence.key
RUN chmod 644 /etc/nginx/ssl/transcendence.crt

# Expose port 443 for HTTPS
EXPOSE 443

# Copy custom nginx configuration into container
COPY ./conf/nginx.conf /etc/nginx/conf.d/nginx.conf

# Copy frontend static files to the appropriate Nginx directory
COPY ./static /usr/share/nginx/html

# Start Nginx in the foreground (important for Docker containers)
CMD ["nginx", "-g", "daemon off;"]
