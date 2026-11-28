# @canonical/dataviews-react

React bindings for Canonical collection views, built on `@canonical/dataviews-core`: the `DataViews` root with its connected `Search`, `Filters`, `SortPanel`, `ActionBar`, `Pagination` and `SavedViews` parts, the provider context, the four scoped observation hooks, the `DataTable` renderer and the `PaginationBar`.

> **Stability: pre-1.0 / experimental.** The API is still consolidating and breaking changes may land between minor versions. Every breaking change ships with a conventional-commit subject and a CHANGELOG entry — those are the migration record. Pin a minor version if you need stability today.

## Installation

```bash
bun add @canonical/dataviews-react @canonical/dataviews-core
```

## Status

Under active development; the public surface grows change by change. Prototype renderers not exported from the root — DataCards, DataChart and DataChartWithTable — have their recipes under patterns / DataViews / Renderers. The current exports:

- **`DataViews`** — the root component: mounts a provider created by `createDataViewsProvider` (from `@canonical/dataviews-core`) as the collection's context, observes it for as long as it is mounted — which starts the provider's source, location, presentation and saved views, ref-counted, so a table inside the root observing too costs nothing and a StrictMode rehearsal leaves a working provider — and owns the root's filter records. Throws unless the provider is one `createDataViewsProvider` built. Nothing is wired in an effect by the application: it builds the provider once, in state, and mounts.
- **Messages and announcements** — every word a part renders or announces comes from one messages record, `DataViewsMessages` (from `@canonical/dataviews-core`), in English unless the application says otherwise. The root takes `messages`: any of them, merged over English, or all of them — annotate a whole replacement as `DataViewsMessages` and a missing message fails to compile. A message stating a fact is a function of it — a count, a position, a name, a reason — and words its own plurals and ordinals. Field and option labels are not messages. A standalone `DataTable` or `PaginationBar` is its own root and takes `messages` itself; the connected parts take their root's. What a command did that has no place on screen — a sort's new order, why it changed nothing, a column hidden, shown or moved — is said through one polite live region per root, rendered after its children: what is said in one moment is spoken as one announcement — words repeated in that moment said once, and an outcome with one latest answer, such as what the rows are ordered by, standing where the last one stood — the same words said again in a later moment are spoken again, and a second root over the same provider says nothing of the first root's commands. While the query bar's sheet is open, the page behind the modal dialog is inert, so the bar and every part inside the sheet speak through the sheet's own atomic status region instead. Status regions that belong to a place — the pagination summary, the table's status row, a filter's feedback, the saved views' status — speak for themselves and are never repeated.
- **`useDataViews(collection)`** — the typed collection scope for custom children: the collection's state channel, its rows, the refused URL clauses, selection, saved views, presentation, this root's filter handles and the bounded commands, `runAction` and `listRefusals` among them. The module-scope collection is the type and identity witness: it must be the one the enclosing root's provider was built over, so a custom child lives at module scope with no provider prop, and a nested root over another collection rejects it rather than answering with the wrong records typed as the right ones.
- **`useDataViewsValue(channel)`, `useDataViewsValue(channel, { select, isEqual })`** — observe one channel, or the part `select` reads; the held value is returned while `isEqual` says the next reads the same.
- **`useDataViewsFilter(collection, field, operator)`** — one filter of the enclosing root: its text input, applied semantic value — typed by the field's kind — and feedback, with `edit`/`set`/`clear` routed through the root's record. The records are the root's: two roots over one provider share the applied query and never each other's half-typed input.
- **`createColumns({ collection, columns })`** — columns over the collection's fields, each `cell` handed its typed value, record and applicability; a column with an `id` and a `cell` and no field draws its record. The connected table infers its records from it, and every table throws at mount on another collection's columns.
- **`useDataViewsCell(collection)`** — the current cell's scope (row id, column id, the read-only record channel typed as the collection's records, fields and selected channels), installed by the table renderer; throws outside a rendered cell or on a witness mismatch.
- **`DataViews.Search`** — the connected search: one labelled native search input over the applied search. Every edit applies as it is typed through `setSearch`, and a search replaces the history entry rather than pushing one, so typing never floods history and Back restores the applied search into the input. It reads the applied search alone, so a result arriving re-renders no search box; it throws where the source declares no search, as SavedViews does without a store. At baseline it is a GET form carrying the rest of the query hidden.
- **`DataViews.Filters`** — the connected query-editing part. Which fields it offers and which operators each accepts come from the provider — its collection's schema, and the capabilities its source declares — so it never offers a restriction the source would refuse, takes no query props, and has no draft query to keep in step with the applied one. An edit the source refuses keeps the restriction in force and says why beside the control. At baseline it is a GET form whose controls are named as the URL spells their clauses, a number bound a native number input carrying the schema's bounds, with the rest of the query hidden beside them; once scripting is enabled every edit applies as it is made and a submission is intercepted.
- **`DataViews.SortPanel`** — the reader's ordering as a list: each term in precedence order with its direction, moved up, moved down or removed through `setSort`. The path to an ordering of several terms that needs no Shift key. While the reader states no term it says what orders the rows instead. Without scripts each move and removal is a link to the ordering it leads to, from page one. Deliberately rough; its design comes later.
- **`DataViews.Pagination`** — the connected window navigation: the `PaginationBar`, bound to the enclosing root's provider.
- **`DataViews.ActionBar`** — the connected action bar: the selection's count, the actions a caller places, and a button that clears the selection, on the design system's contrasted surface. It reads the root's selection, takes no copy of it, and is absent while nothing is selected.
- **`DataViews.SavedViews`** — the connected saved views: which view is open, whether the query has moved from it, and switching, saving, saving as, renaming, reverting and deleting, over the store the provider was given; its notices also say when the provider's presentation is not being saved. Throws when the provider has no view store; without JavaScript it says only that views are unavailable.
- **`PaginationBar`** — the bar beneath a collection's rows, observing its provider like the table does: the page size, a summary of the rows on screen out of the filtered total, a page select and first, previous, next and last page controls. Its destinations are the ones the collection can actually reach: a source that counts the rows the window pages over exactly gets a page total and a last page; one that counts them loosely or not at all gets a Next taken from the page's own word that more exists, or, failing that, offered only while the page is full; a source reaching its pages only through tokens is paged by those tokens, without a page total or a last page to jump to; and a pending or failed replacement claims no total at all. At baseline every page it can reach is a real link the provider's encoder spelled — through the consumer's router `Link` where `LinkComponent` names one, against the design system's shared link contract — and the page size and the page select each sit in a GET form carrying the rest of the query; once scripting is enabled a plain click on the intrinsic anchor or a submission moves the window in place, and controls only the enhancement can drive wait for it.
- **`QueryChip`** — one clause of a query, such as a field, an operator and a value, as parts the host composes: `QueryChip.Segment` for each settled part, a button with `onActivate` once scripts run, and at most one `QueryChip.Entry`, the text input being typed. `unity` separates the parts or joins them into one target. In a roving toolbar the chip is one item: its first Segment, its Entry, or a read-only chip's remove control. The remove control is a link when the host gives `removeHref`, so removal works without scripts.
- **`QueryChips`** — the query's clauses as one named list of query chips, in a wrapping row.
- **`FilterButton`** — the trigger of one filter: Button's tertiary face with a chevron, whose panel is a non-modal dialog holding the host's controls. While the filter applies, a Badge shows the count, the trigger's name carries the host's words for it, and the applied clause's Condition mark comes first. Without scripts the native popover opens and the host's GET form submits.
- **`FilterOptions`** — one filter's values as words beside its name, for a filter of few values: each word a link where the host gives it an address, a button once scripts run where it does not, and inert text before them, the word that applies marked current, or pressed among several at once. `FilterOptions.Grid` lines several up, one per line, their names in one column.
- **`QueryInput`** — the field where people type text beside a group of query chips: a toolbar of the chips and the free-text entry with one tab stop, suggestions from downshift's combobox that a chip's Entry borrows, and a clear control. Without scripts it is a plain search input in the host's GET form when given a `name`.
- **`DataViews.DataTable`** — the connected table: the `DataTable` bound to the enclosing root's provider, with the same props less that provider.
- **`DataTable.SettingsMenu`** — the table's column settings, passed as `settings` to a table with an `id`: each column's visibility, its place, and a reset, kept under that id, URI-encoded (`table.<id>.order`, `table.<id>.hidden`, `table.<id>.width.<column>`; `a.b` gives `table.a%2Eb.order`, `order` gives `table.%6Frder.order`).
- **`DataTable`** — the row renderer: a native table whose rows share one column track list, sorting, selection and resizing. It observes its provider for as long as it is mounted, so a standalone table is a complete screen on its own. Each table keeps which columns it shows, in what order and at what width under its `id` in the provider's presentation, and a column may declare `hideable: false`. A column's `sortable` is honoured only on a field the provider's source declares sortable — the same declaration `DataViews.Filters` reads — so the table never offers an ordering the source would refuse. Activating a header sorts by that column alone, cycling ascending, descending and back to the source's own order; Shift with a click, Enter or Space adds it as a further term. The headers show the ordering in force, the source's default included, and exactly one carries `aria-sort`. Without scripting each sortable header is a real link to the next ordering. Once scripts run, a menu beside each sortable header sorts it ascending or descending, or removes it from the ordering.

