# 🚀 Acción Inmediata: Configurar Checkout y Pagos

## ⚡ Lo que necesitas hacer AHORA

### 1. Configurar MercadoPago (15 minutos)

#### Paso 1: Obtener Credenciales
1. Ve a: https://www.mercadopago.com.ar/developers
2. Crea una cuenta o inicia sesión
3. Crea una aplicación
4. Copia las credenciales de **TEST** (para probar)

#### Paso 2: Agregar a .env
Abre `harrys-boutique-next/.env` y agrega:

```env
# MercadoPago - CREDENCIALES DE PRUEBA
MERCADOPAGO_ACCESS_TOKEN="TEST-1234567890-123456-abcdef1234567890abcdef1234567890-123456789"
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="TEST-abcdef12-3456-7890-abcd-ef1234567890"
MERCADOPAGO_WEBHOOK_SECRET="tu-webhook-secret"
```

#### Paso 3: Probar
1. Reinicia el servidor: `npm run dev`
2. Ve a: http://localhost:3000/checkout
3. Agrega productos al carrito
4. Selecciona "MercadoPago"
5. Usa tarjeta de prueba:
   - **Número**: 4509 9535 6623 3704
   - **CVV**: 123
   - **Fecha**: 11/25
   - **Nombre**: APRO (para aprobar)

---

## 📧 Configurar Emails (10 minutos)

### Ya está casi listo, solo falta:

1. Verificar que tienes `RESEND_API_KEY` en `.env`
2. Los templates ya están creados en `src/lib/email-templates.ts`
3. Solo necesitas implementar el envío (código abajo)

### Código para enviar emails:

Crea `src/lib/send-email.ts`:

```typescript
import { Resend } from 'resend'
import { orderConfirmationEmail, paymentConfirmedEmail } from './email-templates'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOrderConfirmation(data: any) {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: data.customerEmail,
      subject: `✅ Pedido #${data.orderId} confirmado - Harry's Boutique`,
      html: orderConfirmationEmail(data),
    })
  } catch (error) {
    console.error('Error sending email:', error)
  }
}
```

---

## 🎯 Estado Actual vs Objetivo

### ✅ Lo que YA funciona:
- Carrito de compras
- Direcciones guardadas
- Selector geográfico inteligente
- Cupones de descuento
- Cálculo de envío
- Pago contra entrega (COD)

### ⚠️ Lo que falta configurar:
- **MercadoPago**: Credenciales (15 min)
- **Emails**: Implementar envío (30 min)
- **Webhook**: Configurar URL pública (solo en producción)

### 🚀 Mejoras opcionales (después):
- Stripe como alternativa
- PayPal
- Transferencia bancaria
- Indicador de progreso
- Trust badges

---

## 🧪 Cómo Probar Todo

### Test 1: Pago contra entrega
1. Agrega productos al carrito
2. Ve al checkout
3. Selecciona "Pago contra entrega"
4. Completa la dirección
5. Confirma el pedido
6. ✅ Debería crear la orden

### Test 2: MercadoPago (después de configurar)
1. Agrega productos al carrito
2. Ve al checkout
3. Selecciona "MercadoPago"
4. Completa la dirección
5. Haz clic en "Pagar con MercadoPago"
6. Usa tarjeta de prueba
7. ✅ Debería redirigir y confirmar pago

### Test 3: Cupones
1. Crea un cupón en `/admin/coupons`
2. Código: `TEST20`
3. Tipo: Porcentaje
4. Valor: 20
5. Ve al checkout
6. Aplica el cupón
7. ✅ Debería aplicar el descuento

---

## 📊 Checklist de Producción

Antes de lanzar a producción:

### Configuración
- [ ] Cambiar credenciales de TEST a PRODUCCIÓN
- [ ] Configurar webhook con URL real
- [ ] Verificar dominio en Resend
- [ ] Activar HTTPS/SSL
- [ ] Configurar variables de entorno en servidor

### Testing
- [ ] Probar compra real con monto pequeño ($100)
- [ ] Verificar que llegan los emails
- [ ] Probar desde móvil
- [ ] Probar con diferentes métodos de pago
- [ ] Verificar que se actualiza el stock

### Legal
- [ ] Términos y condiciones actualizados
- [ ] Política de privacidad
- [ ] Política de devolución
- [ ] Información de contacto

---

## 🆘 Problemas Comunes

### "MercadoPago no configurado"
**Solución**: Agrega `MERCADOPAGO_ACCESS_TOKEN` en `.env`

### "No redirige a MercadoPago"
**Solución**: Verifica que las credenciales sean correctas

### "Pago aprobado pero orden no se actualiza"
**Solución**: El webhook necesita estar configurado (solo en producción)

### "No llegan los emails"
**Solución**: 
1. Verifica `RESEND_API_KEY`
2. Verifica que el dominio esté verificado en Resend
3. Revisa la carpeta de spam

---

## 💰 Costos Estimados

### MercadoPago
- **Comisión**: 3.99% + IVA por transacción
- **Ejemplo**: Venta de $10,000 = $399 de comisión

### Resend (Emails)
- **Gratis**: Hasta 3,000 emails/mes
- **Pagado**: $20/mes por 50,000 emails

### Hosting (Vercel)
- **Gratis**: Para proyectos pequeños
- **Pro**: $20/mes si necesitas más

### Total mensual estimado:
- **Inicio**: $0 - $20/mes (solo emails si superas límite)
- **Con ventas**: 3.99% de cada venta + hosting

---

## 📞 Soporte

### MercadoPago
- Docs: https://www.mercadopago.com.ar/developers
- Soporte: developers@mercadopago.com

### Resend
- Docs: https://resend.com/docs
- Soporte: support@resend.com

### Vercel
- Docs: https://vercel.com/docs
- Soporte: https://vercel.com/support

---

## 🎯 Próximos Pasos

### Hoy (1-2 horas)
1. ✅ Configurar MercadoPago con credenciales de prueba
2. ✅ Probar checkout completo
3. ✅ Implementar envío de emails

### Esta semana (3-5 horas)
1. ⬜ Agregar indicador de progreso en checkout
2. ⬜ Mejorar validación de formularios
3. ⬜ Agregar trust badges
4. ⬜ Testing exhaustivo

### Antes de producción (2-3 horas)
1. ⬜ Cambiar a credenciales de producción
2. ⬜ Configurar webhook
3. ⬜ Testing con dinero real (monto pequeño)
4. ⬜ Documentar proceso para el equipo

---

## ✨ Resultado Final

Después de completar estos pasos tendrás:

✅ **Checkout funcional** con múltiples métodos de pago
✅ **Emails automáticos** para cada etapa del pedido
✅ **Direcciones guardadas** para compras rápidas
✅ **Sistema de cupones** funcionando
✅ **Cálculo de envío** automático
✅ **Experiencia profesional** para tus clientes

---

**Tiempo total estimado**: 2-3 horas
**Dificultad**: Media
**Prioridad**: 🔴 Alta (necesario para vender)
