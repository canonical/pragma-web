import { MODIFIER_FAMILIES } from "@canonical/ds-types";
import type { Meta, StoryFn } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { rtl, serverMarkup } from "../../../storybook/decorators.js";
import { Button } from "../Button/index.js";
import { DropdownPanel } from "./common/Panel/index.js";
import type { WithDropdownRender } from "./types.js";
import Component from "./withDropdownButton.js";

const meta = {
  title: "components/DropdownButton",
  // The panel is a popover in the top layer, which escapes every container,
  // so each docs preview gets its own iframe.
  parameters: {
    docs: {
      story: { inline: false, iframeHeight: "320px" },
      source: { type: "code", language: "tsx" },
    },
  },
} satisfies Meta;

export default meta;

/** Lays a row of triggers out with room for their panels. */
const row: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--dimension-200)",
  alignItems: "start",
};

/*
 * The panels and their triggers are defined at module scope: each HOC call
 * makes a component type, and the render function sees only module values.
 */

const renderViewOptions: WithDropdownRender = ({ ref, id, triggerId }) => (
  <DropdownPanel ref={ref} id={id} aria-labelledby={triggerId}>
    <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
      <legend>Show</legend>
      <label style={{ display: "block" }}>
        <input type="checkbox" defaultChecked /> Status
      </label>
      <label style={{ display: "block" }}>
        <input type="checkbox" /> Owner
      </label>
    </fieldset>
  </DropdownPanel>
);

const ViewTrigger = Component(Button, renderViewOptions);

/**
 * A secondary "View" button whose panel holds view options. The chevron
 * trails the label and says the button expands the interface.
 */
export const Default: StoryFn = () => (
  <ViewTrigger importance="secondary">View</ViewTrigger>
);
Default.parameters = {
  docs: {
    source: {
      code: `const ViewTrigger = withDropdownButton(Button, ({ ref, id, triggerId }) => (
  <DropdownPanel ref={ref} id={id} aria-labelledby={triggerId}>
    <label><input type="checkbox" defaultChecked /> Status</label>
  </DropdownPanel>
));

<ViewTrigger importance="secondary">View</ViewTrigger>`,
    },
  },
};

/** Importance and anticipation are the wrapped Button's own props. */
export const ImportanceAndAnticipation: StoryFn = () => (
  <div style={{ display: "grid", gap: "var(--dimension-200)" }}>
    {[undefined, ...MODIFIER_FAMILIES.anticipation].map((anticipation) => (
      <div key={anticipation ?? "none"} style={row}>
        {MODIFIER_FAMILIES.importance.map((importance) => (
          <ViewTrigger
            key={importance}
            importance={importance}
            anticipation={anticipation}
          >
            {anticipation ?? importance}
          </ViewTrigger>
        ))}
      </div>
    ))}
  </div>
);

/**
 * A leading icon, an icon-only trigger named by `aria-label`, a loading
 * trigger and a disabled one. Loading and disabled triggers cannot open
 * their panels, with or without scripts.
 */
export const IconLoadingAndDisabled: StoryFn = () => (
  <div style={row}>
    <ViewTrigger importance="secondary" icon="filter">
      Filter
    </ViewTrigger>
    <ViewTrigger importance="secondary" icon="filter" aria-label="Filter" />
    <ViewTrigger importance="secondary" loading>
      Loading
    </ViewTrigger>
    <ViewTrigger importance="secondary" disabled>
      Disabled
    </ViewTrigger>
  </div>
);

const renderStatusFilter: WithDropdownRender = ({ ref, id, triggerId }) => (
  <DropdownPanel ref={ref} id={id} aria-labelledby={triggerId}>
    <form method="get">
      <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
        <legend>Status</legend>
        {["Ready", "Deploying", "Failed"].map((status) => (
          <label key={status} style={{ display: "block" }}>
            <input type="checkbox" name="status" value={status} /> {status}
          </label>
        ))}
      </fieldset>
      <div style={{ ...row, marginBlockStart: "var(--dimension-200)" }}>
        <Button type="submit" importance="primary">
          Apply
        </Button>
        <Button
          type="button"
          importance="tertiary"
          popoverTarget={id}
          popoverTargetAction="hide"
        >
          Done
        </Button>
      </div>
    </form>
  </DropdownPanel>
);

const StatusTrigger = Component(Button, renderStatusFilter);

/**
 * The query bar's case: a GET form of native checkboxes. Toggling a box
 * leaves the panel open. Apply submits the form natively, and Done closes
 * the panel with `popovertargetaction="hide"`, with no script.
 */
