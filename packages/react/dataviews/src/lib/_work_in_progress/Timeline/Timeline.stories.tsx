import type {
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactElement, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import {
  type ActivityProviderConfig,
  activityLabels,
  activityMapping,
  createActivitySource,
  createFailingActivitySource,
  createPendingActivitySource,
  useActivityProvider,
} from "../../../storybook/activities/fixtures.js";
import { withAppScope, withFrame } from "../../../storybook/decorators.js";
import { Timeline as ConnectedTimeline } from "../DataViews/common/Timeline/index.js";
import { DataViews } from "../DataViews/index.js";
import { RendererSwitch } from "../RendererSwitch/index.js";
import Component from "./Timeline.js";
import type { TimelineDecoration, TimelineProps } from "./types.js";

const meta = {
  title: "_work_in_progress/Timeline",
  component: Component,
  decorators: [withAppScope, withFrame("48rem")],
  args: {
    label: "Review activity",
    dateTimeFormats: { timeZone: "UTC" },
  },
  // Each story supplies its own provider, mapping and callbacks.
  argTypes: {
    provider: { control: false },
    mapping: { control: false },
    decorate: { control: false },
    rowLabel: { control: false },
    renderStatus: { control: false },
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof Component>;

type StoryTimelineProps = Omit<
  TimelineProps<readonly SchemaFieldDefinition[]>,
  "provider" | "mapping"
> & { readonly config?: ActivityProviderConfig };

const decorateActivity = (row: RowRecord): TimelineDecoration => ({
  marker: {
    initials: String(row["actorName"])
      .split(" ")
      .map((part) => part.charAt(0))
      .join(""),
  },
  ...(row["kind"] === "rejection" ? { criticality: "error" as const } : {}),
  ...(row["kind"] === "approval"
    ? { customContent: <em>Ready to merge</em> }
    : {}),
});

function ReviewTimeline({
  config,
  ...props
}: StoryTimelineProps): ReactElement {
  const provider = useActivityProvider(config);
  return (
    <Component
      {...activityLabels}
      {...props}
      provider={provider}
      mapping={activityMapping}
    />
  );
}

/**
 * The review log of a merge proposal, newest first as the source orders it,
 * collapsed below its first eight events. Its controls filter and order the
 * whole log through the provider: choosing a reviewer asks the source again.
 */
export const Default: Story = {
  render: (args) => <ReviewTimeline {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole("button", { name: "Reviewer" }),
    );
    await userEvent.click(
      await within(canvasElement.ownerDocument.body).findByRole("menuitem", {
        name: "Chen Wei",
      }),
    );
    for (const name of await canvas.findAllByText("Chen Wei")) {
      await expect(name).toBeInTheDocument();
    }
    await expect(canvas.queryByText("Ana Lima")).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Latest" }));
    await expect(
      await canvas.findByRole("button", { name: "Earliest" }),
    ).toBeInTheDocument();
  },
};

/** Every event shown: a log short enough to need no collapsing. */
export const Expanded: Story = {
  render: (args) => <ReviewTimeline {...args} />,
  args: { expansion: false },
};

/** Collapsed between its first and last events, revealing the middle from below. */
export const CollapsedInTheMiddle: Story = {
  render: (args) => <ReviewTimeline {...args} />,
  args: { expansion: { method: "middle", initialVisible: 6, step: 3 } },
};

/** The date leading each marker, and markers of two sizes: large where a reviewer's run starts. */
export const LeadingDates: Story = {
  render: (args) => <ReviewTimeline {...args} />,
  args: { dateTimePosition: "leading", markerCombination: "large-small" },
};

/**
 * Each event decorated from its record: the reviewer's initials on the
 * marker, a rejection marked negative, and an approval carrying custom
 * content beneath it.
 */
export const Decorated: Story = {
  render: (args) => <ReviewTimeline {...args} decorate={decorateActivity} />,
};

/**
 * A trailing node, always last: the connector line runs on from the last
 * event to it.
 */
export const WithTrailing: Story = {
  render: (args) => (
    <ReviewTimeline
      {...args}
      expansion={false}
      trailing={<p className="ds">Proposal opened on 1 September 2026</p>}
    />
  ),
};

/**
 * Each event drawn by the caller through `renderItem`, from the event and its
 * context: here a compact line naming the marker size each would have.
 */
export const CustomRendering: Story = {
  render: (args) => (
    <ReviewTimeline
      {...args}
      renderItem={(item, { markerSize, index }) => (
        <p className="ds">
          {`${index + 1}. ${item.description ?? item.id} (${markerSize})`}
        </p>
      )}
    />
  ),
};

function CountedTimeline(props: StoryTimelineProps): ReactElement {
  const [count, setCount] = useState(0);
  return (
    <>
      <p className="ds">{`${count} reported`}</p>
      <ReviewTimeline
        {...props}
        onVisibleItemsChange={(visible) => {
          setCount(visible.length);
        }}
      />
    </>
  );
}

/** The page's events reported to the caller whenever they change. */
export const ReportingTheEvents: Story = {
  render: (args) => <CountedTimeline {...args} />,
};

/** No controls: the timeline only shows the log. */
export const WithoutControls: Story = {
  render: (args) => <ReviewTimeline {...args} />,
  args: { showControls: false },
};

/** A request the source has not answered: the core's pending status, busy. */
export const Loading: Story = {
  render: (args) => (
    <ReviewTimeline
      {...args}
      config={{ source: createPendingActivitySource }}
    />
  ),
};

/** A request the source failed: the core's status says why. */
export const Failed: Story = {
  render: (args) => (
    <ReviewTimeline
      {...args}
      config={{ source: createFailingActivitySource }}
    />
  ),
};

/** A log holding nothing. */
export const Empty: Story = {
  render: (args) => (
    <ReviewTimeline
      {...args}
      config={{ source: () => createActivitySource([]) }}
    />
  ),
};

function TimelineOrTable(): ReactElement {
  const provider = useActivityProvider();
  return (
    <DataViews provider={provider}>
      <RendererSwitch
        label="Show review activity as"
        renderers={[
          {
            id: "timeline",
            label: "Timeline",
            content: (
              <ConnectedTimeline
                mapping={activityMapping}
                {...activityLabels}
                label="Review activity"
                selectable
                dateTimeFormats={{ timeZone: "UTC" }}
              />
            ),
          },
          {
            id: "table",
            label: "Table",
            content: (
              <DataViews.DataTable
                columns={[
                  { id: "at", header: "Date" },
                  { id: "actorName", header: "Reviewer" },
                  { id: "kind", header: "Activity" },
                  { id: "summary", header: "Summary" },
                ]}
                label="Review activity, as a table"
                selectable
                rowLabel={(row) => String(row["summary"])}
              />
            ),
          },
        ]}
      />
    </DataViews>
  );
}

/**
 * The timeline beside a table over one root: one query, one page and one
 * selection. An event selected on the timeline stays selected in the table,
 * and choosing a renderer asks the source for nothing.
 */
export const BesideATable: Story = {
  render: () => <TimelineOrTable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [first] = await canvas.findAllByRole("checkbox", {
      name: /^Select .* revision /u,
    });
    await userEvent.click(first as HTMLElement);
    await userEvent.selectOptions(
      canvas.getByRole("combobox", { name: "Show review activity as" }),
      "table",
    );
    const [inTable] = await canvas.findAllByRole("checkbox", {
      checked: true,
    });
    await expect(inTable).toBeInTheDocument();
  },
};
