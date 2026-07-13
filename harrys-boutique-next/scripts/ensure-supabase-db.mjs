const requiredVariables = ['DATABASE_URL', 'DIRECT_URL']

function readPostgresUrl(name) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is not configured`)
  }

  let url
  try {
    url = new URL(value)
  } catch {
    throw new Error(`${name} must be a valid PostgreSQL connection URL`)
  }

  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    throw new Error(`${name} must use the postgres:// or postgresql:// protocol`)
  }

  const directMatch = url.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/i)
  if (directMatch) {
    return { projectRef: directMatch[1].toLowerCase(), url }
  }

  if (url.hostname.endsWith('.pooler.supabase.com')) {
    const poolerUserMatch = url.username.match(/^postgres\.([a-z0-9]+)$/i)
    if (poolerUserMatch) {
      return { projectRef: poolerUserMatch[1].toLowerCase(), url }
    }

    throw new Error(`${name} must use the Supabase pooler username postgres.<project-ref>`)
  }

  throw new Error(
    `${name} must point to a Supabase direct or pooler connection. Local Docker databases are not supported by this project.`,
  )
}

try {
  const databaseUrls = requiredVariables.map((name) => [name, readPostgresUrl(name)])
  const projectRefs = new Set(databaseUrls.map(([, connection]) => connection.projectRef))

  if (projectRefs.size > 1) {
    throw new Error('DATABASE_URL and DIRECT_URL must target the same Supabase project')
  }

  console.log(`Using Supabase database (${databaseUrls[0][1].projectRef})`)
} catch (error) {
  console.error('Unable to start development with Supabase.')
  console.error(error instanceof Error ? error.message : error)
  console.error(
    'Configure DATABASE_URL and DIRECT_URL in .env.local with a non-production Supabase project or branch connection.',
  )
  process.exit(1)
}
