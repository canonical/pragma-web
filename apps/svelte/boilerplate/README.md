# SvelteKit reference application

This is an initial server-rendered application, using SvelteKit for routing,
head, server actions and navigation. Route files import domain pages and data
from `src/domains`; no second router or process-wide request store is used.
It uses the Svelte app-tier application, view and content layouts, global
breadcrumbs, `@canonical/styles`, its design tokens and self-hosted fonts.
The dashboard rail and create panel use native disclosure controls; generic
app-tier side-navigation and side-panel components are not available in Svelte.
The account flow is a **demo**, not authentication;
real server reads and actions must authorize at the request boundary.

The `theme` cookie chooses light or dark on the server before first paint;
without a valid cookie the styles follow their default/system behavior. The
native preference form reloads the document and works without JavaScript.
Kit announces the new document title; pathname navigation moves focus to the
page heading, while query-only navigation retains Kit's normal focus behavior.
The `visitor` cookie on catalog detail demonstrates request isolation only.
Neither it nor the demo session is a trusted identity.

## Forms

The forms with fields use `Form` and `Field` from `@canonical/svelte-ds-global-form`, the
workspace package, and its stylesheet `@canonical/svelte-ds-global-form/index.css`.
The app adds no form CSS of its own.

- **Native forms and actions.** Contact, settings and instance creation are
  `Form`s without an owner. They post to SvelteKit form actions, which decode
  the native field map, validate it on the server and return `fail(400, …)`
  with the values and message keys. Each field's `error` is the translated key
  from that `fail()` data. They work without JavaScript.
- **Enhancement.** Contact and instance creation add SvelteKit's `enhance` as an
  attachment: `{@attach fromAction(enhance)}` on instance creation, and a small
  typed attachment around `enhance(form, submit)` on contact. Contact's submit function accepts
  one request in flight, keeps edits made while it is pending and tells an
  earlier result from the current draft. A failed transport has an unknown
  outcome and shows a retryable notice. Settings posts as a full page, with an
  error summary linking to each field.
- **Options from `load`.** The instance release options come from the
  `/api/releases` endpoint, read in the page's `load` with `fetchOptions` and
  Kit's `fetch`, so they render on the server.
- **Remote validation.** The instance name is checked with `validateRemotely`
  against `/api/instance-name` while the user types; a taken name blocks the
  submit. The action checks again, since the check needs JavaScript.
- **Form state.** The project preview uses `createFormState()` as the owner of a
  GET form: the preview reads its values as the user types, and a submit posts
  the form natively. The phone example posts its two native controls
  (`number`, `number-country`) to an action decoded with `decodePhone`; when
  hydrated it decodes them in the browser instead.

The contact action is a local demonstration: no message is delivered.

The dashboard's instance workflow creates, selects and removes bounded demo
records in a browser cookie. It does not provision infrastructure. The session
and records are client-controlled demonstration data, not authentication or a
database; real actions require real authorization and server-side persistence.
Removal in SSR has a separate confirmation page that works without JavaScript;
when hydrated it uses the Svelte global Modal. The SPA stores demo records in
localStorage and uses the same modal pattern.

`@canonical/i18n-core` negotiates the request locale (cookie, then
Accept-Language, then English); the per-layout locale source hydrates from the
same value. English, French and Arabic include live browser switching, native
fallback, direction, translations and number/plural examples. HTML responses
are private/no-store because both theme and locale are request-specific.

## Run

Use the repository's pinned Bun and a supported Node version. From the root:

```sh
bun install
bun run lerna run build --scope @canonical/svelte-boilerplate --include-dependencies
```

Then in `apps/svelte/boilerplate`:

```sh
bun run dev
bun run check
bun run test
bun run preview
bun run build:spa
bun run build:storybook
```

`preview` runs the built adapter-node server. Set `HOST`, `PORT` and `ORIGIN`
as appropriate for deployment; see the adapter-node deployment documentation
for proxy configuration. The tests launch the built server on an ephemeral
loopback port, use local synthetic data and require Playwright Chromium already
installed. Set `CHROMIUM_PATH` to an existing executable to override Playwright's
default. `SERVER_RUNTIME=bun` runs the same adapter-node output with Bun; it is
not a separate adapter-bun build. Styles refer to `/icons/*.svg`; the app serves
the four criticality icons from the installed asset package. Vite reports these
absolute URLs as unresolved at build time, but the built server serves them.

The separate SPA build is emitted to `build-spa`; configure the static host to
serve `200.html` as the fallback for every app route, without rewriting assets.
The SPA uses browser locale negotiation, local-only contact validation,
theme and settings stored in browser localStorage, and a sessionStorage demo
account; no POST action, server dashboard, sitemap, HTTP redirect/status,
or no-JavaScript application is available. Its forms validate in the browser
through `onsubmit`; the release options are local and the instance name is not
checked remotely. The static fallback starts with
English/LTR markup until the client initializes. The static host must also serve
the four criticality icons copied to `build-spa/icons/` from `@canonical/ds-assets`.
Storybook has empty, server-error and Arabic contact examples. Its locale toolbar
drives the first two stories; they use Kit mocks rather than a backend.

## Scope and gaps

This is a partial reference. Native dashboard navigation, create disclosure and
card layouts cover part of the shell, but do not implement the React side
navigation, sliding side panel, card components or their full visual and
interaction parity. Combobox is not used. No production authorization, screen
reader audit, scroll-restoration test, proxy deployment test or full browser and
Node version matrix has been performed. The Kit version is 2.70.3 rather than
3.x: its Node requirement and TypeScript peer accommodate this repository's
declared Node range and TypeScript 6.

GraphQL is not part of the app or its checks.
