import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./src/config.js";
import { GhlClient } from "./src/client.js";
import { registerPostTools } from "./src/tools/posts.js";

const config = loadConfig();
const client = new GhlClient(config.ghlToken, config.ghlLocationId);

const server = new McpServer({
  name: "mcp-ghl-community",
  version: "1.0.0",
});

registerPostTools(server, client, config);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("mcp-ghl-community server started");
