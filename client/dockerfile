# Use Nginx as the base image
FROM nginx:latest

# Set working directory for Nginx
WORKDIR /usr/share/nginx/html

# Remove the default Nginx static content
RUN rm -rf ./*

# Copy your frontend static files into the Nginx web root
COPY ./static /usr/share/nginx/html

# update and upgrade the system
RUN apt-get update && apt-get upgrade -y

# install the required packages
RUN apt-get install -y nginx openssl

#create the ssl directory
RUN mkdir -p /etc/nginx/ssl

# Install OpenSSL and generate a self-signed SSL certificate
RUN openssl req -x509 -nodes -out /etc/nginx/ssl/transcendence.crt -keyout \
    /etc/nginx/ssl/transcendence.key -subj "/C=US/ST=State/L=City/O=Organization/OU=Unit/CN=localhost"

# Expose ports for and HTTPS
EXPOSE 443

# Copy the Nginx configuration
COPY ./conf/nginx.conf /etc/nginx/conf.d/default.conf

# Set default command to run Nginx
CMD ["nginx", "-g", "daemon off;"]
