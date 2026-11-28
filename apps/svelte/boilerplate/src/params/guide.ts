import type { ParamMatcher } from "@sveltejs/kit";
import isGuideSlug from "../domains/marketing/isGuideSlug.js";

/** Matches a guide slug: lowercase kebab-case, or the URL is a 404. */
export const match: ParamMatcher = isGuideSlug;
