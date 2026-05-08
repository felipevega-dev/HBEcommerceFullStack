import {
  Prisma,
  InstagramPostStatus,
  type InstagramAutomationSettings,
  type InstagramPost,
  type Product,
} from '@prisma/client'
import { prisma } from '@/lib/prisma'

const DEFAULT_CAPTION_TEMPLATE =
  "Descubre {{product_name}} en Harry's Boutique. {{product_description}} {{hashtags}}"

const DEFAULT_INSTAGRAM_SETTINGS = {
  enabled: false,
  timezone: 'America/Santiago',
  dailyHour: 10,
  dailyMinute: 0,
  sourceType: 'PRODUCTS',
  captionTemplate: DEFAULT_CAPTION_TEMPLATE,
  fallbackHashtags: '#HarrysBoutique #Moda #TiendaOnline',
  maxDailyPosts: 1,
  requireManualApproval: true,
} satisfies Omit<InstagramAutomationSettings, 'id' | 'createdAt' | 'updatedAt'>

type InstagramProductSource = Pick<
  Product,
  'id' | 'name' | 'description' | 'images' | 'active' | 'createdAt'
>

function isMissingInstagramTableError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021'
}

function getFallbackInstagramSettings(): InstagramAutomationSettings {
  const now = new Date()

  return {
    id: 'instagram-settings-unavailable',
    createdAt: now,
    updatedAt: now,
    ...DEFAULT_INSTAGRAM_SETTINGS,
  }
}

export type InstagramSettingsInput = {
  enabled: boolean
  timezone: string
  dailyHour: number
  dailyMinute: number
  sourceType: string
  captionTemplate: string
  fallbackHashtags: string
  maxDailyPosts: number
  requireManualApproval: boolean
}

export type ManualInstagramPostInput = {
  title: string
  imageUrl: string
  sourceDescription?: string | null
  captionDraft?: string | null
  scheduledFor?: Date | string | null
}

export type InstagramPostUpdateInput = {
  title: string
  imageUrl: string
  sourceDescription?: string | null
  captionDraft?: string | null
  finalCaption?: string | null
  scheduledFor?: Date | string | null
}

export async function ensureInstagramAutomationSettings() {
  try {
    const existing = await prisma.instagramAutomationSettings.findFirst()

    if (existing) {
      return existing
    }

    return prisma.instagramAutomationSettings.create({
      data: DEFAULT_INSTAGRAM_SETTINGS,
    })
  } catch (error) {
    if (isMissingInstagramTableError(error)) {
      return getFallbackInstagramSettings()
    }

    throw error
  }
}

export async function updateInstagramAutomationSettings(input: InstagramSettingsInput) {
  const settings = await ensureInstagramAutomationSettings()

  if (settings.id === 'instagram-settings-unavailable') {
    throw new Error(
      'Instagram automation no está disponible hasta ejecutar las migraciones pendientes',
    )
  }

  return prisma.instagramAutomationSettings.update({
    where: { id: settings.id },
    data: {
      ...input,
      captionTemplate: input.captionTemplate.trim() || DEFAULT_CAPTION_TEMPLATE,
      fallbackHashtags: input.fallbackHashtags.trim(),
      timezone: input.timezone.trim() || DEFAULT_INSTAGRAM_SETTINGS.timezone,
    },
  })
}

