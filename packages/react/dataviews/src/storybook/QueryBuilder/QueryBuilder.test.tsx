import { render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import installPopoverStandIn from "../../../testing/installPopoverStandIn.js";
import QueryBuilder from "./QueryBuilder.js";

let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());

describe("QueryBuilder", () => {
  it("hosts the query bar over its three fields, from the clauses it starts on", async () => {
    render(<QueryBuilder initial="status=deployed&pool=gpu" />);
    expect(
      screen.getByRole("combobox", { name: "Filter machines" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("group", { name: "status is deployed" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "pool is gpu" }),
    ).toBeInTheDocument();
  });

  it("sets the field's width", () => {
    const { container } = render(<QueryBuilder inlineSize="20rem" />);
    expect((container.firstElementChild as HTMLElement).style.inlineSize).toBe(
      "20rem",
    );
  });
});
