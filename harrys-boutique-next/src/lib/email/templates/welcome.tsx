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

interface WelcomeEmailProps {
  name: string
  frontendUrl: string
}

export function WelcomeEmail({ name, frontendUrl }: WelcomeEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>¡Bienvenido a Harry&apos;s Boutique!</Preview>
      <Body style={{ backgroundColor: '#fdfaf7', fontFamily: "'Helvetica Neue', sans-serif" }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '0 0 24px' }}>
          <div style={{ backgroundColor: '#1a1a1a', padding: '24px 32px', textAlign: 'center' }}>
            <Heading style={{ color: '#ffffff', fontSize: '22px', fontWeight: '700', margin: 0, letterSpacing: '2px', textTransform: 'uppercase' }}>
              Harry&apos;s Boutique
            </Heading>
          </div>
          <div style={{ padding: '32px' }}>
            <Heading style={{ fontSize: '22px', fontWeight: '600', color: '#1a1a1a' }}>
              ¡Bienvenido/a, {name}!
            </Heading>
            <Text style={{ color: '#6b5c52', lineHeight: '1.6' }}>
              Gracias por registrarte en Harry&apos;s Boutique. Ahora podés explorar nuestra
              colección de ropa y accesorios para tu mascota.
            </Text>
            <Button
              href={`${frontendUrl}/collection`}
              style={{
                backgroundColor: '#1a1a1a',
                color: '#ffffff',
                padding: '12px 28px',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-block',
                marginTop: '16px',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Ver colección
            </Button>
          </div>
          <Hr style={{ borderColor: '#e8ddd5' }} />
          <Text style={{ color: '#9e8e84', fontSize: '12px', textAlign: 'center', padding: '0 32px' }}>
            © {new Date().getFullYear()} Harry&apos;s Boutique — Ropa y accesorios para mascotas
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
