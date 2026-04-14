import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import Sidebar from '../components/Sidebar'

const renderSidebar = (initialPath = '/list') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Sidebar />
    </MemoryRouter>,
  )

describe('Sidebar', () => {
  it('muestra las etiquetas en español', () => {
    renderSidebar()
    expect(screen.getByText('Agregar Producto')).toBeInTheDocument()
    expect(screen.getByText('Productos')).toBeInTheDocument()
    expect(screen.getByText('Hero Slides')).toBeInTheDocument()
    expect(screen.getByText('Órdenes')).toBeInTheDocument()
    expect(screen.getByText('Configuración')).toBeInTheDocument()
  })

  it('no muestra etiquetas en inglés', () => {
    renderSidebar()
    expect(screen.queryByText('Add Items')).not.toBeInTheDocument()
    expect(screen.queryByText('List Items')).not.toBeInTheDocument()
    expect(screen.queryByText('Orders')).not.toBeInTheDocument()
    expect(screen.queryByText('Settings')).not.toBeInTheDocument()
  })

  it('aplica estilo activo al ítem de la ruta actual', () => {
    renderSidebar('/list')
    const productosLink = screen.getByText('Productos').closest('a')
    expect(productosLink).toHaveClass('bg-[#f0e0e0]')
    expect(productosLink).toHaveClass('text-[#a07070]')
  })

  it('renderiza 5 ítems de navegación', () => {
    renderSidebar()
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(5)
  })
})
