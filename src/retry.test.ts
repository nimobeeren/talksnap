import { expect, test } from "vitest";
import retry from "./retry";

test("tries 3 times by default", async () => {
  let numTries = 0;
  try {
    await retry(
      () => {
        numTries++;
        throw new Error("boo!");
      },
      {
        minTimeout: 1,
      },
    );
  } catch {
    // do nothing
  } finally {
    expect(numTries).toBe(3); // first run + 2 retries
  }
});

test("throws after all retries failed", async () => {
  await expect(() =>
    retry(
      async () => {
        throw new Error("boo!");
      },
      {
        minTimeout: 1,
      },
    ),
  ).rejects.toThrowError("boo!");
});
