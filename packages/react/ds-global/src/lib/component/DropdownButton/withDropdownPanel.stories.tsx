import type { Meta, StoryFn } from "@storybook/react-vite";
import { IconButtonStandIn as IconButton } from "../../common/IconButtonStandIn/index.js";
import { withTooltip } from "../Tooltip/index.js";
import { DropdownPanel } from "./common/Panel/index.js";
import type { WithDropdownRender } from "./types.js";
import Component from "./withDropdownPanel.js";

const meta = {
  title: "components/DropdownButton/withDropdownPanel",
  parameters: {
    docs: {
      story: { inline: false, iframeHeight: "280px" },
      source: { type: "code", language: "tsx" },
    },
  },
} satisfies Meta;

export default meta;

const renderSettings: WithDropdownRender = ({ ref, id, triggerId }) => (
  <DropdownPanel ref={ref} id={id} aria-labelledby={triggerId}>
    <DropdownPanel.Menu
      items={[
        { url: "?density=comfortable", label: "Comfortable rows" },
        { url: "?density=dense", label: "Dense rows" },
      ]}
    />
  </DropdownPanel>
);

const renderColumnOptions: WithDropdownRender = ({ ref, id, triggerId }) => (
  <DropdownPanel ref={ref} id={id} aria-labelledby={triggerId}>
    <DropdownPanel.Menu
      items={[
        { url: "?sort=name", label: "Sort ascending" },
        { url: "?sort=-name", label: "Sort descending" },
        { type: "separator", key: "visibility" },
        { key: "hide", label: "Hide column" },
      ]}
    />
  </DropdownPanel>
);

// The Tooltip wraps the icon button, outside the panel: a Tooltip inside an
// open panel would render under the top layer.
const SettingsTrigger = Component(
  withTooltip(IconButton, "Table settings"),
  renderSettings,
);
const OptionsTrigger = Component(
  withTooltip(IconButton, "Options for Name"),
  renderColumnOptions,
);

/**
 * The same wiring as withDropdownButton, with no chevron: for triggers the
 * design draws without one. The settings trigger is a gear, and a column's
 * options trigger is three vertical dots; each opens a menu. Each icon
 * button is named by its `aria-label` and paired with a Tooltip.
 */
export const IconTriggers: StoryFn = () => (
  <div style={{ display: "flex", gap: "var(--dimension-200)" }}>
    <SettingsTrigger
      icon="settings"
      importance="tertiary"
      aria-label="Table settings"
    />
    <OptionsTrigger
      icon="menu-contextual"
      importance="tertiary"
      aria-label="Options for Name"
    />
  </div>
);
IconTriggers.parameters = {
  docs: {
    source: {
      code: `const SettingsTrigger = withDropdownPanel(
  withTooltip(IconButton, "Table settings"),
  ({ ref, id, triggerId }) => (
    <DropdownPanel ref={ref} id={id} aria-labelledby={triggerId}>
      <DropdownPanel.Menu items={settings} />
    </DropdownPanel>
  ),
);

<SettingsTrigger icon="settings" importance="tertiary" aria-label="Table settings" />`,
    },
  },
};
