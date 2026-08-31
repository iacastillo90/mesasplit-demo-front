# Dockerfile — build multi-stage: Gradle compile → JRE 21 runtime
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Resolver dependencias primero (caché de capa de Docker)
COPY build.gradle settings.gradle ./
COPY gradlew ./
COPY gradle ./gradle
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon

# Compilar
COPY src ./src
RUN ./gradlew bootJar -x test --no-daemon

# Runtime mínimo con usuario no-root
FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S labtab && adduser -S labtab -G labtab
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
RUN chown labtab:labtab app.jar
USER labtab

EXPOSE 8080
ENTRYPOINT ["java", "-XX:+UseZGC", "-XX:MaxRAMPercentage=70.0", "-jar", "app.jar"]
