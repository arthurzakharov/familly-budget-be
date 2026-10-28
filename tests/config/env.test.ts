import { describe, expect, test } from "bun:test";
import { parseEnv } from "@/config/env";

describe("parseEnv", () => {
  test("applies defaults", () => {
    expect(parseEnv({})).toEqual({
      NODE_ENV: "development",
      PORT: 3000,
      LOG_LEVEL: "info",
      LOG_FORMAT: "json",
      ALLOWED_ORIGINS: [],
    });
  });

  test("parses provided values", () => {
    expect(
      parseEnv({
        NODE_ENV: "production",
        PORT: "8080",
        LOG_LEVEL: "warn",
        LOG_FORMAT: "pretty",
        ALLOWED_ORIGINS: " https://app.example.com, http://localhost:5173 ,",
      }),
    ).toEqual({
      NODE_ENV: "production",
      PORT: 8080,
      LOG_LEVEL: "warn",
      LOG_FORMAT: "pretty",
      ALLOWED_ORIGINS: ["https://app.example.com", "http://localhost:5173"],
    });
  });

  test("treats empty GIT_COMMIT_* values as unset", () => {
    const env = parseEnv({
      GIT_COMMIT_HASH: "",
      GIT_COMMIT_MESSAGE: "",
      GIT_COMMIT_AUTHOR: "",
      GIT_COMMIT_DATE: "",
    });

    expect(env.GIT_COMMIT_HASH).toBeUndefined();
    expect(env.GIT_COMMIT_MESSAGE).toBeUndefined();
    expect(env.GIT_COMMIT_AUTHOR).toBeUndefined();
    expect(env.GIT_COMMIT_DATE).toBeUndefined();
    expect(parseEnv({ GIT_COMMIT_HASH: "abc" }).GIT_COMMIT_HASH).toBe("abc");
  });

  test("requires ALLOWED_ORIGINS in production", () => {
    expect(() => parseEnv({ NODE_ENV: "production" })).toThrow(
      /required in production[\s\S]*ALLOWED_ORIGINS/,
    );
    expect(() =>
      parseEnv({ NODE_ENV: "production", ALLOWED_ORIGINS: " , " }),
    ).toThrow(/required in production[\s\S]*ALLOWED_ORIGINS/);
  });

  test("does not require deployment variables outside production", () => {
    expect(() => parseEnv({ NODE_ENV: "development" })).not.toThrow();
    expect(() => parseEnv({ NODE_ENV: "test" })).not.toThrow();
  });

  test("normalises origins to what browsers send (no trailing slash or path)", () => {
    expect(
      parseEnv({
        ALLOWED_ORIGINS:
          "http://localhost:5173/,https://app.example.com/some/path",
      }).ALLOWED_ORIGINS,
    ).toEqual(["http://localhost:5173", "https://app.example.com"]);
  });

  test("throws a readable error for invalid values", () => {
    expect(() =>
      parseEnv({
        PORT: "abc",
        LOG_LEVEL: "loud",
        LOG_FORMAT: "fancy",
        ALLOWED_ORIGINS: "not-a-url",
      }),
    ).toThrow(
      /Invalid env variables[\s\S]*PORT[\s\S]*LOG_LEVEL[\s\S]*LOG_FORMAT[\s\S]*ALLOWED_ORIGINS/,
    );
  });
});
