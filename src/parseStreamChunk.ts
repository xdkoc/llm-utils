export interface ParsedChunk {
  text: string;
  done: boolean;
}

// OpenAI: { choices: [{ delta: { content: string }, finish_reason }] }
// Anthropic: { type: "content_block_delta", delta: { text } } or { type: "message_stop" }
export function parseStreamChunk(chunk: unknown): ParsedChunk {
  if (typeof chunk !== "object" || chunk === null) {
    return { text: "", done: false };
  }

  const c = chunk as Record<string, unknown>;

  // OpenAI format
  if (Array.isArray(c.choices)) {
    const choice = c.choices[0] as Record<string, unknown>;
    const delta = choice?.delta as Record<string, unknown> | undefined;
    return {
      text: (delta?.content as string) ?? "",
      done: choice?.finish_reason != null,
    };
  }

  // Anthropic format
  if (c.type === "content_block_delta") {
    const delta = c.delta as Record<string, unknown> | undefined;
    return { text: (delta?.text as string) ?? "", done: false };
  }

  if (c.type === "message_stop") {
    return { text: "", done: true };
  }

  return { text: "", done: false };
}
