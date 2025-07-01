import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { setupListToolsHandler, setupCallToolHandler } from "../tools/index.js";

export function createServer(apiKey: string): Server {
  const server = new Server(
    {
      name: "supavec",
      version: "0.1.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  setupListToolsHandler(server);
  setupCallToolHandler(server, apiKey);

  return server;
}

export async function startServer(server: Server): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