export const CheckboxList: StoryFn = () => (
  <StatusTrigger importance="secondary">Status</StatusTrigger>
);
CheckboxList.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByRole("button", { name: "Status" });
  await userEvent.click(trigger);
  const panel = document.getElementById(
    String(trigger.getAttribute("popovertarget")),
  ) as HTMLElement;
  await waitFor(() => expect(panel.matches(":popover-open")).toBe(true));
  for (const box of within(panel).getAllByRole("checkbox").slice(0, 2)) {
    await userEvent.click(box);
  }
  await expect(panel.matches(":popover-open")).toBe(true);
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await userEvent.click(within(panel).getByRole("button", { name: "Done" }));
  await waitFor(() => expect(panel.matches(":popover-open")).toBe(false));
  await waitFor(() => expect(trigger).toHaveFocus());
};
CheckboxList.parameters = {
  docs: {
    source: {
      code: `const StatusTrigger = withDropdownButton(Button, ({ ref, id, triggerId }) => (
  <DropdownPanel ref={ref} id={id} aria-labelledby={triggerId}>
    <form method="get">
      <label><input type="checkbox" name="status" value="Ready" /> Ready</label>
      <Button type="submit">Apply</Button>
      <Button type="button" popoverTarget={id} popoverTargetAction="hide">Done</Button>
    </form>
  </DropdownPanel>
));`,
    },
  },
};

/**
 * Trigger state comes straight from the trigger's props: an `active` class,
 * `data-active` and a count in the children, which is part of the name.
 * FilterButton owns this look; DropdownButton draws nothing for it.
 */
export const FilterTrigger: StoryFn = () => (
  <StatusTrigger importance="secondary" className="active" data-active>
    Status <span className="count">2</span>
  </StatusTrigger>
);

const renderCustomPanel: WithDropdownRender = ({ ref, id, triggerId }) => (
  <DropdownPanel ref={ref} id={id} aria-labelledby={triggerId}>
    <p style={{ fontWeight: "bold", margin: 0 }}>Find a machine</p>
    <label>
      Name <input type="search" name="machine" />
    </label>
  </DropdownPanel>
);

const SearchTrigger = Component(Button, renderCustomPanel);

/** Any content fits in the panel: here a heading and a search field. */
export const CustomPanel: StoryFn = () => (
  <SearchTrigger importance="secondary">Machines</SearchTrigger>
);

/**
 * Enter opens the panel and focus moves to its first control. Escape closes
 * it and returns focus to the trigger, and a click outside closes it too.
 * The play opens it with Enter and closes it from the trigger; Escape and a
 * click outside are the browser's own, which only a real key press or click
 * triggers.
 */
export const KeyboardAndDismissal: StoryFn = () => (
  <ViewTrigger importance="secondary">View</ViewTrigger>
);
KeyboardAndDismissal.play = async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole("button", { name: "View" });
  const panel = document.getElementById(
    String(trigger.getAttribute("popovertarget")),
  ) as HTMLElement;
  trigger.focus();
  await userEvent.keyboard("{Enter}");
  await waitFor(() => expect(panel.matches(":popover-open")).toBe(true));
  await waitFor(() =>
    expect(panel.contains(document.activeElement)).toBe(true),
  );
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await userEvent.click(trigger);
  await waitFor(() => expect(panel.matches(":popover-open")).toBe(false));
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
};

/** Density comes from the scope, as it does for Button. */
export const Density: StoryFn = () => (
  <div style={row}>
    {["comfortable", "dense"].map((density) => (
      <div key={density} className={density}>
        <ViewTrigger importance="secondary">{density}</ViewTrigger>
      </div>
    ))}
  </div>
);
Density.parameters = { baseline: true };

/**
 * Near the end and bottom edges the panel flips to stay in view, and in
 * right-to-left text it opens towards the start. Browsers without anchor
 * positioning open it centred.
 */
export const PlacementAndRtl: StoryFn = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "end",
      minBlockSize: "280px",
    }}
  >
    <ViewTrigger importance="secondary">Start</ViewTrigger>
    <ViewTrigger importance="secondary">End</ViewTrigger>
  </div>
);
PlacementAndRtl.decorators = [rtl()];

/**
 * The server markup of CheckboxList, as a page shows it before any script
 * runs: no React is attached. The trigger toggles the panel natively,
 * Escape and a click outside close it, the checkboxes submit with the GET
 * form, and Done closes the panel. It carries no ARIA that waits for
 * scripts.
 */
export const WithoutScripts: StoryFn = () => (
  <StatusTrigger importance="secondary">Status</StatusTrigger>
);
WithoutScripts.decorators = [serverMarkup()];
WithoutScripts.play = async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole("button", { name: "Status" });
  await expect(trigger).not.toHaveAttribute("aria-expanded");
  await expect(trigger).not.toHaveAttribute("aria-haspopup");
  const panel = canvasElement.querySelector(
    ".dropdown-button-panel",
  ) as HTMLElement;
  await expect(panel).not.toHaveAttribute("role");
  await userEvent.click(trigger);
  await waitFor(() => expect(panel.matches(":popover-open")).toBe(true));
  await userEvent.click(trigger);
  await waitFor(() => expect(panel.matches(":popover-open")).toBe(false));
};
