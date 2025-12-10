#!/usr/bin/env node
/**
 * Contextive MCP Server CLI
 *
 * Usage:
 *   contextive-mcp serve --stdio
 *   contextive-mcp --help
 */

import pkg from "../../package.json" with { type: "json" };
import { createServer } from "../core/server.js";

const VERSION = pkg.version || "0.1.0";
const args = process.argv.slice(2);

function printHelp(): void {
  console.log(`
Contextive MCP Server - A lean, multi-provider MCP server

Usage:
  contextive-mcp serve [options]
  contextive-mcp --help
  contextive-mcp --version

Commands:
  serve           Start the MCP server

Options:
  --stdio         Use stdio transport (default)
  --config <path> Path to config file
  --help, -h      Show this help message
  --version, -v   Show version

Environment:
  CONTEXTIVE_CONFIG   Path to configuration file

Examples:
  contextive-mcp serve --stdio
  contextive-mcp serve --config ./my-config.json
`);
}

function printVersion(): void {
  console.log(`contextive-mcp-server v${VERSION}`);
}

async function main(): Promise<void> {
  if (args.includes("--help") || args.includes("-h") || args.length === 0) {
    printHelp();
    process.exit(0);
  }

  if (args.includes("--version") || args.includes("-v")) {
    printVersion();
    process.exit(0);
  }

  const command = args[0];

  if (command === "serve") {
    const configIdx = args.indexOf("--config");
    let configPath: string | undefined = undefined;

    if (configIdx !== -1) {
      configPath = args[configIdx + 1];
      if (
        configPath === undefined ||
        configPath.startsWith("--") ||
        configPath.startsWith("-")
      ) {
        console.error("Error: --config flag requires a path argument.");
        printHelp();
        process.exit(1);
      }
    }

    try {
      const contextive = createServer(configPath);
      await contextive.start();

      // Keep process alive
      process.on("SIGINT", () => {
        contextive.logger.info("Received SIGINT, shutting down...");
        process.exit(0);
      });

      process.on("SIGTERM", () => {
        contextive.logger.info("Received SIGTERM, shutting down...");
        process.exit(0);
      });
    } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
  } else {
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
