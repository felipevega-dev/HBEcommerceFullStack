import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from '@react-email/components'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  PROCESSING: 'En proceso',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

interface OrderStatusUpdateProps {
  orderId: string
  customerName: string
  previousStatus: string
  newStatus: string
  frontendUrl: string
}

export function OrderStatusUpdate({
  orderId,
  customerName,
  previousStatus,
  newStatus,
  frontendUrl,
}: OrderStatusUpdateProps) {
  return (
    <Html>
      <Head />
      <Preview>Tu pedido #{orderId.slice(-8).toUpperCase()} ha sido actualizado</Preview>
      <Body style={{ backgroundColor: '#f9fafb', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
          <Heading style={{ fontSize: '24px', fontWeight: '600' }}>
            Actualización de tu pedido
          </Heading>
          <Text>Hola {customerName},</Text>
          <Text>Tu pedido #{orderId.slice(-8).toUpperCase()} ha cambiado de estado:</Text>
          <Text>
            <strong>{STATUS_LABELS[previousStatus] ?? previousStatus}</strong>
            {' → '}
            <strong>{STATUS_LABELS[newStatus] ?? newStatus}</strong>
          </Text>

          <Button
            href={`${frontendUrl}/orders`}
            style={{
              backgroundColor: '#000',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              display: 'inline-block',
              marginTop: '16px',
            }}
          >
            Ver mis pedidos
          </Button>

          <Hr />
          <Text style={{ color: '#9ca3af', fontSize: '12px', textAlign: 'center' }}>
            Harry&apos;s Boutique — Ropa y accesorios para mascotas
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
