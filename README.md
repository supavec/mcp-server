# Supavec MCP Server

Fetch relevant content from Supavec.

An official implementation of an [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server for [Supavec](https://www.supavec.com).

<a href="https://glama.ai/mcp/servers/nkt7wcy8ez">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/nkt7wcy8ez/badge" alt="Supavec Server MCP server" />
</a>

## Tools

-   `fetch-embeddings`: Fetch relevant embeddings and content from Supavec

## Usage

### Build it

Always install dependencies and build it first:

```bash
npm run install && npm run build
```

### Get your Supavec API key

Sign up at [Supavec](https://www.supavec.com) and get your API key.

### With Claude for Desktop

Add the following to your `~/Library/Application\ Support/Claude/claude_desktop_config.json`:

```json
{
    "mcpServers": {
        "supavec": {
            "command": "node",
            "args": ["path/to/supavec/mcp/build/index.js"],
            "env": {
                "SUPAVEC_API_KEY": "<your api key>"
            }
        }
    }
}
```

### Standalone or for other projects

```bash
SUPAVEC_API_KEY=your_api_key && node build/index.js
```

## License

`Supavec MCP Server` is licensed [under the MIT License](LICENSE).