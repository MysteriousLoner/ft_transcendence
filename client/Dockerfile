FROM debian:bullseye

RUN apt-get update \
    && apt-get install -y nginx openssl \
    && mkdir -p /var/www/ /etc/nginx/ssl/

# Nginx needs this directory for important information for FastCGI
RUN mkdir -p /run/nginx

RUN openssl req -newkey rsa:4096 -x509 -sha256 -days 365 -nodes \
    -out /etc/nginx/ssl/transcendence.crt \
    -keyout /etc/nginx/ssl/transcendence.key \
    -subj "/O=transcendence/OU=transcendence/CN=transcendence/"

COPY ./conf/nginx.conf /etc/nginx/conf.d

CMD ["nginx", "-g", "daemon off;"]