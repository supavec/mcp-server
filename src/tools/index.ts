import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { SUPAVEC_BASE_URL, makeSupavecRequest } from "../utils/api.js";
import type {
  Embeddings,
  UserFilesResponse,
  UserFilesRequest,
} from "../types/index.js";

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
  {
    name: "list-user-files",
    description: "List all files uploaded to Supavec for the current user",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Number of files to fetch (default: 10)",
          default: 10,
        },
        offset: {
          type: "number",
          description: "Offset for pagination (default: 0)",
          default: 0,
        },
        order_dir: {
          type: "string",
          description: "Order direction for results",
          enum: ["desc", "asc"],
          default: "desc",
        },
      },
      required: [],
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
      const embeddings = await makeSupavecRequest<Embeddings>(
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

    if (request.params.name === "list-user-files") {
      const limit = request.params.arguments?.limit || 10;
      const offset = request.params.arguments?.offset || 0;
      const order_dir = request.params.arguments?.order_dir || "desc";

      const userFilesUrl = `${SUPAVEC_BASE_URL}/user_files`;
      const requestBody: UserFilesRequest = {
        pagination: {
          limit,
          offset,
        },
        order_dir,
      };

      const userFiles = await makeSupavecRequest<UserFilesResponse>(
        userFilesUrl,
        requestBody,
        apiKey
      );

      if ("error" in userFiles) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to retrieve user files: ${userFiles.error}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            mimeType: "application/json",
            text: JSON.stringify(userFiles, null, 2),
          },
        ],
      };
    }

    throw new Error("Tool not found");
  });
}
