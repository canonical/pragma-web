import type { Decorator, Meta, StoryFn, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import * as decorators from "../../../storybook/decorators.js";
import { Button } from "../Button/index.js";
import { Icon } from "../Icon/index.js";
import type { MenuEntry } from "./types.js";
import withContextualMenu from "./withContextualMenu.js";

// Each HOC call makes a component type, so it runs once, at module scope.
const Component = withContextualMenu(Button);

/** An icon-only trigger: a plain button, named by its `aria-label`. */
const IconTrigger = (props: ComponentProps<"button">) => (
  <button {...props}>
    <Icon icon="menu-contextual" />
  </button>
);
const IconTriggerMenu = withContextualMenu(IconTrigger);

/** A tall stage on a surface, so the open menu has room. */
const stage: Decorator = (Story) => (
  <div
    className="surface"
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      inlineSize: "100%",
      blockSize: "100%",
      minInlineSize: "min(88vw, 480px)",
      minBlockSize: "440px",
      background: "var(--surface-color-background)",
      color: "var(--surface-color-text)",
    }}
  >
    <Story />
  </div>
);

/** Opens the menu once the story renders. */
const openMenu = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const trigger = canvasElement.querySelector<HTMLElement>("[popovertarget]");
  trigger?.click();
};

const meta = {
  title: "components/ContextualMenu",
  component: Component,
  decorators: [stage],
  play: openMenu,
  parameters: {
    // Centre the trigger in the story canvas so the menu is framed.
    layout: "centered",
    // Docs previews render in an iframe: the open menu is in the top layer,
    // so it escapes every container — inside an iframe the preview window is
    // its own viewport and the menu stays contained in its story.
    docs: {
      story: {
        inline: false,
        iframeHeight: "480px",
      },
    },
  },
  args: { importance: "secondary" },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Row actions, with a destructive action set apart. */
const rowActions: MenuEntry[] = [
  { key: "view", label: "View details", url: "#view" },
  { key: "edit", label: "Edit configuration", url: "#edit" },
  { key: "tags", label: "Edit tags", url: "#tags" },
  { type: "separator", key: "before-power" },
  { key: "restart", label: "Restart", url: "#restart" },
  { key: "shutdown", label: "Shut down", url: "#shutdown" },
  { type: "separator", key: "before-delete" },
  { key: "delete", label: "Delete", url: "#delete" },
];

/** More items than fit: the menu scrolls inside itself. */
const longList: MenuEntry[] = Array.from({ length: 40 }, (_, i) => ({
  key: `tz-${i}`,
  label: `UTC${i - 12 >= 0 ? "+" : ""}${i - 12}:00`,
  url: `#tz-${i}`,
}));

export const LongScrollable: Story = {
  args: {
    children: "Timezone",
    menuLabel: "Select a timezone",
    items: longList,
  },
};

/** `withContextualMenu(Button)`. */
export const Default: Story = {
  args: {
    children: "Actions",
    menuLabel: "Instance actions",
    items: rowActions,
  },
};

/** An account menu with a disabled option. */
export const AccountMenu: Story = {
  args: {
    children: "abisola@canonical.com",
    menuLabel: "Account",
    items: [
      { key: "profile", label: "Your profile", url: "#profile" },
      { key: "subs", label: "Subscriptions", url: "#subscriptions" },
      { key: "billing", label: "Billing", url: "#billing", disabled: true },
      { type: "separator", key: "before-signout" },
      { key: "signout", label: "Sign out", url: "#signout" },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /abisola/ }));
    const menu = await canvas.findByRole("menu", { name: "Account" });
    // Opening focuses the first item; wait for it, so it lands first.
    await waitFor(() =>
      expect(
        canvas.getByRole("menuitem", { name: "Your profile" }),
      ).toHaveFocus(),
    );
    const billing = canvas.getByRole("menuitem", { name: "Billing" });
    // A disabled item takes focus from a click, and the menu stays open.
    await userEvent.click(billing);
    await waitFor(() => expect(billing).toHaveFocus());
    await expect(menu.closest("[popover]")?.matches(":popover-open")).toBe(
      true,
    );
  },
};

/** NOT PART OF THE CORE API: a right-hand `slot` with shortcuts. */
export const WithShortcuts: Story = {
  args: {
    children: "Edit",
    menuLabel: "Edit",
    items: [
      { key: "undo", label: "Undo", url: "#undo", slot: "⌘Z" },
      { key: "redo", label: "Redo", url: "#redo", slot: "⇧⌘Z" },
      { type: "separator", key: "before-clipboard" },
      { key: "cut", label: "Cut", url: "#cut", slot: "⌘X" },
      { key: "copy", label: "Copy", url: "#copy", slot: "⌘C" },
      { key: "paste", label: "Paste", url: "#paste", slot: "⌘V" },
    ],
  },
};

