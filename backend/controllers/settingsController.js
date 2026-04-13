import SettingsModel from '../models/settingsModel.js'

const DEFAULT_SETTINGS = [
  { key: 'store_name', value: "Harry's Boutique", description: 'Nombre de la tienda' },
  { key: 'shipping_fee', value: 10, description: 'Costo de envío base' },
  {
    key: 'free_shipping_threshold',
    value: 0,
    description: 'Monto mínimo para envío gratis (0 = desactivado)',
  },
  { key: 'currency', value: '$', description: 'Símbolo de moneda' },
  { key: 'max_billing_addresses', value: 2, description: 'Máximo de direcciones por usuario' },
]

export const getSettings = async (req, res, next) => {
  try {
    // Seed defaults if empty
    const count = await SettingsModel.countDocuments()
    if (count === 0) {
      await SettingsModel.insertMany(DEFAULT_SETTINGS)
    }

    const settings = await SettingsModel.find()
    const settingsMap = settings.reduce((acc, s) => {
      acc[s.key] = s.value
      return acc
    }, {})

    res.json({ success: true, settings: settingsMap })
  } catch (error) {
    next(error)
  }
}

export const updateSettings = async (req, res, next) => {
  try {
    const updates = req.body // { key: value, ... }

    const ops = Object.entries(updates).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: { $set: { value } },
        upsert: true,
      },
    }))

    await SettingsModel.bulkWrite(ops)

    const settings = await SettingsModel.find()
    const settingsMap = settings.reduce((acc, s) => {
      acc[s.key] = s.value
      return acc
    }, {})

    res.json({ success: true, message: 'Configuración actualizada', settings: settingsMap })
  } catch (error) {
    next(error)
  }
}
