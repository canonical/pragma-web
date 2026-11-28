# SvelteKit Boilerplate

A server-rendered Svelte application built on Canonical's design system,
`@canonical/styles` and `@canonical/i18n-core`, with SvelteKit for routing,
loading, form actions and streaming. It is the Svelte counterpart of the React
reference application, `apps/react/boilerplate-vite`: the same routes, pages,
components, messages, stories and behaviours, with Svelte idioms in place of
React's mechanics.

## Quick start

From the repository root:

```sh
bun install
bun run lerna run build --scope @canonical/svelte-boilerplate --include-dependencies
```

Then in `apps/svelte/boilerplate`:

```sh
bun run dev        # SSR dev server with HMR
```

## Builds

| Build | Command | Output | Serve |
| --- | --- | --- | --- |
| SSR (adapter-node) | `bun run build` | `build/` | `bun run preview` (`node build/index.js`; Bun runs it too) |
| SPA (adapter-static) | `bun run build:spa` | `build-spa/` | any static host, with `200.html` as the fallback for every app route |
| Storybook | `bun run build:storybook` | `storybook-static/` | any static host |

The SSR build is the reference. The SPA build renders the same pages from
`src/spa/routes`, a second route tree with browser-only `load` functions: the
theme and locale come from their cookies and the browser's languages, and the
forms have no server to post to. Set `HOST`, `PORT` and `ORIGIN` for the SSR
build as adapter-node documents.

## Testing

```sh
bun run test:unit     # Vitest, the pure modules, in Node
bun run test:browser  # builds, then Playwright Chromium against the SSR server, the SPA and Storybook
bun run test          # both
```

The browser tests need Playwright's Chromium installed; set `CHROMIUM_PATH` to
use another executable, and `SERVER_RUNTIME=bun` to run the SSR build with Bun.

## Project structure

```
src/
├── app.html, spa/app.html  The document shells (SSR, SPA)
├── hooks.server.ts         Reads the theme and locale cookies; writes <html class lang dir>
├── routes/                 The SSR route tree
│   ├── (top-bar)/          Every page except the 404, under the top bar
│   │   ├── (public)/       The public pages, in one constrained column
│   │   └── dashboard/      The dashboard, in the application shell
│   ├── preferences/, language/  The theme and language forms' targets without JavaScript
│   ├── home/, icons/, sitemap.xml/
├── spa/routes/             The SPA route tree: the same pages, browser-only loads
├── params/                 Route matchers (the guide slug)
├── layouts/                The layouts both trees share: root, top bar, public, error
├── domains/                Feature domains, each owning its pages and data
│   ├── marketing/          Home, guides
│   ├── account/            Account (demo guard), login
│   ├── catalog/            Product catalog — the data-layer example
│   ├── contact/            Contact form
│   └── dashboard/          An LXD-style application: side navigation, views,
│                           a side panel and a modal
├── i18n/                   Locale configuration and message catalogs (en/fr/ar)
├── lib/                    Shared components (TopBar, ApplicationShell, …)
├── styles/                 Application CSS, and the stand-ins' stylesheets
└── storybook/              The locale decorator every story renders in
```

### Page layouts

Layouts are route groups, so a page never renders its own frame. Every page
except the 404 sits under `(top-bar)`: a top bar with the app's name, one link
per area of the boilerplate, and the theme and language selectors. Under it a
page takes one of two layouts:

- `(public)` — the public pages: one constrained column.
- `dashboard` — `ApplicationShell` from `src/lib`: the design system's
  `ApplicationLayout` with the side navigation. Each dashboard page renders
  `ViewLayout` and `ContentLayout` inside it.

The dashboard's navigation is one tree of navigation items, built in
`src/domains/dashboard/createDashboardNavigation.ts`. The side navigation
renders it, and the breadcrumbs are projected from it.

## Theme and language

With JavaScript, the theme and language selectors apply on change, as the React
app's do: `setTheme` swaps the theme class on `<html>` and writes the `theme`
cookie, and the locale source re-translates the page, flips `<html lang dir>`
and writes the `locale` cookie. Without JavaScript, each selector is a form
that posts to `/preferences` or `/language`, which set the same cookie and send
the reader back; the server then renders the class, `lang` and `dir`. Their
Apply buttons sit in `<noscript>`, so they never show while JavaScript runs.

Both cookies are `path=/`, `SameSite=Lax`, a one-year max age, `Secure` over
HTTPS on the server, and not `httpOnly`, so the page can overwrite what the
server set.

## Without JavaScript

Every form keeps working: contact and settings post to their page's action, the
instance panel opens through `?create=1` and creates through an action, a
Details button chooses through `?selected=`, and the danger-zone Modal opens
and closes through invoker commands. With JavaScript, each of these behaves as
the React page does, in place.

## Data

The catalog's `load` reads a page of products from local data in
`src/domains/catalog/data.ts`, the same records as the React app's mock GraphQL
schema; replace that module with a call to a real endpoint. GraphQL and Relay
are not part of this app.

## Gaps

`@canonical/svelte-ds-*` does not ship these blocks yet, so the app renders
their markup itself, with their stylesheets copied from the React packages into
`src/styles/standins/`: `SideNavigation` (without the collapse toggle,
tooltips or the small-screen menu), `SidePanel`, `Card`, `Tile`, `Timeline`,
`InlineCode` and `Icon`. Swap each for the Svelte block when it lands, and
delete its stand-in stylesheet.

The account flow is a demo, not authentication; real reads and actions must
authorize at the request boundary.
