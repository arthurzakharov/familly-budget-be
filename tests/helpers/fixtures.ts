import { parseEnv } from "@/config/env";
import type { CommitInfo } from "@/types/commit-info";

export const envFixture = parseEnv({});

export const commitInfoFixture: CommitInfo = {
  hash: "0123456789abcdef0123456789abcdef01234567",
  shortHash: "0123456",
  message: "feat: add health endpoint",
  author: "Jane Doe",
  date: "2026-10-01T12:00:00+02:00",
};
