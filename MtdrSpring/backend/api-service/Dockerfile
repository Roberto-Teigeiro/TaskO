FROM openjdk:17-slim

WORKDIR /app

# Create directory for wallet
RUN mkdir -p /app/db_wallet

# Copy the JAR file
COPY target/api-service-0.0.1-SNAPSHOT.jar api-service.jar

EXPOSE 8080

# Add environment variables
ENV TODO_PDB_NAME=""
ENV OCI_REGION=""
ENV UI_USERNAME=""

ENTRYPOINT ["java", "-jar", "api-service.jar"]