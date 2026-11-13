import { useRoute } from "@canonical/router-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
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
import { Spinner } from "../../subcomponent/Spinner/index.js";
import { Badge } from "../Badge/index.js";
import Component from "./Tabs.js";

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
 * Each tab item can carry a `slot`: trailing content rendered after its plain
 * text `label`, inside the tab — here a count `Badge` and a loading `Spinner`.
 */
export const WithSlots: Story = {
  args: {
    navigationRoot: {
      key: "machine-tabs-slots-root",
      label: "Machine sections",
      items: [
        { url: "#/overview", label: "Overview" },
        {
          url: "#/alerts",
          label: "Alerts",
          slot: <Badge value={12} criticality="warning" />,
        },
        {
          url: "#/packages",
          label: "Packages",
          slot: <Spinner aria-label="Loading packages" />,
        },
        { url: "#/activities", label: "Activities", slot: <Badge value={3} /> },
      ],
    },
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
