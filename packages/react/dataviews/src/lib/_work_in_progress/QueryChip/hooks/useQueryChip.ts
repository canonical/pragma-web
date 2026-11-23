import {
  Children,
  type FocusEvent,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type Ref,
  useCallback,
  useId,
} from "react";
import { useRovingItem, useRovingStop } from "../../../common/index.js";
import { useIsHydrated, useMergedRef } from "../../../hooks/index.js";
import { Entry, Segment, type SegmentProps } from "../common/index.js";
import type { QueryChipFault } from "../common/types.js";
import type { UseQueryChipProps, UseQueryChipResult } from "./types.js";

/** One of the chip's children, with a key that is stable across renders. */
type Part = { key: string; node: ReactNode };

/**
 * Lists the chip's children in order, looking through fragments. Each part
 * keeps the key it was given, so a host that keys its Entry keeps the same
 * input as parts settle before it.
 */
const listParts = (children: ReactNode, prefix = ""): Part[] =>
  Children.toArray(children).flatMap((child, index) => {
    const key = `${prefix}${isValidElement(child) ? child.key : index}`;
    return isValidElement<{ children?: ReactNode }>(child) &&
      child.type === Fragment
      ? listParts(child.props.children, `${key}/`)
      : [{ key, node: child }];
  });

/** Whether a child is a Segment. */
const isSegment = (node: ReactNode): node is ReactElement<SegmentProps> =>
  isValidElement(node) && node.type === Segment;

/** Whether a child is an Entry. */
const isEntry = (node: ReactNode): node is ReactElement<QueryChipFault> =>
  isValidElement(node) && node.type === Entry;

/**
 * Works out what a query chip renders from its parts: checks the
 * composition, finds the chip's one toolbar item, gives each part its role
 * and description ids, and builds the group and the remove control.
 *
 * @param props - The chip's parts and props.
 * @returns The parts with their context, the plain-text descriptions, and
 * the group's and the remove control's props.
 * @note Impure: claims the roving stop when a part takes focus.
 */
