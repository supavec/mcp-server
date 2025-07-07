import { describe, it, expect, beforeEach } from 'vitest'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { createTestServer } from '../utils/test-server.js'
import { validateToolCall, validateResponseContent } from '../utils/matchers.js'
import type { Server } from '@modelcontextprotocol/sdk/server/index.js'

describe('Embeddings E2E Tests', () => {
  let testServer: any
  let server: Server

  beforeEach(async () => {
    testServer = createTestServer()
    server = await testServer.start()
  })

  it('should use fetch-embeddings tool to retrieve relevant content', async () => {
    // Skip if no OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.log('Skipping E2E test: OPENAI_API_KEY not set')
      return
    }

    const toolCalls: any[] = []
    
    const result = await generateText({
      model: openai('gpt-4-turbo'),
      prompt: 'I need to find information about machine learning from file-123. Can you help me retrieve relevant content?',
      tools: {
        'fetch-embeddings': {
          description: 'Fetch embeddings for a file by ID and query',
          parameters: {
            type: 'object',
            properties: {
              file_id: {
                type: 'string',
                description: 'ID of the file to get embeddings for'
              },
              query: {
                type: 'string',
                description: 'Query to search for in the file'
              }
            },
            required: ['file_id', 'query']
          },
          execute: async ({ file_id, query }) => {
            const toolCall = { toolName: 'fetch-embeddings', parameters: { file_id, query } }
            toolCalls.push(toolCall)
            
            // Simulate tool execution through our MCP server
            const response = await server.request({
              method: 'tools/call',
              params: {
                name: 'fetch-embeddings',
                arguments: { file_id, query }
              }
            }) as any
            
            return response.content[0].text
          }
        }
      },
      maxTokens: 500
    })

    // Validate that the AI used the tool
    expect(toolCalls).toHaveLength(1)
    
    const toolCall = toolCalls[0]
    validateToolCall(toolCall, 'fetch-embeddings')
    expect(toolCall.parameters.file_id).toBe('file-123')
    expect(toolCall.parameters.query).toContain('machine learning')
    
    // Validate response content
    validateResponseContent(result.text, 'text')
    expect(result.text).toContain('machine learning')
  })

  it('should handle file not found scenarios gracefully', async () => {
    // Skip if no OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.log('Skipping E2E test: OPENAI_API_KEY not set')
      return
    }

    const toolCalls: any[] = []
    
    const result = await generateText({
      model: openai('gpt-4-turbo'),
      prompt: 'Can you get information from file-not-found?',
      tools: {
        'fetch-embeddings': {
          description: 'Fetch embeddings for a file by ID and query',
          parameters: {
            type: 'object',
            properties: {
              file_id: {
                type: 'string',
                description: 'ID of the file to get embeddings for'
              },
              query: {
                type: 'string',
                description: 'Query to search for in the file'
              }
            },
            required: ['file_id', 'query']
          },
          execute: async ({ file_id, query }) => {
            const toolCall = { toolName: 'fetch-embeddings', parameters: { file_id, query } }
            toolCalls.push(toolCall)
            
            // Simulate tool execution through our MCP server
            const response = await server.request({
              method: 'tools/call',
              params: {
                name: 'fetch-embeddings',
                arguments: { file_id, query }
              }
            }) as any
            
            return response.content[0].text
          }
        }
      },
      maxTokens: 500
    })

    // Validate that the AI attempted to use the tool
    expect(toolCalls).toHaveLength(1)
    
    const toolCall = toolCalls[0]
    validateToolCall(toolCall, 'fetch-embeddings')
    expect(toolCall.parameters.file_id).toBe('file-not-found')
    
    // Validate that AI handled the error gracefully
    expect(result.text.toLowerCase()).toMatch(/not found|error|unable|couldn't/)
  })

  it('should use appropriate queries for different content types', async () => {
    // Skip if no OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.log('Skipping E2E test: OPENAI_API_KEY not set')
      return
    }

    const toolCalls: any[] = []
    
    const result = await generateText({
      model: openai('gpt-4-turbo'),
      prompt: 'I need to find technical documentation about transformer architectures and attention mechanisms from file-123.',
      tools: {
        'fetch-embeddings': {
          description: 'Fetch embeddings for a file by ID and query',
          parameters: {
            type: 'object',
            properties: {
              file_id: {
                type: 'string',
                description: 'ID of the file to get embeddings for'
              },
              query: {
                type: 'string',
                description: 'Query to search for in the file'
              }
            },
            required: ['file_id', 'query']
          },
          execute: async ({ file_id, query }) => {
            const toolCall = { toolName: 'fetch-embeddings', parameters: { file_id, query } }
            toolCalls.push(toolCall)
            
            // Simulate tool execution through our MCP server
            const response = await server.request({
              method: 'tools/call',
              params: {
                name: 'fetch-embeddings',
                arguments: { file_id, query }
              }
            }) as any
            
            return response.content[0].text
          }
        }
      },
      maxTokens: 500
    })

    // Validate that the AI used an appropriate query
    expect(toolCalls).toHaveLength(1)
    
    const toolCall = toolCalls[0]
    validateToolCall(toolCall, 'fetch-embeddings')
    expect(toolCall.parameters.file_id).toBe('file-123')
    
    const query = toolCall.parameters.query.toLowerCase()
    expect(query).toMatch(/transformer|attention|architecture|mechanism/)
    
    // Validate response mentions the requested content
    expect(result.text.toLowerCase()).toMatch(/transformer|attention/)
  })
})