import { http, HttpResponse } from 'msw'

const API = 'http://localhost:3001'

export const mockUser = {
  id: '1',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: { id: '1', name: 'super-admin' },
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

/** Wrap response in backend envelope format */
function envelope(data: unknown) {
  return { success: true, message: 'Operation successful', data, timestamp: new Date().toISOString() }
}

export const handlers = [
  http.post(`${API}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string }
    if (body?.email === 'admin@example.com' && body?.password === 'password123') {
      return HttpResponse.json(envelope({
        user: mockUser,
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      }))
    }
    return HttpResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
  }),

  http.get(`${API}/users`, () => {
    return HttpResponse.json(envelope([mockUser]))
  }),

  http.get(`${API}/users/:id`, () => {
    return HttpResponse.json(envelope(mockUser))
  }),

  http.get(`${API}/dashboard/stats`, () => {
    return HttpResponse.json(envelope({
      totalUsers: 150,
      totalOrders: 1200,
      totalRevenue: 55000,
      totalProducts: 340,
    }))
  }),
]