The remaining connected part, Summary, lands in a later change. The pagination bar already carries the result summary and the action bar the selection count, so `Summary` is designed not to repeat either.

**A provider comes by prop or by context, never both.** A standalone part — `DataTable`, `PaginationBar` — takes `provider` explicitly and never reads context, so it behaves the same alone and inside a root. A connected part — every `DataViews.*` — reads the enclosing root and throws outside one. Every standalone part has a connected twin whose props are its own less `provider`, and a connected part without a twin (`Filters`, `SortPanel`, `ActionBar`, `SavedViews`) has no standalone form. The hooks read context and take the collection as their type and identity witness, so a child cannot be handed another collection's scope by mistake.

**One screen, in outline.** The collection is declared once at module scope; the provider is built once per page over it, its source and its ports; every part observes it:

```tsx
import {
  createArraySource,
  createCollection,
  createDataViewsProvider,
  createPlatformLocation,
} from "@canonical/dataviews-core";
import {
  createColumns,
  DataViews,
  useDataViews,
  useDataViewsValue,
} from "@canonical/dataviews-react";
import { useState } from "react";
import { exportNames, type Machine, platform, store } from "./app.js";

export const machines = createCollection({
  identify: (machine: Machine) => machine.id,
  fields: [
    { field: "name", kind: "text" },
    { field: "status", kind: "choices", options: ["running", "failed"] },
    { field: "cores", kind: "number", min: 1 },
  ],
});

const columns = createColumns({
  collection: machines,
  columns: [
    { field: "name", header: "Host" },
    { field: "status", header: "Status" },
    { field: "cores", header: "Cores", sortable: true },
  ],
});

const nameMachine = (machine: Machine) => machine.name;

function ExportNames() {
  const { rows } = useDataViews(machines);
  const names = useDataViewsValue(rows).entries.map((row) => row.record.name);
  return <button type="button" onClick={() => exportNames(names)}>Export</button>;
}

export function MachinesPage({ rows }: { rows: readonly Machine[] }) {
  const [provider] = useState(() =>
    createDataViewsProvider({
      collection: machines,
      source: createArraySource({ rows, collection: machines, searchFields: ["name"] }),
      location: createPlatformLocation(platform),
      views: store,
      presentation: store,
    }),
  );
  return (
    <DataViews provider={provider}>
      <DataViews.SavedViews label="Machine views" />
      <DataViews.Search />
      <DataViews.Filters />
      <DataViews.DataTable
        columns={columns}
        label="Machines"
        selectable
        getRowLabel={nameMachine}
        footer={<DataViews.Pagination label="Machines pagination" />}
      />
      <ExportNames />
    </DataViews>
  );
}
```

