import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button } from "../Button/index.js";
import { DropdownPanel } from "./common/Panel/index.js";
import withDropdownButton from "./withDropdownButton.js";

const ViewTrigger = withDropdownButton(Button, ({ ref, id, triggerId }) => (
  <DropdownPanel ref={ref} id={id} aria-labelledby={triggerId}>
    Options
  </DropdownPanel>
));

describe("withDropdownButton SSR", () => {
  it("renders the class and the chevron in the server HTML", () => {
    const html = renderToString(<ViewTrigger>View</ViewTrigger>);
    expect(html).toContain('class="ds button primary ds dropdown-button"');
    expect(html).toMatch(
      /<span class="label">View<span class="chevron"><svg[^>]*aria-hidden="true"/,
    );
  });
});
