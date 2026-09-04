# Infraestructura AWS — LabTab Backend

**Versión**: 1.0  
**Fase**: Venta — EC2 + Docker Compose (sin ECS, sin Kubernetes)  
**Región AWS**: `us-east-1` (ajustable — `sa-east-1` para menor latencia en Chile)

Este documento permite replicar el ambiente de producción desde cero en una
instancia EC2 limpia. Todos los archivos de configuración están en este documento
o referenciados desde él.

---

## 1. Topología AWS

```
                          ┌─────────────────────────────────────────┐
                          │           EC2 t3.medium / t4g.medium    │
                          │           Ubuntu 22.04 LTS (ARM si t4g) │
                          │                                         │
                          │  ┌──────────────────────────────────┐   │
Internet ──── HTTPS ────► │  │   labtab-nginx (nginx:alpine) │   │
             port 443     │  │   Reverse Proxy + SSL (Certbot)  │   │
                          │  └──────────────┬───────────────────┘   │
                          │                 │ proxy_pass :8080      │
                          │  ┌──────────────▼───────────────────┐   │
                          │  │   labtab-api (openjdk:21)     │   │
                          │  │   Spring Boot JAR — port 8080    │   │
                          │  │   Virtual Threads habilitados    │   │
                          │  └──────────────┬───────────────────┘   │
                          │                 │ JDBC :5432            │
                          │  ┌──────────────▼───────────────────┐   │
                          │  │   labtab-db (postgres:16)     │   │
                          │  │   Sin puertos expuestos al host  │   │
                          │  │   Volumen: /var/lib/postgresql   │   │
                          │  └──────────────────────────────────┘   │
                          │                                         │
                          │  Red interna Docker: labtab-network  │
                          └─────────────────────────────────────────┘
                                          │
                                          │ pg_dump cron → S3
                                  ┌───────▼───────┐
                                  │   AWS S3      │
                                  │   Backups DB  │
                                  └───────────────┘
```

### Instancia EC2 recomendada

| Atributo | Valor | Nota |
|:---|:---|:---|
| Tipo | `t3.medium` (x86) o `t4g.medium` (ARM) | `t4g` es ~20% más barato — Spring Boot 3.3 soporta ARM64 |
| RAM | 4 GB | Spring Boot en producción necesita ~512 MB; PostgreSQL ~512 MB; margen para picos |
| CPU | 2 vCPU | Suficiente para la fase de venta (1 restaurante, ~50 mesas concurrentes) |
| Storage | 20 GB SSD (gp3) | OS + Docker + datos de PostgreSQL |
| OS | Ubuntu 22.04 LTS | LTS hasta 2027 — base estable y bien documentada |
| Security Group | 80 (HTTP→redirect), 443 (HTTPS), 22 (SSH limitado a IP) | **No** exponer 8080 ni 5432 |

---

## 2. `docker-compose.yml` — Desarrollo Local

```yaml
# docker-compose.yml — ambiente de desarrollo (hot-reload, logs verbosos)
# Uso: docker compose up --build
# Variables: copiar .env.example → .env y completar los valores

version: '3.9'

services:

  # ─────────────────────────────────────────────────────────
  # Base de datos PostgreSQL 16 (Alpine)
  # ─────────────────────────────────────────────────────────
  labtab-db:
    image: postgres:16-alpine
    container_name: labtab-db-dev
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-labtab_dev}
      POSTGRES_USER: ${POSTGRES_USER:-labtab}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"          # Expuesto en dev para conectar con DBeaver/pgAdmin
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-labtab} -d ${POSTGRES_DB:-labtab_dev}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - labtab-network

  # ─────────────────────────────────────────────────────────
  # Spring Boot API (desarrollo — con restart automático)
  # ─────────────────────────────────────────────────────────
  labtab-api:
    build:
      context: .
      dockerfile: Dockerfile
      target: development    # Stage de desarrollo — no optimizado, más rápido de construir
    container_name: labtab-api-dev
    environment:
      SPRING_PROFILES_ACTIVE: dev
      SPRING_DATASOURCE_URL: jdbc:postgresql://labtab-db:5432/${POSTGRES_DB:-labtab_dev}
      SPRING_DATASOURCE_USERNAME: ${POSTGRES_USER:-labtab}
      SPRING_DATASOURCE_PASSWORD: ${POSTGRES_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "8080:8080"          # Expuesto en dev para Postman / Swagger UI
    depends_on:
      labtab-db:
        condition: service_healthy
    volumes:
      - ./target:/app/target  # Hot-reload del JAR si se usa spring-boot:run
    networks:
      - labtab-network

volumes:
  postgres_data:
    driver: local

networks:
  labtab-network:
    driver: bridge
```

