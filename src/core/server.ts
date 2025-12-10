/**
 * MCP Server implementation for Contextive.
 *
 * Uses @modelcontextprotocol/sdk ^1.24.3 with the modern McpServer API.
 * Implements MCP specification 2025-11-25.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { loadConfig, type ContextiveConfig } from "./config.js";
import pino from "pino";

const VERSION = "0.1.0";

export interface ContextiveServer {
  server: McpServer;
  config: ContextiveConfig;
  logger: pino.Logger;
  start(): Promise<void>;
}

/**
 * Builds pino logger options.
 * Uses pino-pretty in development for readable output.
 * In production, uses plain pino JSON output (pino-pretty is a devDependency).
 */
function buildLoggerOptions(logLevel: string): pino.LoggerOptions {
  const options: pino.LoggerOptions = { level: logLevel };

  // Only use pino-pretty in development - it's a devDependency
  if (process.env.NODE_ENV !== "production") {
    options.transport = {
      target: "pino-pretty",
      options: { colorize: true },
    };
  }

  return options;
}

/**
 * Creates and configures the Contextive MCP server.
 */
export function createServer(configPath?: string): ContextiveServer {
  const config = loadConfig(configPath);

  const logger = pino(buildLoggerOptions(config.server.logLevel));

  const server = new McpServer({
    name: "contextive-mcp-server",
    version: VERSION,
  });

  // Register introspection tools (always available)
  registerIntrospectionTools(server, config, logger);

  // Register tool packs based on config
  if (config.toolPacks.fs?.enabled) {
    registerFsTools(server, config, logger);
  }

  if (config.toolPacks.http?.enabled) {
    registerHttpTools(server, config, logger);
  }

  async function start(): Promise<void> {
    if (config.server.mode === "stdio") {
      logger.info("Starting Contextive MCP server in stdio mode");
      const transport = new StdioServerTransport();
      await server.connect(transport);
      logger.info("Contextive MCP server connected via stdio");
    } else {
      // HTTP mode - implement when needed
      throw new Error("HTTP mode not yet implemented");
    }
  }

  return { server, config, logger, start };
}

/**
 * Register introspection tools for debugging and discovery.
 */
function registerIntrospectionTools(
  server: McpServer,
  config: ContextiveConfig,
  logger: pino.Logger
): void {
  // Server info tool
  server.registerTool(
    "contextive_server_info",
    {
      title: "Server Info",
      description:
        "Returns information about the Contextive MCP server including version, enabled tool packs, and configuration summary.",
      inputSchema: {},
      outputSchema: {
        name: z.string(),
        version: z.string(),
        mode: z.string(),
        enabledToolPacks: z.array(z.string()),
        providerCount: z.number(),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => {
      logger.debug("contextive_server_info called");

      const enabledToolPacks = Object.entries(config.toolPacks)
        .filter(([, pack]) => pack?.enabled)
        .map(([name]) => name);

      const output = {
        name: "contextive-mcp-server",
        version: VERSION,
        mode: config.server.mode,
        enabledToolPacks,
        providerCount: Object.keys(config.providers).length,
      };

      return {
        content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
        structuredContent: output,
      };
    }
  );

  // Health check tool
  server.registerTool(
    "contextive_health",
    {
      title: "Health Check",
      description: "Returns the health status of the Contextive MCP server.",
      inputSchema: {},
      outputSchema: {
        status: z.enum(["healthy", "degraded", "unhealthy"]),
        timestamp: z.string(),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => {
      logger.debug("contextive_health called");

      const output = {
        status: "healthy" as const,
        timestamp: new Date().toISOString(),
      };

      return {
        content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
        structuredContent: output,
      };
    }
  );
}

/**
 * Register filesystem tools (placeholder - implement in tool-packs/).
 */
function registerFsTools(
  _server: McpServer,
  _config: ContextiveConfig,
  logger: pino.Logger
): void {
  logger.info("Filesystem tool pack enabled (not yet implemented)");
  // TODO: Implement in src/tool-packs/fs/
}

/**
 * Register HTTP tools (placeholder - implement in tool-packs/).
 */
function registerHttpTools(
  _server: McpServer,
  _config: ContextiveConfig,
  logger: pino.Logger
): void {
  logger.info("HTTP tool pack enabled (not yet implemented)");
  // TODO: Implement in src/tool-packs/http/
}
