import bindField from "../../common/bindField/index.js";
import withWrapper from "../../common/Wrapper/withWrapper.js";
import { Choices } from "./Choices.js";
import type { ChoicesFieldProps } from "./types.js";

/**
 * Choices bound to react-hook-form (controlled), wrapped with field
 * chrome. The field label is rendered as plain text (`mockLabel`), as each
 * option carries its own label; the fieldset is named by it through
 * `aria-labelledby`.
 *
 * `import { ChoicesField } from "@canonical/react-ds-global-form";`
 *
 * @implements ds:global.component.choices_field
 */
export default withWrapper<ChoicesFieldProps>(
  bindField<ChoicesFieldProps>(Choices, "controlled"),
  { mockLabel: true },
);
