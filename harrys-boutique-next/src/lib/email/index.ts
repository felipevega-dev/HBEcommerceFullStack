import { Resend } from 'resend'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null
const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@harrys-boutique.com'

interface SendEmailOptions {
  to: string
  subject: string
  react: React.ReactElement
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  if (!resend) {
    console.warn('[Email] RESEND_API_KEY not configured, skipping email send')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, react })
    if (error) throw error
    return { success: true, id: data?.id }
  } catch (error) {
    console.error('[Email] Failed to send:', { to, subject, error })
    return { success: false, error }
  }
}
