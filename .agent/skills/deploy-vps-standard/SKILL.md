---
name: deploy-vps-standard

description: Despliega aplicaciones web en VPS Hostinger con Docker y Nginx Proxy Manager. Automatiza Dockerfile, Compose y gestión de puertos evitando conflictos.
---
#Deploy VPS Standard

##Cuándo usar este skill

- Cuando el usuario pida "hacer deploy" de una app web.
- Cuando se necesite configurar Docker y Docker Compose en este VPS.
- Cuando el usuario mencione "Hostinger", "VPS" y "Nginx Proxy Manager".
- Para estandarizar los despliegues de Next.js u otras apps Node.js en este entorno.

##Inputs necesarios

-**Tecnología del proyecto**: (e.g., Next.js, React, Node.js) - _analizar package.json_

-**Base de datos**: (e.g., Postgres, Prisma) - _analizar schema.prisma_

-**Puerto destino**: Puerto libre para exponer la app (e.g., 3070).

##Workflow

1. **Análisis del Entorno**

   - Revisar `package.json` para scripts de build y start.
   - Revisar `prisma/schema.prisma` (si existe) para la capa de datos.
   - Detectar `docker-compose.yml` existente.
2. **Configuración de Docker**

   -**Dockerfile**: Crear `Dockerfile` multi-stage optimizado (usar `output: standalone` en Next.js).

   -_Importante_: Exponer el MISMO puerto interno que se usará externamente (e.g., `ENV PORT 3070`, `EXPOSE 3070`).

   -**Compose**: Crear o actualizar `docker-compose.yml`.

   - Servicio `web`: mapeo de puertos `PORT:PORT`.
   - Variables de entorno: `DATABASE_URL` (linkeado a servicio db).
   - Redes: asegurar conexión entre app y db.
3. **Gestión de Puertos**

   - Ejecutar `netstat -tuln` y `docker ps` para encontrar puertos ocupados.
   - Seleccionar un puerto libre (e.g., rango 3000-4000).

   -**Regla de Oro**: Usar el mismo puerto en:

   1. `Dockerfile` (ENV PORT)
   2. `docker-compose.yml` (ports: "3070:3070")
   3. Configuración de Nginx Proxy Manager.
4. **Despliegue**

   - Si usas Next.js, asegúrate de `output: 'standalone'` en `next.config.ts`.
   - Ejecutar: `docker compose up -d --build` (Preferir V2 `docker compose` si está disponible).
5. **Verificación**

   - Verificar estado: `docker ps`.
   - Prueba de conectividad: `curl -I http://localhost:PORT`.
   - Revisar logs si falla: `docker logs <container_name>`.
6. **Entrega**

   - Informar al usuario el PUERTO final.
   - Instrucciones para Nginx Proxy Manager:

     - Forward Hostname: `(IP VPS)` o `host.docker.internal`.
     - Forward Port: `PORT`.

##Instrucciones

-**Next.js**: Siempre verificar `next.config.ts` para habilitar `standalone`. Si falla el build por dependencias de sistema, usar `apk add --no-cache libc6-compat`.

-**Prisma**: Incluir `RUN npx prisma generate` en el Dockerfile antes del build.

-**Consistencia**: No mezclar puertos internos/externos (e.g., NO hacer 3070:3000). Mantener 3070:3070 para evitar confusión en Nginx.

##Output (formato exacto)

Al finalizar, generar un **Walkthrough** (`walkthrough.md`) con:

1. Archivos creados/modificados.
2. Puerto asignado.
3. Comandos de verificación ejecutados.
4. Guía rápida para configurar Nginx Proxy Manager con los datos concretos.
