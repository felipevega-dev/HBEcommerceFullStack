import { execSync } from 'node:child_process'

function run(command, options = {}) {
  try {
    execSync(command, { stdio: options.silent ? 'pipe' : 'inherit' })
    return true
  } catch {
    return false
  }
}

function containerStatus(name) {
  try {
    return execSync(`docker inspect -f "{{.State.Status}}" ${name}`, {
      encoding: 'utf8',
    }).trim()
  } catch {
    return null
  }
}

const legacyContainer = 'harrys-postgres'
const status = containerStatus(legacyContainer)

if (status === 'running') {
  console.log(`PostgreSQL already running (${legacyContainer})`)
  process.exit(0)
}

if (status === 'exited' || status === 'created') {
  console.log(`Starting existing container ${legacyContainer}...`)
  if (!run(`docker start ${legacyContainer}`)) {
    process.exit(1)
  }
  process.exit(0)
}

console.log('Starting PostgreSQL with Docker Compose...')
if (run('docker compose up -d db')) {
  process.exit(0)
}

const composeStatus = containerStatus(legacyContainer)
if (composeStatus) {
  console.log(`Removing orphaned container ${legacyContainer} and retrying...`)
  run(`docker rm -f ${legacyContainer}`)
  if (!run('docker compose up -d db')) {
    process.exit(1)
  }
  process.exit(0)
}

process.exit(1)
