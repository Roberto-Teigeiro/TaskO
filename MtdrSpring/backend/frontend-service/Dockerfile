FROM nginx:1.27-alpine-slim
# Create directory for static files (if needed)
RUN mkdir -p /usr/share/nginx/html

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl 

# Copy SSL certificates 
# These can stay since they don't affect operation unless used

# Copy the already-built static files from Maven target directory
COPY target/frontend-static/ /usr/share/nginx/html/

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Only expose the HTTP port
EXPOSE 8080 

CMD ["nginx", "-g", "daemon off;"]