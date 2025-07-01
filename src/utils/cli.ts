export function parseArgs(): { apiKey: string; showHelp: boolean } {
  const args = process.argv.slice(2);
  let apiKey = "";
  let showHelp = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--help" || arg === "-h") {
      showHelp = true;
    } else if (arg === "--api-key") {
      if (i + 1 < args.length) {
        apiKey = args[i + 1];
        i++;
      } else {
        console.error("Error: --api-key requires a value");
        process.exit(1);
      }
    } else if (arg.startsWith("--api-key=")) {
      apiKey = arg.split("=")[1];
    } else if (!arg.startsWith("-")) {
      continue;
    } else {
      console.error(`Error: Unknown argument: ${arg}`);
      console.error("Use --help for usage information");
      process.exit(1);
    }
  }

  return { apiKey, showHelp };
}

export function showHelp() {
  console.log(`
Supavec MCP Server

USAGE:
  supavec-mcp [OPTIONS]

OPTIONS:
  --api-key <key>    Supavec API key (required)
  --help, -h         Show this help message

ENVIRONMENT VARIABLES:
  SUPAVEC_API_KEY    Supavec API key (overridden by --api-key)

EXAMPLES:
  supavec-mcp --api-key your_api_key_here
  SUPAVEC_API_KEY=your_key supavec-mcp

For more information, visit: https://www.supavec.com
`);
}
