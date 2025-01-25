FROM nginx:1.15.8-alpine

#config
COPY ./conf/nginx.conf /etc/nginx/nginx.conf

#content, comment out the ones you dont need!
COPY ./static/html /usr/share/nginx/html/
COPY ./static/css /usr/share/nginx//html/css/
COPY ./static/js /usr/share/nginx/html/js/