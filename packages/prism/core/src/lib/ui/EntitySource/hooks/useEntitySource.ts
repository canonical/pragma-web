import { useEffect, useState } from "react";
import { useRelayEnvironment } from "react-relay";
import { createOperationDescriptor, type Environment } from "relay-runtime";
import { ENTITY_SOURCE_QUERY, SOURCE_REQUEST } from "../constants.js";
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
 * The entity's source as the store holds it, which a route's warm put
 * there, or `undefined` when the store holds none for `uri`.
 *
 * @note Impure: reads the Relay store.
 */
const readStoredSource = (
  environment: Environment,
  uri: string,
): string | null | undefined => {
  const snapshot = environment.lookup(
    createOperationDescriptor(ENTITY_SOURCE_QUERY, { uri }).fragment,
  );
  return snapshot.isMissingData ? undefined : readSource(snapshot);
};

/**
 * An entity's statements as Turtle: read from the store when a route's warm
 * put them there, so the server's render and hydration both carry the
 * document; otherwise asked of the provider through the site's Relay
 * network on the client, after mount, the server render and the first
 * paint reading "loading". A request still in flight is cancelled when the
 * entity changes or the view unmounts.
 *
 * @param uri - The entity's absolute IRI.
 * @returns Loading, loaded (the text, or `null` when the provider holds
 *   none), or failed.
 * @note Impure: reads the Relay store, and sends a request through the
 *   Relay environment's network when the store holds no source.
 */
export default function useEntitySource(uri: string): UseEntitySourceResult {
  const environment = useRelayEnvironment();
  const stored = readStoredSource(environment, uri);
  const [result, setResult] = useState<UseEntitySourceResult>({
    status: "loading",
  });

  useEffect(() => {
    if (stored !== undefined) return;
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
  }, [environment, uri, stored]);

  return stored === undefined ? result : { status: "loaded", source: stored };
}
