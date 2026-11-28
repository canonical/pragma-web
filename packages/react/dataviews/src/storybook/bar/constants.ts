/** The machines' columns as declared, the same over either collection. */
export const BAR_COLUMN_DECLARATIONS = [
  { field: "hostname", header: "Host" },
  { field: "status", header: "Status" },
  { field: "memory", header: "Memory (MiB)" },
  { field: "tags", header: "Tags" },
  { field: "owner", header: "Owner" },
  { field: "deployed", header: "Deployed" },
] as const;

/** The frame's own parameters, which a story's query never replaces. */
export const FRAME_KEYS: readonly string[] = [
  "id",
  "viewMode",
  "args",
  "globals",
];

/** The query the narrow stories start on: two filter chips, a range once. */
export const NARROW_QUERY =
  "status=deployed&memory__gte=8192&memory__lte=65536";

/** A phone's width, or the frame's where it is narrower still. */
export const PHONE_SIZE = "min(22.5rem, 100%)";
