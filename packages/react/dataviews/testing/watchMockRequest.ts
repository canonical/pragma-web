import type { SetupServer } from "msw/node";
import type { MockRequestWatch } from "./types.js";

/**
 * Follow the first request a mock server receives for one path, through the
 * server's own life-cycle events: a test waits for the request to arrive,
 * not for time to pass, and reads whether the server has finished with it.
 *
 * @note Impure: listens to the server's events until stopped.
 */
export default function watchMockRequest(
  server: SetupServer,
  path: string,
): MockRequestWatch {
  let followed: string | null = null;
  let ended = false;
  let arrive = () => {};
  const received = new Promise<void>((resolve) => {
    arrive = resolve;
  });
  const onStart = ({
    request,
    requestId,
  }: {
    readonly request: Request;
    readonly requestId: string;
  }) => {
    if (followed === null && new URL(request.url).pathname === path) {
      followed = requestId;
      arrive();
    }
  };
  const onEnd = ({ requestId }: { readonly requestId: string }) => {
    if (requestId === followed) {
      ended = true;
    }
  };
  server.events.on("request:start", onStart);
  server.events.on("request:end", onEnd);
  return {
    received,
    hasEnded: () => ended,
    stop: () => {
      server.events.removeListener("request:start", onStart);
      server.events.removeListener("request:end", onEnd);
    },
  };
}
