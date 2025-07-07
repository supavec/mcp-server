import { http, HttpResponse } from 'msw'
import { mockUserFilesResponse, mockEmbeddings, mockErrorResponse, mockEmptyUserFilesResponse } from './data.js'

const SUPAVEC_BASE_URL = 'https://api.supavec.com'

export const handlers = [
  // Mock embeddings endpoint
  http.post(`${SUPAVEC_BASE_URL}/embeddings`, async ({ request }) => {
    const authHeader = request.headers.get('authorization')
    
    // Simulate authentication failure
    if (!authHeader || authHeader === 'invalid-key') {
      return HttpResponse.json(mockErrorResponse, { status: 401 })
    }

    const body = await request.json() as any
    const { file_ids, query } = body

    // Simulate file not found
    if (file_ids.includes('file-not-found')) {
      return HttpResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Simulate empty response for specific query
    if (query === 'empty-query') {
      return HttpResponse.json({
        documents: []
      })
    }

    // Return mock embeddings
    return HttpResponse.json(mockEmbeddings)
  }),

  // Mock user files endpoint
  http.post(`${SUPAVEC_BASE_URL}/user_files`, async ({ request }) => {
    const authHeader = request.headers.get('authorization')
    
    // Simulate authentication failure
    if (!authHeader || authHeader === 'invalid-key') {
      return HttpResponse.json(mockErrorResponse, { status: 401 })
    }

    const body = await request.json() as any
    const { pagination, order_dir } = body

    // Simulate empty response for specific pagination
    if (pagination?.offset >= 100) {
      return HttpResponse.json(mockEmptyUserFilesResponse)
    }

    // Return mock user files with pagination
    const response = {
      ...mockUserFilesResponse,
      pagination: {
        offset: pagination?.offset || 0,
        limit: pagination?.limit || 10
      }
    }

    // Sort based on order_dir
    if (order_dir === 'asc') {
      response.results = [...response.results].sort((a, b) => 
        a.created_at.localeCompare(b.created_at)
      )
    }

    return HttpResponse.json(response)
  }),

  // Mock server error scenarios
  http.post(`${SUPAVEC_BASE_URL}/server-error`, () => {
    return HttpResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  })
]