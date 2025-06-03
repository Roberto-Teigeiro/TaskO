FROM container-registry.oracle.com/java/openjdk:17

WORKDIR /app

# Copy the JAR file
COPY target/*.jar app.jar

# Create directory for wallet
RUN mkdir -p /app/db_wallet

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]