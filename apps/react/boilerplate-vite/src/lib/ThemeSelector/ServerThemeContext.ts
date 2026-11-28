import { createContext } from "react";

/**
 * The theme the server read from the `theme` cookie. The browser reads the
 * cookie itself, so only the server entry provides it: it lets the selector
 * render the stored choice in the server's HTML, which is what a reader
 * without JavaScript sees.
 */
const ServerThemeContext = createContext<"light" | "dark" | undefined>(
  undefined,
);

export default ServerThemeContext;
