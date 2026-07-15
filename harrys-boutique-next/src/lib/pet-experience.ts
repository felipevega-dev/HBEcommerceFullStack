import type { BrandIconName } from '@/components/ui/brand-icon'

export type StyleProfileId = 'street' | 'royal' | 'anime' | 'cozy' | 'explorer'

export interface StyleProfile {
  id: StyleProfileId
  name: string
  tagline: string
  description: string
  href: string
  accentClass: string
}

export interface StyleQuizOption {
  id: string
  label: string
  detail: string
  scores: Partial<Record<StyleProfileId, number>>
}

export interface StyleQuizQuestion {
  id: string
  eyebrow: string
  question: string
  options: StyleQuizOption[]
}

export interface OccasionShop {
  title: string
  description: string
  href: string
  icon: BrandIconName
}

export interface ExperienceCard {
  title: string
  eyebrow: string
  description: string
  href: string
  icon: BrandIconName
}

export interface CoCreatedDrop {
  id: string
  title: string
  fandom: string
  description: string
  goal: number
  votes: number
  accent: string
  icon: BrandIconName
}

export interface CommunityChallenge {
  title: string
  prompt: string
  reward: string
  metric: string
  icon: BrandIconName
}

export interface ClubTier {
  name: string
  price: string
  description: string
  perks: string[]
  highlight: string
  icon: BrandIconName
}

export interface LoyaltyMission {
  id: string
  title: string
  description: string
  reward: number
  href: string
  icon: BrandIconName
}

export interface LoyaltyTier {
  name: string
  minCoins: number
  nextCoins: number
}

export const STYLE_QUIZ_RESULT_STORAGE_KEY = 'harrys-style-quiz-result'
export const CO_CREATED_DROP_VOTE_STORAGE_KEY = 'harrys-co-created-drop-vote'

export const STYLE_PROFILES: Record<StyleProfileId, StyleProfile> = {
  street: {
    id: 'street',
    name: 'Street Royal',
    tagline: 'Actitud de paseo, foto lista para redes.',
    description:
      'Looks urbanos, contrastes fuertes, polerones, accesorios con nombre y piezas que se sienten como drop limitado.',
    href: '/tienda?search=streetwear',
    accentClass: 'bg-black text-white',
  },
  royal: {
    id: 'royal',
    name: 'Mini Royal',
    tagline: 'Elegancia dulce para mascotas que se saben protagonistas.',
    description:
      'Vestidos, tonos suaves, detalles brillantes y conjuntos pensados para fotos familiares, cumpleanos y celebraciones.',
    href: '/tienda?subCategory=Vestidos',
    accentClass: 'bg-[var(--color-accent)] text-white',
  },
  anime: {
    id: 'anime',
    name: 'Anime Cozy',
    tagline: 'Tierno, expresivo y un poco dramatico.',
    description:
      'Prendas comodas con energia kawaii, colores expresivos y potencial para challenges, reels y matching con fandoms.',
    href: '/tienda?search=anime',
    accentClass: 'bg-[#4a6fa5] text-white',
  },
  cozy: {
    id: 'cozy',
    name: 'Soft Cozy',
    tagline: 'Comodidad premium para quedarse mirando.',
    description:
      'Texturas suaves, calces relajados y prendas faciles de usar todos los dias sin perder estilo.',
    href: '/tienda?subCategory=Polerones',
    accentClass: 'bg-[var(--color-gold)] text-white',
  },
  explorer: {
    id: 'explorer',
    name: 'Explorer Chic',
    tagline: 'Para mascotas de paseo largo, viaje y aventura.',
    description:
      'Capas practicas, accesorios resistentes y looks pensados para lluvia, ruta, plaza y escapadas de fin de semana.',
    href: '/tienda?search=viaje',
    accentClass: 'bg-[#4a7c59] text-white',
  },
}

export const STYLE_QUIZ_QUESTIONS: StyleQuizQuestion[] = [
  {
    id: 'personality',
    eyebrow: 'Personalidad',
    question: 'Cuando entra a una pieza, tu mascota normalmente...',
    options: [
      {
        id: 'boss',
        label: 'Llega como celebridad',
        detail: 'Quiere mirada, camara y atencion.',
        scores: { street: 2, royal: 2 },
      },
      {
        id: 'soft',
        label: 'Busca comodidad',
        detail: 'Prefiere calma, regaloneo y telas suaves.',
        scores: { cozy: 3, royal: 1 },
      },
      {
        id: 'chaos',
        label: 'Viene con energia',
        detail: 'Corre, explora y siempre esta inventando algo.',
        scores: { explorer: 3, anime: 1 },
      },
    ],
  },
  {
    id: 'moment',
    eyebrow: 'Momento',
    question: 'Que plan te gustaria vestir mejor?',
    options: [
      {
        id: 'photos',
        label: 'Fotos y celebraciones',
        detail: 'Cumpleanos, visitas, domingos familiares.',
        scores: { royal: 3, anime: 1 },
      },
      {
        id: 'daily',
        label: 'Uso diario con estilo',
        detail: 'Salir, pasear y verse bien sin esfuerzo.',
        scores: { cozy: 2, street: 2 },
      },
      {
        id: 'outside',
        label: 'Paseos y viajes',
        detail: 'Ruta, plaza, lluvia y aventura.',
        scores: { explorer: 3, street: 1 },
      },
    ],
  },
  {
    id: 'visual',
    eyebrow: 'Vibe',
    question: 'Que energia quieres que comunique el look?',
    options: [
      {
        id: 'limited',
        label: 'Drop exclusivo',
        detail: 'Algo que parezca dificil de conseguir.',
        scores: { street: 3, explorer: 1 },
      },
      {
        id: 'cute',
        label: 'Ternura viral',
        detail: 'El tipo de foto que todos quieren guardar.',
        scores: { anime: 3, cozy: 1 },
      },
      {
        id: 'premium',
        label: 'Premium delicado',
        detail: 'Elegante, limpio y con identidad de boutique.',
        scores: { royal: 3, cozy: 1 },
      },
    ],
  },
]

