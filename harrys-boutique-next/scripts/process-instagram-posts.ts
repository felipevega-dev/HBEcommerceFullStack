import { processDueInstagramPosts } from '@/lib/instagram-automation'

async function main() {
  const results = await processDueInstagramPosts()

  if (results.length === 0) {
    console.log('[instagram-worker] No hay publicaciones pendientes para procesar')
    return
  }

  console.log(`[instagram-worker] Procesadas ${results.length} publicación(es)`)

  for (const post of results) {
    console.log(
      JSON.stringify({
        id: post.id,
        status: post.status,
        publishedAt: post.publishedAt,
        mediaId: post.instagramMediaId,
      }),
    )
  }
}

main().catch((error) => {
  console.error('[instagram-worker] Error al procesar publicaciones', error)
  process.exit(1)
})
