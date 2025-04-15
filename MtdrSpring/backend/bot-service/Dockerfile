FROM openjdk:17-slim

WORKDIR /app

# Copy the JAR file 
COPY target/*.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]