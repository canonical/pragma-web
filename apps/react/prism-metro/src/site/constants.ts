/**
 * The port the Bun dev and preview servers listen on when `PORT` is unset or
 * not a number, and so the port the sitemap's localhost fallback names. It sits beside the
 * metro graph's 5176, so the graph and the site run side by side.
 */
export const DEFAULT_PORT = 5178;

/**
 * How far above the site's port the Bun dev server's live-reload WebSocket
 * listens. Vite in middleware mode cannot share the port Bun serves, so it
 * opens its own; deriving it from the site's port keeps two dev servers on
 * one machine from both claiming Vite's fixed default.
 */
export const HMR_PORT_OFFSET = 1;
