# 📚 Índice de Documentación - Harry's Boutique

Guía rápida para encontrar la información que necesitas.

---

## 🚀 Inicio Rápido

### ¿Primera vez aquí?

1. **[LEEME.md](./LEEME.md)** ⭐ **EMPIEZA AQUÍ**
   - Resumen completo en español
   - Opciones de despliegue
   - Comandos básicos
   - **Tiempo de lectura:** 5 minutos

2. **[RESUMEN_DESPLIEGUE.md](./RESUMEN_DESPLIEGUE.md)**
   - Lista de todos los archivos creados
   - Por dónde empezar
   - Checklist rápido
   - **Tiempo de lectura:** 3 minutos

---

## 📖 Documentación Principal

### Guías de Despliegue

| Archivo | Descripción | Cuándo Leerlo |
|---------|-------------|---------------|
| **[QUICK_START.md](./QUICK_START.md)** | Comparación de opciones de despliegue | Cuando no sabes qué opción elegir |
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | Guía completa paso a paso | Cuando estés listo para desplegar |
| **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** | Checklist detallado | Antes y después de desplegar |

### Referencia Técnica

| Archivo | Descripción | Cuándo Leerlo |
|---------|-------------|---------------|
| **[COMMANDS.md](./COMMANDS.md)** | Comandos útiles de Docker, NPM, Git | Cuando necesites un comando específico |
| **[README.md](./README.md)** | Documentación general del proyecto | Para entender la estructura del proyecto |

### Variables de Entorno

| Archivo | Descripción | Cuándo Usarlo |
|---------|-------------|---------------|
| **[.env.example](./.env.example)** | Template para desarrollo | Desarrollo local |
| **[.env.production.example](./.env.production.example)** | Template para producción | Despliegue a producción |

---

## 🎯 Buscar por Objetivo

### "Quiero desplegar mi aplicación"

1. Lee [LEEME.md](./LEEME.md) para entender las opciones
2. Lee [QUICK_START.md](./QUICK_START.md) para comparar
3. Elige tu opción y sigue [DEPLOYMENT.md](./DEPLOYMENT.md)
4. Usa [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) para verificar

### "Quiero probar localmente"

1. Ejecuta `verify-setup.bat` (Windows) o `./verify-setup.sh` (Mac/Linux)
2. Ejecuta `start-local.bat` (Windows) o `./start-local.sh` (Mac/Linux)
3. O sigue la sección "Desarrollo Local" en [LEEME.md](./LEEME.md)

### "Necesito un comando específico"

1. Busca en [COMMANDS.md](./COMMANDS.md)
2. Secciones disponibles:
   - Docker
   - Base de datos (Prisma + PostgreSQL)
   - NPM
   - Despliegue
   - Debugging
   - Monitoreo
   - Seguridad
   - Mantenimiento

### "Tengo un problema"

