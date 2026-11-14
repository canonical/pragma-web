import type React from "react";
import bindField from "../../common/bindField/index.js";
import type { WrapperProps } from "../../common/types.js";
import Wrapper from "../../common/Wrapper/Wrapper.js";
import withWrapper from "../../common/Wrapper/withWrapper.js";
import { Choices } from "./Choices.js";
import type { ChoicesFieldProps } from "./types.js";

/* Existing wrapper hook marks the plain Choices legend without changing DOM. */
const ChoicesWrapper = (
  props: WrapperProps<ChoicesFieldProps>,
): React.ReactElement => (
  <Wrapper
    {...props}
    className={[props.className, "field-choices"].filter(Boolean).join(" ")}
  />
);

/**
 * Choices bound to react-hook-form (controlled), wrapped with field
 * chrome. The label is mocked into the fieldset legend, as the "true" label is
 * rendered by the individual options.
 *
 * `import { ChoicesField } from "@canonical/react-ds-global-form";`
 *
 * @implements ds:global.component.choices_field
 */
export default withWrapper<ChoicesFieldProps>(
  bindField<ChoicesFieldProps>(Choices, "controlled"),
  { mockLabel: true },
  ChoicesWrapper,
);
