# @canonical/react-markdown

Renders Markdown and MDX through design-system elements. A document is parsed as
GitHub-flavoured Markdown, with GitHub-style admonitions, and each HTML
element it produces is rendered by the component the components map names for
its tag: inline code as `InlineCode`, admonitions as `Announcement`, fenced
code and tables with the design system's styles.

Rendering is synchronous, so a server render and a client render produce the
same markup. The package knows nothing about routing: a router-aware link is
the consumer's `a` entry in the components map.

## Installation

```bash
bun add @canonical/react-markdown
```

Requires React 19. The default components import their own CSS, as every
design-system component does, so the package is consumed through a bundler
(Vite, for instance). For server rendering, bundle `@canonical/*` packages
rather than leaving them external, so the CSS imports are handled.

## Quick start

```tsx
import { Markdown } from "@canonical/react-markdown";

export default function ReleaseNotes({ notes }: { notes: string }) {
  return (
    <article>
      <Markdown source={notes} />
    </article>
  );
}
```

`Markdown` renders the document's elements as a fragment, with no wrapper of
its own: put it inside whatever element the page needs.

## Components

`components` maps a tag name to the component that renders it, or to another
tag name to render in its place. It defaults to `defaultComponents`.

A map you pass **replaces** the defaults; it is never merged with them. To keep
the design-system elements and change one of them, spread them:

```tsx
import { defaultComponents, Markdown } from "@canonical/react-markdown";

const components = { ...defaultComponents, a: RouterLink };

<Markdown source={source} components={components} />;
```

To render a heading level as another, name the tag:

```tsx
// Comments are shown inside a page, so their headings must not outrank it.
const commentComponents = { h1: "h3", h2: "h3" } as const;
```

An override receives the native props of the element it replaces, plus
`node`, the syntax-tree element being rendered. `node` is not an HTML
attribute: take it out of the props you spread onto an element, or React writes
`node="[object Object]"` into the markup.

```tsx
import type { ComponentProps } from "react";

function RouterLink({ node, ...props }: ComponentProps<"a"> & { node?: unknown }) {
  return <Link {...props} />;
}
```

Declare the map at module scope, so it is the same object on every render.

## Headings

Every heading gets an `id` slugged from its text and prefixed with
`user-content-`: `# Hello world` renders `<h1 id="user-content-hello-world">`,
and a second heading with the same text gets `user-content-hello-world-1`.

The prefix keeps the document's ids apart from the page's own, and from
global names a page's scripts rely on. It is the prefix GitHub uses and the
one GFM footnote ids carry. Headings get their ids after sanitising, so a
heading's id, like a footnote's, is the same with or without sanitising.

`extractHeadings` lists a document's headings with those ids, for a table of
contents:

```tsx
import { extractHeadings } from "@canonical/react-markdown";

function TableOfContents({ source }: { source: string }) {
  return (
    <ul>
      {extractHeadings(source).map(({ id, depth, text }) => (
        <li key={id} data-depth={depth}>
          <a href={`#${id}`}>{text}</a>
        </li>
      ))}
    </ul>
  );
}
```

Each entry has the heading's `depth` (1 to 6), its `id`, and its `text` with
inline markup flattened. The "Footnotes" heading GitHub-flavoured Markdown
generates is not listed.

## Sanitising

`sanitize` defaults to `true`: the rendered HTML is filtered against a
GitHub-like allow-list, which removes scripts, event-handler attributes,
`style`, and links with unsafe protocols. Admonition markers survive it.

Raw HTML in the source never becomes live markup, whatever `sanitize` says.
Sanitised, it is removed; with `sanitize={false}`, it is shown as literal text.
Turn sanitising off only for trusted documents whose generated attributes must
all survive.

## Admonitions

A blockquote whose first line is exactly one of the five GitHub markers
becomes an admonition. The marker is case-insensitive, and must be alone on its
line:

```md
> [!WARNING]
> Back up your data first.
```

| Marker           | Rendered as                                 |
|------------------|---------------------------------------------|
| `[!NOTE]`        | `Announcement`, `information`, "Note"       |
| `[!TIP]`         | `Announcement`, `success`, "Tip"            |
| `[!IMPORTANT]`   | `Announcement`, `information`, "Important"  |
| `[!WARNING]`     | `Announcement`, `warning`, "Warning"        |
| `[!CAUTION]`     | `Announcement`, `error`, "Caution"          |

The headings are English. To translate them, override `blockquote`: the
blockquote of an admonition carries its kind as `data-admonition`.

## Presets

`remarkPreset` and `rehypePreset` are the unified plugin lists `Markdown`
runs: GitHub-flavoured Markdown and admonitions on the Markdown side, heading
ids on the HTML side. Use them to build your own unified pipeline that agrees
with `Markdown` on what a document means.

## MDX

MDX pages render through the same components map as `Markdown`, and compile
with the same presets, so a page's elements and heading ids are the same
whether its content is Markdown rendered at runtime or MDX compiled at build
time. Using MDX is an addition to the consumer's build contract, in three
parts.

1. Add the preset to the Vite configuration, before the React plugin:

   ```ts
   // vite.config.ts
   import { createMdxVitePreset } from "@canonical/react-markdown/mdx/vite";
   import react from "@vitejs/plugin-react";
   import { defineConfig } from "vite";

   export default defineConfig({
     plugins: [createMdxVitePreset(), react()],
   });
   ```

   The preset needs `vite` (an optional peer dependency) and runs only in the
   build: never import `@canonical/react-markdown/mdx/vite` from application
   code. It compiles `.mdx` files only; `.md` imports, `?raw` ones included,
   are left alone.

2. Declare `.mdx` modules for TypeScript:

   ```ts
   // src/mdx.d.ts
   declare module "*.mdx" {
     import type { ComponentType } from "react";

     const MdxPage: ComponentType;
     export default MdxPage;
   }
   ```

3. Mount `MdxProvider` above the pages, with the map you give `Markdown`:

   ```tsx
   import { defaultComponents } from "@canonical/react-markdown";
   import { MdxProvider } from "@canonical/react-markdown/mdx";

   const components = { ...defaultComponents, a: RouterLink };

   <MdxProvider components={components}>
     <App />
   </MdxProvider>;
   ```

   A page with no provider above it renders `defaultComponents`.

MDX is compiled from files that ship with the application, so it is not
sanitised.

## Public API

- `Markdown` — render a Markdown `source` through a components map.
- `defaultComponents` — the design-system elements `Markdown` uses by default.
- `extractHeadings` — list a document's headings with their rendered ids.
- `remarkPreset`, `rehypePreset` — the unified plugins every renderer runs.
- `MarkdownProps` — the props of `Markdown`.
- `MarkdownComponents` — the shape of a components map.
- `Heading`, `HeadingDepth` — an entry of `extractHeadings`, and its level.

From `@canonical/react-markdown/mdx`:

- `MdxProvider` — set the components map compiled MDX pages render through.
- `MdxProviderProps` — the props of `MdxProvider`.
- `useMDXComponents` — the hook compiled MDX pages call to read that map;
  application code does not need it.

From `@canonical/react-markdown/mdx/vite`:

- `createMdxVitePreset` — create the Vite plugin that compiles `.mdx` files.