1. Revisa la sección "Troubleshooting" en [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Revisa "Problemas Comunes" en [LEEME.md](./LEEME.md)
3. Revisa "Comandos de Emergencia" en [COMMANDS.md](./COMMANDS.md)
4. Ejecuta `verify-setup.bat` o `./verify-setup.sh` para diagnosticar

### "Quiero entender el proyecto"

1. Lee [README.md](./README.md) para la estructura general
2. Revisa el stack tecnológico
3. Explora la estructura de carpetas

---

## 📋 Documentación por Plataforma

### Railway

- **Guía:** [DEPLOYMENT.md](./DEPLOYMENT.md) → Sección "Despliegue en Railway"
- **Ventajas:** Más fácil, PostgreSQL incluido
- **Tiempo:** 5 minutos
- **Costo:** $10-20/mes

### Vercel + Supabase

- **Guía:** [DEPLOYMENT.md](./DEPLOYMENT.md) → Sección "Despliegue en Vercel + Supabase"
- **Ventajas:** Más rápido, tier gratuito
- **Tiempo:** 5 minutos
- **Costo:** Gratis hasta cierto límite

### VPS (DigitalOcean, AWS, etc.)

- **Guía:** [DEPLOYMENT.md](./DEPLOYMENT.md) → Sección "Despliegue en VPS"
- **Ventajas:** Control total, bajo costo
- **Tiempo:** 30-60 minutos
- **Costo:** $5-10/mes

### Desarrollo Local

- **Guía:** [LEEME.md](./LEEME.md) → Sección "Desarrollo Local"
- **Scripts:** `start-local.bat` o `start-local.sh`
- **Tiempo:** 2 minutos
- **Costo:** Gratis

---

## 🛠️ Scripts Disponibles

### Windows

| Script | Descripción | Uso |
|--------|-------------|-----|
| `start-local.bat` | Inicia servicios localmente | Doble click o `start-local.bat` |
| `verify-setup.bat` | Verifica configuración | Doble click o `verify-setup.bat` |

### Mac/Linux

| Script | Descripción | Uso |
|--------|-------------|-----|
| `start-local.sh` | Inicia servicios localmente | `./start-local.sh` |
| `verify-setup.sh` | Verifica configuración | `./verify-setup.sh` |

**Nota:** Primero haz los scripts ejecutables:
```bash
chmod +x start-local.sh verify-setup.sh
```

---

## 🐳 Archivos Docker

| Archivo | Descripción | Cuándo Modificarlo |
|---------|-------------|-------------------|
| `Dockerfile` | Imagen Docker de la app | Cambios en el proceso de build |
| `docker-compose.yml` | Configuración de servicios | Cambios en servicios o puertos |
| `.dockerignore` | Archivos a excluir del build | Optimización del build |

---

## 🔄 CI/CD (GitHub Actions)

| Archivo | Descripción | Se Ejecuta |
|---------|-------------|------------|
| `.github/workflows/ci.yml` | Tests automáticos | En cada push/PR |
| `.github/workflows/deploy.yml` | Despliegue a VPS | En push a main |

**Configuración necesaria:**
- Ver [DEPLOYMENT.md](./DEPLOYMENT.md) → Sección "CI/CD con GitHub Actions"

---

## 📊 Comparación Rápida

### Por Facilidad

1. 🥇 Railway (⭐⭐⭐⭐⭐)
2. 🥈 Vercel + Supabase (⭐⭐⭐⭐)
3. 🥉 VPS con Docker (⭐⭐)

### Por Costo

1. 🥇 VPS ($5-10/mes)
2. 🥈 Railway ($10-20/mes)
3. 🥉 Vercel + Supabase (Gratis-$20/mes)

### Por Velocidad de Despliegue

1. 🥇 Vercel (1-2 minutos)
2. 🥈 Railway (2-3 minutos)
3. 🥉 VPS (30-60 minutos inicial)

Ver [QUICK_START.md](./QUICK_START.md) para comparación detallada.

---

## 🔍 Buscar por Palabra Clave

### Docker
- [LEEME.md](./LEEME.md) → Sección "Comandos Docker Útiles"
- [COMMANDS.md](./COMMANDS.md) → Sección "Docker"
- [DEPLOYMENT.md](./DEPLOYMENT.md) → Sección "Desarrollo Local con Docker"

### Base de Datos
- [COMMANDS.md](./COMMANDS.md) → Sección "Base de Datos"
- [DEPLOYMENT.md](./DEPLOYMENT.md) → Sección "Troubleshooting"

### Variables de Entorno
- [.env.example](./.env.example) → Desarrollo
- [.env.production.example](./.env.production.example) → Producción
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) → Sección "Variables de Entorno"

### Prisma
- [COMMANDS.md](./COMMANDS.md) → Sección "Base de Datos" → "Prisma"
- [README.md](./README.md) → Sección "Scripts Disponibles"

### MercadoPago
- [.env.example](./.env.example) → Configuración
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) → Sección "MercadoPago"

### Vercel Blob
- [.env.example](./.env.example) → Configuración
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) → Sección "Vercel Blob Storage"

