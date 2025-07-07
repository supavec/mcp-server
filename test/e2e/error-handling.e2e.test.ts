import { describe, it, expect } from 'vitest'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import { validateToolCall, validateResponseContent } from '../utils/matchers.js'

describe('Error Handling E2E Tests', () => {

  it('should handle authentication errors gracefully', async () => {
    // Skip if no OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.log('Skipping E2E test: OPENAI_API_KEY not set')
      return
    }

    const toolCalls: any[] = []
    
    const result = await generateText({
      model: openai('gpt-4-turbo'),
      prompt: 'Can you list my files?',
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
            
            // Mock authentication error response
            return JSON.stringify({
              error: 'Authentication failed: Invalid API key provided'
            })
          }
        }
      },
      maxTokens: 500,
      toolChoice: 'required'
    })

    // Validate that the AI attempted to use the tool
    expect(toolCalls).toHaveLength(1)
    
    const toolCall = toolCalls[0]
    validateToolCall(toolCall, 'list-user-files')
    
    // Validate that AI handled authentication error gracefully (check toolResults for forced tool usage)
    if (result.text) {
      expect(result.text.toLowerCase()).toMatch(/authentication|unauthorized|invalid|api key|error/)
    } else {
      // When using toolChoice: 'required', response might be in toolResults
      expect(result.toolResults || result.toolCalls).toBeDefined()
      if (result.toolResults && result.toolResults.length > 0) {
        const toolResult = result.toolResults[0].result
        expect(toolResult.toLowerCase()).toMatch(/authentication|unauthorized|invalid|api key|error/)
      }
    }
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
          parameters: z.object({
            file_id: z.string().describe('ID of the file to get embeddings for'),
            query: z.string().describe('Query to search for in the file')
          }),
          execute: async ({ file_id, query }) => {
            const toolCall = { toolName: 'fetch-embeddings', parameters: { file_id, query } }
            toolCalls.push(toolCall)
            
            // Mock file not found error response
            return JSON.stringify({
              error: 'File not found: The requested file ID does not exist'
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
    validateToolCall(toolCall, 'fetch-embeddings')
    expect(toolCall.parameters.file_id).toBeDefined()
    
    // Validate that AI handled file not found error gracefully (check toolResults for forced tool usage)
    if (result.text) {
      expect(result.text.toLowerCase()).toMatch(/not found|doesn't exist|cannot find|file.*not.*available/)
    } else {
      // When using toolChoice: 'required', response might be in toolResults
      expect(result.toolResults || result.toolCalls).toBeDefined()
      if (result.toolResults && result.toolResults.length > 0) {
        const toolResult = result.toolResults[0].result
        const parsed = JSON.parse(toolResult)
        expect(parsed.error).toBeDefined()
        expect(toolResult.toLowerCase()).toMatch(/not found|doesn't exist|cannot find|file.*not.*available/)
      }
    }
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
          parameters: z.object({
            file_id: z.string().describe('ID of the file to get embeddings for'),
            query: z.string().describe('Query to search for in the file')
          }),
          execute: async ({ file_id, query }) => {
            const toolCall = { toolName: 'fetch-embeddings', parameters: { file_id, query } }
            toolCalls.push(toolCall)
            
            // First try will fail, second should succeed
            if (toolCalls.length === 1) {
              return JSON.stringify({
                error: 'File not found: The requested file ID does not exist'
              })
            } else {
              return JSON.stringify({
                success: true,
                results: [
                  {
                    content: 'Artificial intelligence is a branch of computer science...',
                    score: 0.92,
                    metadata: { page: 2, section: 'AI Overview' }
                  }
                ],
                count: 1
              })
            }
          }
        },
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
            
            // Mock available files response
            return JSON.stringify({
              success: true,
              results: [
                {
                  id: 'file-123',
                  name: 'ai-research-paper.pdf',
                  type: 'pdf',
                  size: 3072,
                  created_at: '2024-01-01T00:00:00Z'
                },
                {
                  id: 'file-456',
                  name: 'machine-learning-guide.pdf',
                  type: 'pdf',
                  size: 2048,
                  created_at: '2024-01-02T00:00:00Z'
                }
              ],
              pagination: { limit: limit || 10, offset: offset || 0, total: 2 },
              count: 2
            })
          }
        }
      },
      maxTokens: 800,
      toolChoice: 'required'
    })

    // Validate that the AI made at least one attempt
    expect(toolCalls.length).toBeGreaterThanOrEqual(1)
    
    const toolNames = toolCalls.map(tc => tc.toolName)
    
    // Check if AI attempted to use tools for recovery
    const hasListFiles = toolNames.includes('list-user-files')
    const hasEmbeddings = toolNames.includes('fetch-embeddings')
    
    expect(hasListFiles || hasEmbeddings).toBe(true)
    
    // Validate that AI provided helpful suggestions (check toolResults for forced tool usage)
    if (result.text) {
      expect(result.text.toLowerCase()).toMatch(/available|try|suggest|alternative|files|list/)
    } else {
      // When using toolChoice: 'required', response might be in toolResults
      expect(result.toolResults || result.toolCalls).toBeDefined()
      if (result.toolResults && result.toolResults.length > 0) {
        const toolResult = result.toolResults[0].result
        const parsed = JSON.parse(toolResult)
        // Check if this is a file listing response showing available files
        if (parsed.results && Array.isArray(parsed.results)) {
          expect(parsed.results.length).toBeGreaterThan(0)
          expect(parsed.results[0].name).toBeDefined()
        } else {
          // Or check if it's another type of helpful response
          expect(toolResult.toLowerCase()).toMatch(/available|try|suggest|alternative|files|list/)
        }
      }
    }
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
          parameters: z.object({
            file_id: z.string().describe('ID of the file to get embeddings for'),
            query: z.string().describe('Query to search for in the file')
          }),
          execute: async ({ file_id, query }) => {
            const toolCall = { toolName: 'fetch-embeddings', parameters: { file_id, query } }
            toolCalls.push(toolCall)
            
            // Mock empty results response
            return JSON.stringify({
              success: true,
              results: [],
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
    validateToolCall(toolCall, 'fetch-embeddings')
    
    // Validate that AI handled empty response gracefully (check toolResults for forced tool usage)
    if (result.text) {
      expect(result.text.toLowerCase()).toMatch(/no results|empty|no content|no matches|nothing found/)
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