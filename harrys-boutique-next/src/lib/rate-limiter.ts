import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

let upstashRatelimit: Ratelimit | null | undefined
let upstashRedis: Redis | null | undefined

function getUpstashRatelimit() {
  if (upstashRatelimit !== undefined) {
    return upstashRatelimit
  }

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    upstashRatelimit = null
    upstashRedis = null
    return upstashRatelimit
  }

  const redis = new Redis({ url, token })
  upstashRedis = redis
  upstashRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '10 s'),
    analytics: true,
    prefix: 'hb-rate-limit',
  })

  return upstashRatelimit
}

function toUpstashDuration(windowMs: number) {
  if (windowMs % (60 * 60 * 1000) === 0) {
    return `${windowMs / (60 * 60 * 1000)} h` as `${number} h`
  }

  if (windowMs % (60 * 1000) === 0) {
    return `${windowMs / (60 * 1000)} m` as `${number} m`
  }

  if (windowMs % 1000 === 0) {
    return `${windowMs / 1000} s` as `${number} s`
  }

  return `${windowMs} ms` as `${number} ms`
}

export function rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true // allowed
  }

  if (entry.count >= maxRequests) {
    return false // blocked
  }

  entry.count++
  return true // allowed
}

function getLocalRateLimitState(key: string, maxRequests: number, windowMs: number) {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs
    store.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: maxRequests - 1, resetAt }
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count += 1
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt }
}

export async function getRateLimitState(key: string, maxRequests: number, windowMs: number) {
  const ratelimit = getUpstashRatelimit()

  if (!ratelimit || !upstashRedis) {
    return getLocalRateLimitState(key, maxRequests, windowMs)
  }

  const identifier = `${key}:${maxRequests}:${windowMs}`
  const duration = toUpstashDuration(windowMs)

  const dynamicLimiter = new Ratelimit({
    redis: upstashRedis,
    limiter: Ratelimit.slidingWindow(maxRequests, duration),
    analytics: true,
    prefix: 'hb-rate-limit',
  })

  const result = await dynamicLimiter.limit(identifier)

  return {
    allowed: result.success,
    remaining: result.remaining,
    resetAt: result.reset,
  }
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() ?? 'unknown'
}
