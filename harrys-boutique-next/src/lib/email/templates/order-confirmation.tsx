import {
  Body,
  Column,
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
import * as React from 'react'

export interface OrderConfirmationProps {
  orderId: string
  customerName: string
  items: {
    name: string
    price: number
    quantity: number
    size: string
    image?: string
  }[]
  subtotal: number
  shippingFee: number
  total: number
  address: string
}

export default function OrderConfirmation({
  orderId,
  customerName,
  items,
  subtotal,
  shippingFee,
  total,
  address,
}: OrderConfirmationProps) {
  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount)

  return (
    <Html lang="es">
      <Head />
      <Preview>Confirmación de tu pedido #{orderId} — Harry&apos;s Boutique</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Heading style={logoStyle}>Harry&apos;s Boutique</Heading>
          </Section>

          {/* Greeting */}
          <Section style={sectionStyle}>
            <Heading as="h2" style={h2Style}>
              ¡Gracias por tu compra, {customerName}!
            </Heading>
            <Text style={textStyle}>
              Tu pedido fue confirmado y está siendo procesado. A continuación encontrás el resumen
              de tu compra.
            </Text>
            <Text style={orderIdStyle}>Número de pedido: #{orderId}</Text>
          </Section>

          <Hr style={hrStyle} />

          {/* Items */}
          <Section style={sectionStyle}>
            <Heading as="h3" style={h3Style}>
              Productos
            </Heading>
            {items.map((item, index) => (
              <Row key={index} style={itemRowStyle}>
                {item.image && (
                  <Column style={imgColumnStyle}>
                    <Img
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      style={itemImgStyle}
                    />
                  </Column>
                )}
                <Column style={itemDetailsStyle}>
                  <Text style={itemNameStyle}>{item.name}</Text>
                  <Text style={itemMetaStyle}>
                    Talle: {item.size} · Cantidad: {item.quantity}
                  </Text>
                </Column>
                <Column style={itemPriceColumnStyle}>
                  <Text style={itemPriceStyle}>{formatPrice(item.price * item.quantity)}</Text>
                  <Text style={itemUnitPriceStyle}>{formatPrice(item.price)} c/u</Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={hrStyle} />

          {/* Totals */}
          <Section style={sectionStyle}>
            <Row style={totalRowStyle}>
              <Column>
                <Text style={totalLabelStyle}>Subtotal</Text>
              </Column>
              <Column style={totalValueColumnStyle}>
                <Text style={totalValueStyle}>{formatPrice(subtotal)}</Text>
              </Column>
            </Row>
            <Row style={totalRowStyle}>
              <Column>
                <Text style={totalLabelStyle}>Envío</Text>
              </Column>
              <Column style={totalValueColumnStyle}>
                <Text style={totalValueStyle}>
                  {shippingFee === 0 ? 'Gratis' : formatPrice(shippingFee)}
                </Text>
              </Column>
            </Row>
            <Hr style={thinHrStyle} />
            <Row style={totalRowStyle}>
              <Column>
                <Text style={grandTotalLabelStyle}>Total</Text>
              </Column>
              <Column style={totalValueColumnStyle}>
                <Text style={grandTotalValueStyle}>{formatPrice(total)}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hrStyle} />

          {/* Shipping address */}
          <Section style={sectionStyle}>
            <Heading as="h3" style={h3Style}>
              Dirección de envío
            </Heading>
            <Text style={textStyle}>{address}</Text>
          </Section>

          <Hr style={hrStyle} />

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              Si tenés alguna pregunta sobre tu pedido, respondé este correo o contactanos por
              nuestras redes sociales.
            </Text>
            <Text style={footerTextStyle}>© {new Date().getFullYear()} Harry&apos;s Boutique</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const bodyStyle: React.CSSProperties = {
  backgroundColor: '#f5f5f5',
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  margin: 0,
  padding: 0,
}

const containerStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
  padding: '0 0 24px',
}

const headerStyle: React.CSSProperties = {
  backgroundColor: '#1a1a1a',
  padding: '24px 32px',
  textAlign: 'center',
}

const logoStyle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '700',
  letterSpacing: '2px',
  margin: 0,
  textTransform: 'uppercase',
}

const sectionStyle: React.CSSProperties = {
  padding: '24px 32px',
}

const h2Style: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '22px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const h3Style: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}

const textStyle: React.CSSProperties = {
  color: '#555555',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 8px',
}

const orderIdStyle: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: '600',
  margin: '12px 0 0',
}

const hrStyle: React.CSSProperties = {
  borderColor: '#e5e5e5',
  borderTopWidth: '1px',
  margin: '0',
}

const thinHrStyle: React.CSSProperties = {
  borderColor: '#e5e5e5',
  borderTopWidth: '1px',
  margin: '8px 0',
}

const itemRowStyle: React.CSSProperties = {
  marginBottom: '16px',
}

const imgColumnStyle: React.CSSProperties = {
  width: '72px',
  verticalAlign: 'top',
}

const itemImgStyle: React.CSSProperties = {
  borderRadius: '6px',
  objectFit: 'cover',
}

const itemDetailsStyle: React.CSSProperties = {
  paddingLeft: '12px',
  verticalAlign: 'top',
}

const itemNameStyle: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 4px',
}

const itemMetaStyle: React.CSSProperties = {
  color: '#888888',
  fontSize: '13px',
  margin: 0,
}

const itemPriceColumnStyle: React.CSSProperties = {
  textAlign: 'right',
  verticalAlign: 'top',
  width: '100px',
}

const itemPriceStyle: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 2px',
}

const itemUnitPriceStyle: React.CSSProperties = {
  color: '#aaaaaa',
  fontSize: '12px',
  margin: 0,
}

const totalRowStyle: React.CSSProperties = {
  marginBottom: '4px',
}

const totalLabelStyle: React.CSSProperties = {
  color: '#555555',
  fontSize: '14px',
  margin: '4px 0',
}

const totalValueColumnStyle: React.CSSProperties = {
  textAlign: 'right',
}

const totalValueStyle: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '14px',
  margin: '4px 0',
}

const grandTotalLabelStyle: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: '700',
  margin: '8px 0',
}

const grandTotalValueStyle: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: '700',
  margin: '8px 0',
}

const footerStyle: React.CSSProperties = {
  padding: '16px 32px 0',
  textAlign: 'center',
}

const footerTextStyle: React.CSSProperties = {
  color: '#aaaaaa',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '0 0 4px',
}
