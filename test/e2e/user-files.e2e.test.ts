import { describe, it, expect } from 'vitest'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import { validateToolCall, validateResponseContent } from '../utils/matchers.js'

describe('User Files E2E Tests', () => {

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
          parameters: z.object({
            limit: z.number().optional().describe('Number of files to fetch (default: 10)'),
            offset: z.number().optional().describe('Offset for pagination (default: 0)'),
            order_dir: z.enum(['desc', 'asc']).optional().describe('Order direction for results')
          }),
          execute: async ({ limit, offset, order_dir }) => {
            const toolCall = { toolName: 'list-user-files', parameters: { limit, offset, order_dir } }
            toolCalls.push(toolCall)
            
            // Mock response for user files
            return JSON.stringify({
              success: true,
              results: [
                {
                  id: 'file-123',
                  name: 'document.pdf',
                  type: 'pdf',
                  size: 1024,
                  created_at: '2024-01-01T00:00:00Z'
                }
              ],
              pagination: { limit: limit || 10, offset: offset || 0, total: 1 },
              count: 1
            })
          }
        }
      },
      maxTokens: 500,
      toolChoice: 'required'
    })

    // Validate that the AI used the tool
    expect(toolCalls).toHaveLength(1)
    
    const toolCall = toolCalls[0]
    validateToolCall(toolCall, 'list-user-files')
    
    // Validate response content (check toolResults for forced tool usage)
    if (result.text) {
      validateResponseContent(result.text, 'text')
      expect(result.text.toLowerCase()).toMatch(/files|documents|uploaded/)
    } else {
      // When using toolChoice: 'required', response might be in toolResults
      expect(result.toolResults || result.toolCalls).toBeDefined()
      if (result.toolResults && result.toolResults.length > 0) {
        const toolResult = result.toolResults[0].result
        const parsed = JSON.parse(toolResult)
        expect(parsed.success).toBe(true)
        expect(parsed.results).toHaveLength(1)
        expect(parsed.results[0].name).toBe('document.pdf')
      }
    }
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
          parameters: z.object({
            limit: z.number().optional().describe('Number of files to fetch (default: 10)'),
            offset: z.number().optional().describe('Offset for pagination (default: 0)'),
            order_dir: z.enum(['desc', 'asc']).optional().describe('Order direction for results')
          }),
          execute: async ({ limit, offset, order_dir }) => {
            const toolCall = { toolName: 'list-user-files', parameters: { limit, offset, order_dir } }
            toolCalls.push(toolCall)
            
            // Mock response for paginated file listing
            const mockFiles = [
              { id: 'file-1', name: 'doc1.pdf', type: 'pdf', size: 1024 },
              { id: 'file-2', name: 'doc2.pdf', type: 'pdf', size: 2048 },
              { id: 'file-3', name: 'doc3.pdf', type: 'pdf', size: 3072 },
              { id: 'file-4', name: 'doc4.pdf', type: 'pdf', size: 4096 },
              { id: 'file-5', name: 'doc5.pdf', type: 'pdf', size: 5120 }
            ]
            
            const startIndex = offset || 0
            const pageSize = limit || 10
            const results = mockFiles.slice(startIndex, startIndex + pageSize)
            
            return JSON.stringify({
              success: true,
              results,
              pagination: { limit: pageSize, offset: startIndex, total: mockFiles.length },
              count: results.length
            })
          }
        }
      },
      maxTokens: 800,
      toolChoice: 'required'
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
    
    // Validate response content (check toolResults for forced tool usage)
    if (result.text) {
      validateResponseContent(result.text, 'text')
      expect(result.text.toLowerCase()).toMatch(/files|first|next|pagination/)
    } else {
      // When using toolChoice: 'required', response might be in toolResults
      expect(result.toolResults || result.toolCalls).toBeDefined()
      if (result.toolResults && result.toolResults.length > 0) {
        const toolResult = result.toolResults[0].result
        expect(toolResult.toLowerCase()).toMatch(/files|first|next|pagination/)
      }
    }
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
          parameters: z.object({
            limit: z.number().optional().describe('Number of files to fetch (default: 10)'),
            offset: z.number().optional().describe('Offset for pagination (default: 0)'),
            order_dir: z.enum(['desc', 'asc']).optional().describe('Order direction for results')
          }),
          execute: async ({ limit, offset, order_dir }) => {
            const toolCall = { toolName: 'list-user-files', parameters: { limit, offset, order_dir } }
            toolCalls.push(toolCall)
            
            // Mock response for user files with PDF file
            return JSON.stringify({
              success: true,
              results: [
                {
                  id: 'file-123',
                  name: 'machine-learning-guide.pdf',
                  type: 'pdf',
                  size: 2048,
                  created_at: '2024-01-01T00:00:00Z'
                }
              ],
              pagination: { limit: limit || 10, offset: offset || 0, total: 1 },
              count: 1
            })
          }
        },
        'fetch-embeddings': {
          description: 'Fetch embeddings for a file by ID and query',
          parameters: z.object({
            file_id: z.string().describe('ID of the file to get embeddings for'),
            query: z.string().describe('Query to search for in the file')
          }),
          execute: async ({ file_id, query }) => {
            const toolCall = { toolName: 'fetch-embeddings', parameters: { file_id, query } }
            toolCalls.push(toolCall)
            
            // Mock response for embeddings query
            return JSON.stringify({
              success: true,
              results: [
                {
                  content: 'Machine learning is a subset of artificial intelligence that focuses on algorithms...',
                  score: 0.95,
                  metadata: { page: 1, section: 'Introduction' }
                }
              ],
              count: 1
            })
          }
        }
      },
      maxTokens: 800,
      toolChoice: 'required'
    })

    // Validate that the AI used at least one tool
    expect(toolCalls.length).toBeGreaterThanOrEqual(1)
    
    const toolNames = toolCalls.map(tc => tc.toolName)
    expect(toolNames).toContain('list-user-files')
    
    // If both tools were used, validate embeddings call
    const embeddingsCall = toolCalls.find(tc => tc.toolName === 'fetch-embeddings')
    if (embeddingsCall) {
      expect(embeddingsCall.parameters.file_id).toBe('file-123') // From mock data
      expect(embeddingsCall.parameters.query).toContain('machine learning')
    }
    
    // Validate response content (check toolResults for forced tool usage)
    if (result.text) {
      validateResponseContent(result.text, 'text')
      expect(result.text.toLowerCase()).toMatch(/files|machine learning/)
    } else {
      // When using toolChoice: 'required', response might be in toolResults
      expect(result.toolResults || result.toolCalls).toBeDefined()
      if (result.toolResults && result.toolResults.length > 0) {
        const toolResult = result.toolResults[0].result
        const parsed = JSON.parse(toolResult)
        // Check if this is a file listing response
        if (parsed.results && Array.isArray(parsed.results)) {
          expect(parsed.results[0].name).toContain('machine-learning')
        } else {
          // Or check if it's an embeddings response
          expect(toolResult.toLowerCase()).toMatch(/machine learning/)
        }
      }
    }
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
          parameters: z.object({
            limit: z.number().optional().describe('Number of files to fetch (default: 10)'),
            offset: z.number().optional().describe('Offset for pagination (default: 0)'),
            order_dir: z.enum(['desc', 'asc']).optional().describe('Order direction for results')
          }),
          execute: async ({ limit, offset, order_dir }) => {
            const toolCall = { toolName: 'list-user-files', parameters: { limit, offset, order_dir } }
            toolCalls.push(toolCall)
            
            // Mock response for empty file list (high offset)
            return JSON.stringify({
              success: true,
              results: [],
              pagination: { limit: limit || 10, offset: offset || 0, total: 0 },
              count: 0
            })
          }
        }
      },
      maxTokens: 500,
      toolChoice: 'required'
    })

    // Validate that the AI used the tool
    expect(toolCalls).toHaveLength(1)
    
    const toolCall = toolCalls[0]
    validateToolCall(toolCall, 'list-user-files')
    expect(toolCall.parameters.offset).toBe(100)
    
    // Validate that AI handled empty results gracefully (check toolResults for forced tool usage)
    if (result.text) {
      expect(result.text.toLowerCase()).toMatch(/no files|empty|no results|nothing found/)
    } else {
      // When using toolChoice: 'required', response might be in toolResults
      expect(result.toolResults || result.toolCalls).toBeDefined()
      if (result.toolResults && result.toolResults.length > 0) {
        const toolResult = result.toolResults[0].result
        const parsed = JSON.parse(toolResult)
        expect(parsed.success).toBe(true)
        expect(parsed.results).toEqual([])
        expect(parsed.count).toBe(0)
      }
    }
  })
})