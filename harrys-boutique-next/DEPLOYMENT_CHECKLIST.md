# ✅ Checklist de Despliegue - Harry's Boutique

Usa este checklist para asegurar un despliegue exitoso a producción.

---

## 📋 Pre-Despliegue

### Configuración de Servicios Externos

- [ ] **Vercel Blob Storage**
  - [ ] Crear Blob Store en Vercel Dashboard
  - [ ] Copiar `BLOB_READ_WRITE_TOKEN`
  - [ ] Verificar que funciona subiendo una imagen de prueba

- [ ] **MercadoPago**
  - [ ] Crear aplicación en [MercadoPago Developers](https://www.mercadopago.com/developers)
  - [ ] Obtener credenciales de **PRODUCCIÓN** (no test)
  - [ ] Copiar `MERCADOPAGO_ACCESS_TOKEN`
  - [ ] Copiar `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`
  - [ ] Configurar webhook URL: `https://tu-dominio.com/api/webhooks/mercadopago`
  - [ ] Copiar `MERCADOPAGO_WEBHOOK_SECRET`
  - [ ] Probar pago de prueba en modo producción

- [ ] **Resend (Emails)**
  - [ ] Crear cuenta en [Resend](https://resend.com)
  - [ ] Verificar dominio (agregar registros DNS)
  - [ ] Obtener `RESEND_API_KEY`
  - [ ] Configurar `RESEND_FROM_EMAIL` con dominio verificado
  - [ ] Enviar email de prueba

- [ ] **Base de Datos**
  - [ ] Crear base de datos PostgreSQL
    - Railway: Agregar desde dashboard
    - Supabase: Crear proyecto
    - VPS: Instalar PostgreSQL
  - [ ] Copiar `DATABASE_URL`
  - [ ] Verificar conexión

### Seguridad

- [ ] **Generar secretos únicos**
  ```bash
  # Generar NEXTAUTH_SECRET
  openssl rand -base64 32
  ```
  - [ ] Copiar y guardar en lugar seguro
  - [ ] NO usar el mismo secret que en desarrollo

- [ ] **Revisar variables de entorno**
  - [ ] Todas las URLs apuntan a producción (no localhost)
  - [ ] No hay credenciales de prueba
  - [ ] No hay valores por defecto o de ejemplo

- [ ] **Configurar CORS**
  - [ ] Verificar que `NEXTAUTH_URL` coincide con tu dominio
  - [ ] Verificar que `NEXT_PUBLIC_FRONTEND_URL` coincide con tu dominio

### Código

- [ ] **Tests**
  ```bash
  npm run test
  ```
  - [ ] Todos los tests pasan

- [ ] **Linter**
  ```bash
  npm run lint
  ```
  - [ ] Sin errores de lint

- [ ] **Type Check**
  ```bash
  npm run type-check
  ```
  - [ ] Sin errores de TypeScript

- [ ] **Build**
  ```bash
  npm run build
  ```
  - [ ] Build exitoso sin errores

- [ ] **Commit y Push**
  ```bash
  git add .
  git commit -m "chore: prepare for production deployment"
  git push origin main
  ```

---

## 🚀 Despliegue

### Opción A: Railway

- [ ] Crear cuenta en [Railway](https://railway.app)
- [ ] Conectar repositorio de GitHub
- [ ] Agregar servicio PostgreSQL
- [ ] Configurar variables de entorno (ver sección abajo)
- [ ] Esperar a que termine el despliegue (~3-5 min)
- [ ] Verificar que la app esté corriendo
- [ ] Configurar dominio personalizado (opcional)

### Opción B: Vercel + Supabase

- [ ] Crear base de datos en [Supabase](https://supabase.com)
- [ ] Copiar `DATABASE_URL`
- [ ] Crear proyecto en [Vercel](https://vercel.com)
- [ ] Conectar repositorio de GitHub
- [ ] Configurar variables de entorno
- [ ] Desplegar
- [ ] Configurar dominio personalizado (opcional)

### Opción C: VPS con Docker

- [ ] Conectar al servidor: `ssh user@server-ip`
- [ ] Instalar Docker y Docker Compose
- [ ] Clonar repositorio
- [ ] Configurar `.env` con variables de producción
- [ ] Ejecutar: `docker-compose up -d`
- [ ] Configurar Nginx como proxy reverso
- [ ] Configurar SSL con Let's Encrypt
- [ ] Configurar auto-deploy con GitHub Actions

### Variables de Entorno a Configurar

Copiar estas variables en tu plataforma de hosting:

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=<generado-con-openssl>
NEXTAUTH_URL=https://tu-dominio.com
BLOB_READ_WRITE_TOKEN=vercel_blob_...
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-...
MERCADOPAGO_WEBHOOK_SECRET=...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@tu-dominio.com
NEXT_PUBLIC_FRONTEND_URL=https://tu-dominio.com
NODE_ENV=production
```

---

## ✅ Post-Despliegue

### Verificación Básica

- [ ] **App accesible**
  - [ ] Abrir `https://tu-dominio.com`
  - [ ] La página carga correctamente
  - [ ] No hay errores en la consola del navegador

- [ ] **Health Check**
  - [ ] Abrir `https://tu-dominio.com/api/health`
  - [ ] Responde con status 200

- [ ] **Base de datos**
  - [ ] Las migraciones se aplicaron correctamente
  - [ ] Las tablas existen

### Verificación de Funcionalidades

- [ ] **Autenticación**
  - [ ] Registro de nuevo usuario funciona
  - [ ] Login funciona
  - [ ] Logout funciona
  - [ ] Sesión persiste al recargar

- [ ] **Productos**
  - [ ] Listado de productos carga
  - [ ] Detalle de producto funciona
  - [ ] Búsqueda funciona
  - [ ] Filtros funcionan

- [ ] **Carrito**
  - [ ] Agregar producto al carrito
  - [ ] Modificar cantidad
  - [ ] Eliminar producto
  - [ ] Carrito persiste

- [ ] **Checkout**
  - [ ] Proceso de checkout funciona
  - [ ] Integración con MercadoPago funciona
  - [ ] Pago de prueba exitoso
  - [ ] Webhook recibe notificaciones
  - [ ] Estado del pedido se actualiza

- [ ] **Admin Panel**
  - [ ] Login como admin funciona
  - [ ] Dashboard carga
  - [ ] CRUD de productos funciona
  - [ ] Upload de imágenes funciona
  - [ ] Gestión de pedidos funciona

- [ ] **Emails**
  - [ ] Email de confirmación de pedido se envía
  - [ ] Email de cambio de estado se envía
  - [ ] Emails llegan correctamente

### Configuración de Webhooks

- [ ] **MercadoPago Webhook**
  - [ ] URL configurada: `https://tu-dominio.com/api/webhooks/mercadopago`
  - [ ] Webhook recibe notificaciones
  - [ ] Pedidos se actualizan automáticamente
  - [ ] Probar con pago real de bajo monto

### Monitoreo

- [ ] **Logs**
  - [ ] Configurar acceso a logs
  - [ ] Verificar que no hay errores críticos
  - [ ] Configurar alertas (opcional)

- [ ] **Performance**
  - [ ] Tiempo de carga < 3 segundos
  - [ ] Imágenes se cargan correctamente
  - [ ] No hay memory leaks

- [ ] **Errores**
  - [ ] Configurar Sentry o similar (opcional)
  - [ ] Probar páginas de error (404, 500)

### Seguridad

- [ ] **SSL/HTTPS**
  - [ ] Certificado SSL válido
  - [ ] Redirección HTTP → HTTPS funciona
  - [ ] No hay warnings de seguridad

- [ ] **Headers de Seguridad**
  - [ ] CSP configurado
  - [ ] CORS configurado correctamente
  - [ ] Rate limiting activo

- [ ] **Credenciales**
  - [ ] Cambiar contraseña de admin por defecto
  - [ ] Verificar que no hay credenciales expuestas en el código
  - [ ] Guardar credenciales en gestor de contraseñas

### Backup

- [ ] **Configurar backups automáticos**
  - Railway: Automático
  - Supabase: Configurar en dashboard
  - VPS: Configurar cron job
  
- [ ] **Probar restauración**
  - [ ] Hacer backup manual
  - [ ] Restaurar en ambiente de prueba
  - [ ] Verificar integridad de datos

### Documentación

- [ ] **Actualizar README**
  - [ ] URL de producción
  - [ ] Credenciales de acceso (en lugar seguro)
  - [ ] Procedimientos de emergencia

- [ ] **Documentar configuración**
  - [ ] Variables de entorno usadas
  - [ ] Servicios externos configurados
  - [ ] Procedimientos de despliegue

---

## 🔄 Actualizaciones Futuras

### Proceso de Actualización

1. **Desarrollo Local**
   ```bash
   # Hacer cambios
   git checkout -b feature/nueva-funcionalidad
   # ... hacer cambios ...
   npm run test
   npm run lint
   npm run build
   ```

2. **Pull Request**
   ```bash
   git push origin feature/nueva-funcionalidad
   # Crear PR en GitHub
   # Esperar CI/CD
   # Revisar cambios
   ```

3. **Merge a Main**
   ```bash
   # Merge PR en GitHub
   # Railway/Vercel despliegan automáticamente
   ```

4. **Verificar Despliegue**
   - [ ] Verificar que el despliegue fue exitoso
   - [ ] Probar funcionalidad nueva
   - [ ] Verificar que no se rompió nada existente

### Rollback (si algo sale mal)

**Railway:**
```bash
railway rollback
```

**Vercel:**
```bash
# En dashboard, ir a Deployments
# Click en deployment anterior
# Click "Promote to Production"
```

**VPS:**
```bash
ssh user@server
cd /opt/harrys-boutique/harrys-boutique-next
git log --oneline  # Ver commits
git reset --hard <commit-anterior>
docker-compose up -d --build
```

---

## 🆘 Troubleshooting

### App no carga

1. Verificar logs
2. Verificar variables de entorno
3. Verificar que la base de datos está accesible
4. Reiniciar servicios

### Errores de base de datos

1. Verificar `DATABASE_URL`
2. Verificar que las migraciones se aplicaron
3. Verificar conexiones activas
4. Restaurar desde backup si es necesario

### Pagos no funcionan

1. Verificar credenciales de MercadoPago (producción, no test)
2. Verificar webhook URL
3. Verificar logs del webhook
4. Probar con pago de prueba

### Emails no se envían

1. Verificar `RESEND_API_KEY`
2. Verificar que el dominio está verificado
3. Verificar límites de envío (100/día en tier gratuito)
4. Verificar logs de Resend

---

## 📞 Contactos de Emergencia

- **Hosting:** [Soporte de Railway/Vercel/VPS]
- **Base de datos:** [Soporte de Railway/Supabase]
- **Pagos:** [Soporte de MercadoPago](https://www.mercadopago.com/ayuda)
- **Emails:** [Soporte de Resend](https://resend.com/support)

---

## 🎉 ¡Listo!

Si completaste todos los items del checklist, tu aplicación está lista para producción.

**Próximos pasos:**
- Monitorear logs regularmente
- Hacer backups periódicos
- Actualizar dependencias mensualmente
- Revisar métricas de uso
- Recopilar feedback de usuarios

---

**Fecha de despliegue:** _______________  
**Desplegado por:** _______________  
**Versión:** _______________  
**Notas adicionales:** _______________
