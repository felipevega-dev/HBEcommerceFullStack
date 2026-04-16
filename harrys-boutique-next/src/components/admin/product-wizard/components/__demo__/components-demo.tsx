'use client'

import { useState } from 'react'
import { Tooltip } from '../tooltip'
import { CharacterCounter } from '../character-counter'

/**
 * Demo page for Tooltip and CharacterCounter components
 * 
 * This is a visual test page to verify the components work correctly.
 * Not meant for production use.
 */
export function ComponentsDemo() {
  const [nameValue, setNameValue] = useState('')
  const [descriptionValue, setDescriptionValue] = useState('')

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Product Wizard Components Demo</h1>
          <p className="text-gray-600">Visual test page for Tooltip and CharacterCounter components</p>
        </div>

        {/* Tooltip Demo */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold">Tooltip Component</h2>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">Basic tooltip</span>
              <Tooltip content="This is a basic tooltip with helpful information" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm">Long content tooltip</span>
              <Tooltip content="Describí las características principales: material, tamaño, para qué mascota es. Incluí detalles que ayuden a los clientes a tomar una decisión de compra." />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm">Custom aria-label</span>
              <Tooltip 
                content="El precio que verán tus clientes en la tienda"
                ariaLabel="Ayuda sobre precio de venta"
              />
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
            <strong>Tip:</strong> Hover over the info icons to see the tooltips. They auto-hide after 5 seconds.
          </div>
        </div>

        {/* CharacterCounter Demo */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold">CharacterCounter Component</h2>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center text-sm font-medium mb-2">
                Product Name (100 chars max)
                <Tooltip content="Elegí un nombre descriptivo que incluya el tipo de producto" />
              </label>
              <input
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value.slice(0, 100))}
                placeholder="Ej: Collar para Perro Ajustable"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
              />
              <CharacterCounter current={nameValue.length} max={100} className="mt-1" />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium mb-2">
                Description (500 chars max)
                <Tooltip content="Describí las características principales del producto" />
              </label>
              <textarea
                value={descriptionValue}
                onChange={(e) => setDescriptionValue(e.target.value.slice(0, 500))}
                placeholder="Describe tu producto aquí..."
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
              />
              <CharacterCounter current={descriptionValue.length} max={500} className="mt-1" />
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800 space-y-2">
            <p><strong>Color States:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li><span className="text-gray-400">Gray</span>: Normal (below 90%)</li>
              <li><span className="text-amber-600">Amber</span>: Approaching limit (90-100%)</li>
              <li><span className="text-red-600">Red</span>: Over limit (&gt;100%)</li>
            </ul>
          </div>
        </div>

        {/* Static Examples */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold">CharacterCounter States</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm">Normal state (50/100)</span>
              <CharacterCounter current={50} max={100} />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm">Approaching limit (90/100)</span>
              <CharacterCounter current={90} max={100} />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm">At limit (100/100)</span>
              <CharacterCounter current={100} max={100} />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm">Over limit (105/100)</span>
              <CharacterCounter current={105} max={100} />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm">Custom threshold 80% (85/100)</span>
              <CharacterCounter current={85} max={100} warningThreshold={0.8} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
