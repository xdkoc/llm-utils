# llm-utils

Zero-dependency TypeScript utilities for parsing and processing LLM outputs.

Works with OpenAI, Anthropic, and any other LLM provider.

```bash
npm install llm-utils
```

---

## Why

LLMs return messy text. You need JSON, but get markdown. You need clean output, but get `<thinking>` tags. You need to know if the response was cut off. This library handles all of that.

---

## Functions

### `extractJson(text)`

Extracts JSON from LLM output — works whether the model wrapped it in a code block or not.

```ts
import { extractJson } from "llm-utils";

// From a fenced code block
extractJson('```json\n{"name": "Alice"}\n```');
// → { success: true, data: { name: "Alice" } }

// From raw text
extractJson('{"name": "Alice"}');
// → { success: true, data: { name: "Alice" } }

// Embedded in prose
extractJson('Here is your result: {"status": "ok"} — let me know if you need more.');
// → { success: true, data: { status: "ok" } }

// Nothing found
extractJson("Sorry, I cannot help with that.");
// → { success: false, error: "No valid JSON found in text" }
```

---

### `extractCodeBlocks(text)`

Extracts all fenced code blocks with their language tags.

```ts
import { extractCodeBlocks } from "llm-utils";

const text = `
Here is the solution:
\`\`\`ts
const greet = (name: string) => \`Hello, \${name}!\`;
\`\`\`
And the test:
\`\`\`ts
expect(greet("Alice")).toBe("Hello, Alice!");
\`\`\`
`;

extractCodeBlocks(text);
// → [
//     { language: "ts", code: 'const greet = (name: string) => `Hello, ${name}!`;' },
//     { language: "ts", code: 'expect(greet("Alice")).toBe("Hello, Alice!");' }
//   ]
```

---

### `stripThinkingTags(text)`

Removes internal reasoning tags that some models include in their output (`<thinking>`, `<reasoning>`, `<scratchpad>`, `<inner_monologue>`).

```ts
import { stripThinkingTags } from "llm-utils";

stripThinkingTags(`
  <thinking>
    The user wants a short answer. I should keep it brief.
  </thinking>
  The capital of France is Paris.
`);
// → "The capital of France is Paris."
```

---

### `isTruncated(text)`

Detects whether an LLM response was cut off mid-generation (e.g. due to max_tokens).

```ts
import { isTruncated } from "llm-utils";

isTruncated("The answer is 42.");
// → false

isTruncated("Here is the code:\n```js\nconst x =");
// → true  (unclosed code block)

isTruncated("The main reason this works is bec");
// → true  (ends mid-word)
```

---

### `parseStreamChunk(chunk)`

Unified parser for streaming responses from OpenAI and Anthropic. Returns a consistent `{ text, done }` shape regardless of provider.

```ts
import { parseStreamChunk } from "llm-utils";

// OpenAI chunk
parseStreamChunk({ choices: [{ delta: { content: "Hello" }, finish_reason: null }] });
// → { text: "Hello", done: false }

// Anthropic chunk
parseStreamChunk({ type: "content_block_delta", delta: { text: "Hello" } });
// → { text: "Hello", done: false }

// Done signals
parseStreamChunk({ choices: [{ delta: {}, finish_reason: "stop" }] });
// → { text: "", done: true }

parseStreamChunk({ type: "message_stop" });
// → { text: "", done: true }
```

---

## Full example: streaming with unified output

```ts
import { parseStreamChunk, isTruncated, extractJson } from "llm-utils";

let fullText = "";

for await (const chunk of stream) {
  const { text, done } = parseStreamChunk(chunk);
  fullText += text;
  if (done) break;
}

if (isTruncated(fullText)) {
  console.warn("Response was cut off!");
}

const result = extractJson(fullText);
if (result.success) {
  console.log(result.data);
}
```

---

## API

| Function | Signature | Returns |
|---|---|---|
| `extractJson` | `(text: string)` | `{ success: true, data: unknown } \| { success: false, error: string }` |
| `extractCodeBlocks` | `(text: string)` | `CodeBlock[]` |
| `stripThinkingTags` | `(text: string)` | `string` |
| `isTruncated` | `(text: string)` | `boolean` |
| `parseStreamChunk` | `(chunk: unknown)` | `{ text: string, done: boolean }` |

---

## License

MIT
