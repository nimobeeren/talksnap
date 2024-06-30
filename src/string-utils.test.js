import { describe, expect, test } from "vitest";
import { findFuzzySubstringPos, splitTranscript } from "./string-utils";

describe("findFuzzySubstringPos", () => {
  test("returns null when no match is found", () => {
    const transcript = "This is a test transcript";
    const highlight = "foo";
    const result = findFuzzySubstringPos(transcript, highlight);
    expect(result).toBeNull();
  });

  test("returns the correct pos when matching exactly", () => {
    const transcript = "This is a test transcript";
    const highlight = "test";

    const result = findFuzzySubstringPos(transcript, highlight);

    expect(result).toEqual([10, 14]);
  });

  test("returns the correct pos when matching with case differences", () => {
    const transcript = "This is a test transcript";
    const highlight = "TEST";

    const result = findFuzzySubstringPos(transcript, highlight);

    expect(result).toEqual([10, 14]);
  });

  test.skip("returns the correct pos when matching with punctuation and case differences", () => {
    const transcript = "This is a\ntest transcript";
    const highlight = "is a test";

    const result = findFuzzySubstringPos(transcript, highlight);

    expect(result).toEqual([5, 14]);
  });
});

describe("splitTranscript", () => {
  test("returns the correct segments without highlights", () => {
    const transcript = "This is a test transcript";
    const highlights = [];
    const result = splitTranscript(transcript, highlights);
    expect(result).toEqual([
      { isHighlight: false, value: "This is a test transcript" },
    ]);
  });

  test("returns the correct segments with highlights", () => {
    const transcript =
      "Check out this cool transcript that we use for testing awesome applications";
    const highlights = ["cool transcript", "awesome"];
    const result = splitTranscript(transcript, highlights);
    expect(result).toEqual([
      { isHighlight: false, value: "Check out this " },
      { isHighlight: true, value: "cool transcript" },
      { isHighlight: false, value: " that we use for testing " },
      { isHighlight: true, value: "awesome" },
      { isHighlight: false, value: " applications" },
    ]);
  });

  test("returns the correct segments when highlight is at the start", () => {
    const transcript = "This is a test transcript";
    const highlights = ["This"];
    const result = splitTranscript(transcript, highlights);
    expect(result).toEqual([
      { isHighlight: true, value: "This" },
      { isHighlight: false, value: " is a test transcript" },
    ]);
  });

  test("returns the correct segments when highlights are touching", () => {
    const transcript = "abcd";
    const highlights = ["b", "c"];
    const result = splitTranscript(transcript, highlights);
    expect(result).toEqual([
      { isHighlight: false, value: "a" },
      { isHighlight: true, value: "b" },
      { isHighlight: true, value: "c" },
      { isHighlight: false, value: "d" },
    ]);
  });
});
