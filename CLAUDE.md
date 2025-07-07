# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) server that enables AI assistants to interact with Supavec's embeddings API. The server provides two main tools:
- `fetch-embeddings`: Retrieves relevant content from Supavec files using embeddings
- `list-user-files`: Lists all files uploaded to a user's Supavec account

## Commands

### Build & Development
```bash
# Build the project (compiles TypeScript to build/ directory)
npm run build

# Build and watch for changes during development
npm run watch

# Test the server with MCP Inspector
npm run inspector

# Test the CLI directly
npm run build && node build/index.js --help
```

### Running the Server
```bash
# With API key argument
node build/index.js --api-key your_api_key

# With environment variable
SUPAVEC_API_KEY=your_key node build/index.js

# Show help
node build/index.js --help
```

## Architecture

### Entry Point (`src/index.ts`)
- Handles CLI argument parsing and API key validation
- Creates and starts the MCP server
- API key priority: `--api-key` argument > `SUPAVEC_API_KEY` environment variable

### Core Components

**Server Setup (`src/utils/server.ts`)**
- Creates MCP server instance using `@modelcontextprotocol/sdk`
- Configures server with stdio transport for MCP communication
- Sets up tool handlers

**Tool Definitions (`src/tools/index.ts`)**
- Defines the two MCP tools with their schemas
- Handles tool execution by calling Supavec API endpoints
- Returns structured JSON responses to AI assistants

**API Layer (`src/utils/api.ts`)**
- Centralized HTTP client for Supavec API (`https://api.supavec.com`)
- Handles authentication via `authorization` header
- Provides error handling and type-safe responses

**CLI Utilities (`src/utils/cli.ts`)**
- Parses command line arguments (supports `--api-key` and `--help`)
- Displays help information

### Type Definitions (`src/types/index.ts`)
- `Embeddings`: Response structure for embedding queries
- `UserFile`: Individual file metadata from Supavec
- `UserFilesResponse`: Paginated response for file listings
- `UserFilesRequest`: Request parameters for file listings

## MCP Integration

The server implements the Model Context Protocol standard, allowing it to work with:
- Cursor IDE (via `.cursor/mcp.json`)
- Claude Desktop
- VS Code with Copilot
- Other MCP-compatible tools

The server uses stdio transport for communication and provides structured tool responses in JSON format.

## Key Patterns

- TypeScript with ES2022 modules
- Functional programming approach with separated concerns
- Error handling returns `{ error: string }` objects rather than throwing
- All API responses are typed for safety
- Environment variable fallbacks for configuration