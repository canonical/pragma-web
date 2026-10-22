/**
 * A document exercising every GitHub-flavoured Markdown extension the
 * renderer styles: an aligned table, a task list, strikethrough, a fenced
 * JavaScript block and inline code.
 */
export const gfmDocument = `| Name | Count |
| :--- | ----: |
| Apples | 3 |

- [x] Done
- [ ] To do

~~Struck~~ and \`inline\` code.

\`\`\`js
const answer = 42;
\`\`\`
`;

/** One admonition of each kind, followed by an ordinary quote. */
export const admonitionDocument = `> [!NOTE]
> A note.

> [!TIP]
> A tip.

> [!IMPORTANT]
> Important.

> [!WARNING]
> A warning.

> [!CAUTION]
> A caution.

> Just a quote.
`;

/**
 * An admonition whose marker line ends in two spaces, which Markdown reads as
 * a hard line break.
 */
export const hardBreakAdmonitionDocument = "> [!NOTE]  \n> A note.\n";

/**
 * Markup a sanitiser must neutralise: a script element, an event-handler
 * attribute and a `javascript:` link.
 */
export const hostileDocument = `<script>alert(1)</script>

<img src="x" onerror="alert(1)">

[click](javascript:alert(1))
`;

/**
 * Two headings that slug to the same id, one with inline markup, and a
 * footnote, whose generated "Footnotes" label is a heading the source never
 * wrote.
 */
export const duplicateHeadingsDocument = `# Hello *world*

## Hello world

A claim.[^1]

[^1]: The source.
`;

/** Two footnote references, one of them used twice, and their notes. */
export const footnoteDocument = `A claim.[^1] Another.[^note] The first again.[^1]

[^1]: The first source.
[^note]: The second source.
`;

/** The heading `testing/sample.mdx` opens with, as Markdown. */
export const sampleMdxHeading = "# Getting started";