## Working without JavaScript

Each part renders a baseline before scripts run, and works once they do.

| Part | Before scripts |
|---|---|
| `DataViews.QueryBar` | With a location that spells addresses: a GET search form around a plain input holding the search as `q`, the other parameters in hidden fields; each chip's remove control, the clear control and a refused filter's clear as links; a contradiction's Merge as a link to the merged query; and the full filters form in a disclosure, "Filters (n)". In memory, the remove and clear controls render inert, with no address, name or method; there is no Filters disclosure, and Merge waits for scripts. Once scripts run, the links become buttons. |
| `DataViews.QueryBar`, narrow | Below a container width of 37.5rem, under any location: the summary button opens the sheet's modal dialog through its invoker command, and its close buttons close it. With a location that spells addresses, each chip's remove control and Clear all are links, and Apply submits the filters' GET form with the search kept as `q`. In memory, the sheet opens on inert chips, with no filters form, no address, name or method. A browser without invoker commands opens the sheet only once scripts run. The sheet's own status region, and "Add filter", exist only once scripts run. |
| `DataViews.QueryBar` quick filters | With a location that spells addresses: each `FilterOptions` word is a link to the query with its condition set or removed, and each `FilterButton` panel is a GET form whose Apply submits its field, the search `q` and every other clause riding in hidden fields. In memory, the words are inert text with the current one still marked, the popover still opens, and its controls have no name. Once scripts run, the words become buttons, Apply and the hidden fields go, and each choice commits as it is made. |
| `FilterOptions` | A word with an `href` is a link; one without is inert text, still marked current, until scripts run and it becomes a button. |

