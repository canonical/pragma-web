<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Component from "./ApplicationShell.svelte";
  import createHelpItem from "./createHelpItem.js";

  const { Story } = defineMeta({
    title: "common/ApplicationShell",
    component: Component,
    parameters: { layout: "fullscreen" },
    args: {
      label: "Dashboard",
      currentUrl: "/",
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
              {
                url: "/dashboard/settings",
                label: "Settings",
                icon: "settings",
              },
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
    },
  });
</script>

{#snippet template(args: import("./types.js").ApplicationShellProps)}
  <div style="block-size: 100dvh; display: grid;">
    <Component {...args}><h1>Page content</h1></Component>
  </div>
{/snippet}

<!-- The application layout with the side navigation following the page: the
     item for the current URL is marked as the current page. -->
<Story
  name="Default"
  {template}
  play={async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const navigation = canvas.getByRole("navigation", { name: args.label });

    await expect(
      within(navigation).getByRole("link", { name: "Overview" }),
    ).toHaveAttribute("aria-current", "page");
    await expect(canvas.getByRole("main")).toHaveAttribute(
      "id",
      "main-content",
    );
  }}
/>

<!-- Without footer rows, the side navigation shows no footer. -->
<Story name="WithoutFooter" {template} args={{ footerRoot: undefined }} />
