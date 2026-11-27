import { describe, expect, it } from "vitest";
import {
  decodePhone,
  extractPhoneDigits,
  formatPhone,
  formatPhoneCountryLabel,
  inferPhoneCountry,
  readNationalDigits,
  sortPhoneCountries,
} from "./phone.js";

const us = { code: "US", name: "United States", dialCode: "+1" };
const ca = { code: "CA", name: "Canada", dialCode: "+1" };
const gb = {
  code: "GB",
  name: "United Kingdom",
  dialCode: "+44",
  format: "#### ######",
};
const ag = { code: "AG", name: "Antigua", dialCode: "+1268" };
const name = "phone";

describe("extractPhoneDigits", () => {
  it("drops every non-digit", () => {
    expect(extractPhoneDigits("+44 (0) 7700-900")).toBe("4407700900");
  });
});

describe("formatPhone", () => {
  it("formats partial, unmasked and overflowing numbers", () => {
    expect(formatPhone("+1 (23)")).toBe("123");
    expect(formatPhone("12", "(###) ###-####")).toBe("(12");
    expect(formatPhone("", "###")).toBe("");
    expect(formatPhone("1234", "##-#")).toBe("12-34");
  });
});

describe("inferPhoneCountry", () => {
  it("picks the longest matching dial code, preferring the current country", () => {
    expect(inferPhoneCountry("+12685551234", [us, ag], "US")).toBe("AG");
    expect(inferPhoneCountry("+15551234", [us, ca], "CA")).toBe("CA");
    expect(inferPhoneCountry("+15551234", [us, ca], "GB")).toBe("US");
  });

  it("returns nothing for a value without a matching international prefix", () => {
    expect(inferPhoneCountry("5551234", [us], "US")).toBeUndefined();
    expect(inferPhoneCountry("+1", [us], "US")).toBeUndefined();
    expect(inferPhoneCountry("+995", [us], "US")).toBeUndefined();
  });
});

describe("sortPhoneCountries", () => {
  it("sorts by dial code then name, hoisting preferred countries", () => {
    expect(
      sortPhoneCountries([gb, us, ca], undefined, []).map((c) => c.code),
    ).toEqual(["CA", "US", "GB"]);
    expect(
      sortPhoneCountries([gb, us, ca], undefined, ["GB"]).map((c) => c.code),
    ).toEqual(["GB", "CA", "US"]);
  });

  it("keeps the filtered countries in the given order", () => {
    expect(
      sortPhoneCountries([gb, us, ca], ["US", "XX", "GB"], ["GB", "US"]).map(
        (c) => c.code,
      ),
    ).toEqual(["GB", "US"]);
  });
});

describe("formatPhoneCountryLabel", () => {
  it("labels by code, name or flag", () => {
    expect(formatPhoneCountryLabel(gb, "code")).toBe("+44 GB");
    expect(formatPhoneCountryLabel(gb, "name")).toBe("+44 United Kingdom");
    expect(formatPhoneCountryLabel(gb, "flag")).toBe("+44 🇬🇧");
    expect(formatPhoneCountryLabel({ ...gb, code: "GBR" }, "flag")).toBe(
      "+44 GBR",
    );
  });
});

describe("readNationalDigits", () => {
  it("reads structured, international, national and missing values", () => {
    expect(readNationalDigits({ countryCode: "GB", number: "77 00" }, gb)).toBe(
      "7700",
    );
    expect(readNationalDigits("+447700", gb)).toBe("7700");
    expect(readNationalDigits("07700", gb)).toBe("07700");
    expect(readNationalDigits(undefined, gb)).toBe("");
  });
});

describe("decodePhone", () => {
  it("decodes the country and national number of a posted form", () => {
    const data = new FormData();
    data.set("phone-country", "US");
    data.set("phone", "(555) 123-4567");
    expect(decodePhone(data, name, [us])).toEqual({
      structured: { countryCode: "US", number: "5551234567" },
      e164: "+15551234567",
    });
    data.set("phone", "");
    expect(decodePhone(data, name, [us])).toEqual({
      structured: { countryCode: "US", number: "" },
      e164: "",
    });
  });

  it("reads the bundled country dataset by default", () => {
    const data = new FormData();
    data.set("phone-country", "FR");
    data.set("phone", "612345678");
    expect(decodePhone(data, name).e164).toBe("+33612345678");
  });

  it("accepts an international number matching the country", () => {
    const data = new FormData();
    data.set("phone-country", "GB");
    data.set("phone", "+44 7700 900");
    expect(decodePhone(data, name, [gb]).e164).toBe("+447700900");
  });

  it("does not strip a national number beginning with the dial digits", () => {
    const data = new FormData();
    data.set("phone-country", "US");
    data.set("phone", "1555123");
    expect(decodePhone(data, name, [us]).e164).toBe("+11555123");
  });

  it("rejects invalid configurations and entries", () => {
    const data = new FormData();
    data.set("phone-country", "US");
    data.set("phone", "123");
    expect(() => decodePhone(data, name, [us, us])).toThrow("ambiguous");
    expect(() => decodePhone(data, name, [])).toThrow("Unknown phone country");
    expect(() => decodePhone(data, name, [{ ...us, dialCode: "01" }])).toThrow(
      "Unknown phone country",
    );
    for (const invalid of ["123 ext 4", "123+45", "+123+45"]) {
      data.set("phone", invalid);
      expect(() => decodePhone(data, name, [us])).toThrow(
        "Invalid phone characters",
      );
    }
    data.set("phone", "+44 123");
    expect(() => decodePhone(data, name, [us])).toThrow(
      "does not match country",
    );
    data.set("phone", "+1");
    expect(() => decodePhone(data, name, [us])).toThrow(
      "requires a national number",
    );
    data.append("phone", "456");
    expect(() => decodePhone(data, name, [us])).toThrow(
      "one country and one number",
    );
    data.set("phone", new File(["123"], "number.txt"));
    expect(() => decodePhone(data, name, [us])).toThrow(
      "one country and one number",
    );
    data.set("phone", "123");
    data.set("phone-country", new File(["US"], "country.txt"));
    expect(() => decodePhone(data, name, [us])).toThrow(
      "one country and one number",
    );
  });
});
