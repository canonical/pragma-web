import type { ComponentType, ReactElement } from "react";
import { Icon } from "../Icon/index.js";
import { CHEVRON_ICON } from "./constants.js";
import type {
  WithDropdownButtonTriggerProps,
  WithDropdownRender,
  WithDropdownTriggerProps,
} from "./types.js";
import withDropdownPanel from "./withDropdownPanel.js";
import "./styles.css";

const componentCssClassName = "ds dropdown-button";

/**
 * `unknown` for a trigger whose children can hold the chevron, `never` for
 * one that declares no children or refuses them (an icon-only trigger),
 * which takes withDropdownPanel instead.
 */
type ChevronSlot<TProps> = TProps extends { children?: never }
  ? never
  : unknown;

/**
 * A Dropdown Button is a specialized button that includes a persistent
 * chevron icon to indicate nested functionality. Unlike standard Buttons that
 * execute a single, immediate action, the Dropdown Button reveals a
 * ContextualMenu of options or controls. This visual cue ensures users
 * understand that an interaction will expand the interface to provide further
 * choices rather than triggering an instantaneous system change.
 *
 * `withDropdownButton` draws no button of its own. It takes the trigger
 * component, usually `Button`, and a render function that returns the
 * complete `<DropdownPanel>`. The component it returns renders the two as
 * siblings, with no root element. The trigger opens and closes the panel
 * through `popovertarget`, so it works before any script runs, and the
 * persistent chevron follows its children.
 *
 * The render function receives `{ close, ref, id, triggerId }`. **It must
 * set `ref` and `id` on the `<DropdownPanel>` it returns.** `DropdownPanel`
 * requires both, so a factory that forgets either fails to compile. Name the
 * panel with `aria-labelledby={triggerId}`, or with an `aria-label`.
 *
 * Every prop reaches the trigger unchanged, except the keys the HOC owns:
 * `popoverTarget`, `popoverTargetAction`, `aria-haspopup`, `aria-expanded`
 * and `aria-controls`. The trigger's `onClick` runs as its own, and
 * `event.preventDefault()` there cancels the toggle. The trigger renders
 * `type="button"` unless a `type` is passed; a `type="submit"` trigger also
 * submits the form around it.
 *
 * Call it once, at module scope. The render function can see only
 * module-level values, so data from the parent reaches the panel through a
 * context provided above the trigger.
 *
 * `import { withDropdownButton } from "@canonical/react-ds-global";`
 *
 * @implements ds:global.component.dropdown_button
 * @param Trigger The trigger: it renders a `<button>`, forwards `id`, `type`, `style`, `popoverTarget` and the ARIA keys to it, and takes `children`.
 * @param render A {@link WithDropdownRender} that returns the `<DropdownPanel>`, with `ref` and `id` set from its props.
 * @returns A component that renders the trigger, with the chevron, and the panel as siblings.
 */
export default function withDropdownButton<
  TProps extends WithDropdownButtonTriggerProps,
>(
  Trigger: ComponentType<TProps> & NoInfer<ChevronSlot<TProps>>,
  render: WithDropdownRender,
): ComponentType<WithDropdownTriggerProps<TProps>> {
  // The guard has done its work in the signature; inside, Trigger is a plain
  // component of TProps.
  const TriggerComponent: ComponentType<TProps> = Trigger;

  // The chevron trails the children inside the trigger's label, so it hides
  // with the label while the trigger is loading.
  const ChevronTrigger = ({
    children,
    className,
    ...props
  }: TProps): ReactElement => {
    // The chevron is decorative, but it gives Button visible children, so
    // Button's own warning for an unnamed icon-only button never fires. The
    // trigger repeats it.
    const { "aria-label": label, "aria-labelledby": labelledBy } = props as {
      "aria-label"?: string;
      "aria-labelledby"?: string;
    };
    const hasVisibleChildren =
      children != null && typeof children !== "boolean" && children !== "";
    if (
      typeof process !== "undefined" &&
      process.env.NODE_ENV !== "production" &&
      !hasVisibleChildren &&
      !label &&
      !labelledBy
    ) {
      console.warn(
        "withDropdownButton: a trigger with no visible children needs an `aria-label` or `aria-labelledby` to be accessible.",
      );
    }
    const triggerProps = {
      ...props,
      className: [componentCssClassName, className].filter(Boolean).join(" "),
      children: (
        <>
          {children}
          <span className="chevron">
            <Icon icon={CHEVRON_ICON} />
          </span>
        </>
      ),
    } as TProps;
    return <TriggerComponent {...triggerProps} />;
  };

  const WrappedComponent = withDropdownPanel(ChevronTrigger, render);
  WrappedComponent.displayName = `withDropdownButton(${
    Trigger.displayName || Trigger.name || "AnonymousComponent"
  })`;

  return WrappedComponent;
}
