FROM nginx:1.27-alpine-slim
# Create directory for static files (if needed)
RUN mkdir -p /usr/share/nginx/html

# Copy the already-built static files from Maven target directory
COPY target/frontend-static/ /usr/share/nginx/html/

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf


EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]