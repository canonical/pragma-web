import { createHelpItem } from "@canonical/react-ds-app";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import withRouter from "../../../.storybook/decorators/withRouter.js";
import { stubRoutes } from "../../testing/fixtures.js";
import Component from "./ApplicationShell.js";

const meta = {
  title: "common/ApplicationShell",
  component: Component,
  decorators: [
    withRouter({ routes: stubRoutes }),
    (Story) => (
      <div style={{ blockSize: "100dvh", display: "grid" }}>
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "fullscreen" },
  args: {
    label: "Dashboard",
    root: {
      key: "root",
      items: [
        {
          key: "pages",
          items: [
            { url: "/", label: "Overview", icon: "switcher-dashboard" },
            {
              url: "/dashboard/instances",
              label: "Instances",
              icon: "containers",
            },
            { url: "/dashboard/settings", label: "Settings", icon: "settings" },
          ],
        },
        {
          key: "networking",
          label: "Networking",
          items: [
            {
              key: "networks",
              label: "Networks",
              icon: "connected",
              disabled: true,
            },
          ],
        },
        {
          key: "help-group",
          items: [createHelpItem("https://ubuntu.com/legal")],
        },
      ],
    },
    footerRoot: {
      key: "footer",
      items: [
        { url: "/guides/router-core", label: "Router guide", icon: "book" },
      ],
    },
    children: <h1>Page content</h1>,
  },
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The application layout with the side navigation following the router: the
 * item for the current URL is marked as the current page.
 */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const navigation = canvas.getByRole("navigation", { name: args.label });

    await expect(
      within(navigation).getByRole("link", { name: "Overview" }),
    ).toHaveAttribute("aria-current", "page");
    await expect(canvas.getByRole("main")).toHaveAttribute(
      "id",
      "main-content",
    );
  },
};

/** Without footer rows, the side navigation shows no footer. */
export const WithoutFooter: Story = {
  args: { footerRoot: undefined },
};
