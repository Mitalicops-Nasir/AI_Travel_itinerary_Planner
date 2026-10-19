"use server";

import { requireUser } from "@/lib/guards";
import { extractDraft } from "./lib";
import { ImportRequestSchema } from "./schemas";
import type { ImportRequest } from "./types";

export async function previewImport(input: ImportRequest) {
  try {
    const { user, error } = await requireUser(
      "You must be logged in to import a trip."
    );

    if (!user) {
      return { success: false as const, error };
    }

    const parsed = ImportRequestSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false as const,
        error: "Please paste some text, a valid link, or upload one image.",
      };
    }

    const draft = await extractDraft(input as ImportRequest);

    return { success: true as const, draft };
  } catch (error) {
    console.log("previewImport failed:", error);
    return {
      success: false as const,
      error: "We could not read that. You can fill the form yourself.",
    };
  }
}