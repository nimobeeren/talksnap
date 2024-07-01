import { describe, expect, test } from "vitest";
import { findBestSubstringMatch, splitTranscript } from "./string-utils";

describe("findBestSubstringMatch", () => {
  test("returns null when no match is found", () => {
    const transcript = "This is a test transcript";
    const highlight = "foo";
    const match = findBestSubstringMatch(transcript, highlight);
    expect(match).toBeNull();
  });

  test("returns the correct pos when matching exactly", () => {
    const transcript = "This is a test transcript";
    const highlight = "test";

    const match = findBestSubstringMatch(transcript, highlight);

    expect(match).toEqual({ text: "test", start: 10, end: 14 });
  });

  test("returns the correct pos when matching with case differences", () => {
    const transcript = "This is a test transcript";
    const highlight = "TEST";

    const match = findBestSubstringMatch(transcript, highlight);

    expect(match).toEqual({ text: "test", start: 10, end: 14 });
  });

  test.skip("returns the correct pos when matching with punctuation and case differences", () => {
    const transcript = "This is a\ntest transcript";
    const highlight = "is a test";

    const match = findBestSubstringMatch(transcript, highlight);

    expect(match).toEqual({ text: "is a\ntest", start: 10, end: 14 });
  });
});

describe("splitTranscript", () => {
  test("returns the correct segments without highlights", () => {
    const transcript = "This is a test transcript";
    const highlights = [];
    const match = splitTranscript(transcript, highlights);
    expect(match).toEqual([
      { isHighlight: false, text: "This is a test transcript" },
    ]);
  });

  test("returns the correct segments with highlights", () => {
    const transcript =
      "Check out this cool transcript that we use for testing awesome applications";
    const highlights = [
      { text: "cool transcript", summary: "cool" },
      { text: "awesome", summary: "awesome" },
    ];
    const segments = splitTranscript(transcript, highlights);
    expect(segments).toEqual([
      { isHighlight: false, text: "Check out this " },
      { isHighlight: true, text: "cool transcript", summary: "cool" },
      { isHighlight: false, text: " that we use for testing " },
      { isHighlight: true, text: "awesome", summary: "awesome" },
      { isHighlight: false, text: " applications" },
    ]);
  });

  test("returns the correct segments when highlight is at the start", () => {
    const transcript = "This is a test transcript";
    const highlights = [{ text: "This", summary: "this" }];
    const segments = splitTranscript(transcript, highlights);
    expect(segments).toEqual([
      { isHighlight: true, text: "This", summary: "this" },
      { isHighlight: false, text: " is a test transcript" },
    ]);
  });

  test("returns the correct segments when highlights are touching", () => {
    const transcript = "abcd";
    const highlights = [
      { text: "b", summary: "b" },
      { text: "c", summary: "c" },
    ];
    const segments = splitTranscript(transcript, highlights);
    expect(segments).toEqual([
      { isHighlight: false, text: "a" },
      { isHighlight: true, text: "b", summary: "b" },
      { isHighlight: true, text: "c", summary: "c" },
      { isHighlight: false, text: "d" },
    ]);
  });
});
