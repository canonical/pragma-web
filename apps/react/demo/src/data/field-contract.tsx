import { Field, type FieldProps } from "@canonical/react-ds-global-form";

type IsAny<T> = 0 extends 1 & T ? true : false;
const fieldPropsAreAny: IsAny<FieldProps> = false;

type CodeProps = { name: string; length: number };
const Code = ({ name, length }: CodeProps) => (
  <input name={name} maxLength={length} />
);
type VariantProps =
  | { name: string; kind: "text"; text: string }
  | { name: string; kind: "number"; number: number };
const Variant = (_props: VariantProps) => null;

const valid = (
  <Field inputType="custom" CustomComponent={Code} name="code" length={8} />
);
const variants: FieldProps<VariantProps>[] = [
  {
    inputType: "custom",
    CustomComponent: Variant,
    name: "a",
    kind: "text",
    text: "a",
  },
  {
    inputType: "custom",
    CustomComponent: Variant,
    name: "b",
    kind: "number",
    number: 2,
  },
];
const rendered = variants.map((field) => <Field key={field.name} {...field} />);

const email = <Field inputType="email" name="mail" placeholder="Email" />;
const emailVariant: Extract<FieldProps, { inputType: "email" }> = {
  inputType: "email",
  name: "mail",
};
// @ts-expect-error inputType selects the native type
const conflictingEmail = <Field inputType="email" name="mail" type="number" />;
// @ts-expect-error date cannot override the native type
const conflictingDate = <Field inputType="date" name="date" type="text" />;
type FlexibleProps = {
  name: string;
  id: number;
  registerProps: string;
  type: "own";
};
const Flexible = (_props: FlexibleProps) => null;
const flexible = (
  <Field
    inputType="custom"
    CustomComponent={Flexible}
    name="x"
    id={1}
    registerProps="own"
    type="own"
  />
);
const flexibleMap: FieldProps<FlexibleProps> = {
  inputType: "custom",
  CustomComponent: Flexible,
  name: "x",
  id: 1,
  registerProps: "own",
  type: "own",
};

// @ts-expect-error a select requires options
const missingOptions = <Field inputType="select" name="choice" />;
const missingLength = (
  // @ts-expect-error custom component's required length is missing
  <Field inputType="custom" CustomComponent={Code} name="code" />
);
const wrongVariant = (
  <Field
    inputType="custom"
    CustomComponent={Variant}
    name="a"
    kind="text"
    // @ts-expect-error variant properties must match the discriminant
    number={2}
  />
);

type ReservedProps =
  | { name: string; kind: "safe" }
  | { name: string; kind: "reserved"; inputType: "custom" };
const Reserved = (_props: ReservedProps) => null;
const reserved = (
  <Field
    // @ts-expect-error Field consumes inputType even when only one union member requires it
    inputType="custom"
    CustomComponent={Reserved}
    name="reserved"
    kind="safe"
  />
);

void [
  fieldPropsAreAny,
  valid,
  rendered,
  email,
  emailVariant,
  conflictingEmail,
  conflictingDate,
  flexible,
  flexibleMap,
  missingOptions,
  missingLength,
  wrongVariant,
  reserved,
];
