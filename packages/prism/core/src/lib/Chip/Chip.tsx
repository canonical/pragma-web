import type { CSSProperties, MouseEvent, ReactElement } from "react";
import { t } from "../i18n/index.js";
import { DEFAULT_BOX, DEFAULT_LIFECYCLE } from "./constants.js";
import {
  assertNonEmptyString,
  buildChipChannelStyle,
  deriveNamespaceFromUri,
  getLifecycleEncoding,
} from "./encodings.js";
import type { ChipProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds chip";

/**
 * An inline mention of a graph entity — a site's ambient mechanism for
 * naming things the knowledge graph knows about.
 *
 * A chip is a mention, not the entity itself: `uri` is its identity and the
 * decoration is derived, per the four orthogonal channels in `encodings.ts`
 * (tint → namespace, border-vs-fill → class/instance, shape → kind, dot →
 * lifecycle). Every channel arrives as a CSS custom property, so themes can
 * restyle chips without touching this logic, and with styling ignored the
 * chip degrades to its label as plain running text — chips never block the
 * reading path.
 *
 * The tint comes from the namespace's place in `prefixes`, the site's own
 * namespace list. With an `href` the chip is a real link to the noun's
 * canonical home; without one it is inert text. Native props reach the
 * root; the chip's own class, style, description and data attributes are
 * set after them.
 *
 * `import { Chip } from "@canonical/prism-core";`
 */
const Chip = (props: ChipProps): ReactElement => {
  const {
    uri,
    label,
    kind,
    prefixes,
    namespace,
    box = DEFAULT_BOX,
    lifecycle = DEFAULT_LIFECYCLE,
    summary,
    onNavigate,
    className,
    style,
    ...rest
  } = props;
  // Props cross the content boundary (MDX, graph data) — fail loudly here.
  assertNonEmptyString(uri, "uri");
  assertNonEmptyString(label, "label");

  const resolvedNamespace = namespace ?? deriveNamespaceFromUri(uri);
  // The definition peek, with the lifecycle's catalog label folded in so
  // what the dot shows visually also reaches assistive tech, in the
  // catalog's language.
  const description =
    summary === undefined
      ? undefined
      : lifecycle === "none"
        ? summary
        : t("chip.summaryWithLifecycle", {
            summary,
            lifecycle: t(getLifecycleEncoding(lifecycle).labelKey),
          });
  const sharedProps = {
    className: [componentCssClassName, className].filter(Boolean).join(" "),
    // The channel payloads; typed as ChipChannelStyle, cast for React's
    // style prop (custom properties pass through to setProperty). A
    // consumer's own style merges underneath them.
    style: {
      ...style,
      ...buildChipChannelStyle({
        namespace: resolvedNamespace,
        kind,
        box,
        lifecycle,
        prefixes,
      }),
    } as CSSProperties,
    // The peek's primary channel is `aria-description` (assistive tech
    // announces it; `title` alone is unreliable there); `title` stays as a
    // redundant visual hover affordance. Both are string attributes, never
    // text nodes, so the surrounding text's textContent stays equal to the
    // visible prose — the reads-as-text invariant.
    "aria-description": description,
    title: summary,
    // Identity and channel values as data attributes, for tooling, tests
    // and the stylesheet's structural selectors (e.g. hiding the dot).
    "data-uri": uri,
    "data-namespace": resolvedNamespace ?? "",
    "data-kind": kind,
    "data-box": box,
    "data-lifecycle": lifecycle,
  };

  if (rest.href === undefined) {
    const { href: _absent, ...spanProps } = rest;
    return (
      <span {...spanProps} {...sharedProps}>
        {label}
      </span>
    );
  }

  const { href, onClick, ...anchorProps } = rest;

  function handleClick(event: MouseEvent<HTMLAnchorElement>): void {
    onClick?.(event);
    onNavigate?.(uri, event);
  }

  return (
    <a {...anchorProps} {...sharedProps} href={href} onClick={handleClick}>
      {label}
    </a>
  );
};

export default Chip;
