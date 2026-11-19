import type { Meta, StoryFn } from "@storybook/react-vite";
import { type ToggleEvent, useRef, useState } from "react";
import { Button } from "../../../Button/index.js";
import Component from "./Provider.js";
import type { DropdownPanelHandle } from "./types.js";

const meta = {
  title: "components/DropdownButton/Panel",
  component: Component,
  parameters: {
    docs: {
      story: { inline: false, iframeHeight: "320px" },
      source: { type: "code", language: "tsx" },
    },
  },
} satisfies Meta<typeof Component>;

export default meta;

/**
 * When the HOCs' module-scope rule does not fit, compose the panel directly:
 * a hand-made trigger names it with `popoverTarget`, and the handle drives it
 * from script. A panel composed this way opens where the browser places
 * popovers, because no anchor ties it to its trigger.
 */
export const DirectComposition: StoryFn = () => {
  const ref = useRef<DropdownPanelHandle>(null);
  return (
    <div style={{ display: "flex", gap: "var(--dimension-200)" }}>
      <Button importance="secondary" popoverTarget="direct-panel">
        Trigger
      </Button>
      <Button importance="tertiary" onClick={() => ref.current?.show()}>
        show()
      </Button>
      <Button importance="tertiary" onClick={() => ref.current?.toggle()}>
        toggle()
      </Button>
      <Component ref={ref} id="direct-panel" aria-label="Direct panel">
        <p style={{ margin: 0 }}>Driven through its handle.</p>
        <Button importance="tertiary" onClick={() => ref.current?.hide()}>
          hide()
        </Button>
      </Component>
    </div>
  );
};

/**
 * The native `onToggle` reports every opening and closing with
 * `event.newState`, and runs before the panel's own listener.
 */
export const OnToggle: StoryFn = () => {
  const ref = useRef<DropdownPanelHandle>(null);
  const [state, setState] = useState("closed");
  return (
    <div>
      <Button importance="secondary" popoverTarget="toggle-panel">
        Trigger
      </Button>
      <output style={{ marginInlineStart: "var(--dimension-200)" }}>
        {state}
      </output>
      <Component
        ref={ref}
        id="toggle-panel"
        aria-label="Reporting panel"
        onToggle={(event: ToggleEvent<HTMLDivElement>) =>
          setState(event.newState)
        }
      >
        Close me with Escape or a click outside.
      </Component>
    </div>
  );
};