export const OCCASION_SHOPS: OccasionShop[] = [
  {
    title: 'Cumpleanos',
    description: 'Looks, accesorios y caja sorpresa para celebrar como evento familiar.',
    href: '/experiencias#birthday',
    icon: 'gift',
  },
  {
    title: 'Lluvia y frio',
    description: 'Capas comodas, polerones y prendas para salir sin perder estilo.',
    href: '/tienda?search=invierno',
    icon: 'shipping',
  },
  {
    title: 'Foto familiar',
    description: 'Prendas mas elegantes, matching fits y tonos faciles de combinar.',
    href: '/tienda?search=foto',
    icon: 'camera',
  },
  {
    title: 'Primer paseo',
    description: 'Kits de bienvenida para mascotas nuevas y familias primerizas.',
    href: '/experiencias#adoption',
    icon: 'paw',
  },
  {
    title: 'Streetwear pet',
    description: 'Piezas urbanas, nombres bordados y actitud de drop limitado.',
    href: '/tienda?search=streetwear',
    icon: 'shirt',
  },
  {
    title: 'Viaje y aventura',
    description: 'Looks practicos para moverse, explorar y aparecer perfecto en ruta.',
    href: '/tienda?search=viaje',
    icon: 'location',
  },
]

export const EXPERIENCE_CARDS: ExperienceCard[] = [
  {
    eyebrow: 'Personalizacion',
    title: "Harry's Atelier",
    description: 'Bordados con nombre, frases cortas, ajustes y combinaciones por encargo.',
    href: '/experiencias#atelier',
    icon: 'design',
  },
  {
    eyebrow: 'FOMO',
    title: 'Pet Drops',
    description: 'Lanzamientos limitados con preventa, contador y acceso anticipado para clientes.',
    href: '/experiencias#drops',
    icon: 'sparkles',
  },
  {
    eyebrow: 'Comunidad',
    title: '#HarrysFitCheck',
    description: 'Campanas para subir fotos, participar en desafios y aparecer en la web.',
    href: '/experiencias#ugc',
    icon: 'camera',
  },
  {
    eyebrow: 'Recurrencia',
    title: "Club Harry's",
    description: 'Cumpleanos, puntos, acceso anticipado, cajas trimestrales y regalos sorpresa.',
    href: '/experiencias#club',
    icon: 'star',
  },
]

export const CO_CREATED_DROPS: CoCreatedDrop[] = [
  {
    id: 'neo-tokyo-rain',
    title: 'Neo Tokyo Rain',
    fandom: 'anime + lluvia',
    description: 'Capa liviana, detalles reflectantes y parche bordado para mascotas dramaticas.',
    goal: 80,
    votes: 57,
    accent: 'bg-[#4a6fa5] text-white',
    icon: 'shipping',
  },
  {
    id: 'pixel-arcade',
    title: 'Pixel Arcade',
    fandom: 'gaming + streetwear',
    description: 'Poleron gamer con bloques de color, nombre bordado y charm coleccionable.',
    goal: 70,
    votes: 49,
    accent: 'bg-[#181513] text-white',
    icon: 'toy',
  },
  {
    id: 'soft-idol',
    title: 'Soft Idol',
    fandom: 'k-pop + cozy',
    description: 'Set suave con accesorios de foto, tonos limpios y energia de fan meeting.',
    goal: 60,
    votes: 44,
    accent: 'bg-[var(--color-accent)] text-white',
    icon: 'sparkles',
  },
]

export const COMMUNITY_CHALLENGES: CommunityChallenge[] = [
  {
    title: 'Mascota del Mes',
    prompt: 'Sube el mejor look, etiqueta a la tienda y junta votos de tu comunidad.',
    reward: "Bordado gratis + portada en Harry's World",
    metric: 'Top 12 looks',
    icon: 'star',
  },
  {
    title: 'Matching Domingo',
    prompt: 'Dueno y mascota con una paleta parecida, un paseo real y una foto vertical.',
    reward: 'Acceso anticipado al proximo drop',
    metric: '7 dias',
    icon: 'camera',
  },
  {
    title: 'Unboxing Ritual',
    prompt: 'Graba la reaccion, muestra la tarjeta y termina con un fit check.',
    reward: 'HarryCoins extra en la siguiente fase',
    metric: 'Reels/TikTok',
    icon: 'gift',
  },
]

