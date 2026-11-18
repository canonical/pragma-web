import { Button } from "@canonical/react-ds-global";
import type { Meta, StoryFn, StoryObj } from "@storybook/react-vite";
import type { CSSProperties, ReactElement, ToggleEvent } from "react";
import { useRef, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  withRightToLeft,
  withServerMarkup,
} from "../../../storybook/decorators.js";
import type { QueryChipCondition as Condition } from "../QueryChip/index.js";
import Component from "./FilterButton.js";
import type { FilterButtonPanelHandle } from "./index.js";

const meta = {
  title: "_work_in_progress/FilterButton",
  component: Component,
  // The panel is a popover in the top layer, which escapes every container,
  // so each docs preview gets its own iframe.
  parameters: {
    docs: { story: { inline: false, iframeHeight: "360px" } },
  },
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

const STATUSES = [
  { value: "deployed", count: 12 },
  { value: "ready", count: 4 },
  { value: "commissioning", count: 2 },
  { value: "broken", count: 1 },
];

const row: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--dimension-200)",
  alignItems: "start",
};

const optionStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--dimension-100)",
  minBlockSize: "var(--dimension-300)",
};

const hidden: CSSProperties = {
  position: "absolute",
  inlineSize: 1,
  blockSize: 1,
  overflow: "hidden",
  clipPath: "inset(50%)",
};

/**
 * A checkbox list whose counts are part of each checkbox's name, such as
 * "deployed, 12". Each choice commits as it is ticked.
 */
const StatusOptions = ({
  selected,
  onChange,
  values = STATUSES,
}: {
  selected: string[];
  onChange: (selected: string[]) => void;
  values?: typeof STATUSES;
}): ReactElement => (
  <div style={{ display: "grid" }}>
    {values.map(({ value, count }) => (
      <label key={value} style={optionStyle}>
        <input
          type="checkbox"
          name="status"
          value={value}
          checked={selected.includes(value)}
          onChange={(event) =>
            onChange(
              event.target.checked
                ? [...selected, value]
                : selected.filter((item) => item !== value),
            )
          }
        />
        {value}
        <span style={hidden}>, </span>
        <span style={{ color: "var(--color-text-muted)" }}>{count}</span>
      </label>
    ))}
  </div>
);

/** A status filter that holds its own choices. */
const StatusFilter = ({
  condition,
  initial = [],
}: {
  condition?: Condition;
  initial?: string[];
}): ReactElement => {
  const [selected, setSelected] = useState(initial);
  const applied = selected.length;
  const words =
    condition === "exclusion" ? `none of ${applied}` : `${applied} applied`;
  return (
    <Component
      label="Status"
      condition={condition}
      applied={applied}
      appliedLabel={words}
    >
      <StatusOptions selected={selected} onChange={setSelected} />
    </Component>
  );
};

/** Nothing applies: the tertiary face, with the chevron. */
export const Default: StoryFn = () => <StatusFilter />;

/**
 * While the filter applies, a Badge shows the count, and the trigger's name
 * carries the host's words: "Status, 2 applied".
 */
export const Applied: StoryFn = () => (
  <StatusFilter initial={["deployed", "ready"]} />
);

/**
 * The applied clause's Condition mark comes before the count, such as `≠`
 * for an Exclusion clause, whose words say "none of 2".
 */
export const Conditions: StoryFn = () => (
  <div style={row}>
    {(["inclusion", "exclusion", "match", "range", "presence"] as const).map(
      (condition) => (
        <StatusFilter
          key={condition}
          condition={condition}
          initial={["deployed", "ready"]}
        />
      ),
    )}
  </div>
);

/** The panel stays open while its checkboxes change. */
export const CheckboxList: StoryFn = () => <StatusFilter />;
CheckboxList.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByRole("button", { name: "Status" });
  await userEvent.click(trigger);
  // The panel is found through the trigger and queried with hidden
  // elements, so the play also runs in jsdom, which hides every popover.
  const panel = document.getElementById(
    trigger.getAttribute("aria-controls") ?? "",
  ) as HTMLElement;
  await userEvent.click(
    within(panel).getByRole("checkbox", {
      hidden: true,
      name: /^deployed\s?,\s?12$/,
    }),
  );
  await waitFor(() =>
    expect(
      canvas.getByRole("button", { name: "Status, 1 applied" }),
    ).toHaveAttribute("aria-expanded", "true"),
  );
};

