/* @canonical/generator-ds 0.9.0-experimental.4 */
import type React from "react";
import { CheckboxField } from "../../component/CheckboxField/index.js";
import { ChoicesField } from "../../component/ChoicesField/index.js";
import { ColorField } from "../../component/ColorField/index.js";
import { ComboboxField } from "../../component/ComboboxField/index.js";
import { DateField } from "../../component/DateField/index.js";
import { DateTimeField } from "../../component/DateTimeField/index.js";
import { FileUploadField } from "../../component/FileUploadField/index.js";
import { HiddenField } from "../../component/HiddenField/index.js";
import { NumberField } from "../../component/NumberField/index.js";
import { PasswordField } from "../../component/PasswordField/index.js";
import { PhoneField } from "../../component/PhoneField/index.js";
import { RangeField } from "../../component/RangeField/index.js";
import { RatingField } from "../../component/RatingField/index.js";
import { RichChoicesField } from "../../component/RichChoicesField/index.js";
import { SelectField } from "../../component/SelectField/index.js";
import { SwitchField } from "../../component/SwitchField/index.js";
import { TextareaField } from "../../component/TextareaField/index.js";
import { TextField } from "../../component/TextField/index.js";
import { TimeField } from "../../component/TimeField/index.js";
import type { FieldProps } from "./types.js";

const withoutRoutingProps = <T extends { inputType: string }>(
  props: T,
): T extends unknown
  ? Omit<T, "inputType" | "CustomComponent" | "type">
  : never => {
  const {
    inputType: _,
    CustomComponent: _component,
    type: _type,
    ...rest
  } = props as T & {
    CustomComponent?: unknown;
    type?: unknown;
  };
  return rest as T extends unknown
    ? Omit<T, "inputType" | "CustomComponent" | "type">
    : never;
};

/**
 * A form field is the unit that pairs a single input with the surrounding meaning a user needs to act on it: a label naming what is being asked, optional descriptive guidance, the input itself, and validation feedback when an entry is rejected. It is the common frame every concrete form control adopts so that labelling, help text, optionality and error reporting behave the same across a form.
 *
 * This router has no single native root; the selected field renders its own root.
 *
 * `import { Field } from "@canonical/react-ds-global-form";`
 *
 * @implements ds:global.pattern.field
 */
const Field = <P extends { name: string } = { name: string }>(
  props: FieldProps<P>,
): React.ReactElement => {
  switch (props.inputType) {
    case "textarea":
      return <TextareaField {...withoutRoutingProps(props)} />;
    case "checkbox":
      return <CheckboxField {...withoutRoutingProps(props)} />;
    case "switch":
      return <SwitchField {...withoutRoutingProps(props)} />;
    case "rating":
      return <RatingField {...withoutRoutingProps(props)} />;
    case "range":
      return <RangeField {...withoutRoutingProps(props)} />;
    case "select":
      return <SelectField {...withoutRoutingProps(props)} />;
    case "choices":
      return <ChoicesField {...withoutRoutingProps(props)} />;
    case "combobox":
      return <ComboboxField {...withoutRoutingProps(props)} />;
    case "hidden":
      return <HiddenField {...withoutRoutingProps(props)} />;
    case "date":
      return <DateField {...withoutRoutingProps(props)} />;
    case "time":
      return <TimeField {...withoutRoutingProps(props)} />;
    case "datetime":
      return <DateTimeField {...withoutRoutingProps(props)} />;
    case "file":
      return <FileUploadField {...withoutRoutingProps(props)} />;
    case "color":
      return <ColorField {...withoutRoutingProps(props)} />;
    case "phone":
      return <PhoneField {...withoutRoutingProps(props)} />;
    case "password":
      return <PasswordField {...withoutRoutingProps(props)} />;
    case "number":
      return <NumberField {...withoutRoutingProps(props)} />;
    case "rich-choices":
      return <RichChoicesField {...withoutRoutingProps(props)} />;
    case "custom":
      if (!props.CustomComponent) {
        throw new Error(
          'Field with inputType="custom" requires a CustomComponent prop.',
        );
      }
      {
        const { inputType: _, CustomComponent, ...customProps } = props;
        return <CustomComponent {...(customProps as unknown as P)} />;
      }
    default:
      return (
        <TextField
          {...withoutRoutingProps(props)}
          inputType={props.inputType}
        />
      );
  }
};

export default Field;
