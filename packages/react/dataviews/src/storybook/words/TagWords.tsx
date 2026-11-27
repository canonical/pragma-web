import type { ReactElement } from "react";
import { useState } from "react";
import FilterOptions from "../../lib/component/FilterOptions/FilterOptions.js";
import { TAGS } from "./constants.js";

/** Several tags at once, as checkboxes behave. Story-only. */
export default function TagWords(): ReactElement {
  const [tags, setTags] = useState<readonly string[]>(["ex-gpu"]);
  return (
    <FilterOptions
      label="Tags"
      multiple
      options={TAGS.map((tag) => ({
        value: tag,
        label: tag,
        current: tags.includes(tag),
        onSelect: () =>
          setTags(
            tags.includes(tag)
              ? tags.filter((held) => held !== tag)
              : [...tags, tag],
          ),
      }))}
    />
  );
}
