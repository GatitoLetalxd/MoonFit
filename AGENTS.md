# 🛡️ MoonFit Agent & Developer Directives

## ⚠️ ESTADO DEL SISTEMA: PRODUCCIÓN ACTIVA
- **URL Base API Producción:** `https://moonfit.moondev.online/api`
- **Servidor:** VPS Ubuntu (PM2 + Nginx + PostgreSQL)
- **Registro de Auditoría Obligatorio:** [05-registro-cambios-produccion.md](file:///d:/Programacion%20y%20Proyectos/MoonFit/05-registro-cambios-produccion.md)

---

## 📋 Reglas de Desarrollo y Control de Cambios

1. **Retrocompatibilidad Estricta:**
   - La aplicación móvil (APK) compilada e instalada por los usuarios se comunica con la API de producción.
   - **PROHIBIDO** romper endpoints existentes, alterar contratos de respuesta JSON o eliminar rutas activas sin una estrategia de versionado y deprecación.
   - Todo cambio en `backend/prisma/schema.prisma` debe ser aditivo (campos opcionales `?` o con `@default(...)`) para no romper registros existentes en la base de datos PostgreSQL de producción.

2. **Auditoría Obligatoria de Cambios:**
   - Cualquier modificación en `backend/` (código fuente, dependencias, variables de entorno, modelos de datos) debe ser registrada en [05-registro-cambios-produccion.md](file:///d:/Programacion%20y%20Proyectos/MoonFit/05-registro-cambios-produccion.md) asignando un correlativo `PRD-XXX`.
   - El registro debe detallar: motivo, archivos modificados, impacto en la base de datos, impacto en el cliente móvil, comandos de despliegue en VPS y plan de rollback.

3. **Verificación de Tipos:**
   - Antes de dar por finalizado un cambio en el backend o frontend, ejecutar `npx tsc --noEmit` para garantizar compilación con cero errores de TypeScript.
