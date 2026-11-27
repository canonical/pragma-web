import type React from "react";
import { useRef } from "react";
import { useController, useFormContext } from "react-hook-form";
import withWrapper from "../../common/Wrapper/withWrapper.js";
import {
  FileUploadInput,
  type UploadSummary,
} from "../../subcomponent/FileUploadInput/index.js";
import defaultMessages from "../../subcomponent/FileUploadInput/messages.js";
import fileUploadRules from "./fileUploadRules.js";
import type { FileUploadFieldProps } from "./types.js";
import "./styles.css";

/**
 * Binds the FileUploadInput to react-hook-form. The form value is the
 * `File[]` the user chose; upload state stays in the input, which reports its
 * running and failed counts here so the `uploads` rule can hold a submit back
 * (see `fileUploadRules`). When those counts change while the field shows an
 * error, the field validates again, so the error clears once uploads settle.
 *
 * The field's ref focuses the first enabled button in the input: the Choose
 * file button, or a file's action when the drop area is hidden.
 */
const FileUploadBinding = ({
  name,
  registerProps,
  // A button does not take `aria-required`; the native file input carries
  // `required` instead.
  "aria-required": _ariaRequired,
  onUploadStatusChange,
  ...props
}: FileUploadFieldProps): React.ReactElement => {
  const { trigger, getFieldState } = useFormContext();
  const uploadSummary = useRef<UploadSummary>({ uploading: 0, failed: 0 });
  const messages = { ...defaultMessages, ...props.messages };

  const { field } = useController({
    name,
    defaultValue: [],
    rules: fileUploadRules(
      props,
      messages,
      () => uploadSummary.current,
      registerProps,
    ),
  });

  const handleUploadStatusChange = (summary: UploadSummary) => {
    uploadSummary.current = summary;
    if (getFieldState(name).error) void trigger(name);
    onUploadStatusChange?.(summary);
  };

  return (
    <FileUploadInput
      {...props}
      name={name}
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      onUploadStatusChange={handleUploadStatusChange}
      ref={(element: HTMLDivElement | null) =>
        field.ref(
          element && {
            focus: () =>
              element
                .querySelector<HTMLButtonElement>("button:not(:disabled)")
                ?.focus(),
          },
        )
      }
    />
  );
};

/**
 * FileUploadInput bound to react-hook-form, in the field frame: a label, an
 * optional description, and the input, which renders the field error under its
 * drop area. `maxFiles`, per-file errors and unsettled uploads are
 * react-hook-form validation rules, so each makes the field invalid and holds
 * a submit back.
 *
 * `import { FileUploadField } from "@canonical/react-ds-global-form";`
 *
 * @implements ds:global.component.file_upload_field
 */
export default withWrapper<FileUploadFieldProps>(FileUploadBinding, {
  errorSlot: "input",
});