### Resend (Emails)
- [.env.example](./.env.example) → Configuración
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) → Sección "Resend"

### Troubleshooting
- [DEPLOYMENT.md](./DEPLOYMENT.md) → Sección "Troubleshooting"
- [LEEME.md](./LEEME.md) → Sección "Problemas Comunes"
- [COMMANDS.md](./COMMANDS.md) → Sección "Comandos de Emergencia"

### CI/CD
- [DEPLOYMENT.md](./DEPLOYMENT.md) → Sección "CI/CD con GitHub Actions"
- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`

---

## 📱 Acceso Rápido por Dispositivo

### Desde Windows

1. Ejecuta `verify-setup.bat` para verificar
2. Ejecuta `start-local.bat` para iniciar
3. Lee [LEEME.md](./LEEME.md) para guía completa

### Desde Mac/Linux

1. Ejecuta `./verify-setup.sh` para verificar
2. Ejecuta `./start-local.sh` para iniciar
3. Lee [LEEME.md](./LEEME.md) para guía completa

### Desde Terminal

```bash
# Ver este índice
cat INDICE_DOCUMENTACION.md

# Ver resumen
cat LEEME.md

# Ver comandos
cat COMMANDS.md

# Verificar setup
./verify-setup.sh  # Mac/Linux
verify-setup.bat   # Windows

# Iniciar servicios
docker-compose up -d
```

---

## 🎓 Ruta de Aprendizaje

### Nivel 1: Principiante (Primera vez con Docker/Despliegue)

1. Lee [LEEME.md](./LEEME.md) completo
2. Ejecuta `verify-setup` para verificar tu sistema
3. Ejecuta `start-local` para probar localmente
4. Lee [QUICK_START.md](./QUICK_START.md) para elegir plataforma
5. Sigue [DEPLOYMENT.md](./DEPLOYMENT.md) paso a paso

### Nivel 2: Intermedio (Ya usaste Docker antes)

1. Lee [QUICK_START.md](./QUICK_START.md) para comparar opciones
2. Ejecuta `docker-compose up -d` directamente
3. Sigue [DEPLOYMENT.md](./DEPLOYMENT.md) para tu plataforma elegida
4. Usa [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) para verificar

### Nivel 3: Avanzado (Experiencia con despliegues)

1. Revisa `Dockerfile` y `docker-compose.yml`
2. Configura `.env` con tus credenciales
3. Ejecuta `docker-compose up -d --build`
4. Configura CI/CD en `.github/workflows/`
5. Usa [COMMANDS.md](./COMMANDS.md) como referencia

---

## 🆘 Ayuda Rápida

### "No sé por dónde empezar"
→ Lee [LEEME.md](./LEEME.md)

### "Quiero comparar opciones"
→ Lee [QUICK_START.md](./QUICK_START.md)

### "Estoy listo para desplegar"
→ Lee [DEPLOYMENT.md](./DEPLOYMENT.md)

### "Necesito un comando"
→ Lee [COMMANDS.md](./COMMANDS.md)

### "Tengo un error"
→ Sección "Troubleshooting" en [DEPLOYMENT.md](./DEPLOYMENT.md)

### "Quiero verificar mi configuración"
→ Ejecuta `verify-setup.bat` o `./verify-setup.sh`

---

## 📞 Soporte

Si después de revisar la documentación aún tienes problemas:

1. Ejecuta el script de verificación
2. Revisa los logs: `docker-compose logs -f app`
3. Verifica las variables de entorno en `.env`
4. Busca el error específico en la documentación

---

## 🔄 Mantener Actualizado

Este índice se actualiza cuando se agregan nuevos archivos de documentación.

**Última actualización:** Configuración inicial de despliegue

---

## 📝 Contribuir a la Documentación

Si encuentras algo que falta o puede mejorarse:

1. Edita el archivo correspondiente
2. Actualiza este índice si es necesario
3. Commit y push

---

**¡Éxito con tu proyecto!** 🚀
