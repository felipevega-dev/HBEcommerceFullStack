export const up = async (db) => {
  // Add role field to all existing users that don't have it
  await db.collection('users').updateMany({ role: { $exists: false } }, { $set: { role: 'USER' } })
}

export const down = async (db) => {
  await db.collection('users').updateMany({}, { $unset: { role: '' } })
}
