import type { Meta, StoryFn } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { serverMarkup } from "../../../../../storybook/decorators.js";
import {
  Modal,
  type WithModalRender,
  withModal,
} from "../../../../pattern/Modal/index.js";
import { Button } from "../../../Button/index.js";
import { KeyboardKey } from "../../../KeyboardKey/index.js";
import type { WithDropdownRender } from "../../types.js";
import withDropdownButton from "../../withDropdownButton.js";
import { DropdownPanel } from "../Panel/index.js";
import Component from "./Menu.js";
import type { DropdownMenuEntry, DropdownMenuItem } from "./types.js";

const meta = {
  title: "components/DropdownButton/Menu",
  component: Component,
  parameters: {
    docs: {
      story: { inline: false, iframeHeight: "320px" },
      source: { type: "code", language: "tsx" },
    },
  },
} satisfies Meta<typeof Component>;

export default meta;

const Highlighted = ({ item }: { item: DropdownMenuItem }) => (
  <span>
    <strong>{item.label}</strong> (custom)
  </span>
);

const actions: DropdownMenuEntry[] = [
  { key: "rename", label: "Rename", slot: <KeyboardKey keyValue="f2" /> },
  { key: "duplicate", label: "Duplicate" },
  {
    key: "pin",
    label: "Pin",
    displayItemsType: "custom",
    Component: Highlighted,
  },
  { type: "separator", key: "danger" },
  { key: "archive", label: "Archive", disabled: true },
  { key: "delete", label: "Delete" },
];

const links: DropdownMenuEntry[] = [
  { url: "?view=table", label: "Table" },
  { url: "?view=cards", label: "Cards" },
  { type: "separator", key: "more" },
  { url: "?view=timeline", label: "Timeline" },
];

/** Renders a menu of `entries` in a panel. */
const createMenuPanel =
  (entries: DropdownMenuEntry[]): WithDropdownRender =>
  ({ ref, id, triggerId }) => (
    <DropdownPanel ref={ref} id={id} aria-labelledby={triggerId}>
      <Component items={entries} />
    </DropdownPanel>
  );

const ActionsTrigger = withDropdownButton(Button, createMenuPanel(actions));
const ViewTrigger = withDropdownButton(Button, createMenuPanel(links));
// Server markup states no disabled item: a disabled action takes
// aria-disabled only once the menu is hydrated.
const QuickActionsTrigger = withDropdownButton(
  Button,
  createMenuPanel([
    { key: "rename", label: "Rename" },
    { key: "duplicate", label: "Duplicate" },
    { key: "delete", label: "Delete" },
  ]),
);

/**
 * A menu of actions: a slot with a keyboard shortcut, a custom item, a
 * separator and a disabled item. Disabled items stay focusable and are
 * announced as unavailable.
 */
export const Default: StoryFn = () => (
  <ActionsTrigger importance="secondary">Actions</ActionsTrigger>
);
Default.parameters = {
  docs: {
    source: {
      code: `const ActionsTrigger = withDropdownButton(Button, ({ ref, id, triggerId }) => (
  <DropdownPanel ref={ref} id={id} aria-labelledby={triggerId}>
    <DropdownPanel.Menu items={actions} />
  </DropdownPanel>
));`,
    },
  },
};

/**
 * The server markup of a menu of links, before any script runs: the items
 * are real links, with no menu roles, and the trigger opens the panel
 * natively. Once hydrated, a client router takes a link by calling
 * `event.preventDefault()` in `onSelect`.
 */
export const MenuOfLinks: StoryFn = () => (
  <ViewTrigger importance="secondary">View</ViewTrigger>
);
MenuOfLinks.decorators = [serverMarkup()];
MenuOfLinks.play = async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole("button", { name: "View" });
  await expect(trigger).not.toHaveAttribute("aria-haspopup");
  await userEvent.click(trigger);
  const link = within(canvasElement).getByText("Cards").closest("a");
  await expect(link).toHaveAttribute("href", "?view=cards");
  await expect(link).not.toHaveAttribute("role");
};

/**
 * The server markup of a menu of actions alone. Such a menu does nothing
 * before scripts run, so with scripting off its stylesheet hides the
 * trigger; this canvas runs scripts, so the trigger is still drawn here.
 */
export const ActionsOnly: StoryFn = () => (
  <QuickActionsTrigger importance="secondary">Actions</QuickActionsTrigger>
);
ActionsOnly.decorators = [serverMarkup()];

/**
 * ArrowDown on the trigger opens the menu on its first item, ArrowUp on its
 * last. Typing jumps to the first item whose label starts with it, Enter
 * chooses, and focus returns to the trigger.
 */
export const Keyboard: StoryFn = () => (
  <ActionsTrigger importance="secondary">Actions</ActionsTrigger>
);
Keyboard.play = async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole("button", {
    name: "Actions",
  });
  const panel = document.getElementById(
    String(trigger.getAttribute("popovertarget")),
  ) as HTMLElement;
  trigger.focus();
  await userEvent.keyboard("{ArrowDown}");
  await waitFor(() =>
    expect(document.activeElement).toHaveTextContent("Rename"),
  );
  // Escape is the browser's own close request, which a play cannot send, so
  // the trigger closes the menu here.
  await userEvent.click(trigger);
  await waitFor(() => expect(panel.matches(":popover-open")).toBe(false));
  trigger.focus();
  await userEvent.keyboard("{ArrowUp}");
  await waitFor(() =>
    expect(document.activeElement).toHaveTextContent("Delete"),
  );
  await userEvent.keyboard("d");
  await waitFor(() =>
    expect(document.activeElement).toHaveTextContent("Duplicate"),
  );
  await userEvent.keyboard("{Enter}");
  await waitFor(() => expect(panel.matches(":popover-open")).toBe(false));
  await waitFor(() => expect(trigger).toHaveFocus());
};

const MachineModal: WithModalRender = ({ ref }) => (
  <Modal ref={ref}>
    <Modal.Header>Machine</Modal.Header>
    <Modal.Content>
      <ActionsTrigger importance="secondary">Actions</ActionsTrigger>
    </Modal.Content>
  </Modal>
);

const OpenMachine = withModal(Button, MachineModal);

/**
 * A menu inside a modal. Escape closes only the menu, with focus back on its
 * trigger; the modal stays open until a second Escape.
 */
export const InAModal: StoryFn = () => (
  <OpenMachine importance="secondary">Open machine</OpenMachine>
);
InAModal.parameters = {
  docs: { story: { inline: false, iframeHeight: "480px" } },
};
