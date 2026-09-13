import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ItemsInput = z.object({
  category: z.string().min(1),
  avoid: z.array(z.string()).default([]),
  count: z.number().int().min(1).max(6).default(2),
});

export interface SmartItem {
  emoji: string;
  en: string;
  es: string;
  ar: string;
}

/** Ask Lovable AI for fresh, age-appropriate items for a category. */
export const generateSmartItems = createServerFn({ method: "POST" })
  .validator((input: unknown) => ItemsInput.parse(input))
  .handler(async ({ data }): Promise<{ items: SmartItem[]; error?: string }> => {
    const geminiKey = process.env["GEMINI_API_KEY"];
    const lovableKey = process.env["LOVABLE_API_KEY"];
    if (!geminiKey && !lovableKey) return { items: [], error: "AI is not configured." };

    const prompt = [
      `Suggest ${data.count} new choice items for a preschool (ages 3-6) preference game.`,
      `Category: "${data.category}".`,
      data.avoid.length ? `Do NOT repeat any of these: ${data.avoid.join(", ")}.` : "",
      "Every item must be concrete, cheerful, non-scary, non-violent, food-safe and culturally neutral.",
      'Reply with JSON only, shape: {"items":[{"emoji":"🐶","en":"Dog","es":"Perro","ar":"كلب"}]}.',
      "Each label is 1-2 words. Emoji must be a single emoji character.",
    ]
      .filter(Boolean)
      .join(" ");

    let text = "";
    if (geminiKey) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        },
      );

      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        return { items: [], error: `AI unavailable (${res.status}). ${detail.slice(0, 120)}` };
      }

      const json = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    } else {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${lovableKey}` },
        body: JSON.stringify({
          model: "openai/gpt-5.6-sol",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
        }),
      });

      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        if (res.status === 402)
          return { items: [], error: "AI credits are used up — using the built-in library." };
        if (res.status === 429)
          return { items: [], error: "AI is busy right now — using the built-in library." };
        return { items: [], error: `AI unavailable (${res.status}). ${detail.slice(0, 120)}` };
      }

      const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      text = json.choices?.[0]?.message?.content ?? "";
    }
    try {
      const parsed = JSON.parse(text) as { items?: SmartItem[] };
      const items = (parsed.items ?? [])
        .filter((i) => i && i.emoji && i.en)
        .slice(0, data.count)
        .map((i) => ({
          emoji: [...i.emoji][0] ?? "⭐",
          en: String(i.en).slice(0, 24),
          es: String(i.es ?? i.en).slice(0, 24),
          ar: String(i.ar ?? i.en).slice(0, 24),
        }));
      return { items };
    } catch {
      return { items: [], error: "AI reply could not be read — using the built-in library." };
    }
  });

const PhotoInput = z.object({ query: z.string().min(1).max(60) });

export interface PhotoResult {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  creator: string;
}

/** Search openly licensed photos so teachers can illustrate their own categories. */
export const searchPhotos = createServerFn({ method: "POST" })
  .validator((input: unknown) => PhotoInput.parse(input))
  .handler(async ({ data }): Promise<{ photos: PhotoResult[]; error?: string }> => {
    const url = new URL("https://api.openverse.org/v1/images/");
    url.searchParams.set("q", data.query);
    url.searchParams.set("page_size", "18");
    url.searchParams.set("mature", "false");
    url.searchParams.set("license_type", "commercial,modification");

    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) return { photos: [], error: `Photo search unavailable (${res.status}).` };
      const json = (await res.json()) as {
        results?: {
          id: string;
          url: string;
          thumbnail?: string;
          title?: string;
          creator?: string;
        }[];
      };
      const photos = (json.results ?? [])
        .filter((r) => r.url)
        .map((r) => ({
          id: r.id,
          url: r.url,
          thumbnail: r.thumbnail ?? r.url,
          title: r.title ?? data.query,
          creator: r.creator ?? "Unknown",
        }));
      return { photos };
    } catch {
      return { photos: [], error: "Photo search needs an internet connection." };
    }
  });
