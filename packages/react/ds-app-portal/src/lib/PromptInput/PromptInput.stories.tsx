import { Icon } from "@canonical/react-ds-global";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { PromptInput } from "./index.js";

const meta = {
  title: "PromptInput",
  component: PromptInput,
  args: {
    placeholder:
      "• Describe your issue for the Knowbot to provide an answer\n• Search for ticket by ID or articles",
    compactPlaceholder: "Describe your issue",
    onSubmit: fn((event) => event.preventDefault()),
  },
} satisfies Meta<typeof PromptInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The prompt field with its hint and submit button. Below 30rem wide the hint
 * switches to the shorter `compactPlaceholder`.
 */
export const Default: Story = {};

/** Controls can be passed to show them beside the submit button. */
export const WithControl: Story = {
  args: {
    controls: <PromptInput.DeepThinkingToggle />,
  },
};

/**
 * Suggestions are listed under the field while it has focus. Click into the
 * field to open them, then use the arrow keys, Enter and Escape.
 */
export const WithSuggestions: Story = {
  args: {
    controls: <PromptInput.DeepThinkingToggle />,
    onSuggestionSelect: fn(),
    suggestions: [
      {
        id: "ask-ai",
        label: "Ask AI",
        items: [
          {
            id: "hotfix",
            icon: <Icon icon="comments" />,
            label:
              "what is the hotfix policy? can i request a critical cve fix as a hot patch?",
          },
          { id: "hello", icon: <Icon icon="comments" />, label: "hello" },
        ],
      },
      {
        id: "history",
        label: "History",
        items: [
          { id: "files", icon: <Icon icon="change-version" />, label: "files" },
        ],
      },
      {
        id: "articles",
        label: "Knowledge base articles",
        items: [
          {
            id: "hotfix-policy",
            icon: <Icon icon="file" />,
            label: "Support Hotfix Policy",
            tags: ["Desktop", "Server", "Core", "Cloud", "IoT", "Kubernetes"],
          },
          {
            id: "apparmor",
            icon: <Icon icon="file" />,
            label: "Enable AppArmor complain mode for a profile",
            tags: ["Desktop", "Server"],
          },
        ],
      },
      {
        id: "tickets",
        label: "Tickets",
        items: [
          {
            id: "00452339",
            icon: <Icon icon="status" />,
            label: "00452339: Openstack problem",
          },
        ],
      },
    ],
  },
};
