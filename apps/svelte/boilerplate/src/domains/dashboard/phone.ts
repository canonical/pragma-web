import { decodePhone } from "@canonical/svelte-ds-global-form";

/** The countries the phone example offers. */
export const phoneCountryCodes: readonly string[] = ["US", "GB"];

/** Decodes the phone example's `number` and `number-country` entries to E.164, or `undefined` when invalid. */
export function readPhone(data: FormData): string | undefined {
  const raw = data.get("number");
  if (typeof raw !== "string" || raw.length > 40) return undefined;
  try {
    const { structured, e164 } = decodePhone(data, "number");
    return phoneCountryCodes.includes(structured.countryCode) ? e164 || undefined : undefined;
  } catch { return undefined; }
}

/** Decodes the phone example from a query string, as the static build receives it. */
export function phoneFromQuery(query: URLSearchParams): string | undefined {
  const data = new FormData();
  for (const [name, value] of query) if (name === "number-country" || name === "number") data.append(name, value);
  return readPhone(data);
}
