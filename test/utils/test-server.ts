import { createServer } from '../../src/utils/server.js'
import type { Server } from '@modelcontextprotocol/sdk/server/index.js'

export interface TestServerOptions {
  apiKey?: string
}

export class TestMCPServer {
  private server: Server
  private apiKey: string

  constructor(options: TestServerOptions = {}) {
    this.apiKey = options.apiKey || 'test-api-key'
    this.server = createServer(this.apiKey)
  }

  async start() {
    // Server is already configured in createServer
    return this.server
  }

  async stop() {
    // Cleanup if needed
  }

  getServer() {
    return this.server
  }

  getApiKey() {
    return this.apiKey
  }
}

export function createTestServer(options?: TestServerOptions) {
  return new TestMCPServer(options)
}