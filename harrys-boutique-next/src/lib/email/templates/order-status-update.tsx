import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

export interface OrderStatusUpdateProps {
  orderId: string
  customerName: string
  previousStatus: string
  newStatus: string
  frontendUrl: string
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  PROCESSING: 'En proceso',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status
}

export default function OrderStatusUpdate({
  orderId,
  customerName,
  previousStatus,
  newStatus,
  frontendUrl,
}: OrderStatusUpdateProps) {
  const previousLabel = getStatusLabel(previousStatus)
  const newLabel = getStatusLabel(newStatus)

  return (
    <Html lang="es">
      <Head />
      <Preview>
        Actualización de tu pedido #{orderId} — {newLabel}
      </Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Heading style={logoStyle}>Harry&apos;s Boutique</Heading>
          </Section>

          {/* Greeting */}
          <Section style={sectionStyle}>
            <Heading as="h2" style={h2Style}>
              Hola, {customerName}
            </Heading>
            <Text style={textStyle}>
              El estado de tu pedido ha sido actualizado. A continuación encontrás los detalles del
              cambio.
            </Text>
            <Text style={orderIdStyle}>Número de pedido: #{orderId}</Text>
          </Section>

          <Hr style={hrStyle} />

          {/* Status transition */}
          <Section style={sectionStyle}>
            <Heading as="h3" style={h3Style}>
              Cambio de estado
            </Heading>
            <table style={statusTableStyle}>
              <tbody>
                <tr>
                  <td style={statusLabelCellStyle}>Estado anterior</td>
                  <td style={statusValueCellStyle}>
                    <span style={previousStatusBadgeStyle}>{previousLabel}</span>
                  </td>
                </tr>
                <tr>
                  <td style={statusLabelCellStyle}>Nuevo estado</td>
                  <td style={statusValueCellStyle}>
                    <span style={newStatusBadgeStyle}>{newLabel}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Hr style={hrStyle} />

          {/* CTA */}
          <Section style={ctaSectionStyle}>
            <Text style={ctaTextStyle}>
              Podés ver el detalle completo de tu pedido haciendo clic en el botón de abajo.
            </Text>
            <Button href={frontendUrl} style={ctaButtonStyle}>
              Ver mi pedido
            </Button>
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

const statusTableStyle: React.CSSProperties = {
  borderCollapse: 'collapse',
  width: '100%',
}

const statusLabelCellStyle: React.CSSProperties = {
  color: '#555555',
  fontSize: '14px',
  paddingBottom: '12px',
  paddingRight: '16px',
  verticalAlign: 'middle',
  width: '140px',
}

const statusValueCellStyle: React.CSSProperties = {
  paddingBottom: '12px',
  verticalAlign: 'middle',
}

const previousStatusBadgeStyle: React.CSSProperties = {
  backgroundColor: '#f0f0f0',
  borderRadius: '4px',
  color: '#888888',
  display: 'inline-block',
  fontSize: '13px',
  fontWeight: '600',
  padding: '4px 10px',
}

const newStatusBadgeStyle: React.CSSProperties = {
  backgroundColor: '#1a1a1a',
  borderRadius: '4px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '13px',
  fontWeight: '600',
  padding: '4px 10px',
}

const ctaSectionStyle: React.CSSProperties = {
  padding: '24px 32px',
  textAlign: 'center',
}

const ctaTextStyle: React.CSSProperties = {
  color: '#555555',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 20px',
}

const ctaButtonStyle: React.CSSProperties = {
  backgroundColor: '#1a1a1a',
  borderRadius: '4px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: '600',
  padding: '12px 28px',
  textDecoration: 'none',
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
