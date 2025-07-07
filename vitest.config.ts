import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Extended timeout for AI interactions
    testTimeout: 30000,
    // Global setup files
    setupFiles: ['./test/setup.ts'],
    // Test file patterns
    include: [
      'test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}',
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}'
    ],
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'test/**',
        'build/**',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/coverage/**'
      ],
      // Thresholds
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      }
    },
    // Environment variables for testing
    env: {
      NODE_ENV: 'test'
    }
  }
})