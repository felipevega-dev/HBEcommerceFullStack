interface OrderItem {
  name: string
  quantity: number
  price: number
  size?: string
  color?: string
  image?: string
}

interface Address {
  firstname: string
  lastname: string
  street: string
  city: string
  region: string
  postalCode: string
  country: string
  phone: string
}

interface OrderEmailData {
  orderId: string
  customerName: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  discount?: number
  total: number
  paymentMethod: string
  address: Address
  orderDate: string
}

const baseStyles = `
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #000; color: #fff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #fff; padding: 30px 20px; }
    .order-summary { background: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
    .item:last-child { border-bottom: none; }
    .total-row { display: flex; justify-content: space-between; padding: 10px 0; font-weight: bold; font-size: 18px; border-top: 2px solid #000; margin-top: 10px; }
    .button { display: inline-block; background: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .address-box { background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .badge-pending { background: #fff3cd; color: #856404; }
    .badge-paid { background: #d4edda; color: #155724; }
    .badge-shipped { background: #d1ecf1; color: #0c5460; }
    .badge-delivered { background: #d4edda; color: #155724; }
  </style>
`

export function orderConfirmationEmail(data: OrderEmailData): string {
  const itemsHtml = data.items
    .map(
      (item) => `
    <div class="item">
      <div>
        <strong>${item.name}</strong>
        ${item.size ? `<br><small>Talla: ${item.size}</small>` : ''}
        ${item.color ? `<br><small>Color: ${item.color}</small>` : ''}
        <br><small>Cantidad: ${item.quantity}</small>
      </div>
      <div style="text-align: right;">
        $${(item.price * item.quantity).toLocaleString('es-CL')}
      </div>
    </div>
  `
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Pedido</title>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Pedido Confirmado</h1>
        </div>
        
        <div class="content">
          <h2>¡Gracias por tu compra, ${data.customerName}!</h2>
          <p>Hemos recibido tu pedido y lo estamos procesando.</p>
          
          <div style="margin: 20px 0;">
            <strong>Número de pedido:</strong> #${data.orderId}<br>
            <strong>Fecha:</strong> ${new Date(data.orderDate).toLocaleDateString('es-CL', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}<br>
            <strong>Estado:</strong> <span class="badge badge-pending">Pendiente</span>
          </div>

          <div class="order-summary">
            <h3 style="margin-top: 0;">Resumen del Pedido</h3>
            ${itemsHtml}
            
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
              <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                <span>Subtotal:</span>
                <span>$${data.subtotal.toLocaleString('es-CL')}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                <span>Envío:</span>
                <span>${data.shipping === 0 ? '<strong style="color: #28a745;">Gratis</strong>' : `$${data.shipping.toLocaleString('es-CL')}`}</span>
              </div>
              ${data.discount ? `
              <div style="display: flex; justify-content: space-between; padding: 5px 0; color: #28a745;">
                <span>Descuento:</span>
                <span>-$${data.discount.toLocaleString('es-CL')}</span>
              </div>
              ` : ''}
              <div class="total-row">
                <span>Total:</span>
                <span>$${data.total.toLocaleString('es-CL')}</span>
              </div>
            </div>
          </div>

          <div class="address-box">
            <h4 style="margin-top: 0;">Dirección de Envío</h4>
            <p style="margin: 5px 0;">
              ${data.address.firstname} ${data.address.lastname}<br>
              ${data.address.street}<br>
              ${data.address.city}, ${data.address.region} ${data.address.postalCode}<br>
              ${data.address.country}<br>
              Tel: ${data.address.phone}
            </p>
          </div>

          <div style="background: #f0f8ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <strong>Método de pago:</strong> ${data.paymentMethod === 'COD' ? 'Pago contra entrega' : 'MercadoPago'}
            ${data.paymentMethod === 'COD' ? '<br><small>Pagarás al recibir tu pedido</small>' : '<br><small>Procesaremos tu pago y te notificaremos</small>'}
          </div>

          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/orders" class="button">Ver mi pedido</a>
          </div>

          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Te enviaremos un email cuando tu pedido sea despachado con el número de seguimiento.
          </p>
        </div>

        <div class="footer">
          <p>
            <strong>Harry's Boutique</strong><br>
            ¿Necesitas ayuda? <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/contacto">Contáctanos</a>
          </p>
          <p style="margin-top: 10px;">
            <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}">Visitar tienda</a> | 
            <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/devoluciones">Política de devolución</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function paymentConfirmedEmail(data: OrderEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pago Confirmado</title>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 Pago Confirmado</h1>
        </div>
        
        <div class="content">
          <h2>¡Excelente, ${data.customerName}!</h2>
          <p>Tu pago ha sido confirmado exitosamente.</p>
          
          <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 6px; padding: 20px; margin: 20px 0; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">✓</div>
            <h3 style="margin: 0; color: #155724;">Pago Recibido</h3>
            <p style="margin: 10px 0 0 0; color: #155724;">
              <strong>$${data.total.toLocaleString('es-CL')}</strong>
            </p>
          </div>

          <div style="margin: 20px 0;">
            <strong>Número de pedido:</strong> #${data.orderId}<br>
            <strong>Estado:</strong> <span class="badge badge-paid">Pagado</span>
          </div>

          <p>Estamos preparando tu pedido para el envío. Te notificaremos cuando sea despachado con el número de seguimiento.</p>

          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/orders" class="button">Ver estado del pedido</a>
          </div>
        </div>

        <div class="footer">
          <p>
            <strong>Harry's Boutique</strong><br>
            Gracias por tu confianza
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function orderShippedEmail(
  data: OrderEmailData & { trackingNumber: string; courier: string }
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pedido Enviado</title>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 Tu pedido está en camino</h1>
        </div>
        
        <div class="content">
          <h2>¡Buenas noticias, ${data.customerName}!</h2>
          <p>Tu pedido ha sido despachado y está en camino.</p>
          
          <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 6px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0c5460;">Información de Envío</h3>
            <p style="margin: 5px 0;">
              <strong>Número de seguimiento:</strong> ${data.trackingNumber}<br>
              <strong>Transportista:</strong> ${data.courier}<br>
              <strong>Tiempo estimado:</strong> 3-5 días hábiles
            </p>
          </div>

          <div style="margin: 20px 0;">
            <strong>Número de pedido:</strong> #${data.orderId}<br>
            <strong>Estado:</strong> <span class="badge badge-shipped">Enviado</span>
          </div>

          <div class="address-box">
            <h4 style="margin-top: 0;">Dirección de Entrega</h4>
            <p style="margin: 5px 0;">
              ${data.address.firstname} ${data.address.lastname}<br>
              ${data.address.street}<br>
              ${data.address.city}, ${data.address.region}<br>
              Tel: ${data.address.phone}
            </p>
          </div>

          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/orders" class="button">Rastrear mi pedido</a>
          </div>

          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Recibirás una notificación cuando tu pedido sea entregado.
          </p>
        </div>

        <div class="footer">
          <p>
            <strong>Harry's Boutique</strong><br>
            ¿Problemas con tu envío? <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/contacto">Contáctanos</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function orderDeliveredEmail(data: OrderEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pedido Entregado</title>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✨ Pedido Entregado</h1>
        </div>
        
        <div class="content">
          <h2>¡Tu pedido ha llegado, ${data.customerName}!</h2>
          <p>Esperamos que disfrutes tus productos.</p>
          
          <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 6px; padding: 20px; margin: 20px 0; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
            <h3 style="margin: 0; color: #155724;">Entrega Completada</h3>
            <p style="margin: 10px 0 0 0; color: #155724;">
              Pedido #${data.orderId}
            </p>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 20px; margin: 20px 0; text-align: center;">
            <h3 style="margin-top: 0;">¿Cómo fue tu experiencia?</h3>
            <p>Tu opinión nos ayuda a mejorar</p>
            <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/orders" class="button" style="background: #ffc107; color: #000;">
              Dejar una reseña
            </a>
          </div>

          <p style="text-align: center; margin: 30px 0;">
            ¿Algún problema con tu pedido?<br>
            <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/contacto" style="color: #007bff;">Contáctanos</a> y lo resolveremos
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/collection" class="button">Seguir comprando</a>
          </div>
        </div>

        <div class="footer">
          <p>
            <strong>Harry's Boutique</strong><br>
            Gracias por confiar en nosotros
          </p>
          <p style="margin-top: 10px;">
            <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/devoluciones">Política de devolución</a> | 
            <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/faq">Preguntas frecuentes</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}
