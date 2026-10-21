import { createEnvironment } from "@canonical/prism-core";
import { Head } from "@canonical/react-head";
import {
  createMemoryAdapter,
  createRouter,
  route,
} from "@canonical/router-core";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { useRelayEnvironment } from "react-relay";
import { describe, expect, it } from "vitest";
import Shell from "./Shell.js";

// The nest only provides the environment; nothing here queries, so a fetch
// that never settles stands in for the network.
const environment = createEnvironment({
  fetchFn: () => new Promise<never>(() => {}),
});

/** Route content that reads every context the nest provides. */
function Probe(): ReactElement {
  const provided = useRelayEnvironment();
  return (
    <section>
      <Head title="Probe" />
      <h1>Probe content</h1>
      <p>{provided === environment ? "Environment provided" : "Other"}</p>
    </section>
  );
}

const renderShell = () =>
  render(
    <Shell
      environment={environment}
      router={createRouter(
        {
          probe: route({ url: "/", content: Probe }),
          other: route({ url: "/other", content: () => <p>Other page</p> }),
        },
        { adapter: createMemoryAdapter("/") },
      )}
    />,
  );

describe("Shell", () => {
  it("renders the matched route's content through the outlet", async () => {
    renderShell();
    expect(
      await screen.findByRole("heading", { name: "Probe content" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Other page")).toBeNull();
  });

  it("provides the Relay environment it is given", async () => {
    renderShell();
    expect(await screen.findByText("Environment provided")).toBeInTheDocument();
  });

  it("composes the page's title with the document title template", async () => {
    renderShell();
    await screen.findByRole("heading", { name: "Probe content" });
    expect(document.title).toBe("Probe — Pragma docs");
  });
});
