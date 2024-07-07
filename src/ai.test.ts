import { describe, expect, test, beforeEach } from "vitest";
import { AI } from "./ai";

describe("parseTalkingPoint", () => {
  let ai: AI;
  beforeEach(() => {
    ai = new AI("FAKE_KEY");
  });

  test("parses valid json", () => {
    const raw = JSON.stringify({ text: "Text", summary: "Summary" });
    expect(ai.parseTalkingPoint(raw)).toEqual({
      text: "Text",
      summary: "Summary",
    });
  });

  test("parses when additional properties are present", () => {
    const raw = JSON.stringify({
      text: "Text",
      summary: "Summary",
      extra: "Extra",
    });
    expect(ai.parseTalkingPoint(raw)).toEqual({
      text: "Text",
      summary: "Summary",
    });
  });

  test("capitalizes summary", () => {
    const raw = JSON.stringify({ text: "text", summary: "summary" });
    expect(ai.parseTalkingPoint(raw)).toEqual({
      text: "text",
      summary: "Summary",
    });
  });

  test("throws when json is null", () => {
    const raw = null;
    expect(() => ai.parseTalkingPoint(raw)).toThrowError();
  });

  test("throws when property is missing", () => {
    const raw = JSON.stringify({ text: "text" });
    expect(() => ai.parseTalkingPoint(raw)).toThrowError();
  });

  test("throws when property has wrong type", () => {
    const raw = JSON.stringify({ text: "text", summary: 123 });
    expect(() => ai.parseTalkingPoint(raw)).toThrowError();
  });
});