export function renderInstagramCaption({
  productName,
  productDescription,
  template,
  hashtags,
}: {
  productName: string
  productDescription?: string | null
  template: string
  hashtags?: string | null
}) {
  const safeDescription = normalizeDescription(productDescription)
  const safeHashtags = normalizeHashtags(hashtags)

  return template
    .replaceAll('{{product_name}}', productName.trim())
    .replaceAll('{{product_description}}', safeDescription)
    .replaceAll('{{hashtags}}', safeHashtags)
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export function computeNextScheduledFor(
  settings: Pick<InstagramAutomationSettings, 'timezone' | 'dailyHour' | 'dailyMinute'>,
  now = new Date(),
) {
  const current = getTimeZoneParts(now, settings.timezone)
  const shouldUseNextDay =
    current.hour > settings.dailyHour ||
    (current.hour === settings.dailyHour && current.minute >= settings.dailyMinute)

  const targetDate = new Date(
    Date.UTC(current.year, current.month - 1, current.day + (shouldUseNextDay ? 1 : 0), 12, 0, 0),
  )
  const targetParts = getTimeZoneParts(targetDate, settings.timezone)

  return zonedDateTimeToUtc(
    {
      year: targetParts.year,
      month: targetParts.month,
      day: targetParts.day,
      hour: settings.dailyHour,
      minute: settings.dailyMinute,
      second: 0,
    },
    settings.timezone,
  )
}

export async function generateInstagramDrafts(count = 1) {
  const settings = await ensureInstagramAutomationSettings()
  const products = await selectProductsForQueue(count)

  const createdPosts: InstagramPost[] = []

  for (const [index, product] of products.entries()) {
    const scheduledBase = computeNextScheduledFor(settings)
    const scheduledFor = new Date(scheduledBase.getTime() + index * 60_000)
    const captionDraft = renderInstagramCaption({
      productName: product.name,
      productDescription: product.description,
      template: settings.captionTemplate,
      hashtags: settings.fallbackHashtags,
    })

    const post = await prisma.instagramPost.create({
      data: {
        productId: product.id,
        status: settings.requireManualApproval
          ? InstagramPostStatus.DRAFT
          : InstagramPostStatus.PENDING,
        sourceType: settings.sourceType,
        imageUrl: product.images[0],
        title: product.name,
        sourceDescription: product.description,
        captionDraft,
        scheduledFor,
        selectedAt: new Date(),
      },
    })

    createdPosts.push(post)
  }

  return createdPosts
}

export async function createManualInstagramPost(input: ManualInstagramPostInput) {
  const settings = await ensureInstagramAutomationSettings()
  const scheduledFor = resolveScheduledFor(input.scheduledFor, settings)
  const captionDraft =
    input.captionDraft?.trim() ||
    renderInstagramCaption({
      productName: input.title,
      productDescription: input.sourceDescription,
      template: settings.captionTemplate,
      hashtags: settings.fallbackHashtags,
    })

  return prisma.instagramPost.create({
    data: {
      status: settings.requireManualApproval
        ? InstagramPostStatus.DRAFT
        : InstagramPostStatus.PENDING,
      sourceType: 'MANUAL_UPLOAD',
      imageUrl: input.imageUrl.trim(),
      title: input.title.trim(),
      sourceDescription: input.sourceDescription?.trim() || null,
      captionDraft,
      scheduledFor,
      selectedAt: new Date(),
    },
  })
}

export async function updateInstagramPostDraft(postId: string, input: InstagramPostUpdateInput) {
  const post = await prisma.instagramPost.findUnique({ where: { id: postId } })

  if (!post) {
    throw new Error('Publicación no encontrada')
  }

  if (
    post.status === InstagramPostStatus.PUBLISHED ||
    post.status === InstagramPostStatus.PROCESSING
  ) {
    throw new Error('La publicación ya no puede editarse en su estado actual')
  }

  const settings = await ensureInstagramAutomationSettings()

  return prisma.instagramPost.update({
    where: { id: postId },
    data: {
      title: input.title.trim(),
      imageUrl: input.imageUrl.trim(),
      sourceDescription: input.sourceDescription?.trim() || null,
      captionDraft: input.captionDraft?.trim() || null,
      finalCaption: input.finalCaption?.trim() || null,
      scheduledFor: resolveScheduledFor(input.scheduledFor, settings),
      lastError: null,
      status: post.status === InstagramPostStatus.FAILED ? InstagramPostStatus.DRAFT : post.status,
    },
  })
}

export async function approveInstagramPost(postId: string) {
  const post = await prisma.instagramPost.findUnique({ where: { id: postId } })

  if (!post) {
    throw new Error('Publicación no encontrada')
  }

  if (
    post.status === InstagramPostStatus.PUBLISHED ||
    post.status === InstagramPostStatus.SKIPPED ||
    post.status === InstagramPostStatus.PROCESSING
  ) {
    throw new Error('La publicación no puede moverse a la cola en su estado actual')
  }

  if (post.status === InstagramPostStatus.PENDING) {
    return post
  }

  return prisma.instagramPost.update({
    where: { id: postId },
    data: {
      status: InstagramPostStatus.PENDING,
      lastError: null,
    },
  })
}

export async function skipInstagramPost(postId: string) {
  const post = await prisma.instagramPost.findUnique({ where: { id: postId } })

  if (!post) {
    throw new Error('Publicación no encontrada')
  }

  if (post.status === InstagramPostStatus.PUBLISHED) {
    throw new Error('No se puede omitir una publicación ya publicada')
  }

  return prisma.instagramPost.update({
    where: { id: postId },
    data: {
      status: InstagramPostStatus.SKIPPED,
      processedAt: new Date(),
    },
  })
}

export async function processDueInstagramPosts(limit?: number) {
  const settings = await ensureInstagramAutomationSettings()

  if (!settings.enabled) {
    return []
  }

  const maxPosts = Math.max(1, limit ?? settings.maxDailyPosts)
  const duePosts = await prisma.instagramPost.findMany({
    where: {
      status: InstagramPostStatus.PENDING,
      scheduledFor: { lte: new Date() },
    },
    orderBy: { scheduledFor: 'asc' },
    take: maxPosts,
  })

  const results = []

  for (const post of duePosts) {
    results.push(await processInstagramPost(post.id))
  }

  return results
}

export async function processInstagramPost(postId: string) {
  const locked = await prisma.instagramPost.updateMany({
    where: {
      id: postId,
      status: InstagramPostStatus.PENDING,
    },
    data: {
      status: InstagramPostStatus.PROCESSING,
      processedAt: new Date(),
    },
  })

  if (locked.count === 0) {
    throw new Error('La publicación no está lista para procesarse')
  }

  const post = await prisma.instagramPost.findUnique({ where: { id: postId } })

  if (!post) {
    throw new Error('Publicación no encontrada')
  }

  try {
    const publishResponse = await publishInstagramImagePost(post)

    const updated = await prisma.instagramPost.update({
      where: { id: post.id },
      data: {
        status: InstagramPostStatus.PUBLISHED,
        finalCaption: post.finalCaption ?? post.captionDraft,
        publishedAt: new Date(),
        instagramCreationId: publishResponse.creationId,
        instagramMediaId: publishResponse.mediaId,
        lastError: null,
      },
    })

    await prisma.instagramPostAttempt.create({
      data: {
        instagramPostId: post.id,
        status: 'SUCCESS',
        message: 'Publicación enviada correctamente a Instagram',
        requestPayload: {
          imageUrl: post.imageUrl,
          caption: post.finalCaption ?? post.captionDraft,
        },
        responsePayload: publishResponse,
      },
    })

    return updated
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error desconocido al publicar en Instagram'

    await prisma.instagramPost.update({
      where: { id: post.id },
      data: {
        status: InstagramPostStatus.FAILED,
        retryCount: { increment: 1 },
        lastError: message,
      },
    })

    await prisma.instagramPostAttempt.create({
      data: {
        instagramPostId: post.id,
        status: 'FAILED',
        message,
      },
    })

    throw error
  }
}

export async function testInstagramConnection() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
  const instagramUserId = process.env.INSTAGRAM_USER_ID
  const graphVersion = process.env.INSTAGRAM_GRAPH_API_VERSION ?? 'v22.0'

  if (!accessToken || !instagramUserId) {
    throw new Error('Faltan INSTAGRAM_ACCESS_TOKEN o INSTAGRAM_USER_ID para probar la conexión')
  }

  const response = await fetch(
    `https://graph.facebook.com/${graphVersion}/${instagramUserId}?fields=id,username,account_type&access_token=${encodeURIComponent(accessToken)}`,
    {
      method: 'GET',
      cache: 'no-store',
    },
  )

  const payload = await response.json()

  if (!response.ok || !payload.id) {
    throw new Error(extractInstagramError(payload, 'No fue posible validar la cuenta de Instagram'))
  }

  return {
    id: String(payload.id),
    username: typeof payload.username === 'string' ? payload.username : null,
    accountType: typeof payload.account_type === 'string' ? payload.account_type : null,
  }
}

