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
import { PASSWORD_RESET_TOKEN_TTL_MINUTES } from '@/lib/auth/password-reset'

interface PasswordResetEmailProps {
  name: string
  resetUrl: string
}

export function PasswordResetEmail({ name, resetUrl }: PasswordResetEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Restablece tu contraseña de Harry&apos;s Boutique</Preview>
      <Body style={{ backgroundColor: '#fdfaf7', fontFamily: "'Helvetica Neue', sans-serif" }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '0 0 24px' }}>
          <div style={{ backgroundColor: '#1a1a1a', padding: '24px 32px', textAlign: 'center' }}>
            <Heading style={{ color: '#ffffff', fontSize: '22px', fontWeight: '700', margin: 0 }}>
              Harry&apos;s Boutique
            </Heading>
          </div>
          <div style={{ padding: '32px' }}>
            <Heading style={{ fontSize: '22px', fontWeight: '600', color: '#1a1a1a' }}>
              Hola, {name}
            </Heading>
            <Text style={{ color: '#6b5c52', lineHeight: '1.6' }}>
              Recibimos una solicitud para restablecer la contraseña de tu cuenta. Este enlace
              vence en {PASSWORD_RESET_TOKEN_TTL_MINUTES} minutos.
            </Text>
            <Button
              href={resetUrl}
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
              Restablecer contraseña
            </Button>
            <Text style={{ color: '#9e8e84', fontSize: '13px', lineHeight: '1.6', marginTop: '24px' }}>
              Si no solicitaste este cambio, puedes ignorar este correo.
            </Text>
          </div>
          <Hr style={{ borderColor: '#e8ddd5' }} />
          <Text style={{ color: '#9e8e84', fontSize: '12px', textAlign: 'center', padding: '0 32px' }}>
            © {new Date().getFullYear()} Harry&apos;s Boutique
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
