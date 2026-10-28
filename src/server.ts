import { createApp } from "@/app";
import { parseEnv } from "@/config/env";
import { resolveCommitInfo } from "@/lib/commit-info";
import { handleShutdownSignals } from "@/lib/graceful-shutdown";
import { createLog } from "@/lib/log";
import { logServerStart } from "@/lib/startup-log";

// Parse and validate environment variables
const env = parseEnv(process.env);

// Get Pino log instance
const log = createLog({
  level: env.LOG_LEVEL,
  pretty: env.LOG_FORMAT === "pretty",
});

// Resolve commit info from env or local git
const commitInfo = resolveCommitInfo(env);

// Create Hono app
const app = createApp({ log, commitInfo, origin: env.ALLOWED_ORIGINS });

// Start Bun server on env.PORT
const server = Bun.serve({ port: env.PORT, fetch: app.fetch });

// Log startup; warn if commit info is unavailable
logServerStart(log, { env, commitInfo });

// Gracefully stop server on SIGINT/SIGTERM
handleShutdownSignals(log, server);
