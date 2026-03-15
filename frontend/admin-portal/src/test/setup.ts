import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

function envelope(data: unknown) {
  return { success: true, message: 'Operation successful', data, timestamp: new Date().toISOString() }
}

// Default handlers return empty data so tests don't hang on unhandled requests
export const server = setupServer(
  http.post('http://localhost:3001/auth/login', () => HttpResponse.json(envelope({ accessToken: 'test', refreshToken: 'test', user: { id: '1', email: 'a@b.c', firstName: 'Test', lastName: 'User', isActive: true, isEmailVerified: true, createdAt: '', updatedAt: '' } }))),
  http.get('http://localhost:3001/users', () => HttpResponse.json(envelope([]))),
  http.get('http://localhost:3001/orders', () => HttpResponse.json(envelope([]))),
  http.get('http://localhost:3001/products', () => HttpResponse.json(envelope([]))),
  http.get('http://localhost:3001/reviews', () => HttpResponse.json(envelope([]))),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
