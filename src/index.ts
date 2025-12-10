/**
 * Contextive MCP Server
 *
 * A lean, multi-provider, workflow-oriented Model Context Protocol server.
 */

export { createServer, type ContextiveServer } from "./core/server.js";
export {
  configSchema,
  loadConfig,
  type ContextiveConfig,
} from "./core/config.js";
