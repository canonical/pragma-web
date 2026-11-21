import type {
  ComponentProps,
  MouseEventHandler,
  ReactElement,
  ReactNode,
  RefCallback,
  RefObject,
} from "react";

type BaseOwnProps = {
  /**
   * Whether clicking the backdrop dismisses the modal. Defaults to `false`, so
   * backdrop dismissal is opt-in. Independent of the header's `undismissible`.
   */
  closeOnBackdropClick?: boolean;
  /**
   * The composed sections — `Modal.Header`, `Modal.Content` and
   * `Modal.Footer`, in that order. The header and footer are optional; the
   * content carries the main information the modal conveys.
   */
  children: ReactNode;
  /**
   * Callback fired when the open state changes, whether triggered by invoker commands,
   * the Escape key, a backdrop click, or programmatic changes.
   */
  onOpenChange?: (open: boolean) => void;
};

type ControlledOwnProps = BaseOwnProps & {
  /**
   * `open` serves two purposes:
   * - As an SSR mechanism to render the modal already open without client-side JS.
   *   Note: a dialog displayed this way is non-modal, so the component styles emulate
   *   a modal and, once hydrated, upgrade it to a real one.
   * - As a controlled prop once hydrated: setting it maps to `showModal()` / `close()`,
   *   and `onOpenChange` is called to reflect state changes triggered by other means
   *   (e.g., invoker commands, Escape press, outside click).
   */
  open: boolean;
  /**
   * Optional handle on the underlying `<dialog>` when controlled via `open`.
   */
  ref?: RefCallback<HTMLDialogElement> | RefObject<HTMLDialogElement | null>;
};

type UncontrolledOwnProps = BaseOwnProps & {
  /**
   * `open` is omitted in uncontrolled mode: use `ref.current?.showModal()` to
   * open the modal.
   */
  open?: never;
  /**
   * The handle on the underlying `<dialog>`, and the only way an uncontrolled
   * modal opens: `ref.current?.showModal()`, with `ref.current?.close()` closing it.
   * The prop is required when `open` is omitted so an uncontrolled modal that can
   * never open fails at compile time rather than silently doing nothing.
   */
  ref: RefCallback<HTMLDialogElement> | RefObject<HTMLDialogElement | null>;
};

type OwnProps = ControlledOwnProps | UncontrolledOwnProps;

/**
 * Props for the Modal pattern
 *
 * @implements ds:global.pattern.modal
 *
 * It renders a native `<dialog>` opened as a modal. In addition to imperative
 * control via `ref`, the modal supports declarative and SSR open states via
 * `open` and `onOpenChange`.
 *
 * `onClose` is also supported: the native `close` event fires whenever the modal
 * is closed, whichever way out the user took.
 */
export type ModalProps = OwnProps &
  Omit<ComponentProps<"dialog">, keyof OwnProps>;

/**
 * The shared modal API threaded to the composed subcomponents through the
 * Modal context: the id the dialog's `aria-labelledby` points at (set on the
 * Header's title, which is what gives the dialog its accessible name), and
 * the dismissal that closes the dialog (what the Header's close button calls).
 */
export interface ModalContextValue {
  /**
   * The id the dialog's `aria-labelledby` points at. The Header sets it on the
   * title, which is what gives the dialog its accessible name.
   */
  titleId: string;
  /** Closes the dialog. What the Header's close button calls. */
  onDismiss: () => void;
}

/**
 * The one requirement {@link withModal} places on the component it wraps: it
 * must accept an `onClick` handler. The HOC composes its open handler onto
 * the trigger itself — no wrapper element — so a trigger that accepts
 * `onClick` but never forwards it to a clickable element never opens its
 * modal. An `onClick` the consumer passes still runs: the HOC calls it first,
 * then opens the modal.
 *
 * The event is typed against plain `Element` so triggers rooted at any
 * element — `<button>`, `<a>`, a clickable `<span>` — satisfy the constraint:
 * React's event handlers are bivariant (the `bivarianceHack`), so a
 * `MouseEventHandler<HTMLButtonElement>` prop fits where a
 * `MouseEventHandler<Element>` is expected.
 */
export type WithModalTriggerProps = {
  onClick?: MouseEventHandler<Element>;
};

/**
 * The props the modal element returned by a {@link WithModalRender} carries:
 * everything `Modal` accepts — including the required `ref`, which the factory
 * sets on the `<Modal>` so the trigger can open it.
 */
export type WithModalModalProps = ModalProps;

/**
 * What {@link withModal} hands a {@link WithModalRender} function: a props
 * object.
 */
export type WithModalRenderProps = {
  /** Closes the modal. What a footer button wires its `onClick` to. */
  close: () => void;
  /**
   * The handle on the `<dialog>` the trigger opens. The factory MUST set it
   * on the `<Modal>` it returns — `<Modal ref={ref}>`. `Modal` requires its
   * `ref`, so a factory that forgets it fails to compile.
   */
  ref: RefObject<HTMLDialogElement | null>;
};

/**
 * The second argument of {@link withModal}: a render contract. The HOC calls
 * it during render with a {@link WithModalRenderProps} object — `{ close,
 * ref }` — and it returns the complete `<Modal>` element.
 *
 * **Every factory must attach the `ref` it receives to the `<Modal>` it
 * returns.** The trigger opens the dialog through that ref. `Modal` requires
 * its `ref`, so a factory that forgets it fails to compile:
 *
 * `({ ref }) => <Modal ref={ref}>…</Modal>`
 *
 * or, with a footer button that closes the modal:
 *
 * `({ close, ref }) => <Modal ref={ref}><Modal.Footer><Button onClick={close}>Got it</Button></Modal.Footer></Modal>`
 *
 * A footer action can only close. If it must do more — submit data, close
 * conditionally, open another modal — skip the HOC and compose `Modal`
 * directly, driving it through its `ref`.
 */
export type WithModalRender = (
  props: WithModalRenderProps,
) => ReactElement<WithModalModalProps>;
