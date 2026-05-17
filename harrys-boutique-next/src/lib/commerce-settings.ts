import { prisma } from '@/lib/prisma'
import { DEFAULT_PRICING_SETTINGS, type PricingSettings } from '@/lib/checkout'
import { STORE_SETTING_DEFINITIONS, getDefaultSettingsMap } from '@/lib/store-settings'

function toPositiveNumber(value: string | undefined, fallback: number) {
  if (value == null || value.trim() === '') return fallback

  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

export async function getPricingSettings(): Promise<PricingSettings> {
  let settings: { key: string; value: string }[]

  try {
    settings = await prisma.settings.findMany({
      where: { key: { in: ['shipping_fee', 'free_shipping_threshold'] } },
      select: { key: true, value: true },
    })
  } catch (error) {
    console.warn('[CommerceSettings] Using default pricing settings', error)
    return DEFAULT_PRICING_SETTINGS
  }

  const map = Object.fromEntries(settings.map((setting) => [setting.key, setting.value]))

  return {
    shippingFee: toPositiveNumber(map.shipping_fee, DEFAULT_PRICING_SETTINGS.shippingFee),
    freeShippingThreshold: toPositiveNumber(
      map.free_shipping_threshold,
      DEFAULT_PRICING_SETTINGS.freeShippingThreshold,
    ),
  }
}

export async function ensureDefaultStoreSettings() {
  const existing = await prisma.settings.findMany({
    where: { key: { in: STORE_SETTING_DEFINITIONS.map((setting) => setting.key) } },
    select: { key: true },
  })

  const existingKeys = new Set(existing.map((setting) => setting.key))
  const missing = STORE_SETTING_DEFINITIONS.filter((setting) => !existingKeys.has(setting.key))

  if (missing.length === 0) return

  await prisma.settings.createMany({
    data: missing.map((setting) => ({
      key: setting.key,
      value: setting.defaultValue,
      description: setting.description,
    })),
    skipDuplicates: true,
  })
}

export async function getSettingsMap() {
  await ensureDefaultStoreSettings()
  const settings = await prisma.settings.findMany()
  return {
    ...getDefaultSettingsMap(),
    ...Object.fromEntries(settings.map((setting) => [setting.key, setting.value])),
  }
}
