import type { FieldChromeProps } from "../../common/types.js";
import type { FileUploadInputProps } from "../../subcomponent/FileUploadInput/types.js";

/** Props for the FileUploadField: field chrome plus the FileUploadInput props. */
export type FileUploadFieldProps = FieldChromeProps &
  Omit<FileUploadInputProps, "id" | "class" | "style" | "name" | "files"> & {
    /** Where the description sits: above the control or below it. */
    descriptionPosition?: "leading" | "trailing";
    /** The selected files. Bindable. */
    value?: File[];
  };
