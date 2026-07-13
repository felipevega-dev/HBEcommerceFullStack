import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('distributed rate limiting', () => {
  it('falls back to the local limiter in production when Upstash is not configured', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '')

    const { getRateLimitState } = await import('../rate-limiter')

    await expect(getRateLimitState('admin:mutation:127.0.0.1', 10, 60_000)).resolves.toMatchObject({
      allowed: true,
    })
  })

  it('keeps the local limiter available outside production', async () => {
    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '')

    const { getRateLimitState } = await import('../rate-limiter')

    await expect(getRateLimitState('local:test', 1, 60_000)).resolves.toMatchObject({
      allowed: true,
    })
    await expect(getRateLimitState('local:test', 1, 60_000)).resolves.toMatchObject({
      allowed: false,
    })
  })
})
