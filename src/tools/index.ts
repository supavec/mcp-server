import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { SUPAVEC_BASE_URL, makeSupavecRequest } from "../utils/api.js";
import type { EMBEDDINGS } from "../types/index.js";

export const tools = [
  {
    name: "fetch-embeddings",
    description: "Fetch embeddings for a file by ID and query",
    inputSchema: {
      type: "object",
      properties: {
        file_id: {
          type: "string",
          description: "ID of the file to get embeddings for",
        },
        query: {
          type: "string",
          description: "Query to search for in the file",
        },
      },
      required: ["file_id", "query"],
    },
  },
];

export function setupListToolsHandler(server: any) {
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools,
    };
  });
}

export function setupCallToolHandler(server: any, apiKey: string) {
  server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
    if (request.params.name === "fetch-embeddings") {
      const file_id = request.params.arguments?.file_id as string;
      const query = request.params.arguments?.query as string;
      const embeddingsUrl = `${SUPAVEC_BASE_URL}/embeddings`;
      const embeddings = await makeSupavecRequest<EMBEDDINGS>(
        embeddingsUrl,
        {
          file_ids: [file_id],
          query: query,
        },
        apiKey
      );

      if ("error" in embeddings) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to retrieve embeddings for ${file_id}: ${embeddings.error}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            mimeType: "application/json",
            text: JSON.stringify(
              embeddings.documents.map((d) => d.content).join("\n"),
              null,
              2
            ),
          },
        ],
      };
    }

    throw new Error("Tool not found");
  });
}
