import { z } from "zod";

export const ImportRequestSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("text"),
    text: z.string().min(10).max(20000),
  }),
  z.object({
    kind: z.literal("url"),
    url: z.string().url().max(2000),
  }),
  z.object({
    kind: z.literal("image"),
    dataUrl: z.string().max(7_000_000),
  }),
]);

export type ImportRequestInput = z.input<typeof ImportRequestSchema>;

export const ImportDraftSchema = z.object({
  country: z.string().nullable(),
  places: z.array(z.string().max(80)).max(12),
  suggestedInterests: z.array(z.string().max(60)).max(12),
  suggestedDuration: z.number().int().min(1).max(14).nullable(),
  confidence: z.enum(["high", "medium", "low"]),
  note: z.string().max(300).optional(),
});