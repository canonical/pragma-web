<script lang="ts">
  import { phoneCountries } from "@canonical/ds-utils";
  import { untrack } from "svelte";
  import {
    extractPhoneDigits,
    formatPhone,
    formatPhoneCountryLabel,
    inferPhoneCountry,
    readNationalDigits,
    sortPhoneCountries,
  } from "../../utils/phone/index.js";
  import readEditedSelection from "../../utils/readEditedSelection.js";
  import type { PhoneCountry, PhoneInputProps, PhoneValue } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds input phone chrome";

  // Digits plus every separator the bundled masks use. Parens are escaped
  // because `pattern` is compiled with the `v` flag, where they are reserved
  // inside a character class.
  const ALLOWED_NUMBER_CHARACTERS = "[0-9+\\(\\)\\-\\.\\s]*";

  let {
    id,
    class: className,
    style,
    name,
    value = $bindable(),
    defaultCountry = "US",
    filteredCountries,
    preferredCountries = [],
    countries = phoneCountries,
    valueFormat = "e164",
    countryDisplay = "code",
    mask = false,
    disabled = false,
    countryLabel = "Country code",
    numberLabel = "Phone number",
    patternTitle = "Digits, and the spacing characters used by the number's format.",
    "aria-labelledby": ariaLabelledBy,
    ...rest
  }: PhoneInputProps = $props();

  let selectedCountry = $state(untrack(() => defaultCountry));
  let composing = false;

  const sortedCountries = $derived(
    sortPhoneCountries(countries, filteredCountries, preferredCountries),
  );
  // The value decides the country when it names one; otherwise the country the
  // user last selected (or the default) applies.
  const countryCode = $derived(
    typeof value === "object"
      ? value.countryCode
      : (inferPhoneCountry(value ?? "", countries, selectedCountry) ??
          selectedCountry),
  );
  const country = $derived.by(() => {
    const found =
      countries.find((item) => item.code === countryCode) ?? countries.at(0);
    if (!found)
      throw new Error("PhoneInput requires a non-empty `countries` list.");
    return found;
  });
  const digits = $derived(readNationalDigits(value, country));
  const display = $derived(
    formatPhone(digits, mask ? country.format : undefined),
  );

  /** Writes the value for a country and national number, if it changed. */
  function emit(target: PhoneCountry, number: string) {
    const next: string | PhoneValue =
      valueFormat === "structured"
        ? { countryCode: target.code, number }
        : number
          ? `${target.dialCode}${number}`
          : "";
    const same =
      typeof next === "string"
        ? next === (value ?? "")
        : typeof value === "object" &&
          value.countryCode === next.countryCode &&
          value.number === next.number;
    if (!same) value = next;
  }

  /** Finds a country offered by the selector; its options come from `countries`. */
  const findCountry = (code: string) =>
    countries.find((item) => item.code === code) as PhoneCountry;

  function selectCountry(event: Event & { currentTarget: HTMLSelectElement }) {
    selectedCountry = event.currentTarget.value;
    emit(findCountry(selectedCountry), digits);
  }

  /**
   * Reformats the number as it is typed and keeps the caret after the same
   * digit. A deletion that only removed a separator removes the digit before
   * (or after) it instead, so the edit is not undone by the reformat.
   */
  function editNumber(event: Event & { currentTarget: HTMLInputElement }) {
    const inputElement = event.currentTarget;
    if (composing) return;
    let offset = extractPhoneDigits(
      inputElement.value.slice(0, Number(inputElement.selectionStart)),
    ).length;
    let number = extractPhoneDigits(inputElement.value);
    if (
      event instanceof InputEvent &&
      event.inputType.startsWith("delete") &&
      number === digits &&
      inputElement.value.length === display.length - 1
    ) {
      const forward = event.inputType.includes("Forward");
      const index = forward ? offset : offset - 1;
      if (index >= 0 && index < number.length) {
        number = number.slice(0, index) + number.slice(index + 1);
        if (!forward) offset -= 1;
      }
    }
    const formatted = formatPhone(number, mask ? country.format : undefined);
    inputElement.value = formatted;
    let position = 0;
    while (
      position < formatted.length &&
      extractPhoneDigits(formatted.slice(0, position)).length < offset
    )
      position++;
    if (inputElement.ownerDocument.activeElement === inputElement)
      inputElement.setSelectionRange(position, position);
    emit(country, number);
  }

  function endComposition(
    event: CompositionEvent & { currentTarget: HTMLInputElement },
  ) {
    composing = false;
    editNumber(event);
  }

  // Keeps a country or number entered before hydration: a pre-effect runs
  // once, in the browser, before the controls' values are written to the
  // server-rendered markup. The markup is found through the number input's
  // `id`, which the field always provides.
  $effect.pre(() => {
    const rootElement = untrack(() =>
      id ? document.getElementById(id)?.parentElement : null,
    );
    if (rootElement) untrack(() => adoptEditedPhone(rootElement));
  });

  function adoptEditedPhone(rootElement: HTMLElement) {
    const selectElement = rootElement.querySelector(
      "select",
    ) as HTMLSelectElement;
    const inputElement = rootElement.querySelector("input") as HTMLInputElement;
    const editedCountry = readEditedSelection(selectElement)?.at(0);
    const numberEdited = inputElement.value !== inputElement.defaultValue;
    if (!editedCountry && !numberEdited) return;
    untrack(() => {
      if (editedCountry) selectedCountry = editedCountry;
      emit(
        findCountry(editedCountry ?? country.code),
        numberEdited ? extractPhoneDigits(inputElement.value) : digits,
      );
    });
  }
</script>

<!-- The selector's attributes are spread so its value is written as given. --><div {style} class={[componentCssClassName, className]}><select
    {...{
      class: "country-select p",
      name: name ? `${name}-country` : undefined,
      value: country.code,
      disabled,
      autocomplete: "tel-country-code",
      "aria-label": countryLabel,
    }}
    onchange={selectCountry}
  >{#each sortedCountries as item (item.code)}<option {...{ value: item.code }}>{formatPhoneCountryLabel(item, countryDisplay)}</option>{/each}</select><input
    {id}
    type="tel"
    class="number-input p"
    {name}
    inputmode="tel"
    autocomplete="tel-national"
    pattern={ALLOWED_NUMBER_CHARACTERS}
    title={patternTitle}
    value={display}
    oninput={editNumber}
    oncompositionstart={() => (composing = true)}
    oncompositionend={endComposition}
    {disabled}
    aria-label={ariaLabelledBy ? undefined : numberLabel}
    aria-labelledby={ariaLabelledBy}
    {...rest}
  /></div>

<!-- @component
Presentational phone input combining a country selector with a national-number
field. Bind `value` for two-way binding: an E.164 string, or a structured
`{ countryCode, number }` with `valueFormat="structured"`. The submitted number
is always raw digits; `mask` only groups the display.

The `id` and the field's ARIA wiring go on the number input, so the field label
names it; the country `<select>` keeps its own "Country code" label. Without
`aria-labelledby` the number input falls back to `numberLabel`. With a `name`,
both controls post without JavaScript: the number as `<name>` and the country
code as `<name>-country`, which `decodePhone` reads.

`import { PhoneInput } from "@canonical/svelte-ds-global-form";`

@implements ds:global.subcomponent.phone_input
-->
