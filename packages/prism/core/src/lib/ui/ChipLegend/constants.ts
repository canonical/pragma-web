import type { EncodingIndex } from "../Chip/index.js";
import type { Channel, ChannelDescriptor } from "./types.js";

/** The four channels, in the order the legend presents them. */
export const CHANNELS = ["namespace", "box", "kind", "lifecycle"] as const;

/**
 * The legend's copy for each of the four channels, one row per
 * {@link CHANNELS} value, each row's `value` equal to its key; the label
 * and description are catalog keys, read through `t()`.
 */
export const CHANNEL_INDEX: EncodingIndex<Channel, ChannelDescriptor> = {
  namespace: {
    value: "namespace",
    labelKey: "chip.channel.namespace.label",
    descriptionKey: "chip.channel.namespace.description",
  },
  box: {
    value: "box",
    labelKey: "chip.channel.box.label",
    descriptionKey: "chip.channel.box.description",
  },
  kind: {
    value: "kind",
    labelKey: "chip.channel.kind.label",
    descriptionKey: "chip.channel.kind.description",
  },
  lifecycle: {
    value: "lifecycle",
    labelKey: "chip.channel.lifecycle.label",
    descriptionKey: "chip.channel.lifecycle.description",
  },
};

/**
 * The channels' legend copy in {@link CHANNELS} order, as the legend
 * presents it.
 */
export const CHANNEL_DESCRIPTORS: readonly ChannelDescriptor[] = CHANNELS.map(
  (value) => CHANNEL_INDEX[value],
);