export default function useQueryChip({
  children,
  id,
  label,
  criticality,
  disabled,
  onRemove,
  removeHref,
  removeLabel,
  ref,
}: UseQueryChipProps): UseQueryChipResult {
  const isMounted = useIsHydrated();
  const baseId = useId();
  const parts = listParts(children);
  const rovingContext = useRovingStop();
  const isRoving = rovingContext !== undefined;
  const entryCount = parts.filter((part) => isEntry(part.node)).length;
  const hasEntry = entryCount > 0;
  const firstPart = parts.find((part) => isSegment(part.node));
  const isInteractive =
    hasEntry ||
    parts.some((part) => isSegment(part.node) && part.node.props.onActivate);
  // A read-only chip's one toolbar item is its remove control; a disabled
  // chip has none.
  const removeItem = useRovingItem({
    id: isRoving && !isInteractive && !disabled ? `${id}:remove` : undefined,
  });

  if (isInteractive && !isRoving) {
    throw new Error(
      "QueryChip: an interactive chip lives inside a roving toolbar.",
    );
  }
  if (isRoving && id === undefined) {
    throw new Error("QueryChip: `id` is required inside a roving toolbar.");
  }
  if (isInteractive && label === undefined) {
    throw new Error(
      "QueryChip: `label` is required while a part is interactive.",
    );
  }
  if (!firstPart) {
    throw new Error("QueryChip: a chip holds at least one QueryChip.Segment.");
  }
  // Found by isSegment above.
  const firstSegment = firstPart.node as ReactElement<SegmentProps>;
  if (entryCount > 1) {
    throw new Error("QueryChip: a chip holds at most one QueryChip.Entry.");
  }
  // The first Segment is the toolbar item the host lands on.
  if (isInteractive && !firstSegment.props.onActivate) {
    throw new Error(
      "QueryChip: the first Segment needs `onActivate` while a part is interactive.",
    );
  }

  const isPartFocusable = isMounted && isInteractive;
  // A reference speaks a description only from a control that takes focus.
  const isRemoveFocusable =
    removeLabel !== undefined &&
    !disabled &&
    (removeHref !== undefined || isMounted);
  const isRefused = criticality === "error";
  // From the part's place, not its key, which may hold whitespace an id
  // reference would split on.
  const findDescriptionId = (part: Part) => `${baseId}-${parts.indexOf(part)}`;
  const isFault = (part: Part): boolean =>
    (isSegment(part.node) || isEntry(part.node)) &&
    Boolean(part.node.props.invalid);
  const faultIds = parts
    .filter((part) => part !== firstPart && isFault(part))
    .map(findDescriptionId);
  // While no part takes focus, as on a read-only chip or any chip before
  // scripts run, the remove control carries the refused chip's reason and
  // every fault, which no part can speak. No Entry renders then.
  const removeDescribedBy =
    isPartFocusable || !isRemoveFocusable
      ? undefined
      : [
          ...(isRefused && firstSegment.props.description ? [firstPart] : []),
          ...parts.filter((part) => isSegment(part.node) && isFault(part)),
        ]
          .filter((part, index, list) => list.indexOf(part) === index)
          .map(findDescriptionId)
          .join(" ") || undefined;
  // A plain-text Segment's description is referenced by the first Segment,
  // for a fault, while the parts take focus; by the remove control, for the
  // reason or a fault, while they do not.
  const isReferenced = (part: Part): boolean =>
    isPartFocusable
      ? !disabled && isFault(part)
      : isRemoveFocusable &&
        (isFault(part) || (isRefused && part === firstPart));

  // Focus on any of the chip's parts, by pointer too, gives the chip's one
  // item the stop.
  const itemId = hasEntry
    ? `${id}:entry`
    : isInteractive
      ? `${id}`
      : `${id}:remove`;
  const claimChipStop = () => {
    if (rovingContext && !disabled && rovingContext.activeItem !== itemId) {
      rovingContext.setActiveItem(itemId);
    }
  };
  const removeRoving = isMounted ? removeItem : undefined;
  // The chip's root is a member of the composite, so focus on any of its
  // parts counts as inside it.
  const registerMember = rovingContext?.registerMember;
  const attachRoot = useCallback(
    (node: HTMLSpanElement) =>
      registerMember ? registerMember(node) : undefined,
    [registerMember],
  );
  const rootRef = useMergedRef(ref, attachRoot);

  return {
    parts: parts.map((part) => ({
      key: part.key,
      node: part.node,
      context: {
        id,
        isMounted,
        disabled,
        // The toolbar item is the Entry while there is one, else the first
        // Segment of an interactive chip.
        isItem:
          isRoving &&
          !disabled &&
          (hasEntry ? isEntry(part.node) : isInteractive && part === firstPart),
        isRefusedReason: isRefused && part === firstPart,
        descriptionId: findDescriptionId(part),
        // Only a first Segment that takes focus speaks the faults.
        faultIds: part === firstPart && !disabled ? faultIds : [],
      },
    })),
    descriptions: parts.flatMap((part) =>
      isSegment(part.node) &&
      part.node.props.description &&
      !(isMounted && part.node.props.onActivate)
        ? [
            {
              key: `${part.key}-description`,
              id: findDescriptionId(part),
              text: part.node.props.description,
              isReferenced: isReferenced(part),
            },
          ]
        : [],
    ),
    groupProps: isPartFocusable
      ? {
          role: "group",
          "aria-label": label,
          // The item claims the stop itself; any other part claims it here.
          onFocus: (event: FocusEvent<HTMLElement>) => {
            if (
              (event.target as HTMLElement).dataset["rovingItem"] !== itemId
            ) {
              claimChipStop();
            }
          },
        }
      : {},
    rootRef,
    removeProps: {
      ...removeRoving,
      // An interactive chip's remove control stays out of the tab order: the
      // host's Delete key is its keyboard path.
      tabIndex:
        removeRoving?.tabIndex ?? (isMounted && isRoving ? -1 : undefined),
      className: "remove",
      "aria-label": removeLabel,
      "aria-describedby": removeDescribedBy,
      // A read-only chip's remove control is its item, which claims the
      // stop itself; an interactive chip's claims it for the item.
      onFocus: (event) => {
        if (removeRoving) removeRoving.onFocus(event);
        else claimChipStop();
      },
      onClick: (event) => {
        removeRoving?.onClick(event);
        onRemove?.(event);
      },
    },
    isRemoveLink: removeHref !== undefined && !disabled,
    isRemoveInert: disabled || !isMounted,
  };
}