/** NOT PART OF THE CORE API: a custom item `Component`. */
export const CustomItems: Story = {
  args: {
    children: "Switch organisation",
    menuLabel: "Organisations",
    items: [
      {
        key: "canonical",
        label: "Canonical",
        displayItemsType: "custom",
        Component: ({ item }) => (
          <span style={{ display: "flex", flexDirection: "column" }}>
            <strong>{item.label}</strong>
            <small>Owner · 42 members</small>
          </span>
        ),
      },
      {
        key: "community",
        label: "Ubuntu Community",
        displayItemsType: "custom",
        Component: ({ item }) => (
          <span style={{ display: "flex", flexDirection: "column" }}>
            <strong>{item.label}</strong>
            <small>Member · 1,208 members</small>
          </span>
        ),
      },
    ],
  },
};

/** Submenus, opened by hover, ArrowRight or Enter on their parent. */
const nestedActions: MenuEntry[] = [
  { key: "open", label: "Open", url: "#open" },
  {
    key: "share",
    label: "Share",
    // A submenu parent — its items open in a nested menu. Separators work
    // inside submenus too.
    items: [
      { key: "share-link", label: "Copy link", url: "#link" },
      { key: "share-email", label: "Email", url: "#email" },
      { type: "separator", key: "share-before-teams" },
      {
        key: "share-teams",
        label: "Send to team",
        // A deeper submenu, to show arbitrary nesting.
        items: [
          { key: "team-eng", label: "Engineering", url: "#eng" },
          { key: "team-design", label: "Design", url: "#design" },
          { key: "team-ops", label: "Operations", url: "#ops" },
        ],
      },
    ],
  },
  {
    key: "export",
    label: "Export as",
    items: [
      { key: "export-pdf", label: "PDF", url: "#pdf" },
      { key: "export-csv", label: "CSV", url: "#csv" },
      { key: "export-json", label: "JSON", url: "#json" },
    ],
  },
  { type: "separator", key: "before-delete" },
  { key: "delete", label: "Delete", url: "#delete" },
];

export const NestedSubmenus: Story = {
  args: {
    children: "Actions",
    menuLabel: "Item actions",
    items: nestedActions,
  },
};

/** A menu in Arabic: everything mirrors. */
const rtlActions: MenuEntry[] = [
  { key: "open", label: "فتح", url: "#open" },
  {
    key: "share",
    label: "مشاركة",
    items: [
      { key: "share-link", label: "نسخ الرابط", url: "#link" },
      { key: "share-email", label: "بريد إلكتروني", url: "#email" },
      {
        key: "share-team",
        label: "إرسال إلى الفريق",
        items: [
          { key: "team-eng", label: "الهندسة", url: "#eng" },
          { key: "team-design", label: "التصميم", url: "#design" },
        ],
      },
    ],
  },
  { key: "rename", label: "إعادة تسمية", url: "#rename" },
  { type: "separator", key: "before-delete" },
  { key: "delete", label: "حذف", url: "#delete" },
];

export const RightToLeft: Story = {
  decorators: [decorators.rtlDocument()],
  args: {
    children: "الإجراءات",
    menuLabel: "إجراءات العنصر",
    items: rtlActions,
  },
};

/** An icon-only trigger, whose `aria-label` names the menu too. */
export const IconOnlyTrigger: StoryFn = () => (
  <IconTriggerMenu
    aria-label="Status column options"
    items={[
      {
        key: "sort",
        label: "Sort (this column cannot be sorted)",
        disabled: true,
      },
      { url: "?hide=status", label: "Hide column" },
      { url: "?pin=status", label: "Pin column" },
    ]}
  />
);
IconOnlyTrigger.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const name = "Status column options";
  await userEvent.click(canvas.getByRole("button", { name }));
  await waitFor(() => expect(canvas.getByRole("menu", { name })).toBeVisible());
  // A disabled item takes focus but cannot be chosen.
  const sort = canvas.getByRole("menuitem", {
    name: "Sort (this column cannot be sorted)",
  });
  await waitFor(() => expect(sort).toHaveFocus());
  await expect(sort).toHaveAttribute("aria-disabled", "true");
};
IconOnlyTrigger.parameters = {
  docs: {
    source: {
      code: `const IconTrigger = (props) => (
  <button {...props}>
    <Icon icon="menu-contextual" />
  </button>
);
const IconTriggerMenu = withContextualMenu(IconTrigger);

<IconTriggerMenu aria-label="Status column options" items={columnItems} />`,
    },
  },
};

/** Menus of links, as the server renders them before scripts. */
export const WithoutScripts: Story = {
  decorators: [decorators.renderServerMarkup()],
  args: {
    children: "View",
    items: [
      { url: "?view=table", label: "Table" },
      { url: "?view=cards", label: "Cards" },
      { type: "separator", key: "more" },
      { key: "customise", label: "Customise…" },
    ],
  },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "View" });
    await expect(trigger).not.toHaveAttribute("aria-haspopup");
    await userEvent.click(trigger);
    const link = within(canvasElement).getByText("Cards").closest("a");
    await expect(link).toHaveAttribute("href", "?view=cards");
    await expect(link).not.toHaveAttribute("role");
  },
};
