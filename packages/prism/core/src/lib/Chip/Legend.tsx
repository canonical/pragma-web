import type { ReactElement } from "react";
import Chip from "./Chip.js";
import {
  BOX_ENCODINGS,
  CHANNEL_DESCRIPTORS,
  DEFAULT_BOX,
  DEFAULT_LIFECYCLE,
  KIND_ENCODINGS,
  LEGEND_CSS_CLASS_NAME,
  LIFECYCLE_ENCODINGS,
} from "./constants.js";
import type { Channel, ChipChannelValues, ChipLegendProps } from "./types.js";
import "./styles.css";

/** One generated legend row: legend copy plus the swatch's channel values. */
interface LegendEntry {
  readonly key: string;
  readonly label: string;
  readonly description: string;
  readonly channels: ChipChannelValues;
}

/**
 * Projects one channel's rows into legend entries, each swatch holding the
 * baseline constant while its own channel varies — so each legend row
 * demonstrates exactly one dimension of the grammar. The namespace rows are
 * the site's prefixes; the others are the encoding tables. The switch is
 * exhaustive over {@link Channel}, so adding a channel without legend
 * coverage is a compile error.
 */
function listEntriesForChannel(
  channel: Channel,
  prefixes: readonly string[],
): readonly LegendEntry[] {
  const baseline: ChipChannelValues = {
    namespace: prefixes.at(0),
    kind: "term",
    box: DEFAULT_BOX,
    lifecycle: DEFAULT_LIFECYCLE,
    prefixes,
  };
  switch (channel) {
    case "namespace":
      return prefixes.map((prefix) => ({
        key: prefix,
        label: `${prefix}:`,
        description: `Entities whose URI starts with ${prefix}:`,
        channels: { ...baseline, namespace: prefix },
      }));
    case "box":
      return BOX_ENCODINGS.map((row) => ({
        key: row.value,
        label: row.label,
        description: row.description,
        channels: { ...baseline, box: row.value },
      }));
    case "kind":
      return KIND_ENCODINGS.map((row) => ({
        key: row.value,
        label: `${row.label} (${row.shape})`,
        description: row.description,
        channels: { ...baseline, kind: row.value },
      }));
    case "lifecycle":
      return LIFECYCLE_ENCODINGS.map((row) => ({
        key: row.value,
        label: row.label,
        description: row.description,
        channels: { ...baseline, lifecycle: row.value },
      }));
    /* v8 ignore start -- exhaustive switch: every Channel member is handled above, so this arm is unreachable */
    default: {
      // Exhaustiveness survives the return-type annotation being removed:
      // a new Channel without a case fails to assign to `never` here.
      const _exhaustive: never = channel;
      throw new Error(`ChipLegend: unknown channel "${String(_exhaustive)}"`);
    }
    /* v8 ignore stop */
  }
}

/**
 * The chip legend — generated, never hand-written. The namespace group lists
 * one swatch per site prefix; every other group maps over the encoding
 * tables `Chip` renders from; and every swatch is a real `Chip` styled
 * through the same channel pipeline, so the legend cannot drift from
 * behaviour.
 *
 * `import { ChipLegend } from "@canonical/prism-core";`
 */
const ChipLegend = ({
  prefixes,
  className,
  ...props
}: ChipLegendProps): ReactElement => (
  <div
    {...props}
    className={[LEGEND_CSS_CLASS_NAME, className].filter(Boolean).join(" ")}
  >
    {CHANNEL_DESCRIPTORS.map((channel) => (
      <section aria-label={channel.label} key={channel.value}>
        <p className="chip-legend-title">{channel.label}</p>
        <p className="chip-legend-summary">{channel.description}</p>
        <ul className="chip-legend-entries">
          {listEntriesForChannel(channel.value, prefixes).map((entry) => (
            <li key={entry.key}>
              <Chip
                box={entry.channels.box}
                kind={entry.channels.kind}
                label={entry.label}
                lifecycle={entry.channels.lifecycle}
                namespace={entry.channels.namespace}
                prefixes={prefixes}
                uri={`legend:${channel.value}.${entry.key}`}
              />
              <span className="chip-legend-note">{entry.description}</span>
            </li>
          ))}
        </ul>
      </section>
    ))}
  </div>
);

export default ChipLegend;
