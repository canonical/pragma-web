import bindField from "../../common/bindField/index.js";
import withWrapper from "../../common/Wrapper/withWrapper.js";
import { DateTimeInput } from "../../subcomponent/DateTimeInput/index.js";
import type { DateTimeFieldProps } from "./types.js";

/**
 * DateTime input bound to react-hook-form, wrapped with field chrome
 * (label, description, error) and middleware/conditional-display support.
 * Helper text (description) sits under the input by default; `layout: "aside"`
 * moves the label beside the input and helper text.
 *
 * `import { DateTimeField } from "@canonical/react-ds-global-form";`
 *
 * @implements ds:global.component.date_time_field
 */
export default withWrapper<DateTimeFieldProps>(
  bindField<DateTimeFieldProps>(DateTimeInput, "native"),
  { descriptionPosition: "trailing" },
);
