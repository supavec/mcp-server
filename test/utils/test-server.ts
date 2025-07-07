import { createServer } from '../../src/utils/server.js'
import type { Server } from '@modelcontextprotocol/sdk/server/index.js'
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js'

export interface TestServerOptions {
  apiKey?: string
}

// Simple in-memory transport for testing
class TestTransport implements Transport {
  async start() {
    // No-op for testing
  }

  async send(message: any) {
    // No-op for testing - we'll call handlers directly
  }

  async close() {
    // No-op for testing
  }
}

export class TestMCPServer {
  private server: Server
  private apiKey: string
  private transport: TestTransport

  constructor(options: TestServerOptions = {}) {
    this.apiKey = options.apiKey || 'test-api-key'
    this.server = createServer(this.apiKey)
    this.transport = new TestTransport()
  }

  async start() {
    // Connect the server with our test transport
    await this.server.connect(this.transport)
    return this.server
  }

  async stop() {
    await this.server.close()
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