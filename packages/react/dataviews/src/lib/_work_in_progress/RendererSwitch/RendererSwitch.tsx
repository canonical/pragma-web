import { SelectInput } from "@canonical/react-ds-global-form";
import { type ReactElement, useId, useState } from "react";
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
 * Once scripts run, the renderers are offered in the design system's select,
 * labelled by `label` or, where the application names nothing, by the words'
 * own `renderer`, and only the chosen one is drawn; the first until another
 * is chosen. Without scripting there is nothing to choose with, so the
 * first renderer — the default — is drawn alone, in a region named for it:
 * drawing every renderer would repeat each record's checkboxes, links and
 * status, and the switch has no choice it could know before it draws.
 *
 * Not exported from the package root: a work-in-progress spike, imported from
 * its own module until it is admitted.
 *
 * @experimental Pre-release: a work-in-progress spike, not admitted to the
 * package root; its shape may change or it may be withdrawn.
 *
 * `import { RendererSwitch } from "./_work_in_progress/RendererSwitch/index.js";`
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
  const options = renderers.map((renderer) => ({
    value: renderer.id,
    label: renderer.label,
  }));
  const words = useMessages(messages);
  // The application's name for this collection, or the words' own.
  const name = label ?? words.renderer;
  const hydrated = useIsHydrated();
  const selectId = useId();
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
      {hydrated ? (
        <div className="choice">
          <label htmlFor={selectId}>{name}</label>
          <SelectInput
            id={selectId}
            value={active}
            options={options}
            onChange={(event) => {
              setChosen(event.target.value);
            }}
          />
        </div>
      ) : null}
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
    </section>
  );
}
