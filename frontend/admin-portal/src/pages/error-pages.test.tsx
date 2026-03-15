import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

describe('UnauthorizedPage', () => {
  it('renders 401 page', async () => {
    const { default: UnauthorizedPage } = await import('@/pages/unauthorized')
    render(<MemoryRouter><UnauthorizedPage /></MemoryRouter>)
    expect(screen.getByText('401')).toBeInTheDocument()
    expect(screen.getByText('Unauthorized')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go to Login' })).toHaveAttribute('href', '/login')
  })
})

describe('ForbiddenPage', () => {
  it('renders 403 page', async () => {
    const { default: ForbiddenPage } = await import('@/pages/forbidden')
    render(<MemoryRouter><ForbiddenPage /></MemoryRouter>)
    expect(screen.getByText('403')).toBeInTheDocument()
    expect(screen.getByText('Forbidden')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to Dashboard' })).toHaveAttribute('href', '/')
  })
})
