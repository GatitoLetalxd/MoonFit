# 🚀 Guía de Despliegue en Producción y Ahorro de Recursos: MoonFit

Esta guía describe el paso a paso para desplegar **MoonFit** en un servidor VPS económico (Ubuntu 22.04 / 24.04 LTS con 1 GB o 2 GB de RAM) manteniendo el consumo total de memoria por debajo de **350 MB de RAM**.

---

## 📋 1. Requisitos Previos del VPS

1. **VPS Recomendado:** Hetzner Cloud (CX22), DigitalOcean ($4 - $6/mes), AWS Lightsail o Linode.
2. **Sistema Operativo:** Ubuntu 22.04 LTS o 24.04 LTS.
3. **Dominio Apuntado:** Registro DNS tipo `A` apuntando a la IP del VPS (ej: `app.tudominio.com`).

---

## ⚡ 2. Preparación del Sistema y Memoria SWAP

Conéctate por SSH a tu servidor y ejecuta:

```bash
# 1. Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# 2. Crear archivo SWAP de 2GB (Evita caídas por falta de memoria)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 3. Instalar Node.js 20 LTS, PostgreSQL, Nginx y Git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs postgresql postgresql-contrib nginx certbot python3-certbot-nginx git

# 4. Instalar PM2 globalmente
sudo npm install -g pm2
```

---

## 🐘 3. Configuración y Afinación de PostgreSQL

### A. Crear la Base de Datos y Usuario
```bash
sudo -u postgres psql
```
Dentro de la consola SQL de PostgreSQL:
```sql
CREATE DATABASE moonfit_prod;
CREATE USER moonfit_user WITH ENCRYPTED PASSWORD 'TU_CONTRASEÑA_SUPER_SEGURA';
GRANT ALL PRIVILEGES ON DATABASE moonfit_prod TO moonfit_user;
ALTER DATABASE moonfit_prod OWNER TO moonfit_user;
\q
```

### B. Ajustar PostgreSQL para Bajo Consumo de RAM
Edita el archivo de configuración:
```bash
sudo nano /etc/postgresql/16/main/postgresql.conf
# (o la versión que esté instalada, ej: 14 o 15)
```
Modifica o añade estos valores optimizados:
```ini
shared_buffers = 128MB          # 25% de la RAM para 1GB o 256MB para 2GB
work_mem = 4MB                  # Mantiene bajo el uso por ordenamiento
effective_cache_size = 512MB
max_connections = 30            # Evita sobrecarga de pools
```
Reinicia PostgreSQL:
```bash
sudo systemctl restart postgresql
```

---

## 📦 4. Despliegue del Backend REST API

```bash
# 1. Clonar el repositorio en /var/www/
sudo mkdir -p /var/www/moonfit
sudo chown -R $USER:$USER /var/www/moonfit
cd /var/www/moonfit
git clone <URL_DE_TU_REPOSITORIO> .

# 2. Configurar variables del Backend
cd /var/www/moonfit/backend
cp .env.production.example .env
nano .env   # Coloca tu DATABASE_URL y genera tus secretos JWT

# 3. Instalar dependencias y compilar
npm ci
npx prisma db push
npx prisma db seed   # Opcional: inicializa rutinas y admin
npm run build

# 4. Iniciar con PM2 usando ecosystem optimizado
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🌐 5. Despliegue del Frontend Web (Vite + Nginx)

```bash
# 1. Configurar variables del Frontend
cd /var/www/moonfit/frontend
cp .env.production.example .env.production
# Asegúrate de que VITE_API_URL="/api" esté configurado

# 2. Instalar dependencias y generar build estático
npm ci
npm run build

# 3. Configurar Nginx
sudo cp /var/www/moonfit/frontend/nginx.conf /etc/nginx/sites-available/moonfit
sudo nano /etc/nginx/sites-available/moonfit   # Ajusta "server_name" con tu dominio real

# 4. Activar el sitio y verificar sintaxis
sudo ln -sf /etc/nginx/sites-available/moonfit /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 6. Obtener Certificados SSL Gratuitos (HTTPS)

```bash
sudo certbot --nginx -d app.tudominio.com
```
Certbot configurará automáticamente la renovación automática y el cifrado HTTPS.

---

## 📱 7. Publicación de la App Móvil (Android)

1. En tu máquina local, configura `mobile/.env`:
   ```env
   EXPO_PUBLIC_API_URL="https://app.tudominio.com/api"
   ```
2. Genera el APK o Android App Bundle para Google Play Store:
   ```bash
   cd mobile/android
   ./gradlew assembleRelease       # Genera APK en android/app/build/outputs/apk/release/
   ./gradlew bundleRelease         # Genera AAB para Play Console
   ```

---

## 💾 8. Script de Copia de Seguridad Automática (Cron diario)

Crea un script simple de backup:
```bash
sudo nano /usr/local/bin/backup-moonfit.sh
```
Pega el siguiente contenido:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/moonfit"
mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
pg_dump -U moonfit_user moonfit_prod | gzip > "$BACKUP_DIR/db_$TIMESTAMP.sql.gz"
# Mantener solo los últimos 7 días de backups
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +7 -delete
```
Hazlo ejecutable y añádelo a crontab:
```bash
sudo chmod +x /usr/local/bin/backup-moonfit.sh
(crontab -l 2>/dev/null; echo "0 3 * * * /usr/local/bin/backup-moonfit.sh") | crontab -
```
