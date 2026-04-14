import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'

interface OrderItem {
  name: string
  price: number
  quantity: number
  size: string
  image?: string
}

interface Address {
  firstname: string
  lastname: string
  street: string
  city: string
  region: string
  country: string
}

interface OrderConfirmationProps {
  orderId: string
  customerName: string
  items: OrderItem[]
  subtotal: number
  shippingFee: number
  total: number
  address: Address
}

export function OrderConfirmation({
  orderId,
  customerName,
  items,
  subtotal,
  shippingFee,
  total,
  address,
}: OrderConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Tu pedido #{orderId.slice(-8).toUpperCase()} ha sido confirmado</Preview>
      <Body style={{ backgroundColor: '#f9fafb', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
          <Heading style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
            ¡Gracias por tu compra, {customerName}!
          </Heading>
          <Text style={{ color: '#6b7280' }}>Pedido #{orderId.slice(-8).toUpperCase()}</Text>

          <Hr />

          <Section>
            <Heading as="h2" style={{ fontSize: '18px' }}>
              Productos
            </Heading>
            {items.map((item, i) => (
              <Row key={i} style={{ marginBottom: '12px' }}>
                <Text style={{ margin: 0 }}>
                  <strong>{item.name}</strong> — Talla: {item.size} × {item.quantity}
                </Text>
                <Text style={{ margin: 0, color: '#6b7280' }}>
                  ${(item.price * item.quantity).toLocaleString('es-CL')}
                </Text>
              </Row>
            ))}
          </Section>

          <Hr />

          <Section>
            <Row>
              <Text>Subtotal: ${subtotal.toLocaleString('es-CL')}</Text>
              <Text>Envío: ${shippingFee.toLocaleString('es-CL')}</Text>
              <Text style={{ fontWeight: '600' }}>Total: ${total.toLocaleString('es-CL')}</Text>
            </Row>
          </Section>

          <Hr />

          <Section>
            <Heading as="h2" style={{ fontSize: '18px' }}>
              Dirección de envío
            </Heading>
            <Text>
              {address.firstname} {address.lastname}
              <br />
              {address.street}
              <br />
              {address.city}, {address.region}
              <br />
              {address.country}
            </Text>
          </Section>

          <Hr />
          <Text style={{ color: '#9ca3af', fontSize: '12px', textAlign: 'center' }}>
            Harry&apos;s Boutique — Ropa y accesorios para mascotas
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
