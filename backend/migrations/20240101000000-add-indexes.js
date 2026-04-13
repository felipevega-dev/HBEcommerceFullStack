export const up = async (db) => {
  // Product indexes
  await db.collection('products').createIndex({ category: 1, subCategory: 1 })
  await db.collection('products').createIndex({ bestSeller: 1 })
  await db.collection('products').createIndex({ date: -1 })
  await db.collection('products').createIndex({ 'rating.average': -1 })

  // Order indexes
  await db.collection('orders').createIndex({ userId: 1, date: -1 })
  await db.collection('orders').createIndex({ status: 1 })

  // AuditLog indexes
  await db.collection('auditlogs').createIndex({ userId: 1, createdAt: -1 })
  await db.collection('auditlogs').createIndex({ resource: 1, createdAt: -1 })
}

export const down = async (db) => {
  await db.collection('products').dropIndex({ category: 1, subCategory: 1 })
  await db.collection('products').dropIndex({ bestSeller: 1 })
  await db.collection('products').dropIndex({ date: -1 })
  await db.collection('products').dropIndex({ 'rating.average': -1 })
  await db.collection('orders').dropIndex({ userId: 1, date: -1 })
  await db.collection('orders').dropIndex({ status: 1 })
}
