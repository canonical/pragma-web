import { useEffect, useState } from "react";
import { useRelayEnvironment } from "react-relay";
import { SOURCE_REQUEST } from "../constants.js";
import type { UseEntitySourceResult } from "./types.js";

/** The response's `source`, or `undefined` when it carries none. */
const readSource = (payload: unknown): string | null | undefined => {
  const data = (payload as { readonly data?: { readonly source?: unknown } })
    .data;
  const source = data?.source;
  if (source === null || typeof source === "string") return source;
  return undefined;
};

/**
 * An entity's statements as Turtle, asked of the provider through the
 * site's Relay network on the client, after mount: the server render and
 * the first paint read "loading", so hydration matches whatever the
 * address. A request still in flight is cancelled when the entity changes
 * or the view unmounts.
 *
 * @param uri - The entity's absolute IRI.
 * @returns Loading, loaded (the text, or `null` when the provider holds
 *   none), or failed.
 * @note Impure: sends a request through the Relay environment's network.
 */
export default function useEntitySource(uri: string): UseEntitySourceResult {
  const environment = useRelayEnvironment();
  const [result, setResult] = useState<UseEntitySourceResult>({
    status: "loading",
  });

  useEffect(() => {
    setResult({ status: "loading" });
    const subscription = environment
      .getNetwork()
      .execute(SOURCE_REQUEST, { uri }, {})
      .subscribe({
        next: (payload) => {
          const source = readSource(payload);
          setResult(
            source === undefined
              ? { status: "failed" }
              : { status: "loaded", source },
          );
        },
        error: () => setResult({ status: "failed" }),
      });
    return () => subscription.unsubscribe();
  }, [environment, uri]);

  return result;
}
