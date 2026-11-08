import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isTokenSigningConfigured, signToken, verifyToken } from "./tokens";

const ID = "9c1d2e3f-4a5b-4c6d-8e7f-0a1b2c3d4e5f";
const ORIGINAL_SECRET = process.env.NEWSLETTER_TOKEN_SECRET;

function setSecret(value: string | undefined) {
  if (value === undefined) delete process.env.NEWSLETTER_TOKEN_SECRET;
  else process.env.NEWSLETTER_TOKEN_SECRET = value;
}

describe("signToken / verifyToken", () => {
  beforeEach(() => setSecret("unit-test-secret"));
  afterEach(() => setSecret(ORIGINAL_SECRET));

  it("round-trips a subscriber id", () => {
    expect(verifyToken(signToken(ID))).toBe(ID);
  });

  it("reports whether a real signing secret is configured", () => {
    setSecret("unit-test-secret");
    expect(isTokenSigningConfigured()).toBe(true);
    setSecret(undefined);
    expect(isTokenSigningConfigured()).toBe(false);
  });

  it("still signs and verifies in degraded (dev) mode", () => {
    // Without a secret the flow must remain exercisable locally, which is why
    // the plan lists the secret as a launch gate rather than a hard failure.
    setSecret(undefined);
    const token = signToken(ID);
    expect(verifyToken(token)).toBe(ID);
  });

  it("rejects a tampered digest", () => {
    const token = signToken(ID);
    const [id, digest] = token.split(".");
    const flipped = digest!.replace(/.$/, digest!.endsWith("A") ? "B" : "A");
    expect(verifyToken(`${id}.${flipped}`)).toBeNull();
  });

  it("rejects an id swapped into someone else's valid token", () => {
    // The actual forgery attempt: take a legitimate signature and pair it with
    // a different subscriber id so the attacker controls which row it targets.
    const token = signToken(ID);
    const digest = token.slice(token.lastIndexOf(".") + 1);
    const victimId = "11111111-1111-4111-8111-111111111111";
    expect(verifyToken(`${victimId}.${digest}`)).toBeNull();
  });

  it("returns only the id the token was minted for", () => {
    const other = "22222222-2222-4222-8222-222222222222";
    // A valid token for another subscriber resolves to THAT id, never ours —
    // a token can never be read as an authorisation for a different row.
    expect(verifyToken(signToken(other))).toBe(other);
    expect(verifyToken(signToken(other))).not.toBe(ID);
  });

  it("rejects a token signed with a different secret", () => {
    setSecret("secret-one");
    const token = signToken(ID);
    setSecret("secret-two");
    expect(verifyToken(token)).toBeNull();
  });

  it("rejects malformed input without throwing", () => {
    for (const bad of [null, undefined, 42, "", ".", "abc", "abc.", ".def", "a.b.c"]) {
      expect(verifyToken(bad as unknown)).toBeNull();
    }
  });

  it("does not accept an empty id", () => {
    expect(verifyToken(signToken(""))).toBeNull();
  });
});
