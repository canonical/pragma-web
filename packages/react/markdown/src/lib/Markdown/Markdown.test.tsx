import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  admonitionDocument,
  duplicateHeadingsDocument,
  footnoteDocument,
  gfmDocument,
  hardBreakAdmonitionDocument,
  hostileDocument,
  schemeLinksDocument,
} from "../../../testing/fixtures.js";
import type { MarkdownElementProps } from "../types.js";
import Markdown from "./Markdown.js";

/** A link override that shows which href it was handed. */
function ProbeLink({
  node: _node,
  href,
  children,
}: MarkdownElementProps<"a">): ReactElement {
  return (
    <span data-probe-href={href} className="probe">
      {children}
    </span>
  );
}

describe("Markdown", () => {
  describe("GitHub-flavoured Markdown", () => {
    it("renders tables, task lists and strikethrough", () => {
      const { container } = render(<Markdown source={gfmDocument} />);

      expect(container.querySelectorAll("table td")).toHaveLength(2);
      expect(container.querySelectorAll("input[type='checkbox']")).toHaveLength(
        2,
      );
      expect(container.querySelector("del")?.textContent).toBe("Struck");
    });
  });

  describe("default components", () => {
    it("renders code, code blocks and tables as design-system elements", () => {
      const { container } = render(<Markdown source={gfmDocument} />);

      expect(container.querySelector("table.ds.markdown-table")).not.toBeNull();
      expect(
        container.querySelector(
          "pre.ds.markdown-code-block > code.language-js",
        ),
      ).not.toBeNull();
      expect(
        container.querySelector("p > code.ds.inline-code")?.textContent,
      ).toBe("inline");
    });

    it("renders admonitions as announcements and plain quotes as blockquotes", () => {
      const { container } = render(<Markdown source={admonitionDocument} />);

      const headings = Array.from(
        container.querySelectorAll(".ds.announcement .heading"),
        (heading) => heading.textContent,
      );
      expect(headings).toEqual([
        "Note",
        "Tip",
        "Important",
        "Warning",
        "Caution",
      ]);
      expect(container.querySelector("blockquote")?.textContent?.trim()).toBe(
        "Just a quote.",
      );
    });

    it("opens an admonition's content with its body when the marker line ends in a hard break", () => {
      const { container } = render(
        <Markdown source={hardBreakAdmonitionDocument} />,
      );

      const content = container.querySelector(".ds.announcement .content");
      expect(content?.textContent?.trim()).toBe("A note.");
      expect(content?.querySelector("br")).toBeNull();
    });
  });

  describe("heading ids", () => {
    it("prefixes ids with user-content- and suffixes duplicates", () => {
      const { container } = render(
        <Markdown source={duplicateHeadingsDocument} />,
      );

      expect(container.querySelector("h1")?.id).toBe(
        "user-content-hello-world",
      );
      expect(container.querySelector("h2")?.id).toBe(
        "user-content-hello-world-1",
      );
    });

    it("renders the same ids on the server", () => {
      const html = renderToString(
        <Markdown source={duplicateHeadingsDocument} />,
      );

      expect(html).toContain('<h1 id="user-content-hello-world">');
      expect(html).toContain('<h2 id="user-content-hello-world-1">');
    });
  });

  describe("footnotes", () => {
    /** Render the footnote document and return its root element. */
    function renderFootnotes(sanitize: boolean): HTMLElement {
      return render(<Markdown source={footnoteDocument} sanitize={sanitize} />)
        .container;
    }

    it.each([true, false])(
      "links every reference and backreference to an existing id (sanitize: %s)",
      (sanitize) => {
        const container = renderFootnotes(sanitize);
        const links = Array.from(
          container.querySelectorAll<HTMLAnchorElement>("a[href^='#']"),
        );
        const describedBy = Array.from(
          container.querySelectorAll("[aria-describedby]"),
          (element) => element.getAttribute("aria-describedby"),
        );

        expect(links).toHaveLength(6);
        for (const link of links) {
          const target = link.hash.slice(1);
          expect(container.querySelector(`[id="${target}"]`)).not.toBeNull();
        }
        expect(describedBy).toHaveLength(3);
        for (const id of describedBy) {
          expect(container.querySelector(`[id="${id}"]`)).not.toBeNull();
        }
      },
    );

    it("gives footnotes the same ids with and without sanitising", () => {
      const listIds = (sanitize: boolean): string[] =>
        Array.from(
          renderFootnotes(sanitize).querySelectorAll("[id]"),
          ({ id }) => id,
        );

      expect(listIds(true)).toEqual(listIds(false));
      expect(listIds(true)).toContain("user-content-fn-1");
    });
  });

  describe("components", () => {
    it("replaces the default components", () => {
      const { container } = render(
        <Markdown
          source={"[Docs](https://example.com)\n\n```\ncode\n```"}
          components={{ a: ProbeLink }}
        />,
      );

      const probe = container.querySelector(".probe");
      expect(probe?.getAttribute("data-probe-href")).toBe(
        "https://example.com",
      );
      expect(probe?.textContent).toBe("Docs");
      expect(container.querySelector("a")).toBeNull();
      expect(container.querySelector("pre")?.className).toBe("");
    });

    it("renders another tag in place of an element", () => {
      const { container } = render(
        <Markdown source="# Title" components={{ h1: "h3" }} />,
      );

      expect(container.querySelector("h1")).toBeNull();
      expect(container.querySelector("h3")?.textContent).toBe("Title");
    });
  });

  describe("sanitising", () => {
    it("removes scripts, event handlers and javascript: links by default", () => {
      const { container } = render(<Markdown source={hostileDocument} />);

      expect(container.querySelector("script")).toBeNull();
      expect(container.querySelector("img")).toBeNull();
      expect(container.innerHTML).not.toContain("onerror");
      expect(container.querySelector("a")?.hasAttribute("href")).toBe(false);
    });

    it("shows raw HTML as text when sanitising is off", () => {
      const { container } = render(
        <Markdown source={hostileDocument} sanitize={false} />,
      );

      expect(container.querySelector("script")).toBeNull();
      expect(container.querySelector("img")).toBeNull();
      expect(container.textContent).toContain("<script>alert(1)</script>");
      expect(container.querySelector("a")?.getAttribute("href")).toBe("");
    });
  });

  describe("links in other schemes", () => {
    /** Read each paragraph's link href, or its image src, in document order. */
    function listUrls(container: HTMLElement): (string | null)[] {
      return Array.from(container.querySelectorAll("p"), (paragraph) => {
        const image = paragraph.querySelector("img");
        if (image) return image.getAttribute("src");
        return paragraph.querySelector("a")?.getAttribute("href") ?? null;
      });
    }

    it.each([true, false])(
      "keeps a named scheme's href and nothing else (sanitize: %s)",
      (sanitize) => {
        const { container } = render(
          <Markdown
            source={schemeLinksDocument}
            sanitize={sanitize}
            linkSchemes={["ds"]}
          />,
        );
        const [button, logo, script, shout, docs] = listUrls(container);

        expect(button).toBe("ds:global.component.button");
        expect(docs).toBe("https://example.com");
        // Neither an image in the named scheme nor a script link is kept:
        // sanitised, the attribute is removed; unsanitised, it is emptied.
        for (const url of [logo, script, shout]) {
          expect(url === null || url === "").toBe(true);
        }
      },
    );

    it.each([true, false])(
      "drops an href in another scheme when none is named (sanitize: %s)",
      (sanitize) => {
        const { container } = render(
          <Markdown source={schemeLinksDocument} sanitize={sanitize} />,
        );
        const [button, , , , docs] = listUrls(container);

        expect(button === null || button === "").toBe(true);
        expect(docs).toBe("https://example.com");
      },
    );

    it("hands a link override the kept href", () => {
      const { container } = render(
        <Markdown
          source="[Button](ds:global.component.button)"
          components={{ a: ProbeLink }}
          linkSchemes={["ds"]}
        />,
      );

      expect(
        container.querySelector(".probe")?.getAttribute("data-probe-href"),
      ).toBe("ds:global.component.button");
    });

    it("renders the same href on the server", () => {
      const html = renderToString(
        <Markdown
          source="[Button](ds:global.component.button)"
          linkSchemes={["ds"]}
        />,
      );

      expect(html).toContain('<a href="ds:global.component.button">');
    });

    it("refuses to keep links in the javascript scheme", () => {
      expect(() =>
        render(
          <Markdown
            source={schemeLinksDocument}
            linkSchemes={["javascript"]}
          />,
        ),
      ).toThrow('links in the "javascript" scheme are never kept');
    });
  });

  describe("props", () => {
    it("refuses unified plugins", () => {
      function renderWithPlugins(): ReactElement {
        // @ts-expect-error -- plugins are fixed so rendering stays synchronous
        return <Markdown source="" remarkPlugins={[]} />;
      }

      expect(renderWithPlugins).toBeTypeOf("function");
    });
  });
});