async function selectProductsForQueue(count: number) {
  const queued = await prisma.instagramPost.findMany({
    where: {
      status: {
        in: [
          InstagramPostStatus.DRAFT,
          InstagramPostStatus.PENDING,
          InstagramPostStatus.PROCESSING,
          InstagramPostStatus.PUBLISHED,
        ],
      },
      productId: { not: null },
    },
    select: { productId: true },
  })

  const usedProductIds = new Set(queued.map((item) => item.productId).filter(Boolean))
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      name: true,
      description: true,
      images: true,
      active: true,
      createdAt: true,
    },
  })

  return products
    .filter((product) => product.images[0] && !usedProductIds.has(product.id))
    .slice(0, count)
}

async function publishInstagramImagePost(
  post: Pick<InstagramPost, 'imageUrl' | 'finalCaption' | 'captionDraft'>,
) {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
  const instagramUserId = process.env.INSTAGRAM_USER_ID
  const graphVersion = process.env.INSTAGRAM_GRAPH_API_VERSION ?? 'v22.0'

  if (!accessToken || !instagramUserId) {
    throw new Error('Faltan INSTAGRAM_ACCESS_TOKEN o INSTAGRAM_USER_ID para publicar en Instagram')
  }

  const caption = post.finalCaption ?? post.captionDraft ?? ''
  const createUrl = `https://graph.facebook.com/${graphVersion}/${instagramUserId}/media`
  const publishUrl = `https://graph.facebook.com/${graphVersion}/${instagramUserId}/media_publish`

  const createResponse = await fetch(createUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_url: post.imageUrl,
      caption,
      access_token: accessToken,
    }),
  })

  const createJson = await createResponse.json()

  if (!createResponse.ok || !createJson.id) {
    throw new Error(
      extractInstagramError(createJson, 'No fue posible crear el contenedor de Instagram'),
    )
  }

  const publishResponse = await fetch(publishUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: createJson.id,
      access_token: accessToken,
    }),
  })

  const publishJson = await publishResponse.json()

  if (!publishResponse.ok || !publishJson.id) {
    throw new Error(
      extractInstagramError(publishJson, 'No fue posible publicar el contenido en Instagram'),
    )
  }

  return {
    creationId: createJson.id as string,
    mediaId: publishJson.id as string,
    createResponse: createJson,
    publishResponse: publishJson,
  }
}

