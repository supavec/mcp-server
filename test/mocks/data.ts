import type { Embeddings, UserFile, UserFilesResponse } from '../../src/types/index.js'

export const mockUserFiles: UserFile[] = [
  {
    type: 'pdf',
    file_id: 'file-123',
    created_at: '2024-01-01T00:00:00Z',
    file_name: 'document.pdf',
    team_id: 'team-456'
  },
  {
    type: 'txt',
    file_id: 'file-456',
    created_at: '2024-01-02T00:00:00Z',
    file_name: 'notes.txt',
    team_id: 'team-456'
  },
  {
    type: 'docx',
    file_id: 'file-789',
    created_at: '2024-01-03T00:00:00Z',
    file_name: 'report.docx',
    team_id: 'team-456'
  }
]

export const mockUserFilesResponse: UserFilesResponse = {
  success: true,
  results: mockUserFiles,
  pagination: {
    offset: 0,
    limit: 10
  },
  count: mockUserFiles.length
}

export const mockEmbeddings: Embeddings = {
  documents: [
    {
      content: 'This is a sample document about machine learning and AI technologies. It covers various topics including neural networks, deep learning, and natural language processing.'
    },
    {
      content: 'The document discusses the implementation of embeddings in vector databases and their applications in semantic search and recommendation systems.'
    },
    {
      content: 'Advanced topics include transformer architectures, attention mechanisms, and the latest developments in large language models.'
    }
  ]
}

export const mockErrorResponse = {
  error: 'Authentication failed: Invalid API key'
}

export const mockEmptyUserFilesResponse: UserFilesResponse = {
  success: true,
  results: [],
  pagination: {
    offset: 0,
    limit: 10
  },
  count: 0
}