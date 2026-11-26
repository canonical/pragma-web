import bindField from "../../common/bindField/index.js";
import withWrapper from "../../common/Wrapper/withWrapper.js";
import { RichChoices } from "./RichChoices.js";
import type { RichChoicesFieldProps } from "./types.js";

/**
 * RichChoices bound to react-hook-form (controlled), wrapped with field chrome.
 * The field label is rendered as plain text (`mockLabel`), as each option
 * carries its own label; the fieldset is named by it through `aria-labelledby`.
 *
 * `import { RichChoicesField } from "@canonical/react-ds-global-form";`
 *
 * @implements ds:global.component.rich_choices_field
 */
export default withWrapper<RichChoicesFieldProps>(
  bindField<RichChoicesFieldProps>(RichChoices, "controlled"),
  { mockLabel: true },
);
