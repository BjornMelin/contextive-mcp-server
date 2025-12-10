/**
 * Configuration schema and loader for Contextive MCP Server.
 *
 * Uses Zod v4 for runtime validation per ADR-0003.
 */

import { z } from "zod";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Server configuration section.
 */
const serverConfigSchema = z.object({
  mode: z.enum(["stdio", "http"]).default("stdio"),
  logLevel: z.enum(["trace", "debug", "info", "warn", "error"]).default("info"),
  port: z.number().int().min(1).max(65535).optional(),
});

/**
 * Provider configuration (e.g., OpenAI, Anthropic).
 */
const providerConfigSchema = z.object({
  apiKey: z.string().min(1).describe("API key (can use $ENV_VAR syntax)"),
  defaultModel: z.string().optional(),
  baseUrl: z.string().url().optional(),
});

/**
 * Tool pack configuration.
 */
const toolPackConfigSchema = z.object({
  enabled: z.boolean().default(false),
  mode: z.enum(["read-only", "read-write"]).default("read-only"),
});

/**
 * Complete Contextive configuration schema.
 */
export const configSchema = z.object({
  server: serverConfigSchema.optional().default({ mode: "stdio", logLevel: "info" }),
  providers: z.record(z.string(), providerConfigSchema).optional().default({}),
  toolPacks: z
    .object({
      fs: toolPackConfigSchema.optional().default({ enabled: false, mode: "read-only" }),
      http: toolPackConfigSchema.optional().default({ enabled: false, mode: "read-only" }),
      introspect: toolPackConfigSchema.optional().default({ enabled: true, mode: "read-only" }),
    })
    .optional()
    .default({
      fs: { enabled: false, mode: "read-only" },
      http: { enabled: false, mode: "read-only" },
      introspect: { enabled: true, mode: "read-only" },
    }),
  workflows: z.record(z.string(), z.unknown()).optional().default({}),
});

export type ContextiveConfig = z.infer<typeof configSchema>;

/**
 * Resolves environment variable references in strings.
 * Supports $VAR and ${VAR} syntax.
 */
function resolveEnvVars(value: string): string {
  return value.replace(/\$\{?([A-Z_][A-Z0-9_]*)\}?/g, (_, name) => {
    return process.env[name] ?? "";
  });
}

/**
 * Deep-resolves environment variables in config values.
 */
function resolveConfigEnvVars(obj: unknown): unknown {
  if (typeof obj === "string") {
    return resolveEnvVars(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(resolveConfigEnvVars);
  }
  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = resolveConfigEnvVars(value);
    }
    return result;
  }
  return obj;
}

/**
 * Load configuration from file or environment.
 *
 * Resolution order:
 * 1. CONTEXTIVE_CONFIG env var path
 * 2. contextive.config.json in CWD
 * 3. contextive.config.yaml in CWD
 * 4. Default configuration
 */
export function loadConfig(configPath?: string): ContextiveConfig {
  const cwd = process.cwd();

  // Determine config file path
  let resolvedPath: string | undefined = configPath;

  if (!resolvedPath && process.env.CONTEXTIVE_CONFIG) {
    resolvedPath = process.env.CONTEXTIVE_CONFIG;
  }

  if (!resolvedPath) {
    const candidates = [
      "contextive.config.json",
      "contextive.config.yaml",
      "contextive.config.yml",
    ];
    for (const candidate of candidates) {
      const fullPath = resolve(cwd, candidate);
      if (existsSync(fullPath)) {
        resolvedPath = fullPath;
        break;
      }
    }
  }

  // Load raw config
  let rawConfig: unknown = {};

  if (resolvedPath && existsSync(resolvedPath)) {
    const content = readFileSync(resolvedPath, "utf-8");
    if (resolvedPath.endsWith(".json")) {
      rawConfig = JSON.parse(content);
    } else {
      // YAML support would go here - for now, only JSON
      throw new Error(
        `YAML config not yet supported. Use JSON or install yaml parser.`
      );
    }
  }

  // Resolve environment variables
  const resolvedConfig = resolveConfigEnvVars(rawConfig);

  // Validate and return
  return configSchema.parse(resolvedConfig);
}
