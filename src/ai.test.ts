import { describe, expect, test } from "vitest";
import { parseTalkingPoint } from "./ai";

describe("parseTalkingPoint", () => {
  test("parses valid json", () => {
    const raw = JSON.stringify({ text: "Text", summary: "Summary" });
    expect(parseTalkingPoint(raw)).toEqual({
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
    expect(parseTalkingPoint(raw)).toEqual({
      text: "Text",
      summary: "Summary",
    });
  });

  test("capitalizes summary", () => {
    const raw = JSON.stringify({ text: "text", summary: "summary" });
    expect(parseTalkingPoint(raw)).toEqual({
      text: "text",
      summary: "Summary",
    });
  });

  test("throws when json is null", () => {
    const raw = null;
    expect(() => parseTalkingPoint(raw)).toThrowError();
  });

  test("throws when property is missing", () => {
    const raw = JSON.stringify({ text: "text" });
    expect(() => parseTalkingPoint(raw)).toThrowError();
  });

  test("throws when property has wrong type", () => {
    const raw = JSON.stringify({ text: "text", summary: 123 });
    expect(() => parseTalkingPoint(raw)).toThrowError();
  });
});
