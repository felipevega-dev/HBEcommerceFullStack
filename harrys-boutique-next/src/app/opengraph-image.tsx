import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = "Harry's Boutique — Ropa y accesorios para mascotas"
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        background: '#fdfaf7',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Georgia, serif',
      }}
    >
      {/* Background accent */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '8px',
          background: '#c9a0a0',
        }}
      />

      {/* Logo area */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        <div
          style={{
            fontSize: '72px',
            fontWeight: '300',
            color: '#1a1a1a',
            letterSpacing: '-2px',
          }}
        >
          Harry&apos;s Boutique
        </div>
        <div
          style={{
            width: '80px',
            height: '2px',
            background: '#c9a0a0',
          }}
        />
        <div
          style={{
            fontSize: '28px',
            color: '#6b5c52',
            fontWeight: '400',
          }}
        >
          Moda para tu mejor amigo
        </div>
      </div>

      {/* Bottom accent */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '8px',
          background: '#c9a0a0',
        }}
      />
    </div>,
    { ...size },
  )
}
