import {
  createDeferred,
  installFakeClock,
  runFailureHandlers,
} from "@canonical/dataviews-core/testing";
import { cleanup, screen } from "@testing-library/react";
import { type ReactElement, useEffect, useState } from "react";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import renderAtRest from "./renderAtRest.js";
import subscribeToBusy from "./subscribeToBusy.js";

/** Resolve once the render's wait observes it. */
const listenForWait = (): Promise<void> => {
  const listening = createDeferred<void>();
  const observe = MutationObserver.prototype.observe;
  const spy = vi
    .spyOn(MutationObserver.prototype, "observe")
    .mockImplementationOnce(function (this: MutationObserver, ...args) {
      observe.apply(this, args);
      listening.resolve();
    });
  onTestFinished(() => {
    spy.mockRestore();
  });
  return listening.promise;
};

/** A region busy until `answer` settles. */
const Loading = ({
  answer,
}: {
  readonly answer: Promise<void>;
}): ReactElement => {
  const [busy, setBusy] = useState(true);
  useEffect(() => {
    void answer.then(() => {
      setBusy(false);
    });
  }, [answer]);
  return (
    <section aria-label="Rows" aria-busy={busy}>
      {busy ? "Loading" : "Loaded"}
    </section>
  );
};

describe("renderAtRest", () => {
  it("resolves at once when nothing in the render is busy", async () => {
    const { container } = await renderAtRest(<p>Ready</p>);
    expect(container).toHaveTextContent("Ready");
  });

  it("waits until the busy region settles", async () => {
    const answer = createDeferred<void>();
    // The answer arrives once the wait listens, never sooner.
    void listenForWait().then(() => {
      answer.resolve();
    });
    await renderAtRest(<Loading answer={answer.promise} />);
    expect(screen.getByRole("region", { name: "Rows" })).toHaveAttribute(
      "aria-busy",
      "false",
    );
  });

  it("rejects under a fake clock", async () => {
    installFakeClock();
    await expect(renderAtRest(<p>Ready</p>)).rejects.toThrow(
      "renderAtRest needs the real clock",
    );
  });

  it("names what it awaited when the test fails after cleanup", async (context) => {
    const listening = listenForWait();
    void renderAtRest(<Loading answer={createDeferred<void>().promise} />);
    await listening;
    const unmounted = createDeferred<void>();
    const unsubscribe = subscribeToBusy(document.body)(() => {
      unmounted.resolve();
    });
    onTestFinished(unsubscribe);
    // Cleanup runs before the failure handlers, as after a failed test.
    cleanup();
    await unmounted.promise;
    await expect(runFailureHandlers(context)).resolves.toEqual([
      "Still waiting on no busy element in the render.",
    ]);
  });
});
