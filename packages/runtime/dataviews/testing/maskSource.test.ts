import { describe, expect, it } from "vitest";
import maskSource from "./maskSource.js";

describe("maskSource", () => {
  it("blanks a line comment up to its newline or the end", () => {
    expect(maskSource("a // b\nc // d")).toBe("a     \nc     ");
  });

  it("blanks a block comment, keeping its newlines, closed or not", () => {
    expect(maskSource("a /* b\nc */ d /* e")).toBe("a     \n     d     ");
  });

  it("blanks string contents and keeps the quotes", () => {
    expect(maskSource(`a = "b\\"c"; d = 'e';`)).toBe(`a = "    "; d = ' ';`);
  });

  it("stops an unterminated string at its newline", () => {
    expect(maskSource('a = "b\nc')).toBe('a = " \nc');
  });

  it("blanks template text and keeps substitutions as code", () => {
    const open = "$" + "{";
    expect(maskSource(`t = \`a\\\`${open} {b: 1} }c\`;`)).toBe(
      `t = \`   ${open} {b: 1} } \`;`,
    );
  });

  it("blanks an unterminated template to the end", () => {
    expect(maskSource("t = `abc")).toBe("t = `   ");
  });

  it("blanks a regular expression after an operator", () => {
    expect(maskSource("r = /a[/]\\//g;")).toBe("r = /      /g;");
  });

  it("blanks a regular expression after a keyword", () => {
    expect(maskSource("return /x/;")).toBe("return / /;");
  });

  it("stops an unterminated regular expression at its newline", () => {
    expect(maskSource("(/ab\nc")).toBe("(/  \nc");
  });

  it("reads a slash after a word as a division", () => {
    expect(maskSource("a / b / c")).toBe("a / b / c");
  });

  it("reads a slash after a closing parenthesis as a division", () => {
    expect(maskSource("f(x) / 2 / 'q'")).toBe("f(x) / 2 / ' '");
  });
});
