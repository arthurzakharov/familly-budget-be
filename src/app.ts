import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import type { CommitInfo } from "@/types/commit-info";
import type { AppEnv } from "@/types/app-env";
import type { Log } from "@/types/log";
import { errorHandler } from "@/middleware/error-handler";
import { notFound } from "@/middleware/not-found";
import { requestContext } from "@/middleware/request-context";
import { requestLog } from "@/middleware/request-log";
import { createHealthRoutes } from "@/routes/health";

/** Dependencies injected into the app. */
type CreateAppParams = {
  /** Root log; each request gets a child bound to its request id. */
  log: Log;
  /** Shown by the health endpoint; `null` when unavailable. */
  commitInfo: CommitInfo | null;
  /** CORS allowed origins (Hono `cors({ origin })`). */
  origin: string[];
};

/** Builds the Hono app: middleware, error handling and routes. */
export function createApp({ log, commitInfo, origin }: CreateAppParams) {
  const app = new Hono<AppEnv>();

  // Must run first: assigns a request id (X-Request-Id) and a request-bound
  // child log, available via `c` and the async request context.
  app.use(requestContext(log));
  // Sets security headers (HSTS, X-Frame-Options, X-Content-Type-Options, ...).
  app.use(secureHeaders());
  // Allows cross-origin calls from `origin` only; exposes X-Request-Id to browsers.
  app.use(cors({ origin, exposeHeaders: ["X-Request-Id"] }));
  // Logs every completed request; level depends on response status.
  app.use(requestLog());
  // JSON 404 for unknown routes.
  app.notFound(notFound());
  // Maps thrown errors to JSON error responses.
  app.onError(errorHandler());

  return app.route("/", createHealthRoutes(commitInfo));
}

/** App type for the typed RPC client (`hc<AppType>`). */
export type AppType = ReturnType<typeof createApp>;
export type {
  ErrorResponse,
  HealthResponse,
  PublicCommitInfo,
  ValidationIssue,
} from "@/types/responses";
