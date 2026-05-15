const THINKING_TAGS = ["thinking", "reasoning", "scratchpad", "inner_monologue"];

export function stripThinkingTags(text: string): string {
  let result = text;
  for (const tag of THINKING_TAGS) {
    result = result.replace(new RegExp(`<${tag}>[\\s\\S]*?<\\/${tag}>`, "gi"), "");
  }
  return result.trim();
}