---

## 3. `docker-compose.prod.yml` — Producción

```yaml
# docker-compose.prod.yml — producción en EC2
# Uso: docker compose -f docker-compose.prod.yml up -d
# IMPORTANTE: usar junto con .env (nunca hardcodear secrets)

version: '3.9'

services:

  # ─────────────────────────────────────────────────────────
  # PostgreSQL 16 — sin puertos expuestos al host en producción
  # ─────────────────────────────────────────────────────────
  labtab-db:
    image: postgres:16-alpine
    container_name: labtab-db-prod
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - labtab-network
    # SIN ports: — el puerto 5432 NO está expuesto al host en producción

  # ─────────────────────────────────────────────────────────
  # Spring Boot API
  # ─────────────────────────────────────────────────────────
  labtab-api:
    image: labtab-api:latest   # Imagen construida por CI/CD o localmente
    container_name: labtab-api-prod
    restart: unless-stopped
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SPRING_DATASOURCE_URL: jdbc:postgresql://labtab-db:5432/${POSTGRES_DB}
      SPRING_DATASOURCE_USERNAME: ${POSTGRES_USER}
      SPRING_DATASOURCE_PASSWORD: ${POSTGRES_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      labtab-db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s   # Spring Boot necesita ~30s para arrancar con Flyway
    networks:
      - labtab-network
    # SIN ports: — solo accesible desde nginx en la red interna

  # ─────────────────────────────────────────────────────────
  # Nginx — reverse proxy + SSL termination
  # ─────────────────────────────────────────────────────────
  labtab-nginx:
    image: nginx:alpine
    container_name: labtab-nginx-prod
    restart: unless-stopped
    ports:
      - "80:80"     # Redirige a 443
      - "443:443"   # HTTPS con certificado Let's Encrypt
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - certbot_certs:/etc/letsencrypt:ro
      - certbot_webroot:/var/www/certbot:ro
    depends_on:
      labtab-api:
        condition: service_healthy
    networks:
      - labtab-network

  # ─────────────────────────────────────────────────────────
  # Certbot — renovación automática de SSL
  # ─────────────────────────────────────────────────────────
  certbot:
    image: certbot/certbot:latest
    container_name: labtab-certbot
    volumes:
      - certbot_certs:/etc/letsencrypt
      - certbot_webroot:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

volumes:
  postgres_data:
    driver: local
  certbot_certs:
    driver: local
  certbot_webroot:
    driver: local

networks:
  labtab-network:
    driver: bridge
```

---

## 4. `Dockerfile` — Multi-Stage Build

```dockerfile
# Dockerfile — build multi-stage: Gradle compile → JRE 21 Alpine runtime
# Stage 'development': para docker-compose.yml local (sin optimizaciones)
# Stage 'production': para docker-compose.prod.yml (imagen mínima)

# ─────────────────────────────────────────────────────────
# STAGE 1: BUILD — Gradle + JDK 21 compila el JAR
# ─────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copiar los archivos de build primero — si el código cambia pero las deps no,
# Docker reutiliza la capa de resolución de dependencias (caché)
COPY build.gradle settings.gradle ./
COPY gradlew ./
COPY gradle ./gradle
RUN ./gradlew dependencies --no-daemon

# Copiar el código fuente y compilar
COPY src ./src
RUN ./gradlew bootJar -x test --no-daemon

# ─────────────────────────────────────────────────────────
# STAGE 2: DEVELOPMENT — JAR sin optimizar, con herramientas de debug
# ─────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS development

WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", \
    "-Xms256m", "-Xmx512m", \
    "-jar", "app.jar"]

# ─────────────────────────────────────────────────────────
# STAGE 3: PRODUCTION — imagen mínima con JRE Alpine
# ─────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS production

# Crear usuario no-root para seguridad
RUN addgroup -S labtab && adduser -S labtab -G labtab

WORKDIR /app

# Copiar solo el JAR del stage de build
COPY --from=builder /app/build/libs/*.jar app.jar

# Cambiar propietario al usuario no-root
RUN chown labtab:labtab app.jar
USER labtab

EXPOSE 8080

# JVM flags para producción:
# -XX:+UseVirtualThreads — habilita Project Loom en JVM
# -XX:MaxRAMPercentage=70 — usa hasta el 70% de la RAM del contenedor
# -XX:+OptimizeStringConcat — optimización menor de strings
ENTRYPOINT ["java", \
    "-XX:+UseVirtualThreads", \
    "-XX:MaxRAMPercentage=70.0", \
    "-XX:+OptimizeStringConcat", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]
```

---

## 5. Configuración Nginx

