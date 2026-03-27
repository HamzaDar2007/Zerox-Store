import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

function renderWithRouter(ui: React.ReactElement, initialEntries = ['/']) {
  return render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>)
}

// We need to import dynamically since Breadcrumbs uses useLocation
import { Breadcrumbs } from '@/components/shared/breadcrumbs'

describe('Breadcrumbs', () => {
  it('renders nothing on root path', () => {
    const { container } = renderWithRouter(<Breadcrumbs />, ['/'])
    expect(container.querySelector('nav')).toBeNull()
  })

  it('renders breadcrumb for /users', () => {
    renderWithRouter(<Breadcrumbs />, ['/users'])
    expect(screen.getByText('Users')).toBeInTheDocument()
  })

  it('renders breadcrumb for /flash-sales', () => {
    renderWithRouter(<Breadcrumbs />, ['/flash-sales'])
    expect(screen.getByText('Flash sales')).toBeInTheDocument()
  })

  it('renders home icon link', () => {
    renderWithRouter(<Breadcrumbs />, ['/users'])
    const homeLink = screen.getByRole('navigation').querySelector('a[href="/"]')
    expect(homeLink).toBeInTheDocument()
  })

  it('renders last segment as non-link text', () => {
    renderWithRouter(<Breadcrumbs />, ['/settings'])
    const links = screen.getByRole('navigation').querySelectorAll('a')
    // Only home link, no link for "Settings" because it's the last segment
    expect(links.length).toBe(1)
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })
})
