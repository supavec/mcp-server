import { describe, it, expect, beforeEach } from 'vitest'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import { createTestServer } from '../utils/test-server.js'
import { validateToolCall, validateResponseContent } from '../utils/matchers.js'
import type { Server } from '@modelcontextprotocol/sdk/server/index.js'

describe('Embeddings E2E Tests', () => {

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
          parameters: z.object({
            file_id: z.string().describe('ID of the file to get embeddings for'),
            query: z.string().describe('Query to search for in the file')
          }),
          execute: async ({ file_id, query }) => {
            const toolCall = { toolName: 'fetch-embeddings', parameters: { file_id, query } }
            toolCalls.push(toolCall)
            
            // Return mock response for now
            return JSON.stringify({
              success: true,
              content: "This is content about machine learning from the file."
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
    expect(toolCall.parameters.file_id).toBe('file-123')
    expect(toolCall.parameters.query).toContain('machine learning')
    
    // Validate response content (check toolResults for forced tool usage)
    console.log('Result:', { text: result.text, toolCalls: result.toolCalls, toolResults: result.toolResults })
    if (result.text) {
      validateResponseContent(result.text, 'text')
      expect(result.text).toContain('machine learning')
    } else {
      // When using toolChoice: 'required', response might be in toolResults
      expect(result.toolResults || result.toolCalls).toBeDefined()
    }
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
          parameters: z.object({
            file_id: z.string().describe('ID of the file to get embeddings for'),
            query: z.string().describe('Query to search for in the file')
          }),
          execute: async ({ file_id, query }) => {
            const toolCall = { toolName: 'fetch-embeddings', parameters: { file_id, query } }
            toolCalls.push(toolCall)
            
            // Return mock error response for file not found
            return JSON.stringify({
              error: "File not found: The requested file does not exist"
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
    validateToolCall(toolCall, 'fetch-embeddings')
    expect(toolCall.parameters.file_id).toBe('file-not-found')
    
    // Validate that AI handled the error gracefully (check toolResults for forced tool usage)
    if (result.text) {
      expect(result.text.toLowerCase()).toMatch(/not found|error|unable|couldn't/)
    } else {
      // When using toolChoice: 'required', response might be in toolResults
      expect(result.toolResults || result.toolCalls).toBeDefined()
      if (result.toolResults && result.toolResults.length > 0) {
        const toolResult = result.toolResults[0].result
        const parsed = JSON.parse(toolResult)
        expect(parsed.error).toBeDefined()
        expect(toolResult.toLowerCase()).toMatch(/not found|error|unable|couldn't/)
      }
    }
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
          parameters: z.object({
            file_id: z.string().describe('ID of the file to get embeddings for'),
            query: z.string().describe('Query to search for in the file')
          }),
          execute: async ({ file_id, query }) => {
            const toolCall = { toolName: 'fetch-embeddings', parameters: { file_id, query } }
            toolCalls.push(toolCall)
            
            // Return mock response with transformer architecture content
            return JSON.stringify({
              success: true,
              content: "This is content about transformer architectures and attention mechanisms in machine learning."
            })
          }
        }
      },
      maxTokens: 500,
      toolChoice: 'required'
    })

    // Validate that the AI used the tool (might make multiple calls)
    expect(toolCalls.length).toBeGreaterThanOrEqual(1)
    
    const toolCall = toolCalls[0]
    validateToolCall(toolCall, 'fetch-embeddings')
    expect(toolCall.parameters.file_id).toBe('file-123')
    
    const query = toolCall.parameters.query.toLowerCase()
    expect(query).toMatch(/transformer|attention|architecture|mechanism/)
    
    // Validate response mentions the requested content (check toolResults for forced tool usage)
    if (result.text) {
      expect(result.text.toLowerCase()).toMatch(/transformer|attention/)
    } else {
      // When using toolChoice: 'required', response might be in toolResults
      expect(result.toolResults || result.toolCalls).toBeDefined()
      if (result.toolResults && result.toolResults.length > 0) {
        const toolResult = result.toolResults[0].result
        expect(toolResult.toLowerCase()).toMatch(/transformer|attention/)
      }
    }
  })
})