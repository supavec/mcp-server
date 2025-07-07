import { describe, it, expect } from "vitest";
import { tools } from "../../src/tools/index.js";

describe("Tools Integration Tests", () => {
  describe("Tool Registration", () => {
    it("should register all expected tools", () => {
      expect(tools).toBeDefined();
      expect(tools).toHaveLength(2);

      const toolNames = tools.map((tool) => tool.name);
      expect(toolNames).toContain("fetch-embeddings");
      expect(toolNames).toContain("list-user-files");
    });

    it("should have correct tool schemas", () => {
      const fetchEmbeddingsTool = tools.find(
        (tool) => tool.name === "fetch-embeddings"
      );
      expect(fetchEmbeddingsTool).toBeDefined();
      expect(fetchEmbeddingsTool!.inputSchema.properties).toHaveProperty(
        "file_id"
      );
      expect(fetchEmbeddingsTool!.inputSchema.properties).toHaveProperty(
        "query"
      );
      expect(fetchEmbeddingsTool!.inputSchema.required).toEqual([
        "file_id",
        "query",
      ]);

      const listUserFilesTool = tools.find(
        (tool) => tool.name === "list-user-files"
      );
      expect(listUserFilesTool).toBeDefined();
      expect(listUserFilesTool!.inputSchema.properties).toHaveProperty("limit");
      expect(listUserFilesTool!.inputSchema.properties).toHaveProperty(
        "offset"
      );
      expect(listUserFilesTool!.inputSchema.properties).toHaveProperty(
        "order_dir"
      );
    });
  });
});
