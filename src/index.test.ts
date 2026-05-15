import { describe, it, expect } from "vitest";
import { extractJson, extractCodeBlocks, stripThinkingTags, isTruncated, parseStreamChunk } from "./index.js";

describe("extractJson", () => {
  it("extracts JSON from fenced code block", () => {
    const result = extractJson('```json\n{"key": "value"}\n```');
    expect(result).toEqual({ success: true, data: { key: "value" } });
  });

  it("extracts raw JSON without fences", () => {
    const result = extractJson('{"key": "value"}');
    expect(result).toEqual({ success: true, data: { key: "value" } });
  });

  it("extracts JSON embedded in prose", () => {
    const result = extractJson('Here is the result: {"status": "ok"} done.');
    expect(result).toEqual({ success: true, data: { status: "ok" } });
  });

  it("returns failure for non-JSON text", () => {
    const result = extractJson("no json here");
    expect(result.success).toBe(false);
  });
});

describe("extractCodeBlocks", () => {
  it("extracts multiple code blocks with languages", () => {
    const text = "```ts\nconst x = 1;\n```\n```python\nprint('hi')\n```";
    const blocks = extractCodeBlocks(text);
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toEqual({ language: "ts", code: "const x = 1;" });
    expect(blocks[1]).toEqual({ language: "python", code: "print('hi')" });
  });

  it("returns empty array when no code blocks", () => {
    expect(extractCodeBlocks("plain text")).toEqual([]);
  });
});

describe("stripThinkingTags", () => {
  it("removes thinking tags", () => {
    const text = "<thinking>internal thought</thinking>The answer is 42.";
    expect(stripThinkingTags(text)).toBe("The answer is 42.");
  });

  it("removes multiple tag types", () => {
    const text = "<reasoning>r</reasoning><scratchpad>s</scratchpad>Result.";
    expect(stripThinkingTags(text)).toBe("Result.");
  });
});

describe("isTruncated", () => {
  it("detects unclosed code block", () => {
    expect(isTruncated("Here is code:\n```js\nconst x =")).toBe(true);
  });

  it("returns false for complete sentence", () => {
    expect(isTruncated("The answer is 42.")).toBe(false);
  });

  it("detects text ending mid-word", () => {
    expect(isTruncated("The respon")).toBe(true);
  });
});

describe("parseStreamChunk", () => {
  it("parses OpenAI chunk", () => {
    const chunk = { choices: [{ delta: { content: "hello" }, finish_reason: null }] };
    expect(parseStreamChunk(chunk)).toEqual({ text: "hello", done: false });
  });

  it("detects OpenAI done", () => {
    const chunk = { choices: [{ delta: {}, finish_reason: "stop" }] };
    expect(parseStreamChunk(chunk)).toEqual({ text: "", done: true });
  });

  it("parses Anthropic delta chunk", () => {
    const chunk = { type: "content_block_delta", delta: { text: "world" } };
    expect(parseStreamChunk(chunk)).toEqual({ text: "world", done: false });
  });

  it("detects Anthropic stop", () => {
    const chunk = { type: "message_stop" };
    expect(parseStreamChunk(chunk)).toEqual({ text: "", done: true });
  });
});
