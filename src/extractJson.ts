export type ExtractJsonResult =
  | { success: true; data: unknown }
  | { success: false; error: string };

export function extractJson(text: string): ExtractJsonResult {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1].trim() : text.trim();

  try {
    return { success: true, data: JSON.parse(raw) };
  } catch {
    const jsonLike = raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonLike) {
      try {
        return { success: true, data: JSON.parse(jsonLike[1]) };
      } catch {}
    }
    return { success: false, error: "No valid JSON found in text" };
  }
}