const POOLS = Array.from({ length: 24 }, (_, index) => ({
  value: `pool-${index + 1}`,
  count: (index * 7) % 13,
}));

/** A long list, with a search field the host adds to narrow it. */
export const LongList: StoryFn = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const shown = POOLS.filter(({ value }) => value.includes(search));
  return (
    <Component
      label="Pool"
      applied={selected.length}
      appliedLabel={`${selected.length} applied`}
    >
      <input
        type="search"
        aria-label="Search pools"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <StatusOptions
        values={shown}
        selected={selected}
        onChange={setSelected}
      />
    </Component>
  );
};
LongList.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: "Pool" }));
  const search = await canvas.findByRole("searchbox", {
    hidden: true,
    name: "Search pools",
  });
  await userEvent.type(search, "pool-2");
  await waitFor(() =>
    expect(
      canvas.queryByRole("checkbox", { hidden: true, name: /^pool-1\b/ }),
    ).toBeNull(),
  );
  expect(
    canvas.getByRole("checkbox", { hidden: true, name: /^pool-2\b/ }),
  ).toBeInTheDocument();
};

/** Button's disabled face; the panel does not open. */
export const Disabled: Story = {
  args: {
    label: "Status",
    disabled: true,
    applied: 2,
    appliedLabel: "2 applied",
    condition: "exclusion",
    children: "Options",
  },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", {
      name: /Status/,
    });
    await expect(trigger).toBeDisabled();
    await userEvent.click(trigger, { pointerEventsCheck: 0 });
    const panel = canvasElement.querySelector(
      ".ds.dropdown-button-panel",
    ) as Element;
    await expect(panel.matches(":popover-open")).toBe(false);
  },
};

/** Density comes from the scope. */
export const Density: StoryFn = () => (
  <div style={row}>
    {["comfortable", "dense"].map((density) => (
      <div key={density} className={density}>
        <StatusFilter initial={["ready"]} />
      </div>
    ))}
  </div>
);
Density.parameters = { baseline: true };

/** In right-to-left text the mark and the count follow the label. */
export const RightToLeft: StoryFn = () => (
  <StatusFilter condition="exclusion" initial={["deployed", "ready"]} />
);
RightToLeft.decorators = [withRightToLeft];

/**
 * The same markup before any script runs, for a host that can spell
 * addresses, rendered as the server sends it: the trigger opens the native
 * popover, and the panel holds a GET form whose Apply submit commits.
 */
export const WithoutScripts: StoryFn = () => (
  <Component label="Status" applied={1} appliedLabel="1 applied">
    <form method="get" style={{ display: "grid", gap: "var(--dimension-100)" }}>
      {STATUSES.map(({ value }) => (
        <label key={value} style={optionStyle}>
          <input
            type="checkbox"
            name="status"
            value={value}
            defaultChecked={value === "ready"}
          />
          {value}
        </label>
      ))}
      <Button type="submit" importance="secondary">
        Apply
      </Button>
    </form>
  </Component>
);
WithoutScripts.decorators = [withServerMarkup];

/** `onToggle` hears the panel open and close, however it happens. */
export const OnToggle: StoryFn = () => {
  const [state, setState] = useState("closed");
  return (
    <div style={row}>
      <Component
        label="Status"
        onToggle={(event: ToggleEvent<HTMLDivElement>) =>
          setState(event.newState)
        }
      >
        Options
      </Component>
      <output>{state}</output>
    </div>
  );
};
OnToggle.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: "Status" }));
  await waitFor(() =>
    expect(canvas.getByRole("status")).toHaveTextContent("open"),
  );
  await userEvent.keyboard("{Escape}");
  await waitFor(() =>
    expect(canvas.getByRole("status")).toHaveTextContent("closed"),
  );
};

/** A host drives the panel through `panelRef`. */
export const PanelRef: StoryFn = () => {
  const panelRef = useRef<FilterButtonPanelHandle>(null);
  return (
    <div style={row}>
      <Component label="Status" panelRef={panelRef}>
        Options
      </Component>
      <Button importance="secondary" onClick={() => panelRef.current?.show()}>
        Open the status filter
      </Button>
    </div>
  );
};
PanelRef.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(
    canvas.getByRole("button", { name: "Open the status filter" }),
  );
  await waitFor(() =>
    expect(canvas.getByRole("button", { name: "Status" })).toHaveAttribute(
      "aria-expanded",
      "true",
    ),
  );
};
