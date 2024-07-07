import { describe, expect, test } from "vitest";
import { findBestSubstringMatch, splitTranscript } from "./string-utils";

describe("findBestSubstringMatch", () => {
  test("returns null when no match is found", () => {
    const transcript = "This is a test transcript";
    const pattern = "foo";
    const match = findBestSubstringMatch(transcript, pattern);
    expect(match).toBeNull();
  });

  test("returns the correct pos when matching exactly", () => {
    const transcript = "This is a test transcript";
    const pattern = "test";

    const match = findBestSubstringMatch(transcript, pattern);

    expect(match).toEqual({ text: "test", start: 10, end: 14 });
  });

  test("returns the correct pos when matching with case differences", () => {
    const transcript = "This is a test transcript";
    const pattern = "TEST";

    const match = findBestSubstringMatch(transcript, pattern);

    expect(match).toEqual({ text: "test", start: 10, end: 14 });
  });

  test("returns the correct pos when matching with whitespace differences", () => {
    const transcript = "This is a\ntest transcript";
    const pattern = "is a test";

    const match = findBestSubstringMatch(transcript, pattern);

    expect(match).toEqual({ text: "is a\ntest", start: 5, end: 14 });
  });

  test.skip("returns the correct pos when matching with punctuation differences", () => {
    const transcript = "This is a test transcript";
    const pattern = "test transcript.";

    const match = findBestSubstringMatch(transcript, pattern);

    expect(match).toEqual({ text: "test transcript", start: 10, end: 25 });
  });
});

describe("splitTranscript", () => {
  test("returns the correct segments without snaps", () => {
    const transcript = "This is a test transcript";
    const snaps: any[] = [];
    const match = splitTranscript(transcript, snaps);
    expect(match).toEqual([
      { isSnap: false, text: "This is a test transcript" },
    ]);
  });

  test("returns the correct segments with snaps", () => {
    const transcript =
      "Check out this cool transcript that we use for testing awesome applications";
    const snaps = [
      { text: "cool transcript", summary: "cool" },
      { text: "awesome", summary: "awesome" },
    ];
    const segments = splitTranscript(transcript, snaps);
    expect(segments).toEqual([
      { isSnap: false, text: "Check out this " },
      { isSnap: true, text: "cool transcript", summary: "cool" },
      { isSnap: false, text: " that we use for testing " },
      { isSnap: true, text: "awesome", summary: "awesome" },
      { isSnap: false, text: " applications" },
    ]);
  });

  test("returns the correct segments when snap is at the start", () => {
    const transcript = "This is a test transcript";
    const snaps = [{ text: "this", summary: "this" }];
    const segments = splitTranscript(transcript, snaps);
    expect(segments).toEqual([
      { isSnap: true, text: "This", summary: "this" },
      { isSnap: false, text: " is a test transcript" },
    ]);
  });

  test("returns the correct segments when snap is at the end", () => {
    const transcript = "This is a test transcript";
    const snaps = [{ text: "transcript", summary: "transcript" }];
    const segments = splitTranscript(transcript, snaps);
    expect(segments).toEqual([
      { isSnap: false, text: "This is a test " },
      { isSnap: true, text: "transcript", summary: "transcript" },
    ]);
  });

  test("returns the correct segments when snaps are touching", () => {
    const transcript = "abcd";
    const snaps = [
      { text: "b", summary: "b" },
      { text: "c", summary: "c" },
    ];
    const segments = splitTranscript(transcript, snaps);
    expect(segments).toEqual([
      { isSnap: false, text: "a" },
      { isSnap: true, text: "b", summary: "b" },
      { isSnap: true, text: "c", summary: "c" },
      { isSnap: false, text: "d" },
    ]);
  });
});
