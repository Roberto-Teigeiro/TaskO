FROM openjdk:17-slim

WORKDIR /app

# Copy the JAR file
COPY target/bot-service-0.0.1-SNAPSHOT.jar bot-service.jar

EXPOSE 8081

# Environment variables
ENV API_SERVICE_URL="http://tasko-api-service:8080"
ENV BOT_TOKEN=""
ENV BOT_USERNAME=""
ENV BOT_WEBHOOK_URL=""

# Run the application
ENTRYPOINT ["java", "-jar", "bot-service.jar"]