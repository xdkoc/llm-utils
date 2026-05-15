const TRUNCATION_PATTERNS = [
  /\w$/, // ends mid-word
  /[,;:]\s*$/, // ends after punctuation suggesting continuation
  /\b(and|or|but|because|that|which|with|for|the|a|an)\s*$/i, // ends on a connector word
  /```\w*\n[\s\S]*[^`]$/, // unclosed code block
];

export function isTruncated(text: string): boolean {
  const trimmed = text.trimEnd();
  if (!trimmed) return false;

  const openCodeBlocks = (trimmed.match(/```/g) ?? []).length % 2 !== 0;
  if (openCodeBlocks) return true;

  const lastChar = trimmed.slice(-1);
  if ([".", "!", "?", '"', "'", ")", "]", "}"].includes(lastChar)) return false;

  return TRUNCATION_PATTERNS.some((p) => p.test(trimmed));
}
