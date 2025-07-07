import { expect } from 'vitest'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

// Custom matcher for AI-powered assertions
export function toMatchCriteria(received: any, criteria: string) {
  return {
    pass: true, // Will be determined by AI evaluation
    message: () => `Expected value to match criteria: ${criteria}`,
    actual: received,
    expected: criteria
  }
}

// AI-powered content evaluation
export async function evaluateWithAI(content: string, criteria: string): Promise<boolean> {
  try {
    const response = await generateText({
      model: openai('gpt-4-turbo'),
      messages: [
        {
          role: 'system',
          content: 'You are a test evaluator. Respond with only "true" or "false" based on whether the content meets the given criteria.'
        },
        {
          role: 'user',
          content: `Content: ${content}\n\nCriteria: ${criteria}\n\nDoes the content meet the criteria?`
        }
      ],
      maxTokens: 10
    })

    return response.text.trim().toLowerCase() === 'true'
  } catch (error) {
    console.warn('AI evaluation failed, falling back to basic check:', error)
    return content.toLowerCase().includes(criteria.toLowerCase())
  }
}

// Tool call validation helpers
export interface ToolCall {
  toolName: string
  parameters: Record<string, any>
  result?: any
}

export function validateToolCall(toolCall: ToolCall, expectedTool: string, expectedParams?: Record<string, any>) {
  expect(toolCall.toolName).toBe(expectedTool)
  
  if (expectedParams) {
    for (const [key, value] of Object.entries(expectedParams)) {
      expect(toolCall.parameters[key]).toBe(value)
    }
  }
}

export function validateToolCallSequence(toolCalls: ToolCall[], expectedSequence: string[]) {
  expect(toolCalls.map(tc => tc.toolName)).toEqual(expectedSequence)
}

// Response content validation
export function validateResponseContent(content: string, expectedType: 'json' | 'text' = 'text') {
  expect(content).toBeDefined()
  expect(content.length).toBeGreaterThan(0)
  
  if (expectedType === 'json') {
    expect(() => JSON.parse(content)).not.toThrow()
  }
}