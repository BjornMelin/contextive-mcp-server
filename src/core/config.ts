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
 * Default tool pack configurations (centralized to avoid duplication).
 */
const DEFAULT_TOOL_PACKS = {
  fs: { enabled: false, mode: "read-only" },
  http: { enabled: false, mode: "read-only" },
  introspect: { enabled: true, mode: "read-only" },
} as const;

/**
 * Complete Contextive configuration schema.
 */
export const configSchema = z.object({
  server: serverConfigSchema.optional().default({ mode: "stdio", logLevel: "info" }),
  providers: z.record(z.string(), providerConfigSchema).optional().default({}),
  toolPacks: z
    .object({
      fs: toolPackConfigSchema.optional().default(DEFAULT_TOOL_PACKS.fs),
      http: toolPackConfigSchema.optional().default(DEFAULT_TOOL_PACKS.http),
      introspect: toolPackConfigSchema.optional().default(DEFAULT_TOOL_PACKS.introspect),
    })
    .optional()
    .default(DEFAULT_TOOL_PACKS),
  workflows: z.record(z.string(), z.unknown()).optional().default({}),
});

export type ContextiveConfig = z.infer<typeof configSchema>;

/**
 * Resolves environment variable references in strings.
 * Supports $VAR and ${VAR} syntax.
 * Throws an error if a referenced environment variable is not defined.
 */
function resolveEnvVars(value: string): string {
  return value.replace(/\$\{?([A-Z_][A-Z0-9_]*)\}?/g, (_, name) => {
    if (process.env[name] === undefined) {
      throw new Error(
        `Environment variable "${name}" is not defined but is referenced in configuration.`
      );
    }
    return process.env[name] as string;
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
 * 1. Explicit `configPath` argument (if provided)
 * 2. CONTEXTIVE_CONFIG env var path
 * 3. contextive.config.json in CWD
 * 4. Default configuration (if no config file found)
 *
 * Note: YAML config files are not yet supported.
 */
export function loadConfig(configPath?: string): ContextiveConfig {
  const cwd = process.cwd();

  // Determine config file path and source (for error messages)
  type Source = "arg" | "env" | "default" | "none";
  let resolvedPath: string | undefined;
  let source: Source = "none";

  if (configPath) {
    resolvedPath = configPath;
    source = "arg";
  } else if (process.env.CONTEXTIVE_CONFIG) {
    resolvedPath = process.env.CONTEXTIVE_CONFIG;
    source = "env";
  } else {
    const jsonPath = resolve(cwd, "contextive.config.json");
    if (existsSync(jsonPath)) {
      resolvedPath = jsonPath;
      source = "default";
    }
  }

  // Load raw config
  let rawConfig: unknown = {};

  if (resolvedPath) {
    // Explicit paths (--config or CONTEXTIVE_CONFIG) must exist
    if (!existsSync(resolvedPath)) {
      if (source === "arg") {
        throw new Error(
          `Configuration file not found at --config path: ${resolvedPath}`
        );
      }
      if (source === "env") {
        throw new Error(
          `Configuration file not found at CONTEXTIVE_CONFIG path: ${resolvedPath}`
        );
      }
      // For implicit default probe, fall through to schema defaults
    } else {
      // File exists, validate format and parse
      if (!resolvedPath.endsWith(".json")) {
        throw new Error(
          `Only JSON configuration files are supported. Got: ${resolvedPath}`
        );
      }
      const content = readFileSync(resolvedPath, "utf-8");
      rawConfig = JSON.parse(content);
    }
  }

  // Resolve environment variables
  const resolvedConfig = resolveConfigEnvVars(rawConfig);

  // Validate and return
  return configSchema.parse(resolvedConfig);
}
