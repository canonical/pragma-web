import { createMemoryLocation } from "@canonical/dataviews-core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createQuickFilterProvider } from "../../../../../../../../../../../testing/index.js";
import DataViews from "../../../../../../../../../_work_in_progress/DataViews/Provider.js";
import PanelForm from "./PanelForm.js";

describe("PanelForm", () => {
  it("keeps the form once scripts run, without Apply or hidden fields, and holds its submission", () => {
    const provider = createQuickFilterProvider({
      location: createMemoryLocation({ href: "/hosts?status=ready&q=web" }),
    });
    const { container } = render(
      <DataViews provider={provider}>
        <PanelForm claimed={[]} hasHref>
          <input type="checkbox" aria-label="deployed" />
        </PanelForm>
      </DataViews>,
    );
    const form = container.querySelector("form") as HTMLFormElement;
    expect(form).toHaveAttribute("method", "get");
    expect(screen.queryByRole("button", { name: "Apply" })).toBeNull();
    expect(form.querySelector('input[type="hidden"]')).toBeNull();
    const submit = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(submit);
    expect(submit.defaultPrevented).toBe(true);
  });

  it("renders the controls alone without an address", () => {
    const provider = createQuickFilterProvider();
    const { container } = render(
      <DataViews provider={provider}>
        <PanelForm claimed={[]} hasHref={false}>
          <input type="checkbox" aria-label="deployed" />
        </PanelForm>
      </DataViews>,
    );
    expect(container.querySelector("form")).toBeNull();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });
});
