FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY target/BioSyncApi-0.0.1-SNAPSHOT.jar BioSync-API.jar
EXPOSE 8080
CMD ["java", "-Xms512m", "-Xmx512m", "-XX:+UseContainerSupport", "-XX:ParallelGCThreads=1", "-jar", "BioSync-API.jar"]
