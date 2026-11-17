# @canonical/i18n-react

React bindings for [`@canonical/i18n-core`](../../runtime/i18n). Thin by design:
the core engine owns negotiation, message records, formatting, and the live
locale value; these hooks expose it to React through `useSyncExternalStore`, so
updates are SSR-safe and surgical — only components that read a locale
re-render.

## Installation

```bash
bun add @canonical/i18n-react @canonical/i18n-core
```

## Setup

Wrap the app once. Pass the SSR-negotiated locale so the server and the first
client render agree: the provider stores `locale` as given, so it should come
from `negotiateLocale`. Declare the config `as const satisfies I18nConfig` and
derive the app's locale type from it, as the
[`@canonical/i18n-core` README](../../runtime/i18n/README.md#configuration)
shows.

```ts
// config.ts
import type { I18nConfig } from "@canonical/i18n-core";

const config = {
  locales: ["en", "fr", "ar"],
  defaultLocale: "en",
  rtlLocales: ["ar"],
} as const satisfies I18nConfig;

export default config;
```

```ts
// types.ts
import type config from "./config.js";

export type AppLocale = (typeof config.locales)[number]; // "en" | "fr" | "ar"
```

```tsx
import { I18nProvider } from "@canonical/i18n-react";
import config from "./config.js";

<I18nProvider config={config} locale={negotiatedLocale}>
  <App />
</I18nProvider>;
```

## Hooks

### `useLocalized` (experimental)

> **Experimental.** Message records are pre-release and may change in a minor
> release before 1.0.

`useLocalized(translations)` returns the active locale's entry from one value
per locale, typically a typed message record per locale. Write the records as
the [`@canonical/i18n-core` README](../../runtime/i18n/README.md#message-records-experimental)
describes: a factory per locale, called once at module scope.

```tsx
import type { Translations } from "@canonical/i18n-core";
import { useLocalized } from "@canonical/i18n-react";
import instanceMessages from "./instanceMessages.js";
import type { AppLocale } from "./types.js";

const nameLabel = {
  en: "Name",
  fr: "Nom",
  ar: "الاسم",
} satisfies Translations<string, AppLocale>;

function InstanceHeading({ count }: { count: number }) {
  const m = useLocalized(instanceMessages);
  return (
    <h2>
      {m.heading} <span>{m.instanceCount(count)}</span>
    </h2>
  );
}

function NameColumnHeader() {
  return <th scope="col">{useLocalized(nameLabel)}</th>;
}
```

- **One object per locale.** The hook returns the very object stored for the
  active locale, so its identity changes only when the locale does. Pass it to
  a memoized child as a prop: the child re-renders once per locale switch, in
  the new language, and skips every other re-render. Keep `translations` at
  module scope for that.
- **Any per-locale data.** Field labels or other values work the same way, as
  `nameLabel` shows: one entry per locale, at module scope, typed with
  `Translations`.
- **No fallback at run time.** Type the argument with
  `Translations<T, AppLocale>`, with `AppLocale` derived from the config, so a
  configured locale without an entry fails to compile. If the active locale has
  no entry anyway, the hook throws, and the first test or server render of that
  locale catches it.
- **Server rendering** is synchronous. A record holds no request state, so
  concurrent requests share it.

### `useFormatters` and `useLocale`

```tsx
import { useFormatters, useLocale } from "@canonical/i18n-react";

function Price({ amount }: { amount: number }) {
  const f = useFormatters();
  return <span>{f.formatCurrency(amount, "USD")}</span>;
}

function Direction({ children }: { children: React.ReactNode }) {
  const { direction } = useLocale();
  return <div dir={direction}>{children}</div>;
}
```

### `useTranslation` and catalogs (deprecated)

> **Deprecated.** `useTranslation` and the provider's `catalogs` prop keep
> working, but a later release removes them. Use `useLocalized` with message
> records instead.

The two can run side by side. Keep `catalogs` on the provider while components
move to `useLocalized` one at a time, then remove the prop. Expect the
differences the
[`@canonical/i18n-core` README](../../runtime/i18n/README.md#moving-from-catalogs)
lists as each component moves: counts are formatted for the locale, placed
names carry isolate marks, a misspelled key fails to compile, and a locale with
no record entry throws where `useTranslation` showed the raw keys. The same
section shows how each catalog entry becomes a record member.

```tsx
import type { Locale, Messages } from "@canonical/i18n-core";
import { I18nProvider, useTranslation } from "@canonical/i18n-react";

const catalogs: Record<Locale, Messages> = {
  en: { "nav.home": "Home", items: { one: "{count} item", other: "{count} items" } },
  fr: { "nav.home": "Accueil", items: { one: "{count} article", other: "{count} articles" } },
  ar: {
    "nav.home": "الرئيسية",
    items: {
      zero: "لا توجد عناصر",
      one: "عنصر واحد",
      two: "عنصران",
      few: "{count} عناصر",
      many: "{count} عنصرًا",
      other: "{count} عنصر",
    },
  },
};

<I18nProvider config={config} catalogs={catalogs} locale={negotiatedLocale}>
  <App />
</I18nProvider>;

function Cart({ count }: { count: number }) {
  const { t } = useTranslation();
  return <span>{t("items", { count })}</span>; // plural via Intl.PluralRules
}
```

## Language switcher

This package deliberately ships no visual components — semantic components
belong to the design-system tier. Pair `useLocale` with any control; listing
each locale by its **endonym** (the language's own name) and tagging each
`<option lang>` keeps the switcher accessible:

```tsx
import { useLocale } from "@canonical/i18n-react";

function LanguageSwitcher() {
  const { locale, locales, setLocale } = useLocale();
  return (
    <select
      aria-label="Language"
      value={locale}
      onChange={(event) => setLocale(event.target.value)}
    >
      {locales.map((tag) => (
        <option key={tag} value={tag} lang={tag}>
          {new Intl.DisplayNames([tag], { type: "language" }).of(tag)}
        </option>
      ))}
    </select>
  );
}
```

Changing the locale re-renders every subscribed component in the new language
and, in the browser, persists the choice to a cookie and flips `<html dir>` for
RTL locales — all via the shared `@canonical/i18n-core` source. `setLocale`
matches a tag as negotiation matches an `Accept-Language` tag, so
`setLocale("fr-CA")` selects `fr` when only `fr` is configured; a tag that
matches no configured locale throws a `RangeError`. A tag from elsewhere, such
as a URL segment, either goes through negotiation, as in
`setLocale(negotiateLocale(config, { acceptLanguage: segment }))`, which falls
back to the default locale when the tag matches nothing, or is set inside a
`try`/`catch` for the `RangeError` that `setLocale` throws instead.
`isSupportedLocale` checks the exact tag only, so it refuses `FR` and `fr-CA`,
which `setLocale` accepts.

For a correct first paint, set `<html lang dir>` on the server from the
negotiated locale with `getDocumentAttributes` (see the
[`@canonical/i18n-core` README](../../runtime/i18n/README.md#server-side-rendering)).

## License

LGPL-3.0