## Composition recipes

The recipes, with consumer code and the live stories beside them, are the Storybook page **Documentation / Guides / Recipes** — source in [`src/docs/guides/Recipes.mdx`](src/docs/guides/Recipes.mdx):

- **The connected parts** — one root, every part reading its provider; place them in any order and any wrapper.
- **Your own words** — `<DataViews provider={provider} messages={{ search: "Rechercher", rowsShown: ({ first, shown, total }) => … }}>`: the parts left out keep English, and a record typed `DataViewsMessages` replaces them all. Keep the record at module scope, or its functions stable: the root holds its words while their members stay the same.
- **Keeping the query in the URL** — hand the provider a location and the URL is the query's other home, adopted before the first page is asked for; a refused link reports its reasons on `provider.issues`.

The parts have recipe pages of their own: [`Filters.mdx`](src/lib/pattern/DataViews/common/controls/Filters/Filters.mdx), [`ActionBar.mdx`](src/lib/pattern/DataViews/common/controls/ActionBar/ActionBar.mdx), [`Pagination.mdx`](src/lib/pattern/DataViews/common/controls/Pagination/Pagination.mdx) and [`PaginationBar.mdx`](src/lib/subcomponent/PaginationBar/PaginationBar.mdx).

## Messages and internationalization

Every word the parts render or announce comes from one record, `DataViewsMessages`, shipped in English. The Storybook page **Documentation / Messages and internationalization** covers it, with live stories — source in [`src/docs/Messages.mdx`](src/docs/Messages.mdx):

- **The root's `messages`** — a partial set merged over English, or a whole replacement annotated `DataViewsMessages`, which fails to compile while it misses a message; standalone `DataTable` and `PaginationBar` take `messages` themselves.
- **Messages that state a fact** — functions of the names, counts, positions and reasons they state, which word their own plurals and ordinals.
- **What the announcer says** — one polite live region per root, for outcomes with no place on screen, and nothing a status on screen already says; while the query bar's sheet is open, its own atomic status region in its place.
- **A whole locale** — a French record with its plurals chosen by `Intl.PluralRules("fr")`, field labels and column headings left to the application, and what right-to-left text needs.

## Styles

Each component imports its own stylesheet, so a page that renders one has the rules it needs. A page that would rather have every rule present from the first paint — before the JavaScript of a lazily loaded route arrives — links the package's entry stylesheet instead:

```css
@import url("@canonical/dataviews-react/index.css");
```