```nginx
# nginx/conf.d/labtab-api.conf

# Redirige todo el tráfico HTTP a HTTPS
server {
    listen 80;
    server_name api.labtab.cl;

    # Certbot challenge — renovación automática de SSL
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Todo lo demás redirige a HTTPS (301 permanente)
    location / {
        return 301 https://$host$request_uri;
    }
}

# Servidor HTTPS
server {
    listen 443 ssl http2;
    server_name api.labtab.cl;

    # Certificados Let's Encrypt (gestionados por Certbot)
    ssl_certificate /etc/letsencrypt/live/api.labtab.cl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.labtab.cl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Headers de seguridad
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Timeout para WebSocket (STOMP necesita conexiones de larga duración)
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;

    # Endpoint REST — proxy al Spring Boot
    location /api/ {
        proxy_pass http://labtab-api:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket / STOMP — upgrade de protocolo
    location /ws {
        proxy_pass http://labtab-api:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    # Actuator health — solo accesible internamente por el LB o monitoring
    location /actuator/health {
        proxy_pass http://labtab-api:8080;
        allow 10.0.0.0/8;    # Solo red interna de VPC
        deny all;
    }
}
```

---

## 6. `.env.example` — Variables de Entorno

```bash
# .env.example — copiar a .env y completar los valores
# NUNCA commitear el archivo .env (está en .gitignore)

# ─────────────────────────────────────────
# PostgreSQL
# ─────────────────────────────────────────
POSTGRES_DB=labtab_prod
POSTGRES_USER=labtab
POSTGRES_PASSWORD=CAMBIAR_POR_PASSWORD_SEGURO_min32chars

# ─────────────────────────────────────────
# JWT
# ─────────────────────────────────────────
# Generar con: openssl rand -base64 32
JWT_SECRET=CAMBIAR_POR_STRING_RANDOM_BASE64_minimo_256_bits

# ─────────────────────────────────────────
# Transbank / Webpay (Sandbox en dev, Producción en prod)
# ─────────────────────────────────────────
TRANSBANK_COMMERCE_CODE=597055555532
TRANSBANK_API_KEY=CAMBIAR_POR_API_KEY_TRANSBANK
TRANSBANK_ENV=sandbox   # sandbox | production

# ─────────────────────────────────────────
# MercadoPago
# ─────────────────────────────────────────
MERCADOPAGO_ACCESS_TOKEN=CAMBIAR_POR_ACCESS_TOKEN_MP

# ─────────────────────────────────────────
# SII Chile (modo contingencia en dev)
# ─────────────────────────────────────────
SII_ENV=certification   # certification | production
SII_RUT_EMISOR=76000000-0
SII_CERT_PASSWORD=CAMBIAR_POR_PASSWORD_CERTIFICADO_DIGITAL

# ─────────────────────────────────────────
# AWS (para backups de DB a S3)
# ─────────────────────────────────────────
AWS_ACCESS_KEY_ID=CAMBIAR
AWS_SECRET_ACCESS_KEY=CAMBIAR
AWS_REGION=us-east-1
S3_BACKUP_BUCKET=labtab-db-backups-prod
```

---

## 7. Estrategia de Backups PostgreSQL

```bash
#!/bin/bash
# /opt/labtab/scripts/backup-db.sh
# Cron job: 0 2 * * * /opt/labtab/scripts/backup-db.sh
# Ejecuta pg_dump dentro del contenedor y sube el resultado a S3.

set -euo pipefail

# Fecha y nombre del backup
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="labtab_backup_${BACKUP_DATE}.sql.gz"
BACKUP_PATH="/tmp/${BACKUP_FILE}"

echo "[$(date)] Iniciando backup de PostgreSQL..."

# pg_dump dentro del contenedor de la DB, comprimido con gzip
docker exec labtab-db-prod pg_dump \
    -U "${POSTGRES_USER}" \
    -d "${POSTGRES_DB}" \
    --clean \
    --if-exists \
    | gzip > "${BACKUP_PATH}"

echo "[$(date)] Backup comprimido: ${BACKUP_PATH}"

# Subir a S3 con aws CLI
aws s3 cp "${BACKUP_PATH}" \
    "s3://${S3_BACKUP_BUCKET}/daily/${BACKUP_FILE}" \
    --storage-class STANDARD_IA

echo "[$(date)] Backup subido a S3: s3://${S3_BACKUP_BUCKET}/daily/${BACKUP_FILE}"

# Eliminar el archivo local (no acumular en /tmp)
rm -f "${BACKUP_PATH}"

# Limpiar backups S3 con más de 30 días (política de retención)
aws s3 ls "s3://${S3_BACKUP_BUCKET}/daily/" \
    | awk '{print $4}' \
    | while read -r file; do
        backup_date=$(echo "$file" | grep -oP '\d{8}' | head -1)
        if [[ -n "$backup_date" ]]; then
            days_old=$(( ($(date +%s) - $(date -d "$backup_date" +%s)) / 86400 ))
            if [[ $days_old -gt 30 ]]; then
                aws s3 rm "s3://${S3_BACKUP_BUCKET}/daily/${file}"
                echo "[$(date)] Backup eliminado (>30 días): ${file}"
            fi
        fi
    done

echo "[$(date)] Backup completado exitosamente."
```

