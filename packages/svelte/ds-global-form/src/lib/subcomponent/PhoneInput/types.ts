import type { PhoneCountry } from "@canonical/ds-utils";
import type { HTMLInputAttributes } from "svelte/elements";

export type { PhoneCountry } from "@canonical/ds-utils";

/** A phone number split into its country and national digits. */
export type PhoneValue = { countryCode: string; number: string };

/**
 * Props for the presentational Phone input. Native attributes, handlers and
 * attachments are spread onto the national-number input.
 */
export type PhoneInputProps = Omit<
  HTMLInputAttributes,
  "type" | "value" | "name"
> & {
  /**
   * Name of the national-number input. The country selector is named
   * `<name>-country`, so a form posted without JavaScript can be decoded with
   * `decodePhone`.
   */
  name?: string;
  /**
   * The value: an E.164 string, or a structured `{ countryCode, number }` when
   * `valueFormat` is "structured". Bindable.
   */
  value?: string | PhoneValue;
  /** Default country (ISO 3166-1 alpha-2). Default: "US". */
  defaultCountry?: string;
  /** Restrict the selector to these countries, in this order. */
  filteredCountries?: readonly string[];
  /** Hoist these countries to the top of the selector, in this order. */
  preferredCountries?: readonly string[];
  /** Country dataset. Defaults to `phoneCountries` from `@canonical/ds-utils`. */
  countries?: readonly PhoneCountry[];
  /** Value format: an E.164 string or a structured object. Default: "e164". */
  valueFormat?: "e164" | "structured";
  /** How a country is labelled after its dial code. Default: "code". */
  countryDisplay?: "code" | "name" | "flag";
  /** Group the national number with the country's display mask. */
  mask?: boolean;
  /** Whether the input is disabled. */
  disabled?: boolean;
  /** Accessible name of the country selector. Default: "Country code". */
  countryLabel?: string;
  /**
   * Accessible name of the national-number input, used only without
   * `aria-labelledby`. Default: "Phone number".
   */
  numberLabel?: string;
  /** Title describing the characters the number accepts. */
  patternTitle?: string;
};
