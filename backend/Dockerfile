FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
# Cache dependencies first
COPY pom.xml .
RUN mvn dependency:go-offline -q
# Build
COPY src ./src
RUN mvn clean package -DskipTests -q

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/golf-charity-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Xmx400m", "-jar", "app.jar"]
