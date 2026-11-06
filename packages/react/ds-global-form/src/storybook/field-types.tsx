import { Field, type FieldProps, type InputProps } from "../index.js";

type IsAny<T> = 0 extends 1 & T ? true : false;
const isAny: IsAny<FieldProps> = false;
void isAny;

// @ts-expect-error An unknown discriminator must be rejected.
const invalid: FieldProps = { inputType: "invalid", name: "field" };
void invalid;

type CustomProps = InputProps<{ label: string; precision: number }>;
const Custom = ({ name, label, precision }: CustomProps) => (
  <input name={name} aria-label={label} maxLength={precision} />
);

const custom = (
  <Field
    inputType="custom"
    CustomComponent={Custom}
    name="x"
    label="X"
    precision={2}
  />
);
const customMap = [
  { inputType: "text", name: "title", label: "Title" },
  {
    inputType: "custom",
    CustomComponent: Custom,
    name: "x",
    label: "X",
    precision: 2,
  },
] satisfies FieldProps<CustomProps>[];
const renderedMap = customMap.map((item) => (
  <Field key={item.name} {...item} />
));
type OtherProps = InputProps<{ prefix: string }>;
const Other = ({ name, prefix }: OtherProps) => (
  <input name={name} placeholder={prefix} />
);
const mixedMap = [
  {
    inputType: "custom",
    CustomComponent: Custom,
    name: "x",
    label: "X",
    precision: 2,
  },
  { inputType: "custom", CustomComponent: Other, name: "y", prefix: "Y" },
] satisfies (FieldProps<CustomProps> | FieldProps<OtherProps>)[];
const unnarrowedMap = mixedMap.map((item) => (
  // @ts-expect-error custom variants must be narrowed before rendering
  <Field key={item.name} {...item} />
));

function checkNarrowing(field: FieldProps) {
  if (field.inputType === "select") {
    return field.options.map((option) => option.value);
  }
  return [];
}
const select = (
  <Field inputType="select" name="choice" label="Choice" options={[]} />
);
const text = (
  <Field
    inputType="text"
    name="title"
    label="Title"
    description="Help"
    isOptional
  />
);
const nativeProps = (
  <Field
    inputType="email"
    name="mail"
    placeholder="Email"
    autoComplete="email"
  />
);
const emailVariant: Extract<FieldProps, { inputType: "email" }> = {
  inputType: "email",
  name: "email",
};
const nativeVariants: Extract<
  FieldProps,
  { inputType: "text" | "email" | "tel" | "url" }
>[] = [
  { inputType: "text", name: "text" },
  { inputType: "email", name: "email" },
  { inputType: "tel", name: "tel" },
  { inputType: "url", name: "url" },
];
// @ts-expect-error inputType controls the native type
const conflictingEmail = <Field inputType="email" name="mail" type="number" />;
// @ts-expect-error date fields do not accept a native type override
const conflictingDate = <Field inputType="date" name="date" type="text" />;
const conflictingToggle = (
  // @ts-expect-error toggle unions also disallow native type overrides
  <Field inputType="checkbox" name="check" label="Check" type="text" />
);
const conflictingMap: FieldProps = {
  inputType: "email",
  name: "mail",
  // @ts-expect-error structurally supplied type is disallowed too
  type: "number",
};
type FlexibleProps = {
  name: string;
  id: number;
  registerProps: string;
  type: "special";
};
const Flexible = (_props: FlexibleProps) => null;
const flexible = (
  <Field
    inputType="custom"
    CustomComponent={Flexible}
    name="x"
    id={1}
    registerProps="rules"
    type="special"
  />
);
const flexibleMap: FieldProps<FlexibleProps> = {
  inputType: "custom",
  CustomComponent: Flexible,
  name: "x",
  id: 1,
  registerProps: "rules",
  type: "special",
};
const checkbox = (
  <Field inputType="checkbox" name="enabled" controlLabel="Enabled" />
);
const conditionalCheckbox = (
  <Field
    inputType="checkbox"
    name="enabled"
    label="Enabled"
    condition={[["title"], ([title]) => Boolean(title)]}
    middleware={[]}
  />
);
const missingCustom = (
  // @ts-expect-error custom component's required precision is missing
  <Field inputType="custom" CustomComponent={Custom} name="x" label="X" />
);
const wrongCustom = (
  <Field
    inputType="custom"
    CustomComponent={Custom}
    name="x"
    label="X"
    // @ts-expect-error custom component's precision must be numeric
    precision="two"
  />
);
// @ts-expect-error select requires options
const missingOptions = <Field inputType="select" name="x" />;
// @ts-expect-error toggle requires a label
const missingLabel = <Field inputType="checkbox" name="x" />;
// @ts-expect-error a text field does not accept select options
const wrongProps = <Field inputType="text" name="x" options={[]} />;
// @ts-expect-error custom fields require a component
const missingComponent = <Field inputType="custom" name="x" />;
// @ts-expect-error custom maps must include the component's required props
const invalidCustomMap: FieldProps<CustomProps> = {
  inputType: "custom",
  CustomComponent: Custom,
  name: "x",
  label: "X",
};
const Reserved = (_props: { name: string; inputType: "custom" }) => null;
const reserved = (
  // @ts-expect-error inputType is consumed by Field, not forwarded
  <Field inputType="custom" CustomComponent={Reserved} name="x" />
);
type UnionReservedProps =
  | { name: string; variant: "safe" }
  | { name: string; variant: "reserved"; inputType: "custom" };
