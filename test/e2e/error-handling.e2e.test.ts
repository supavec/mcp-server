import { describe, it, expect, beforeEach } from 'vitest'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { createTestServer } from '../utils/test-server.js'
import { validateToolCall, validateResponseContent } from '../utils/matchers.js'
import type { Server } from '@modelcontextprotocol/sdk/server/index.js'

describe('Error Handling E2E Tests', () => {
  let testServer: any
  let server: Server

  beforeEach(async () => {
    testServer = createTestServer()
    server = await testServer.start()
  })

  it('should handle authentication errors gracefully', async () => {
    // Skip if no OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.log('Skipping E2E test: OPENAI_API_KEY not set')
      return
    }

    // Create server with invalid API key
    const unauthorizedServer = createTestServer({ apiKey: 'invalid-key' })
    const unauthorizedMcpServer = await unauthorizedServer.start()

    const toolCalls: any[] = []
    
    const result = await generateText({
      model: openai('gpt-4-turbo'),
      prompt: 'Can you list my files?',
      tools: {
        'list-user-files': {
          description: 'List all files uploaded to Supavec for the current user',
          parameters: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Number of files to fetch (default: 10)'
              },
              offset: {
                type: 'number',
                description: 'Offset for pagination (default: 0)'
              },
              order_dir: {
                type: 'string',
                description: 'Order direction for results',
                enum: ['desc', 'asc']
              }
            },
            required: []
          },
          execute: async ({ limit, offset, order_dir }) => {
            const toolCall = { toolName: 'list-user-files', parameters: { limit, offset, order_dir } }
            toolCalls.push(toolCall)
            
            // Simulate tool execution through our MCP server with invalid key
            const response = await unauthorizedMcpServer.request({
              method: 'tools/call',
              params: {
                name: 'list-user-files',
                arguments: { limit, offset, order_dir }
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
    validateToolCall(toolCall, 'list-user-files')
    
    // Validate that AI handled authentication error gracefully
    expect(result.text.toLowerCase()).toMatch(/authentication|unauthorized|invalid|api key|error/)
  })

  it('should handle API errors with helpful messages', async () => {
    // Skip if no OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.log('Skipping E2E test: OPENAI_API_KEY not set')
      return
    }

    const toolCalls: any[] = []
    
    const result = await generateText({
      model: openai('gpt-4-turbo'),
      prompt: 'Can you get content from a file that does not exist?',
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
            
            // Simulate tool execution with non-existent file
            const response = await server.request({
              method: 'tools/call',
              params: {
                name: 'fetch-embeddings',
                arguments: { file_id: 'file-not-found', query }
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
    expect(toolCall.parameters.file_id).toBe('file-not-found')
    
    // Validate that AI handled file not found error gracefully
    expect(result.text.toLowerCase()).toMatch(/not found|doesn't exist|cannot find|file.*not.*available/)
  })

  it('should recover from errors and suggest alternatives', async () => {
    // Skip if no OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.log('Skipping E2E test: OPENAI_API_KEY not set')
      return
    }

    const toolCalls: any[] = []
    
    const result = await generateText({
      model: openai('gpt-4-turbo'),
      prompt: 'I want to find information about AI from my files. If you can\'t find a specific file, please suggest what I should do.',
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
            
            // First try will fail, second should succeed
            if (toolCalls.length === 1) {
              const response = await server.request({
                method: 'tools/call',
                params: {
                  name: 'fetch-embeddings',
                  arguments: { file_id: 'file-not-found', query }
                }
              }) as any
              
              return response.content[0].text
            } else {
              const response = await server.request({
                method: 'tools/call',
                params: {
                  name: 'fetch-embeddings',
                  arguments: { file_id: 'file-123', query }
                }
              }) as any
              
              return response.content[0].text
            }
          }
        },
        'list-user-files': {
          description: 'List all files uploaded to Supavec for the current user',
          parameters: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Number of files to fetch (default: 10)'
              },
              offset: {
                type: 'number',
                description: 'Offset for pagination (default: 0)'
              },
              order_dir: {
                type: 'string',
                description: 'Order direction for results',
                enum: ['desc', 'asc']
              }
            },
            required: []
          },
          execute: async ({ limit, offset, order_dir }) => {
            const toolCall = { toolName: 'list-user-files', parameters: { limit, offset, order_dir } }
            toolCalls.push(toolCall)
            
            const response = await server.request({
              method: 'tools/call',
              params: {
                name: 'list-user-files',
                arguments: { limit, offset, order_dir }
              }
            }) as any
            
            return response.content[0].text
          }
        }
      },
      maxTokens: 800
    })

    // Validate that the AI made multiple attempts and used recovery strategies
    expect(toolCalls.length).toBeGreaterThanOrEqual(2)
    
    const toolNames = toolCalls.map(tc => tc.toolName)
    expect(toolNames).toContain('fetch-embeddings')
    
    // Check if AI listed files after initial failure
    const hasListFiles = toolNames.includes('list-user-files')
    const hasMultipleEmbeddings = toolNames.filter(name => name === 'fetch-embeddings').length > 1
    
    expect(hasListFiles || hasMultipleEmbeddings).toBe(true)
    
    // Validate that AI provided helpful suggestions
    expect(result.text.toLowerCase()).toMatch(/available|try|suggest|alternative|files|list/)
  })

  it('should handle empty responses appropriately', async () => {
    // Skip if no OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.log('Skipping E2E test: OPENAI_API_KEY not set')
      return
    }

    const toolCalls: any[] = []
    
    const result = await generateText({
      model: openai('gpt-4-turbo'),
      prompt: 'Can you search for content using an empty query?',
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
            
            // Simulate empty query response
            const response = await server.request({
              method: 'tools/call',
              params: {
                name: 'fetch-embeddings',
                arguments: { file_id: 'file-123', query: 'empty-query' }
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
    
    // Validate that AI handled empty response gracefully
    expect(result.text.toLowerCase()).toMatch(/no results|empty|no content|no matches|nothing found/)
  })
})