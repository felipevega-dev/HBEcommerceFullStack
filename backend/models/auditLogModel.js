import mongoose from 'mongoose'

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    action: { type: String, required: true }, // e.g. 'CREATE', 'UPDATE', 'DELETE'
    resource: { type: String, required: true }, // e.g. 'product', 'order'
    resourceId: { type: String },
    changes: { type: Object },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true },
)

auditLogSchema.index({ userId: 1, createdAt: -1 })
auditLogSchema.index({ resource: 1, createdAt: -1 })

const AuditLogModel = mongoose.models.auditLog || mongoose.model('auditLog', auditLogSchema)

export default AuditLogModel
