# Supavec MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that enables AI assistants to fetch relevant embeddings and content from [Supavec](https://supavec.com).

## Features

- 🔍 **Fetch Embeddings**: Search and retrieve relevant content from Supavec files using embeddings
- 🤖 **AI Integration**: Works with Cursor, Claude, VS Code Copilot, and other MCP-compatible tools  
- 🔑 **Flexible Authentication**: Support for both command-line arguments and environment variables
- ⚡ **Easy Setup**: One-command installation via npx

## Installation

### Quick Start with npx (Recommended)

No installation required! Use directly with npx:

```bash
npx @supavec/mcp-server --api-key your_api_key
```

### Global Installation

```bash
npm install -g @supavec/mcp-server
supavec-mcp --api-key your_api_key
```

## Configuration

### Cursor

Add to your `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "supavec": {
      "command": "npx",
      "args": [
        "-y",
        "@supavec/mcp-server@latest",
        "--api-key",
        "your_supavec_api_key"
      ]
    }
  }
}
```

### VS Code (Copilot)

Add to your `.vscode/mcp.json`:

```json
{
  "servers": {
    "supavec": {
      "command": "npx",
      "args": [
        "-y", 
        "@supavec/mcp-server@latest",
        "--api-key",
        "your_supavec_api_key"
      ]
    }
  }
}
```

### Claude Desktop

Add to your Claude configuration:

```json
{
  "mcpServers": {
    "supavec": {
      "command": "npx",
      "args": [
        "-y",
        "@supavec/mcp-server@latest", 
        "--api-key",
        "your_supavec_api_key"
      ]
    }
  }
}
```

### Environment Variables

Alternatively, set your API key as an environment variable:

```bash
export SUPAVEC_API_KEY=your_supavec_api_key
```

Then use in your MCP configuration without the `--api-key` argument:

```json
{
  "mcpServers": {
    "supavec": {
      "command": "npx",
      "args": ["-y", "@supavec/mcp-server@latest"]
    }
  }
}
```

## Authentication

### Get Your API Key

1. Visit [Supavec](https://supavec.com)
2. Sign up or log in to your account
3. Navigate to your API settings
4. Generate a new API key

### Usage Priority

The server checks for API keys in this order:
1. `--api-key` command line argument (highest priority)
2. `SUPAVEC_API_KEY` environment variable

## Available Tools

### `fetch-embeddings`

Fetch embeddings for a file by ID and query.

**Parameters:**
- `file_id` (string, required): ID of the file to get embeddings for
- `query` (string, required): Query to search for in the file

**Example:**
```
Ask your AI assistant: "Using Supavec, find information about 'authentication' in file abc123"
```

## Command Line Usage

### Help

```bash
supavec-mcp --help
```

### With API Key

```bash
supavec-mcp --api-key your_api_key_here
```

### With Environment Variable

```bash
export SUPAVEC_API_KEY=your_api_key_here
supavec-mcp
```

## Examples

### Using with Cursor

1. Configure Supavec MCP in `.cursor/mcp.json`
2. Open Cursor and start a new chat
3. Ask: *"Search for 'database setup' information in my Supavec file xyz789"*
4. The AI will use the Supavec MCP to fetch relevant content

### Using with Claude

1. Configure Supavec MCP in Claude settings
2. In a conversation, ask: *"Find documentation about API endpoints in file abc123"*
3. Claude will search your Supavec files and return relevant information

## Troubleshooting

### Common Issues

**"Error: Supavec API key is required"**
- Ensure you've provided an API key via `--api-key` or `SUPAVEC_API_KEY` environment variable

**"Failed to fetch data: status 401"**
- Your API key may be invalid or expired. Check your Supavec account settings

**"Failed to fetch data: status 404"**  
- The file ID may not exist or you may not have access to it

### Debug Mode

Run with environment variables to see more details:

```bash
DEBUG=1 supavec-mcp --api-key your_key
```

## Development

### Requirements

- Node.js 16.0.0 or higher
- TypeScript

### Setup

```bash
git clone https://github.com/supavec/mcp-server.git
cd supavec-mcp-server
npm install
npm run build
```

### Testing

```bash
# Test with MCP Inspector
npm run inspector

# Test command line
npm run build
node build/index.js --help
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Commit your changes: `git commit -am 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- 📚 [Supavec Documentation](https://supavec.com/docs)
- 🐛 [Report Issues](https://github.com/supavec/mcp-server/issues)
- 💬 [Community Support](https://supavec.com/community)

## Related

- [Model Context Protocol](https://modelcontextprotocol.io)
- [Supavec Platform](https://supavec.com)
- [MCP Servers](https://github.com/modelcontextprotocol/servers)