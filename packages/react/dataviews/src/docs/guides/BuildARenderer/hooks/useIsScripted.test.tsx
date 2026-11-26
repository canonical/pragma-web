import { act, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, onTestFinished } from "vitest";
import useIsScripted from "./useIsScripted.js";

const Probe = (): ReactElement => (
  <output>{useIsScripted() ? "scripted" : "unscripted"}</output>
);

describe("useIsScripted", () => {
  it("answers false on the server", () => {
    expect(renderToString(<Probe />)).toContain("unscripted");
  });

  it("answers true in a client render", () => {
    render(<Probe />);
    expect(screen.getByRole("status")).toHaveTextContent("scripted");
  });

  it("answers true once a server render hydrates", async () => {
    const container = document.createElement("div");
    container.innerHTML = renderToString(<Probe />);
    document.body.append(container);
    onTestFinished(() => container.remove());
    await act(async () => {
      const root = hydrateRoot(container, <Probe />);
      onTestFinished(() => root.unmount());
    });
    expect(container).toHaveTextContent(/^scripted$/);
  });
});
