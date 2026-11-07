import { Button } from "@canonical/react-ds-global";
import { type ReactElement, useState } from "react";
import { useIsHydrated, useMessages } from "../../hooks/index.js";
import type { RendererSwitchProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds renderer-switch";

/**
 * Show one collection through the renderer the reader chooses: a table,
 * cards, or any other the application places. The choice is this switch's
 * alone. It is held while the switch is mounted and reaches nothing else —
 * not the provider, the URL or a saved view — so every renderer it holds
 * reads the same query, rows and selection, and changing renderer asks the
 * source for nothing.
 *
 * Draws the chosen renderer alone, the first before scripts or until another
 * is chosen. Once scripts run, the renderers are offered as a segmented
 * choice after it, at the inline end: one design-system button per
 * renderer, the chosen one pressed, in a group named by `label` or, where
 * the application names nothing, by the words' own `renderer`. Each button
 * is a Tab stop that Enter and Space press. The design system names a SegmentedControlInput that no
 * library implements yet; the switch adopts it when one does.
 *
 * @experimental Pre-release: a work-in-progress spike, internal to the
 * package and not exported; its shape may change or it may be withdrawn.
 *
 * @implements ds:apps.pattern.renderer_switch
 */
export default function RendererSwitch({
  label,
  renderers,
  messages,
  className,
  ref,
  ...rest
}: RendererSwitchProps): ReactElement {
  const first = renderers.at(0);
  if (first === undefined) {
    throw new Error("RendererSwitch requires at least one renderer");
  }
  // Built once, and read by the validation, the choice and the fallback
  // alike: an application writes its renderers inline, so a memo over that
  // array would never hold anyway.
  const ids = new Set(renderers.map((renderer) => renderer.id));
  if (ids.size !== renderers.length) {
    throw new Error("RendererSwitch requires a distinct id for each renderer");
  }
  const words = useMessages(messages);
  // The application's name for this collection, or the words' own.
  const name = label ?? words.renderer;
  const hydrated = useIsHydrated();
  const [chosen, setChosen] = useState(first.id);
  // A renderer the application stopped offering is no longer chosen, and is
  // not chosen again should it come back.
  if (!ids.has(chosen)) {
    setChosen(first.id);
  }
  const active = ids.has(chosen) ? chosen : first.id;
  return (
    <section
      {...rest}
      ref={ref}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      aria-label={name}
    >
      {/* The chosen renderer alone; before scripts, the first. */}
      {renderers.map((renderer) =>
        renderer.id === active ? (
          <section
            key={renderer.id}
            data-renderer={renderer.id}
            aria-label={renderer.label}
          >
            {renderer.content}
          </section>
        ) : null,
      )}
      {hydrated ? (
        // biome-ignore lint/a11y/useSemanticElements: a fieldset groups form controls under a legend; this groups toggle buttons, a segmented choice, under the switch's own name
        <div className="choice" role="group" aria-label={name}>
          {renderers.map((renderer) => (
            <Button
              key={renderer.id}
              type="button"
              aria-pressed={renderer.id === active}
              importance={renderer.id === active ? "primary" : "secondary"}
              onClick={() => {
                setChosen(renderer.id);
              }}
            >
              {renderer.label}
            </Button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
