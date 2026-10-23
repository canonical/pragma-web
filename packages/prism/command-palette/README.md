# @canonical/prism-command-palette

The command palette of a Prism documentation site: a modal the reader opens
with Cmd+K or Ctrl+K from anywhere on the site, which searches the graph by
text and opens the canonical home of the result the reader chooses. The
field runs across the top; the results list on the left as the site's
command rows, grouped by type in the order the search ranked them; the
highlighted result's card shows on the right; the keys that move, open and
close sit under them.

The package is **Tier 2**: its query compiles against
`@canonical/prism-contract`'s SDL plus the search extension
(`schema/search.graphql`), `Query.search(text:, first:, after:)`, which
returns the nodes whose title, compact address or definition holds the text,
best first. It runs over any provider that conforms to the contract and
serves that extension; both providers in this repository,
`@canonical/prism-pragma-provider` and `@canonical/prism-graph-example`, do.

## Installation

```bash
bun add @canonical/prism-command-palette
```

Requires React 19, Relay 21, `@canonical/prism-core`,
`@canonical/prism-projections`, `@canonical/react-ds-global`,
`@canonical/router-core` and `@canonical/router-react`.

## Mounting the palette

A site mounts the palette once, as the last child of its shell's grid root,
inside the site's provider nest:

```tsx
import { CommandPalette } from "@canonical/prism-command-palette";

<RelayEnvironmentProvider environment={environment}>
  <RouterProvider router={router}>
    <HomesProvider homes={homes}>
      <ProjectionsProvider LinkComponent={RouterLink} maps={maps}>
        <div className="ds shell grid intrinsic">
          <Outlet />
          <CommandPalette />
        </div>
      </ProjectionsProvider>
    </HomesProvider>
  </RouterProvider>
</RelayEnvironmentProvider>
```

- `RelayEnvironmentProvider`: the environment whose provider serves the
  search extension.
- `RouterProvider`: a chosen result navigates the router to its home.
- `HomesProvider`: a result's home is the one the site gives its type; a
  result whose type has no home is listed and previewed as a disabled
  option, and choosing it does nothing.
- `ProjectionsProvider`: each row is the site's command projection for its
  result's type, and the preview its card projection, so a site's own arms
  render there as everywhere else.

A closed `<dialog>` is not displayed and an open one sits in the top layer,
so the palette is never an item of the shell's grid. It is as wide as six
of the shell's columns and their five gutters, read from the grid's own
variables, four below two groups (`@container shell (width < 912px)`), where
the preview is not shown. It reads the shell's query container, `shell`, so
it re-flows only under a shell that is one.

The palette's native props reach its `<dialog>`. Its `onClose` is called
whenever the palette closes, however the reader closed it.

## Keys

- Cmd+K or Ctrl+K, anywhere on the page: open the palette. The chord is
  ignored with Alt or Shift held, while an input method composes text, and
  when it repeats. It carries a modifier, so it is no character-key shortcut
  and needs no switch to turn it off.
- ↑ and ↓ in the field: move the highlight through the results, wrapping at
  both ends. A pointer moving over a result highlights it too.
- Enter in the field: choose the highlighted result. A click on a result
  chooses it too.
- Escape, or a click on the backdrop: close the palette.

Every opening starts empty: the text, the results and a failure line from
the last opening are gone.

## Accessibility

The palette is the published Modal, a `<dialog>` opened with
`showModal()`: the backdrop, the focus trap, the page's inertness and Escape
are the platform's, and the dialog's focusing steps put the focus in the
field. The dialog is named by its `aria-label`, "Search the graph".

The search is the ARIA combobox pattern with a listbox popup. The field is
the combobox and keeps the focus: it is expanded and controls the listbox
while there are results, and names the highlighted option as its active
descendant. Each group of results is a `group` named by its type's heading;
each result is an `option`, selected while highlighted, disabled when its
type has no home. An option is chosen as a whole, so the title it holds is
text, never a link of its own; the preview's title links to the result's
home.

While the next results load, the last ones stay on screen and the listbox
is busy (`aria-busy`). An empty field shows a one-line hint and sends no
query; a text nothing matches shows one line naming it; both are a `status`
region. A search that fails renders one `alert` line in its place.

The search renders in the browser only: its combobox and listbox are wired
by script, so the server sends the closed dialog and the key hints alone.

## Building against the package

The package ships its TypeScript source and the Relay artifacts its `build`
script compiles into `src/__generated__`. It imports those artifacts itself,
so no Relay transform runs over its files, and a site compiles nothing of the
palette.

The package's `relay.config.json` reads the projections package's fragments
as a base project, compiled against the contract SDL; only the palette's own
artifacts land in `src/__generated__`. The palette's own project compiles
against `.relay/schema.graphql`, which `bun run schema` writes: the contract
SDL with the search extension merged into its `Query` type. It is merged, not
handed to relay-compiler as an extension, because relay-compiler compiles a
field it reads from `extend type Query` as a client extension and never
sends it to the server.

`check:tier2` writes that schema and runs `relay-compiler --validate`
against it: it fails when a selection leaves the contract and the search
extension, and when the artifacts are stale. Run `bun run relay` after
editing a query or a fragment.

## Styling

Every component sits in `src/lib/ui/`, scaffolded by the component
generator, and carries an `anatomy.yaml`: its slots and every style
decision, bound to a token. Its `styles.css` transcribes the anatomy, in the
`ds.components.global` cascade layer, and the package's tests check that it
does (`@canonical/prism-core/testing`).

Each design decision reads a component token declared on its component's
root class (`.ds.command-palette { --command-palette-hints-gap: … }`), never
on `:root`, bound to a semantic token or to the spacing shim of
`@canonical/styles`:

- colour: `--color-border-muted`, `--color-focus-ring`, `--color-text-error`
  and `--color-text-muted`;
- type: `--typography-text-primary-font-size` and
  `--typography-text-primary-smallcaps-letter-spacing`;
- space: `--grid-gutter`, `--grid-margin`, `--component-padding-block`,
  `--component-padding-inline` and, where no semantic name fits, a
  `--space-*` step, which the anatomy names with its reason;
- the grid's own `--grid-col-min`, for the palette's width.

The anatomies list what no token binds yet in their ledgers: the palette's
widths, which span columns no token spans; the hairlines' 1px; and the
field's focus ring, drawn inside it since the dialog clips.

## Public API

- `CommandPalette`; types `CommandPaletteProps`.