const UnionReserved = (_props: UnionReservedProps) => null;
const unionReserved = (
  <Field
    // @ts-expect-error a reserved key in any union member makes the component unsafe
    inputType="custom"
    CustomComponent={UnionReserved}
    name="x"
    variant="safe"
  />
);
const ComponentReserved = (_props: { name: string; CustomComponent: string }) =>
  null;
const componentReserved = (
  <Field
    // @ts-expect-error CustomComponent is consumed by Field
    inputType="custom"
    CustomComponent={ComponentReserved}
    name="x"
  />
);
const KeyRequired = (_props: { name: string; key: string }) => null;
const keyRequired = (
  <Field
    // @ts-expect-error React consumes key instead of passing it to the component
    inputType="custom"
    CustomComponent={KeyRequired}
    name="x"
    key="identity"
  />
);
type VariantProps =
  | { name: string; kind: "a"; a: string }
  | { name: string; kind: "b"; b: number };
const Variant = (_props: VariantProps) => null;
const variantA = (
  <Field
    inputType="custom"
    CustomComponent={Variant}
    name="x"
    kind="a"
    a="ok"
  />
);
const variantB = (
  <Field inputType="custom" CustomComponent={Variant} name="x" kind="b" b={2} />
);
const variantMissing = (
  // @ts-expect-error a requires its own prop
  <Field inputType="custom" CustomComponent={Variant} name="x" kind="a" />
);
const variantWrong = (
  // @ts-expect-error a cannot use b's prop
  <Field inputType="custom" CustomComponent={Variant} name="x" kind="a" b={2} />
);
const variantMap: FieldProps<VariantProps>[] = [
  {
    inputType: "custom",
    CustomComponent: Variant,
    name: "x",
    kind: "a",
    a: "ok",
  },
  { inputType: "custom", CustomComponent: Variant, name: "y", kind: "b", b: 2 },
];
const VariantAOnly = (_props: Extract<VariantProps, { kind: "a" }>) => null;
const wrongVariantComponent: FieldProps<VariantProps> = {
  inputType: "custom",
  // @ts-expect-error a component for one branch cannot accept the entire props union
  CustomComponent: VariantAOnly,
  name: "x",
  kind: "a",
  a: "ok",
};
const variantRendered = variantMap.map((item) => (
  <Field key={item.name} {...item} />
));
void [
  custom,
  customMap,
  renderedMap,
  mixedMap,
  unnarrowedMap,
  checkNarrowing,
  select,
  text,
  nativeProps,
  emailVariant,
  nativeVariants,
  conflictingEmail,
  conflictingDate,
  conflictingToggle,
  conflictingMap,
  flexible,
  flexibleMap,
  checkbox,
  conditionalCheckbox,
  missingCustom,
  wrongCustom,
  missingOptions,
  missingLabel,
  wrongProps,
  missingComponent,
  invalidCustomMap,
  reserved,
  unionReserved,
  componentReserved,
  keyRequired,
  variantA,
  variantB,
  variantMissing,
  variantWrong,
  variantMap,
  wrongVariantComponent,
  variantRendered,
];
