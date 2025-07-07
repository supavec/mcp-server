import { beforeAll, afterAll, afterEach } from 'vitest'
import { setupServer } from 'msw/node'
import { handlers } from './mocks/handlers.js'
import { config } from 'dotenv'

// Load .env.local file for tests
config({ path: '.env.local' })

// Setup MSW server
export const server = setupServer(...handlers)

// Start server before all tests
beforeAll(() => {
  server.listen({ 
    onUnhandledRequest: (request) => {
      // Allow OpenAI API calls for E2E tests
      if (request.url.includes('openai.com')) {
        return
      }
      console.error('Unhandled request:', request.method, request.url)
    }
  })
})

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers()
})

// Clean up after all tests
afterAll(() => {
  server.close()
})