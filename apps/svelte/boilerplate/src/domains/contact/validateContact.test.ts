import { describe, expect, it } from "vitest";
import { readContact, validateContact } from "./validateContact.js";

const formData = (entries: Record<string, string>) => {
  const data = new FormData();
  for (const [name, value] of Object.entries(entries)) data.set(name, value);
  return data;
};

describe("validateContact", () => {
  it("requires the email", () => {
    expect(validateContact(readContact(formData({ email: " " })))).toEqual({
      email: "contact.emailRequired",
    });
  });

  it("accepts a form with an email", () => {
    expect(
      validateContact(readContact(formData({ email: "ada@example.com" }))),
    ).toEqual({});
  });

  it("reads every field, empty when absent", () => {
    expect(readContact(formData({ name: "Ada" }))).toEqual({
      name: "Ada",
      email: "",
      subject: "",
      message: "",
    });
  });
});
