FROM nginx:1.25-alpine

# Create directory for static files
RUN mkdir -p /usr/share/nginx/html

# Copy the static files
COPY target/classes/ /usr/share/nginx/html/

# If you have specific static files location, adjust the path
# COPY target/classes/static/ /usr/share/nginx/html/

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]