#!/usr/bin/env node

import { parseArgs, showHelp } from "./utils/cli.js";
import { createServer, startServer } from "./utils/server.js";

const { apiKey: cmdApiKey, showHelp: shouldShowHelp } = parseArgs();

if (shouldShowHelp) {
  showHelp();
  process.exit(0);
}

const apiKey = cmdApiKey || process.env.SUPAVEC_API_KEY || "";

if (!apiKey) {
  console.error("Error: Supavec API key is required");
  console.error(
    "Provide it via --api-key argument or SUPAVEC_API_KEY environment variable"
  );
  console.error("Use --help for more information");
  process.exit(1);
}

async function main() {
  try {
    const server = createServer(apiKey);
    await startServer(server);
  } catch (error) {
    console.error("Server error:", error);
    process.exit(1);
  }
}

main();
