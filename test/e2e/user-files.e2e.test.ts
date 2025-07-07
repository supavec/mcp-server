import { describe, it, expect, beforeEach } from 'vitest'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { createTestServer } from '../utils/test-server.js'
import { validateToolCall, validateResponseContent } from '../utils/matchers.js'
import type { Server } from '@modelcontextprotocol/sdk/server/index.js'

describe('User Files E2E Tests', () => {
  let testServer: any
  let server: Server

  beforeEach(async () => {
    testServer = createTestServer()
    server = await testServer.start()
  })

  it('should list user files and understand their structure', async () => {
    // Skip if no OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.log('Skipping E2E test: OPENAI_API_KEY not set')
      return
    }

    const toolCalls: any[] = []
    
    const result = await generateText({
      model: openai('gpt-4-turbo'),
      prompt: 'Can you show me what files I have uploaded to Supavec?',
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
            
            // Simulate tool execution through our MCP server
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
      maxTokens: 500
    })

    // Validate that the AI used the tool
    expect(toolCalls).toHaveLength(1)
    
    const toolCall = toolCalls[0]
    validateToolCall(toolCall, 'list-user-files')
    
    // Validate response content
    validateResponseContent(result.text, 'text')
    expect(result.text.toLowerCase()).toMatch(/files|documents|uploaded/)
  })

  it('should handle pagination for large file lists', async () => {
    // Skip if no OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.log('Skipping E2E test: OPENAI_API_KEY not set')
      return
    }

    const toolCalls: any[] = []
    
    const result = await generateText({
      model: openai('gpt-4-turbo'),
      prompt: 'I want to see the first 5 files, then the next 5 files. Can you help me browse my files?',
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
            
            // Simulate tool execution through our MCP server
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

    // Validate that the AI made multiple calls for pagination
    expect(toolCalls.length).toBeGreaterThanOrEqual(1)
    
    // Check if AI used pagination correctly
    const firstCall = toolCalls[0]
    expect(firstCall.parameters.limit).toBe(5)
    expect(firstCall.parameters.offset).toBe(0)
    
    if (toolCalls.length > 1) {
      const secondCall = toolCalls[1]
      expect(secondCall.parameters.limit).toBe(5)
      expect(secondCall.parameters.offset).toBe(5)
    }
    
    // Validate response content
    validateResponseContent(result.text, 'text')
    expect(result.text.toLowerCase()).toMatch(/files|first|next|pagination/)
  })

  it('should combine file listing with embeddings retrieval', async () => {
    // Skip if no OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.log('Skipping E2E test: OPENAI_API_KEY not set')
      return
    }

    const toolCalls: any[] = []
    
    const result = await generateText({
      model: openai('gpt-4-turbo'),
      prompt: 'Show me my files and then get some machine learning content from the first PDF file.',
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
            
            // Simulate tool execution through our MCP server
            const response = await server.request({
              method: 'tools/call',
              params: {
                name: 'list-user-files',
                arguments: { limit, offset, order_dir }
              }
            }) as any
            
            return response.content[0].text
          }
        },
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
      maxTokens: 800
    })

    // Validate that the AI used both tools
    expect(toolCalls.length).toBeGreaterThanOrEqual(2)
    
    const toolNames = toolCalls.map(tc => tc.toolName)
    expect(toolNames).toContain('list-user-files')
    expect(toolNames).toContain('fetch-embeddings')
    
    // Validate that file ID was used correctly
    const embeddingsCall = toolCalls.find(tc => tc.toolName === 'fetch-embeddings')
    expect(embeddingsCall).toBeDefined()
    expect(embeddingsCall!.parameters.file_id).toBe('file-123') // From mock data
    expect(embeddingsCall!.parameters.query).toContain('machine learning')
    
    // Validate response content
    validateResponseContent(result.text, 'text')
    expect(result.text.toLowerCase()).toMatch(/files|machine learning/)
  })

  it('should handle empty file lists gracefully', async () => {
    // Skip if no OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.log('Skipping E2E test: OPENAI_API_KEY not set')
      return
    }

    const toolCalls: any[] = []
    
    const result = await generateText({
      model: openai('gpt-4-turbo'),
      prompt: 'Can you show me files starting from offset 100?',
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
            
            // Simulate tool execution through our MCP server
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
      maxTokens: 500
    })

    // Validate that the AI used the tool
    expect(toolCalls).toHaveLength(1)
    
    const toolCall = toolCalls[0]
    validateToolCall(toolCall, 'list-user-files')
    expect(toolCall.parameters.offset).toBe(100)
    
    // Validate that AI handled empty results gracefully
    expect(result.text.toLowerCase()).toMatch(/no files|empty|no results|nothing found/)
  })
})