import { installPopoverStandIn } from "@canonical/react-ds-global/testing";
import { render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import renderBarWith from "./renderBarWith.js";

let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());

describe("renderBarWith", () => {
  it("renders the machines as configured, with the story's args", async () => {
    render(renderBarWith({ query: "status=deployed" })({}));
    expect(
      await screen.findByRole("group", { name: "status is deployed" }),
    ).toBeInTheDocument();
  });

  it("renders the machines unconfigured", () => {
    render(renderBarWith()({}));
    expect(
      screen.getByRole("combobox", { name: "Filter records" }),
    ).toBeInTheDocument();
  });
});
