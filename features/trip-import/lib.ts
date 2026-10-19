import { google } from "@ai-sdk/google";
import { generateText, Output, type UserContent } from "ai";
import { interests as knownInterests } from "@/constants";
import { ImportDraftSchema } from "./schemas";
import type { ImportDraft, ImportRequest } from "./types";

const FETCH_TIMEOUT_MS = 10_000;
const FETCH_BYTE_CAP = 500 * 1024;
const TEXT_CHAR_CAP = 8_000;

/**
 * Fetches a web page and returns readable plain text.
 * 10s timeout, 500 KB cap, scripts/styles/tags stripped. Never throws.
 */
export async function fetchUrlText(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return "";
    }

    const response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "Tourvisto-Trip-Importer/1.0" },
    });

    if (!response.ok) return "";

    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
      return "";
    }

    const declaredLength = Number(response.headers.get("content-length") ?? "0");

    if (declaredLength > FETCH_BYTE_CAP) {
      return "";
    }

    const reader = response.body?.getReader();

    if (!reader) {
      return stripHtml(await response.text());
    }

    const decoder = new TextDecoder();
    let bytes = 0;
    let raw = "";

    while (bytes < FETCH_BYTE_CAP) {
      const { done, value } = await reader.read();

      if (done) break;

      bytes += value.byteLength;
      raw += decoder.decode(value, { stream: true });
    }

    await reader.cancel().catch(() => undefined);

    return stripHtml(raw);
  } catch (error) {
    console.log("fetchUrlText failed:", error);
    return "";
  } finally {
    clearTimeout(timer);
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, TEXT_CHAR_CAP);
}

const emptyDraft = (note: string): ImportDraft => ({
  country: null,
  places: [],
  suggestedInterests: [],
  suggestedDuration: null,
  confidence: "low",
  note,
});

const extractionInstructions = `You read travel content (a blog, a post, a photo of a boarding pass, an itinerary screenshot) and pull out trip details.

Rules:
- country: the main destination country, written as a full English country name (e.g. "Portugal"). Use null if you truly cannot tell.
- places: up to 12 city/place names mentioned in the order they appear.
- suggestedInterests: up to 12 short interest tags. Prefer these exact options when they fit: ${knownInterests.join(", ")}.
- suggestedDuration: trip length in days if it is stated or obvious, otherwise null.
- confidence: "high" when the content clearly describes one trip, "medium" when it is partly clear, "low" when the content is unclear or is not about travel at all.
- note: one short plain-English sentence for the traveler. Say what you found, or what was unclear. No jargon.

Never invent details that are not in the content. Never refuse: if the content is not a trip, return low confidence with an empty draft.`;

function normaliseDraft(raw: {
  country: string | null;
  places: string[];
  suggestedInterests: string[];
  suggestedDuration: number | null;
  confidence: "high" | "medium" | "low";
  note?: string;
}): ImportDraft {
  return {
    country: raw.country?.trim() || null,
    places: (raw.places ?? []).map((place) => place.trim()).filter(Boolean),
    suggestedInterests: (raw.suggestedInterests ?? [])
      .map((tag) => tag.trim())
      .filter(Boolean),
    suggestedDuration: raw.suggestedDuration ?? null,
    confidence: raw.confidence,
    note: raw.note?.trim() || undefined,
  };
}

/**
 * Turns pasted text, a link or an image into a draft trip.
 * Never throws — unrecognised content comes back as a low-confidence draft
 * with a friendly note so the traveller can still fill the form by hand.
 */
export async function extractDraft(input: ImportRequest): Promise<ImportDraft> {
  try {
    const model = google("gemini-2.5-flash");

    let content: UserContent;

    if (input.kind === "text") {
      content = `${extractionInstructions}\n\n--- TRAVEL CONTENT ---\n${input.text.slice(
        0,
        TEXT_CHAR_CAP
      )}`;
    } else if (input.kind === "url") {
      const pageText = await fetchUrlText(input.url);

      if (!pageText) {
        return emptyDraft(
          "We could not read that link. You can paste the text instead, or just fill the form yourself."
        );
      }

      content = `${extractionInstructions}\n\n--- TRAVEL CONTENT (from ${input.url}) ---\n${pageText}`;
    } else {
      content = [
        { type: "text", text: extractionInstructions },
        { type: "image", image: input.dataUrl },
      ];
    }

    const result = await generateText({
      model,
      // @ts-expect-error - complex schema causes deep type instantiation
      output: Output.object({ schema: ImportDraftSchema }),
      messages: [{ role: "user", content }],
    });

    const draft = result.output as
      | {
          country: string | null;
          places: string[];
          suggestedInterests: string[];
          suggestedDuration: number | null;
          confidence: "high" | "medium" | "low";
          note?: string;
        }
      | undefined;

    if (!draft) {
      return emptyDraft(
        "We could not read that. Try pasting the trip text instead, or fill the form yourself."
      );
    }

    const normalised = normaliseDraft(draft);

    if (
      !normalised.country &&
      normalised.places.length === 0 &&
      normalised.suggestedInterests.length === 0
    ) {
      return emptyDraft(
        normalised.note ??
          "We could not spot a trip in that. Paste the trip text or fill the form yourself."
      );
    }

    return normalised;
  } catch (error) {
    console.log("extractDraft failed:", error);
    return emptyDraft(
      "Something went wrong while reading that. You can fill the form yourself, or try again."
    );
  }
}