FROM nginx:1.25-alpine

# Copy static files from your frontend build
COPY frontend-service/target/frontend-static/ /usr/share/nginx/html/

# Copy configuration
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy SSL certificates if needed
# COPY certs/ /etc/nginx/certs/

EXPOSE 80 443