export type ImportRequest =
  | { kind: "text"; text: string }
  | { kind: "url"; url: string }
  | { kind: "image"; dataUrl: string };

export type ImportDraft = {
  country: string | null;
  places: string[];
  suggestedInterests: string[];
  suggestedDuration: number | null;
  confidence: "high" | "medium" | "low";
  note?: string;
};