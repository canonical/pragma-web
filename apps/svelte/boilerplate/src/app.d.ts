import type { Theme } from "./lib/ThemeSelector/index.js";

declare global {
  namespace App {
    interface Locals {
      /** The theme the `theme` cookie pins, if any. */
      theme: Theme | undefined;
      /** The locale negotiated from the `locale` cookie and Accept-Language. */
      locale: string;
    }
  }
}
