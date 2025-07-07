import { describe, it, expect, beforeEach } from 'vitest'
import { createTestServer } from '../utils/test-server.js'
import { tools } from '../../src/tools/index.js'
import type { 
  ListToolsRequest, 
  CallToolRequest, 
  ListToolsResult, 
  CallToolResult 
} from '@modelcontextprotocol/sdk/types.js'

describe('Tools Integration Tests', () => {
  let testServer: any

  beforeEach(async () => {
    testServer = createTestServer()
    await testServer.start()
  })

  describe('Tool Registration', () => {
    it('should register all expected tools', async () => {
      const server = testServer.getServer()
      const request: ListToolsRequest = {
        method: 'tools/list',
        params: {}
      }

      const response = await server.request(request) as ListToolsResult
      
      expect(response.tools).toBeDefined()
      expect(response.tools).toHaveLength(2)
      
      const toolNames = response.tools.map(tool => tool.name)
      expect(toolNames).toContain('fetch-embeddings')
      expect(toolNames).toContain('list-user-files')
    })

    it('should have correct tool schemas', async () => {
      const server = testServer.getServer()
      const request: ListToolsRequest = {
        method: 'tools/list',
        params: {}
      }

      const response = await server.request(request) as ListToolsResult
      
      const fetchEmbeddingsTool = response.tools.find(tool => tool.name === 'fetch-embeddings')
      expect(fetchEmbeddingsTool).toBeDefined()
      expect(fetchEmbeddingsTool!.inputSchema.properties).toHaveProperty('file_id')
      expect(fetchEmbeddingsTool!.inputSchema.properties).toHaveProperty('query')
      expect(fetchEmbeddingsTool!.inputSchema.required).toEqual(['file_id', 'query'])

      const listUserFilesTool = response.tools.find(tool => tool.name === 'list-user-files')
      expect(listUserFilesTool).toBeDefined()
      expect(listUserFilesTool!.inputSchema.properties).toHaveProperty('limit')
      expect(listUserFilesTool!.inputSchema.properties).toHaveProperty('offset')
      expect(listUserFilesTool!.inputSchema.properties).toHaveProperty('order_dir')
    })
  })

  describe('Tool Execution', () => {
    it('should execute fetch-embeddings tool successfully', async () => {
      const server = testServer.getServer()
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'fetch-embeddings',
          arguments: {
            file_id: 'file-123',
            query: 'machine learning'
          }
        }
      }

      const response = await server.request(request) as CallToolResult
      
      expect(response.content).toBeDefined()
      expect(response.content).toHaveLength(1)
      expect(response.content[0].type).toBe('text')
      expect(response.content[0].mimeType).toBe('application/json')
      
      const content = JSON.parse(response.content[0].text)
      expect(content).toContain('machine learning')
    })

    it('should execute list-user-files tool successfully', async () => {
      const server = testServer.getServer()
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'list-user-files',
          arguments: {
            limit: 5,
            offset: 0,
            order_dir: 'desc'
          }
        }
      }

      const response = await server.request(request) as CallToolResult
      
      expect(response.content).toBeDefined()
      expect(response.content).toHaveLength(1)
      expect(response.content[0].type).toBe('text')
      expect(response.content[0].mimeType).toBe('application/json')
      
      const content = JSON.parse(response.content[0].text)
      expect(content).toHaveProperty('success')
      expect(content).toHaveProperty('results')
      expect(content).toHaveProperty('pagination')
      expect(content).toHaveProperty('count')
    })

    it('should handle authentication errors', async () => {
      const unauthorizedServer = createTestServer({ apiKey: 'invalid-key' })
      await unauthorizedServer.start()
      
      const server = unauthorizedServer.getServer()
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'fetch-embeddings',
          arguments: {
            file_id: 'file-123',
            query: 'test'
          }
        }
      }

      const response = await server.request(request) as CallToolResult
      
      expect(response.content).toBeDefined()
      expect(response.content[0].text).toContain('Authentication failed')
    })

    it('should handle tool not found error', async () => {
      const server = testServer.getServer()
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'non-existent-tool',
          arguments: {}
        }
      }

      await expect(server.request(request)).rejects.toThrow('Tool not found')
    })
  })
})