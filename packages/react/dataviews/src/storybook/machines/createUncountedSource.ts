import type { Source } from "@canonical/dataviews-core";
import createMachineSource from "./createMachineSource.js";
import type { Machine } from "./types.js";

/**
 * A source that pages without counting, as many backends do: it declares no
 * total and publishes none, so nothing can offer a last page.
 */
export default function createUncountedSource(): Source<Machine> {
  const source = createMachineSource();
  const counts = {
    pageable: "unknown",
    matched: "unknown",
    total: "unknown",
  } as const;
  return {
    capabilities: { ...source.capabilities, counts },
    execute: (request, deliver) =>
      source.execute(request, (delivery) => {
        if (delivery.status !== "succeeded") {
          deliver(delivery);
          return;
        }
        const unknown = { kind: "unknown" } as const;
        deliver({
          status: "succeeded",
          page: {
            ...delivery.page,
            counts: { pageable: unknown, matched: unknown, total: unknown },
          },
        });
      }),
  };
}
