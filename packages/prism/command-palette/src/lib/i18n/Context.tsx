import { createTranslator } from "@canonical/i18n-core";
import { createContext } from "react";
import { MESSAGES } from "./constants.js";
import type { Translate } from "./types.js";

/**
 * The translator the palette's components read their strings through. Its
 * default reads the English catalog, so the palette renders its copy with no
 * provider mounted; a locale-aware layer supplies a request's own translator
 * by providing this context, without touching a component.
 */
const MessagesContext = createContext<Translate>(
  createTranslator("en", MESSAGES),
);

export default MessagesContext;