function extractInstagramError(payload: unknown, fallback: string) {
  if (
    payload &&
    typeof payload === 'object' &&
    'error' in payload &&
    payload.error &&
    typeof payload.error === 'object' &&
    'message' in payload.error &&
    typeof payload.error.message === 'string'
  ) {
    return payload.error.message
  }

  return fallback
}

function normalizeDescription(value?: string | null) {
  if (!value) {
    return 'Disponible ahora.'
  }

  return value.replace(/\s+/g, ' ').trim().slice(0, 180)
}

function normalizeHashtags(value?: string | null) {
  return value?.replace(/\s+/g, ' ').trim() || '#HarrysBoutique'
}

function resolveScheduledFor(
  value: Date | string | null | undefined,
  settings: Pick<InstagramAutomationSettings, 'timezone' | 'dailyHour' | 'dailyMinute'>,
) {
  if (!value) {
    return computeNextScheduledFor(settings)
  }

  const scheduledFor = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(scheduledFor.getTime())) {
    throw new Error('Fecha de programación inválida')
  }

  return scheduledFor
}

function getTimeZoneParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(date)
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0)

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
  }
}

function zonedDateTimeToUtc(
  parts: { year: number; month: number; day: number; hour: number; minute: number; second: number },
  timeZone: string,
) {
  const utcGuess = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second),
  )
  const guessParts = getTimeZoneParts(utcGuess, timeZone)
  const desiredMillis = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  )
  const actualMillis = Date.UTC(
    guessParts.year,
    guessParts.month - 1,
    guessParts.day,
    guessParts.hour,
    guessParts.minute,
    guessParts.second,
  )

  return new Date(utcGuess.getTime() + desiredMillis - actualMillis)
}

export async function getInstagramAdminSnapshot() {
  try {
    const settings = await ensureInstagramAutomationSettings()

    const [posts, eligibleProducts] = await Promise.all([
      prisma.instagramPost.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          product: { select: { id: true, name: true } },
          attempts: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.product.count({ where: { active: true, images: { isEmpty: false } } }),
    ])

    return {
      settings,
      posts,
      eligibleProducts,
    }
  } catch (error) {
    if (isMissingInstagramTableError(error)) {
      return {
        settings: getFallbackInstagramSettings(),
        posts: [],
        eligibleProducts: 0,
      }
    }

    throw error
  }
}