The table assumes the `.app` context of `@canonical/styles`, which the page loads: render it inside an element carrying the `.app` class, where the design system's primary text takes its application sizes. It sits in `div.ds.data-table-frame`, which draws the border and is its parent's layout item; `className`, `style` and `ref` reach the `<table>`. It is dense wherever it sits — the table carries the design system's `.dense` class — and its rows and cells take their height and padding from the density channel that class sets; it defines no density rule of its own. The pagination bar is dense the same way; the saved views' controls follow the density scope of the page around them. Its sort chevrons and checkbox marks are `@canonical/ds-assets` icons, served at `/icons` like every other design-system icon.

The sheet is in the `ds.components.global` cascade layer and reads its colours, spacing, borders and type from `@canonical/design-tokens`. The one thing it cannot carry is the column track list: the solver derives that per render from the measured container, and the table publishes the data columns' tracks on itself as `--data-table-columns` (nothing at all when it has no columns), which every row consumes after the selection column's own track. That property is the table's own channel, not a customisation hook: the table writes it after any `style` it is given.

The pagination bar's selects and the controls in the query bar's quick filter panels are the design system's form inputs — `SelectInput`, `CheckboxInput`, `RadioInput`, `TextInput` and `DateInput` — whose chrome is in the `@canonical/react-ds-global-form` stylesheet: a page that renders either loads `@canonical/react-ds-global-form/dist/esm/index.css` beside `@canonical/styles`. The bar sticks to the bottom of whatever scrolls it. The action bar sits on the design system's contrasted surface, `.contrasted`, and paints nothing of its own.

## DataTable recipes

The recipes, with consumer code and the live stories beside them, are the Storybook page **patterns / DataViews / Renderers / DataTable / Recipes** — under **DataViews** in the Storybook hub — source in [`src/lib/pattern/DataViews/common/renderers/DataTable/DataTable.mdx`](src/lib/pattern/DataViews/common/renderers/DataTable/DataTable.mdx):

- **A table over a provider** — build the provider once, over the collection and its source, and mount: the table observes it.
- **Columns and sizing** — fixed and flexible widths, bounds, and the last column taking the rest.
- **Sorting** — `sortable` takes effect where the source's declaration, read by the provider, names the field sortable; on any other field the heading is plain, and nothing throws.
- **A footer** — `footer={<PaginationBar provider={provider} />}`.
- **Selection** — the design system's checkboxes in a 32px column, named by `getRowLabel`; select-all acts on the displayed rows.
- **Resizing and its limits** — held to the declared bounds; no control on the last column; two tables with one id on one provider agree on every width, and nothing is passed between them.
- **A cell handed its record** — a module-scope renderer handed its typed value and record, reading the row's selection through `useDataViewsCell(collection)`.
- **Records of several types** — containers and virtual machines in one table: a field that does not apply draws a dash read as "Not applicable", and a cell narrows on the record's type.
- **The outcomes** — pending, failed, refused — a followed link's filter or search refused, so nothing ran — no access, empty and no match in place of the rows; a failed refresh and retained rows that no longer answer the current query (`refresh-failed`, `stale`) above them, with `renderStatus` over the core's `DisplayStatus`.
- **Mounting only the rows in view** — `virtualization={virtualizeRows({ estimatedRowHeight })}`, from `@canonical/dataviews-react/virtualization`, for a result window of thousands of rows: the table becomes its own scroll viewport and every row still counts.

## Build your own renderer

The Storybook page **Documentation / Guides / Build your own renderer** is a tutorial for writing a renderer over a provider, as `DataTable`, `DataCards` and `DataChart` are written — source in [`src/docs/guides/BuildARenderer/BuildARenderer.mdx`](src/docs/guides/BuildARenderer/BuildARenderer.mdx), with the example's compiled and tested code beside it:

- **A plain list** — observe the provider from an effect for as long as the list is mounted, and read its rows with `useDataViewsValue`.
- **The status** — `resolveDisplayStatus` and `listDisplayEntries` from `@canonical/dataviews-core/bindings`: loading, failed, refresh-failed, stale, empty and no match.
- **Selection, sort and refusals** — one channel set per row from `createRowScopes`, a sort offered only where the source declares it, every refusal's reason shown, and no control drawn before scripts run.
- **A standalone list and its connected twin** — the standalone form takes `provider`; the twin reads the root through `useDataViews(collection)`.
