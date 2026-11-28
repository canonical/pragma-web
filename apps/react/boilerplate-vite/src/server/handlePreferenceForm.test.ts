import { describe, expect, it } from "vitest";
import handlePreferenceForm from "./handlePreferenceForm.js";

const origin = "http://localhost:5174";

function post(pathname: string, body: string, referer?: string) {
  return handlePreferenceForm({
    pathname,
    form: new URLSearchParams(body),
    referer,
    origin,
  });
}

describe("handlePreferenceForm", () => {
  it("stores a pinned theme and returns to the referer", () => {
    expect(post("/preferences", "theme=dark", `${origin}/catalog`)).toEqual({
      status: 303,
      location: `${origin}/catalog`,
      setCookie: "theme=dark; Path=/; Max-Age=31536000; SameSite=Lax",
    });
  });

  it("clears the theme cookie for system", () => {
    expect(post("/preferences", "theme=system")?.setCookie).toBe(
      "theme=; Path=/; Max-Age=0; SameSite=Lax",
    );
  });

  it("stores a configured locale, and ignores any other", () => {
    expect(post("/language", "locale=ar")?.setCookie).toBe(
      "locale=ar; Path=/; Max-Age=31536000; SameSite=Lax",
    );
    expect(post("/language", "locale=pt")).toEqual({
      status: 303,
      location: "/",
    });
  });

  it("marks the cookies Secure over HTTPS", () => {
    expect(
      handlePreferenceForm({
        pathname: "/preferences",
        form: new URLSearchParams("theme=light"),
        referer: null,
        origin: "https://example.com",
      })?.setCookie,
    ).toMatch(/; Secure$/);
  });

  it("returns only to this origin", () => {
    expect(
      post("/language", "locale=fr", "https://evil.example/")?.location,
    ).toBe("/");
    expect(post("/language", "locale=fr", "not a url")?.location).toBe("/");
  });

  it("answers no other path", () => {
    expect(post("/contact", "theme=dark")).toBeNull();
  });
});
