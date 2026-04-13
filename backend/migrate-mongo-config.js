import 'dotenv/config'

const config = {
  mongodb: {
    url: `${process.env.MONGO_URI}/Harrysboutique`,
    options: {},
  },
  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog',
  migrationFileExtension: '.js',
  useFileHash: false,
  moduleSystem: 'esm',
}

export default config
