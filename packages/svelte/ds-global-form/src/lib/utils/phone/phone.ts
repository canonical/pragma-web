import { phoneCountries } from "@canonical/ds-utils";
import type {
  PhoneCountry,
  PhoneValue,
} from "../../subcomponent/PhoneInput/types.js";

// Phone helpers shared by PhoneInput and server code: parsing, formatting and
// ordering of the national number and its country. All are pure.

/** Extracts the digits of a phone entry, dropping separators and signs. */
export function extractPhoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Resolve a valid international prefix without changing the selected member of a shared dial code. */
export function inferPhoneCountry(
  value: string,
  countries: readonly PhoneCountry[],
  current: string,
): string | undefined {
  if (!/^\+[1-9]\d+$/.test(value)) return undefined;
  const candidates = countries.filter(
    (country) =>
      value.startsWith(country.dialCode) &&
      value.length > country.dialCode.length,
  );
  if (!candidates.length) return undefined;
  const longest = Math.max(
    ...candidates.map((country) => country.dialCode.length),
  );
  const matches = candidates.filter(
    (country) => country.dialCode.length === longest,
  );
  return (
    matches.find((country) => country.code === current)?.code ??
    matches[0]?.code
  );
}

/** Groups the digits of a number with a display mask, where `#` is a digit. */
export function formatPhone(value: string, pattern?: string): string {
  const digits = extractPhoneDigits(value);
  if (!pattern) return digits;
  let result = "";
  let index = 0;
  for (const char of pattern) {
    if (index >= digits.length) break;
    if (char === "#") {
      result += digits.slice(index, index + 1);
      index += 1;
    } else result += char;
  }
  return result + digits.slice(index);
}

/**
 * Decodes the two controls a phone field named `name` posts without
 * JavaScript: the national number as `<name>` and the country code as
 * `<name>-country`.
 */
export function decodePhone(
  data: FormData,
  name: string,
  countries: readonly PhoneCountry[] = phoneCountries,
): { structured: PhoneValue; e164: string } {
  const countryEntries = data.getAll(`${name}-country`);
  const numberEntries = data.getAll(name);
  const countryCode = countryEntries.at(0);
  const numberText = numberEntries.at(0);
  if (
    countryEntries.length !== 1 ||
    numberEntries.length !== 1 ||
    typeof countryCode !== "string" ||
    typeof numberText !== "string"
  )
    throw new Error("Phone requires one country and one number");
  const matches = countries.filter((item) => item.code === countryCode);
  if (matches.length > 1) throw new Error("Phone country is ambiguous");
  const country = matches.at(0);
  if (!country || !/^\+[1-9]\d*$/.test(country.dialCode))
    throw new Error("Unknown phone country");
  if (!/^[0-9+().\-\s]*$/.test(numberText))
    throw new Error("Invalid phone characters");
  const raw = numberText.trim();
  if (raw.includes("+") && !/^\+[0-9().\-\s]*$/.test(raw))
    throw new Error("Invalid phone characters");
  const international = raw.startsWith("+")
    ? `+${extractPhoneDigits(raw)}`
    : undefined;
  if (international && !international.startsWith(country.dialCode))
    throw new Error("International phone prefix does not match country");
  if (international === country.dialCode)
    throw new Error("International phone requires a national number");
  const number = international
    ? international.slice(country.dialCode.length)
    : extractPhoneDigits(raw);
  return {
    structured: { countryCode: country.code, number },
    e164: number ? `${country.dialCode}${number}` : "",
  };
}

/**
 * Orders countries for the selector: `filtered` (when given) restricts the list
 * to those codes in the given order, otherwise every country is listed by dial
 * code then name; `preferred` codes are then hoisted to the top in their order.
 */
export function sortPhoneCountries(
  countries: readonly PhoneCountry[],
  filtered: readonly string[] | undefined,
  preferred: readonly string[],
): PhoneCountry[] {
  const universe = filtered
    ? filtered.flatMap((code) =>
        countries.filter((country) => country.code === code),
      )
    : [...countries].sort(
        (a, b) =>
          Number(extractPhoneDigits(a.dialCode)) -
            Number(extractPhoneDigits(b.dialCode)) ||
          a.name.localeCompare(b.name),
      );
  return [
    ...universe
      .filter((country) => preferred.includes(country.code))
      .sort((a, b) => preferred.indexOf(a.code) - preferred.indexOf(b.code)),
    ...universe.filter((country) => !preferred.includes(country.code)),
  ];
}

/**
 * Labels a country in the selector after its dial code: its ISO code, its
 * name, or its emoji flag. A code that is not ISO 3166-1 alpha-2 has no flag
 * and is shown as is.
 */
export function formatPhoneCountryLabel(
  country: PhoneCountry,
  display: "code" | "name" | "flag",
): string {
  const code = country.code.toUpperCase();
  const label =
    display === "name"
      ? country.name
      : display === "flag" && /^[A-Z]{2}$/.test(code)
        ? code.replace(/[A-Z]/g, (char) =>
            String.fromCodePoint(127397 + char.charCodeAt(0)),
          )
        : country.code;
  return `${country.dialCode} ${label}`;
}

/** Reads the national digits a phone value holds for the given country. */
export function readNationalDigits(
  value: string | PhoneValue | undefined,
  country: PhoneCountry,
): string {
  if (typeof value === "object") return extractPhoneDigits(value.number);
  const text = value ?? "";
  return extractPhoneDigits(
    text.startsWith(country.dialCode)
      ? text.slice(country.dialCode.length)
      : text,
  );
}
