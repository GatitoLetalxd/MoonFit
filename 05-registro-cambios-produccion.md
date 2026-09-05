# 🛡️ Registro de Auditoría y Control de Cambios en Producción: MoonFit

> **ESTADO DEL SISTEMA:** PRODUCCIÓN ACTIVA  
> **URL Base API Producción:** `https://moonfit.moondev.online/api`  
> **Servidor:** VPS Ubuntu (PM2 + Nginx + PostgreSQL)  
> **Línea Base Inicial:** Commit `7ba93e4` (v1.0.0)  
> **Fecha de Entrada en Producción:** 2026-09-04  

Este documento es de **actualización obligatoria** ante cualquier modificación, corrección, migración de base de datos o nueva funcionalidad en el **Backend** o **Base de Datos** de MoonFit.

---

## 📜 1. Protocolo de Auditoría y Buenas Prácticas

Cada cambio debe seguir este ciclo de vida:

1. **Evaluación de Compatibilidad (Retrocompatibilidad):**
   - El APK móvil en manos de los usuarios consume endpoints existentes. **No se deben eliminar ni renombrar campos o endpoints** sin un ciclo de deprecación coordinado.
   - Nuevos campos en Prisma deben ser opcionales (`?`) o tener valores `@default(...)` para no romper registros existentes.

2. **Registro en este Documento:**
   - Antes o inmediatamente después de desarrollar un cambio, documentarlo en la sección **Historial de Cambios**.
   - Asignar ID de cambio correlativo (`PRD-001`, `PRD-002`, etc.).

3. **Verificación de Tipos y Compilación Local:**
   ```bash
   cd backend
   npx tsc --noEmit
   ```

4. **Procedimiento Estándar de Despliegue en VPS:**
   ```bash
   cd /var/www/moonfit/backend
   git pull origin main
   # Si hay cambios en schema.prisma:
   npx prisma db push
   # Si hay nuevas dependencias:
   npm ci
   # Recompilar:
   npm run build
   # Recarga sin caída de servicio (Zero-downtime reload):
   pm2 reload moonfit-api
   ```

5. **Plan de Rollback Inmediato:**
   - Todo cambio debe documentar cómo revertirse si surge un fallo inesperado en producción (`git revert`, `pm2 reload`, restauración de backup SQL).

---

## 🚦 2. Clasificación de Impacto

| Nivel | Tipo | Riesgo | Acción Requerida |
|-------|------|--------|------------------|
| 🔴 **ALTO** | Cambio en Prisma Schema / Migración BD | Riesgo de pérdida o bloqueo de datos | Backup previo con `pg_dump`, test local exhaustivo. |
| 🟠 **MEDIO** | Modificación en endpoints existentes / Auth | Riesgo de romper el APK en uso | Validar retrocompatibilidad con la versión actual de la app móvil. |
| 🟡 **BAJO** | Nuevos endpoints aditivos / Optimizaciones internas | Bajo riesgo | Validación con `tsc --noEmit` y pruebas de ruta. |
| 🟢 **MÍNIMO** | Logs, comentarios, configs no críticas | Mínimo | Registro y reload de PM2. |

---

## 📋 3. Historial de Auditoría de Cambios

### [PRD-000] Línea Base Inicial — Despliegue v1.0.0
- **Fecha:** 2026-09-04
- **Commit:** `7ba93e4`
- **Autor / Ejecutor:** MoonFit Dev Team
- **Impacto:** 🔴 ALTO (Lanzamiento inicial en producción)
- **Componentes Afectados:**
  - Servidor Express en `0.0.0.0` (reverse proxy Nginx listo).
  - PostgreSQL `moonfit_prod` con todas las tablas principales.
  - Campos `expo_push_token` y `motivation_tone` integrados en modelo `User`.
  - Módulo completo de notificaciones push `/api/notifications`.
  - Autenticación JWT, Rutinas, Nutrición, Progreso, Metas, Recordatorios, Panel Admin.
- **Estado en Producción:** ✅ **Activo y Desplegado**
- **Verificación:** Health check operativo en `https://moonfit.moondev.online/api/health`.

---

<!-- PLANTILLA PARA NUEVOS REGISTROS (Copiar y pegar arriba para orden cronológico descendente):

### [PRD-XXX] Título del Cambio
- **Fecha:** AAAA-MM-DD
- **Commit:** `hash`
- **Autor:** Nombre / Agente
- **Impacto:** [🔴 ALTO | 🟠 MEDIO | 🟡 BAJO | 🟢 MÍNIMO]
- **Descripción del Cambio:**
  - Explicar qué se hizo y por qué.
- **Componentes / Archivos Afectados:**
  - `backend/src/...`
  - `backend/prisma/schema.prisma` (si aplica)
- **Impacto en Base de Datos / Migración:**
  - [ ] Requiere `npx prisma db push`
  - [ ] Requiere backup previo de PostgreSQL
  - [ ] Sin impacto en base de datos
- **Impacto en Clientes Móviles / Web:**
  - ¿Afecta la versión del APK ya distribuida? (Sí / No / Solo agrega funcionalidad)
- **Instrucciones de Despliegue en VPS:**
  ```bash
  cd /var/www/moonfit/backend
  git pull origin main
  # Comandos adicionales necesarios
  npm run build
  pm2 reload moonfit-api
  ```
- **Plan de Rollback:**
  - Explicar cómo volver atrás en caso de falla.
- **Estado en Producción:** [🟡 Pendiente | 🚀 Desplegado | ⚠️ En Observación | ❌ Revertido]

-->
