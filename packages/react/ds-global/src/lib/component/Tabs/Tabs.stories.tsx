import { useRoute } from "@canonical/router-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement, ReactNode } from "react";
import {
  machineTabsRoot,
  productTabsRoot,
  productTabsWithInertRoot,
  routerTabsRoot,
} from "../../../storybook/tabs/fixtures.js";
import {
  HashLink,
  withHashRouter,
} from "../../../storybook/tabs/story-utils.js";
import { Badge } from "../Badge/index.js";
import { Chip } from "../Chip/index.js";
import Component from "./Tabs.js";
import type { TabItem } from "./types.js";
import "../../../storybook/tabs/static-indicators.css";

const meta = {
  title: "components/Tabs",
  component: Component,
  args: {
    "aria-label": "Sections",
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof Component>;

/**
 * Default: tabs render as plain `<a>` links (no router). The fixture urls are
 * hash-relative (`#/overview`), so activating a tab stays on the page. The tab
 * matching `currentUrl` is marked active.
 */
export const Default: Story = {
  args: {
    navigationRoot: productTabsRoot,
    currentUrl: "#/overview",
  },
};

/**
 * A tab whose item has no `url` renders as inert, muted text rather than a link.
 */
export const WithInertTab: Story = {
  args: {
    navigationRoot: productTabsWithInertRoot,
    currentUrl: "#/overview",
  },
};

/**
 * Overflow: when the tabs exceed the container width the strip scrolls
 * horizontally.
 */
export const Overflow: Story = {
  args: {
    navigationRoot: machineTabsRoot,
    currentUrl: "#/overview",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "20rem" }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * Router integration via a custom `LinkComponent`.
 *
 * Tabs is router-agnostic — it only knows `LinkComponentProps`. This story
 * injects a `HashLink` adapter and derives `currentUrl` from the live route
 * (`useRoute()`), so tabs navigate client-side and the active tab follows
 * navigation. This is the pattern for wiring Tabs to a real router (e.g.
 * `@canonical/router-react`, Next.js, React Router). The other stories use the
 * default `<a>` and need no router.
 */
export const WithRouterLink: Story = {
  args: {
    navigationRoot: routerTabsRoot,
  },
  decorators: [withHashRouter],
  render: (args) => {
    const { pathname } = useRoute();
    return (
      <Component {...args} currentUrl={pathname} LinkComponent={HashLink} />
    );
  },
};

type IndicatorTier = "site" | "docs" | "app";
type IndicatorDensity = "default" | "dense" | "comfortable";

const indicatorRoot = (slot?: ReactNode): TabItem => ({
  key: "root",
  items: [
    {
      className: slot ? "indicator-tab" : "plain-tab",
      label: "Machines",
      slot,
      url: "#/machines",
    },
  ],
});

const IndicatorCase = ({
  tier,
  density,
  dir = "ltr",
}: {
  tier: IndicatorTier;
  density: IndicatorDensity;
  dir?: "ltr" | "rtl";
}): ReactElement => {
  const densityClass = density === "default" ? "" : density;
  const id = `${tier}-${density}-${dir}`;
  return (
    <section
      className={[tier, densityClass, "tabs-indicator-case"]
        .filter(Boolean)
        .join(" ")}
      data-tabs-indicator-case={id}
      dir={dir}
    >
      <h2>{`${tier} · ${density}${dir === "rtl" ? " · RTL" : ""}`}</h2>
      <div className="tabs-indicator-pair badge-pair">
        <Component
          aria-label={`${id} plain Badge comparison`}
          navigationRoot={indicatorRoot()}
        />
        <Component
          aria-label={`${id} Badge indicator`}
          navigationRoot={indicatorRoot(<Badge value={42} />)}
        />
      </div>
      <div className="tabs-indicator-pair chip-pair">
        <Component
          aria-label={`${id} plain Chip comparison`}
          navigationRoot={indicatorRoot()}
        />
        <Component
          aria-label={`${id} wrapped static Chip indicator`}
          navigationRoot={indicatorRoot(
            <span className="neutral-indicator-wrapper">
              <Chip value="12" />
            </span>,
          )}
        />
      </div>
    </section>
  );
};

const apiCoverageRoot: TabItem = {
  key: "root",
  items: [
    { label: "Numeric", slot: 0, url: "#/numeric" },
    {
      disabled: true,
      label: "Disabled",
      slot: <Badge value={1234567} />,
      url: "#/disabled",
    },
    { key: "inert", label: "Inert", slot: <Chip value="direct" /> },
    {
      label: "Wrapped",
      slot: (
        <span className="neutral-indicator-wrapper">
          <Chip value="1,204" />
        </span>
      ),
      url: "#/wrapped",
    },
  ],
};

/**
 * Public Badge and static-Chip routes in the approved noninteractive indicator
 * slot. Each indicator tab has an intrinsic plain peer so baseline, occupied
 * height and focus/selection paint can be compared without grid stretching.
 */
export const StaticIndicators: Story = {
  render: () => (
    <main className="tabs-indicator-proof">
      <h1>Tabs static indicators</h1>
      <p>
        Badge stays invariant; a static Chip receives the tab placement's dense
        block inset through a neutral wrapper.
      </p>
      <div className="tabs-indicator-grid">
        {(["site", "docs", "app"] as const).flatMap((tier) =>
          (["default", "dense", "comfortable"] as const).map((density) => (
            <IndicatorCase
              key={`${tier}-${density}`}
              tier={tier}
              density={density}
            />
          )),
        )}
        <IndicatorCase tier="app" density="dense" dir="rtl" />
      </div>
      <section className="app tabs-indicator-api-cases">
        <h2>API cases</h2>
        <Component
          aria-label="Static indicator API cases"
          navigationRoot={apiCoverageRoot}
        />
      </section>
    </main>
  ),
};