---

## 8. Flyway — Ejecución de Migraciones al Arrancar

Flyway corre automáticamente al arrancar el contenedor de la API antes de que Spring
Boot acepte requests. No se requiere intervención manual.

```
[labtab-api-prod arranca]
    │
    ▼
Spring Boot detecta Flyway en classpath
    │
    ▼
Flyway conecta a PostgreSQL (labtab-db:5432)
    │
    ▼
Flyway revisa flyway_schema_history (tabla interna)
    │
    ├── Si es primera vez → aplica V1 a V12 en orden
    │
    └── Si hay migraciones nuevas → aplica solo las pendientes
    │
    ▼
Spring Boot levanta contexto y acepta requests en :8080
```

```yaml
# Configuración Flyway en application.yml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: false     # NUNCA en producción sin coordinación
    validate-on-migrate: true      # Falla si una migración ya aplicada fue modificada
    out-of-order: false            # Las migraciones deben aplicarse en orden estricto
```

> **Regla crítica**: Si una migración ya fue aplicada en producción y se modifica su
> contenido, Flyway falla con `FlywayException: Checksum mismatch`. Esta es la
> protección correcta — las migraciones son inmutables. Para corregir un error en
> producción, crear una nueva migración (`V14__fix_...`), nunca editar la anterior.

---

## 9. Monitoreo Mínimo — Spring Boot Actuator

```yaml
# Endpoints habilitados (solo /health en producción)
management:
  endpoints:
    web:
      exposure:
        include: health, info    # Agregar 'metrics' si se conecta Prometheus
  endpoint:
    health:
      show-details: never        # No exponer detalles de DB en producción
  info:
    env:
      enabled: false             # No exponer variables de entorno en /actuator/info
```

```bash
# Health check desde la terminal — verifica que la API y la DB estén UP
curl https://api.labtab.cl/actuator/health
# Respuesta esperada:
# { "status": "UP" }
```

### Alertas recomendadas para la fase de venta

| Condición | Acción |
|:---|:---|
| `status != "UP"` en `/actuator/health` | Alerta inmediata — API caída |
| Contenedor `labtab-api` en estado `unhealthy` | Docker reinicia automáticamente (`restart: unless-stopped`) |
| Espacio en disco EC2 > 80% | Limpiar logs Docker: `docker system prune -f` |
| Backup S3 no recibido en 24h | Revilar cron job en EC2 |

---

## 10. Comandos Operativos de Referencia

```bash
# ─── DEPLOY INICIAL ──────────────────────────────────────────────
# 1. Conectar a EC2
ssh -i labtab-key.pem ubuntu@<ec2-public-ip>

# 2. Instalar Docker y Docker Compose
curl -fsSL https://get.docker.com | bash
sudo usermod -aG docker ubuntu

# 3. Clonar repositorio y configurar entorno
git clone https://github.com/labtab/backend.git
cd backend
cp .env.example .env
# Editar .env con los valores reales

# 4. Primer deploy
docker compose -f docker-compose.prod.yml up -d --build

# 5. Obtener certificado SSL (primera vez)
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot --webroot-path=/var/www/certbot \
    -d api.labtab.cl \
    --email team@labtab.cl \
    --agree-tos --no-eff-email

# ─── ACTUALIZAR LA API ────────────────────────────────────────────
# Build de nueva imagen
docker build -t labtab-api:latest --target production .
# Reiniciar solo el contenedor de la API (zero-downtime no garantizado en esta fase)
docker compose -f docker-compose.prod.yml up -d --no-deps labtab-api

# ─── VER LOGS ─────────────────────────────────────────────────────
docker logs labtab-api-prod --tail 100 -f
docker logs labtab-db-prod --tail 50

# ─── BACKUP MANUAL ────────────────────────────────────────────────
/opt/labtab/scripts/backup-db.sh

# ─── RESTAURAR BACKUP ─────────────────────────────────────────────
# Solo en caso de emergencia — requiere detener la API primero
docker exec labtab-db-prod psql -U labtab -d labtab_prod \
    -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
aws s3 cp s3://${S3_BACKUP_BUCKET}/daily/<archivo>.sql.gz - | gunzip | \
    docker exec -i labtab-db-prod psql -U labtab -d labtab_prod
```