export const CLUB_TIERS: ClubTier[] = [
  {
    name: 'Club Mini',
    price: 'Gratis',
    description: 'Para clientes que quieren volver por drops, misiones y cumpleanos.',
    perks: ['HarryCoins', 'alertas de drop', 'recordatorio de cumpleanos'],
    highlight: 'Entrada a comunidad',
    icon: 'paw',
  },
  {
    name: 'Club Muse',
    price: 'Trimestral',
    description: 'Caja sorpresa curada por personalidad con acceso anticipado.',
    perks: ['box de temporada', 'bordado preferente', 'puntos dobles'],
    highlight: 'Mayor recurrencia',
    icon: 'sparkles',
  },
  {
    name: 'Club Legend',
    price: 'Premium',
    description: 'Experiencia personalizada con atelier, regalos y prioridad en limitados.',
    perks: ['atelier express', 'regalo cumpleanos', 'drops reservados'],
    highlight: 'Estatus y exclusividad',
    icon: 'star',
  },
]

export const HARRYS_LOYALTY_MISSIONS: LoyaltyMission[] = [
  {
    id: 'pet-passport',
    title: 'Completa el Pasaporte',
    description: 'Agrega nombre, especie y talla de tu mascota.',
    reward: 80,
    href: '/profile',
    icon: 'paw',
  },
  {
    id: 'birthday',
    title: 'Agenda su cumpleanos',
    description: 'Desbloquea recordatorio para birthday box y regalos.',
    reward: 60,
    href: '/profile',
    icon: 'gift',
  },
  {
    id: 'style-quiz',
    title: 'Descubre su estilo',
    description: 'Completa el quiz y guarda una personalidad de look.',
    reward: 70,
    href: '/experiencias#quiz',
    icon: 'sparkles',
  },
  {
    id: 'profile-photo',
    title: 'Sube foto de perfil',
    description: 'Haz que tu cuenta se sienta parte de la comunidad.',
    reward: 40,
    href: '/profile',
    icon: 'camera',
  },
  {
    id: 'shipping-ready',
    title: 'Deja su envio listo',
    description: 'Guarda una direccion para drops y preventas rapidas.',
    reward: 40,
    href: '/profile',
    icon: 'shipping',
  },
  {
    id: 'fit-check',
    title: 'Prepara un Fit Check',
    description: 'Participa en la campana social #HarrysFitCheck.',
    reward: 120,
    href: '/experiencias#ugc',
    icon: 'star',
  },
]

export const HARRYS_LOYALTY_TIERS: LoyaltyTier[] = [
  { name: 'Fan', minCoins: 0, nextCoins: 120 },
  { name: 'Muse', minCoins: 120, nextCoins: 260 },
  { name: 'Icon', minCoins: 260, nextCoins: 420 },
  { name: 'Legend', minCoins: 420, nextCoins: 420 },
]

export function getStyleProfile(optionIds: string[]) {
  const scores: Record<StyleProfileId, number> = {
    street: 0,
    royal: 0,
    anime: 0,
    cozy: 0,
    explorer: 0,
  }

  STYLE_QUIZ_QUESTIONS.forEach((question) => {
    const selected = question.options.find((option) => optionIds.includes(option.id))
    if (!selected) return

    Object.entries(selected.scores).forEach(([profileId, score]) => {
      scores[profileId as StyleProfileId] += score ?? 0
    })
  })

  const [winner] = Object.entries(scores).sort((a, b) => b[1] - a[1])
  return STYLE_PROFILES[(winner?.[0] as StyleProfileId | undefined) ?? 'street']
}

export function getLoyaltySummary(completedMissionIds: string[]) {
  const completed = new Set(completedMissionIds)
  const coins = HARRYS_LOYALTY_MISSIONS.reduce(
    (total, mission) => total + (completed.has(mission.id) ? mission.reward : 0),
    0,
  )
  const tier =
    HARRYS_LOYALTY_TIERS.findLast((item) => coins >= item.minCoins) ?? HARRYS_LOYALTY_TIERS[0]
  const nextTier =
    HARRYS_LOYALTY_TIERS.find((item) => item.minCoins > coins) ??
    HARRYS_LOYALTY_TIERS[HARRYS_LOYALTY_TIERS.length - 1]
  const nextMission = HARRYS_LOYALTY_MISSIONS.find((mission) => !completed.has(mission.id)) ?? null
  const progressTarget = Math.max(tier.nextCoins, 1)
  const progress =
    tier.nextCoins === tier.minCoins ? 100 : Math.min(100, (coins / progressTarget) * 100)

  return {
    coins,
    tier,
    nextTier,
    nextMission,
    completedCount: completed.size,
    totalCount: HARRYS_LOYALTY_MISSIONS.length,
    progress: Math.round(progress),
  }
}
