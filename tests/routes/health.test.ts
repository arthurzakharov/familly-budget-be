import { describe, expect, test } from "bun:test";
import { testClient } from "hono/testing";
import { createApp } from "@/app";
import { commitInfoFixture } from "@tests/helpers/fixtures";
import { createTestLog } from "@tests/helpers/log";

describe("health routes", () => {
  for (const path of ["/health", "/"]) {
    test(`GET ${path} returns ok status with commit info`, async () => {
      const { log } = createTestLog();
      const app = createApp({
        log,
        commitInfo: commitInfoFixture,
        origin: [],
      });

      const res = await app.request(path);

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({
        status: "ok",
        commit: {
          shortHash: commitInfoFixture.shortHash,
          date: commitInfoFixture.date,
        },
      });
    });
  }

  test("returns null commit when commit info is unavailable", async () => {
    const { log } = createTestLog();
    const app = createApp({ log, commitInfo: null, origin: [] });

    const res = await app.request("/health");

    expect(await res.json()).toEqual({ status: "ok", commit: null });
  });

  test("is callable through the typed RPC client", async () => {
    const { log } = createTestLog();
    const client = testClient(
      createApp({ log, commitInfo: commitInfoFixture, origin: [] }),
    );

    const res = await client.health.$get();
    const body = await res.json();

    expect(body.status).toBe("ok");
    expect(body.commit?.shortHash).toBe(commitInfoFixture.shortHash);
  });
});
