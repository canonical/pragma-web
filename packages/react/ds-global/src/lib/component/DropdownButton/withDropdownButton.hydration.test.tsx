import { act } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../Button/index.js";
import { DropdownPanel } from "./common/Panel/index.js";
import withDropdownButton from "./withDropdownButton.js";

const ViewTrigger = withDropdownButton(Button, ({ ref, id, triggerId }) => (
  <DropdownPanel ref={ref} id={id} aria-labelledby={triggerId}>
    Options
  </DropdownPanel>
));

describe("withDropdownButton hydration", () => {
  it("hydrates the chevron with no mismatch", async () => {
    const ui = <ViewTrigger>View</ViewTrigger>;
    const container = document.createElement("div");
    container.innerHTML = renderToString(ui);
    document.body.append(container);
    const chevron = container.querySelector(".chevron");
    const onRecoverableError = vi.fn();
    const root = await act(async () =>
      hydrateRoot(container, ui, { onRecoverableError }),
    );
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.querySelector(".chevron")).toBe(chevron);
    act(() => root.unmount());
    container.remove();
  });
});
