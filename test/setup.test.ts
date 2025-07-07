import { describe, it, expect } from 'vitest'

describe('Test Setup', () => {
  it('should be able to run basic tests', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have access to environment variables', () => {
    expect(process.env.NODE_ENV).toBe('test')
  })

  it('should be able to import project modules', async () => {
    const { tools } = await import('../src/tools/index.js')
    expect(tools).toBeDefined()
    expect(tools).toHaveLength(2)
  })
})