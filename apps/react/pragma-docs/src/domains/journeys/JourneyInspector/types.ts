import type { InspectedJob } from "../types.js";

export interface JourneyInspectorProps {
  /** Additional CSS class names. */
  className?: string;
  /** The selected job, or undefined on the index (`/journeys`). */
  readonly job: InspectedJob | undefined;
}
