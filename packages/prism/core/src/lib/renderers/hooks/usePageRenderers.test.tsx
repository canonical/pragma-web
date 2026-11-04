import { render, renderHook, screen } from "@testing-library/react";
import { RelayEnvironmentProvider } from "react-relay";
import {
  Environment,
  Network,
  Observable,
  RecordSource,
  Store,
} from "relay-runtime";
import { describe, expect, it } from "vitest";
import usePageRenderers from "./usePageRenderers.js";

describe("usePageRenderers", () => {
  it("offers the page, then Turtle, labelled from the catalog", () => {
    const { result } = renderHook(() => usePageRenderers());
    expect(result.current.map(({ name, label }) => `${name}:${label}`)).toEqual(
      ["page:Page", "turtle:Turtle"],
    );
  });

  it("offers Turtle only when the provider serves source", () => {
    const { result } = renderHook(() => usePageRenderers());
    const turtle = result.current.at(1);
    expect(turtle?.offered?.({ extensions: new Set(["source"]) })).toBe(true);
    expect(turtle?.offered?.({ extensions: new Set(["prose"]) })).toBe(false);
  });

  it("renders the page as given, and Turtle as the entity's source", () => {
    const { result } = renderHook(() => usePageRenderers());
    const [page, turtle] = result.current;
    const props = { uri: "https://a.example/a", title: "A", children: "Body" };
    render(<>{page?.render(props)}</>);
    expect(screen.getByText("Body")).toBeInTheDocument();
    const environment = new Environment({
      network: Network.create(() => Observable.create(() => {})),
      store: new Store(new RecordSource()),
    });
    render(
      <RelayEnvironmentProvider environment={environment}>
        {turtle?.render(props)}
      </RelayEnvironmentProvider>,
    );
    expect(screen.getByText("Loading the source…")).toBeInTheDocument();
  });
});
