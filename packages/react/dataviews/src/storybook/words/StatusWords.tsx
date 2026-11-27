import type { ReactElement } from "react";
import { useState } from "react";
import FilterOptions from "../../lib/component/FilterOptions/FilterOptions.js";
import { STATUSES } from "./constants.js";
import type { StatusWordsProps } from "./types.js";

/** One status at a time, after "All", as a radio group behaves. Story-only. */
export default function StatusWords({
  initial = null,
}: StatusWordsProps): ReactElement {
  const [status, setStatus] = useState<string | null>(initial);
  return (
    <FilterOptions
      label="Status"
      options={[
        {
          value: "",
          label: "All",
          current: status === null,
          onSelect: () => setStatus(null),
        },
        ...STATUSES.map(({ value, count }) => ({
          value,
          label: value,
          count,
          current: status === value,
          onSelect: () => setStatus(value),
        })),
      ]}
    />
  );
}
