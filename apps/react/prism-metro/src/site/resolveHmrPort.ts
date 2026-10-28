import { HMR_PORT_OFFSET } from "./constants.js";

/**
 * Derive the port of the dev server's live-reload WebSocket from the port
 * the site listens on, so each dev server's client reaches its own server.
 *
 * @param port - The port the site listens on.
 * @returns The live-reload WebSocket's port.
 */
export default function resolveHmrPort(port: number): number {
  return port + HMR_PORT_OFFSET;
}
