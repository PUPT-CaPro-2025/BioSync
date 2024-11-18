FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY target/BioSyncApi-0.0.1-SNAPSHOT.jar BioSync-API.jar
EXPOSE 8080
CMD ["java", "-Xms768m", "-Xmx768m", "-XX:+UseContainerSupport", "-XX:ParallelGCThreads=2", "-jar", "BioSync-API.jar"]
