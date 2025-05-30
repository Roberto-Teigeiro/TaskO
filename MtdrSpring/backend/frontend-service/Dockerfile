# Stage 1: Build the frontend application
FROM node:24.1.0-slim AS builder

# Set the working directory for the build
WORKDIR /app
ENV VITE_CLERK_PUBLISHABLE_KEY=pk_test_YXNzdXJpbmctbHlueC05NS5jbGVyay5hY2NvdW50cy5kZXYk
ENV CLERK_SECRET_KEY=sk_test_6Ib6VO3fmCDHpSNC2eJUXgkO9DrE70NusLvT7NmWFI
ENV VITE_CLERK_SIGN_IN_URL=/login
ENV VITE_CLERK_SIGN_UP_URL=/register
ENV VITE_CLERK_AFTER_SIGN_IN_URL=/dashboard
ENV VITE_CLERK_AFTER_SIGN_UP_URL=/dashboard
# Copy package.json and package-lock.json (or yarn.lock)
# Assuming your frontend source code is in 'src/main/frontend' relative to this Dockerfile
COPY src/main/frontend/package.json src/main/frontend/package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of your frontend source code
COPY src/main/frontend/ ./

# Build the application (this usually creates a 'dist' or 'build' folder)
RUN npm run build

# Stage 2: Serve the built frontend with Nginx
FROM nginx:1.27-alpine-slim

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Copy SSL certificates 
# These are copied from the build context (where your Dockerfile is)
COPY server.crt /etc/nginx/ssl/
COPY www_tasko_works.key /etc/nginx/ssl/
COPY ca.crt /etc/nginx/ssl/

# Remove default Nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy the built static files from the 'builder' stage
# Adjust '/app/dist' if your 'npm run build' command outputs to a different directory (e.g., /app/build)
COPY --from=builder /app/dist /usr/share/nginx/html/

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port (ensure this matches your nginx.conf)
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]