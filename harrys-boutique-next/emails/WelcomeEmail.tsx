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
    <Html>
      <Head />
      <Preview>¡Bienvenido a Harry&apos;s Boutique!</Preview>
      <Body style={{ backgroundColor: '#f9fafb', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
          <Heading style={{ fontSize: '24px', fontWeight: '600' }}>¡Bienvenido, {name}!</Heading>
          <Text>
            Gracias por registrarte en Harry&apos;s Boutique. Ahora puedes explorar nuestra
            colección de ropa y accesorios para tu mascota.
          </Text>

          <Button
            href={`${frontendUrl}/collection`}
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
            Ver colección
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
