# @canonical/i18n-core

Framework-agnostic internationalization for the Pragma design system, built on
the native [`Intl`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl)
API. Zero runtime dependencies.

`i18n-core` owns everything that is not framework reactivity — locale
negotiation, typed message records, memoized formatters, and a live locale
source. The React binding, `@canonical/i18n-react`, stays thin and shares this
one engine; a binding for another framework would do the same.

## Installation

```bash
bun add @canonical/i18n-core
```

## Configuration

Locales are declared explicitly as plain data — no magic discovery. Declare
the config `as const satisfies I18nConfig` and derive the app's locale type from
it, so the type always lists exactly the configured locales.

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

## Locale negotiation (pure, SSR-safe)

```ts
import { getDirection, negotiateLocale } from "@canonical/i18n-core";

const locale = negotiateLocale(config, {
  cookieHeader: request.headers.get("cookie"),
  acceptLanguage: request.headers.get("accept-language"),
});
const dir = getDirection(config, locale); // "ltr" | "rtl"
```

An explicit cookie wins, then `Accept-Language` negotiation, then the default
locale. It takes raw header strings and returns a tag, so it behaves the same
on the server and the client.

## Message records (experimental)

> **Experimental.** Message records are pre-release and may change in a minor
> release before 1.0.

A message record is an object of messages under stable keys. Each message is
text, or a function that takes typed facts and returns text. Read it by
member (`m.heading`, `m.instanceCount(3)`), so `tsc` checks every key and every
fact, with no build step and no runtime parser.

Write each locale as a factory, in its own file, that takes that locale's
formatters and returns the record. The first locale defines the record's type;
every other locale names that type as its return type, so a missing or
misspelled member fails to compile. Call each factory once, at module scope.

```ts
// createEnglish.ts
import type { Formatters, MessageRecord } from "@canonical/i18n-core";

export default function createEnglish(f: Formatters) {
  return {
    heading: "Instances",
    instanceCount: (count: number) =>
      f.selectPlural(count, {
        one: `${f.formatNumber(count)} instance`,
        other: `${f.formatNumber(count)} instances`,
      }),
    selectInstance: (name: string) => `Select ${f.isolate(name)}`,
    rowsShown: (facts: {
      readonly first: number;
      readonly last: number;
      readonly total: number;
    }) =>
      `Showing ${f.formatNumber(facts.first)}–${f.formatNumber(facts.last)} of ${f.formatNumber(facts.total)}`,
  } satisfies MessageRecord;
}
```

```ts
// types.ts, beside AppLocale
import type createEnglish from "./createEnglish.js";

export type InstanceMessages = ReturnType<typeof createEnglish>;
```

```ts
// createFrench.ts
import type { Formatters } from "@canonical/i18n-core";
import type { InstanceMessages } from "./types.js";

export default function createFrench(f: Formatters): InstanceMessages {
  return {
    heading: "Instances",
    instanceCount: (count) =>
      f.selectPlural(count, {
        one: `${f.formatNumber(count)} instance`,
        many: `${f.formatNumber(count)} d’instances`, // one million: "1 000 000 d’instances"
        other: `${f.formatNumber(count)} instances`,
      }),
    selectInstance: (name) => `Sélectionner ${f.isolate(name)}`,
    rowsShown: ({ first, last, total }) =>
      `Affichage de ${f.formatNumber(first)}–${f.formatNumber(last)} sur ${f.formatNumber(total)}`,
  };
}
```

```ts
// createArabic.ts
import type { Formatters } from "@canonical/i18n-core";
import type { InstanceMessages } from "./types.js";

export default function createArabic(f: Formatters): InstanceMessages {
  const isolateNumber = (value: number) => f.isolate(f.formatNumber(value));
  return {
    heading: "المثيلات",
    instanceCount: (count) =>
      f.selectPlural(count, {
        zero: "لا توجد مثيلات",
        one: "مثيل واحد",
        two: "مثيلان",
        few: `${isolateNumber(count)} مثيلات`,
        many: `${isolateNumber(count)} مثيلًا`,
        other: `${isolateNumber(count)} مثيل`,
      }),
    selectInstance: (name) => `تحديد ${f.isolate(name)}`,
    rowsShown: ({ first, last, total }) =>
      `عرض ${f.isolate(`${f.formatNumber(first)}–${f.formatNumber(last)}`)} من ${isolateNumber(total)}`,
  };
}
```

```ts
// instanceMessages.ts
import { createFormatters, type Translations } from "@canonical/i18n-core";
import createArabic from "./createArabic.js";
import createEnglish from "./createEnglish.js";
import createFrench from "./createFrench.js";
import type { AppLocale, InstanceMessages } from "./types.js";

const instanceMessages = {
  en: createEnglish(createFormatters("en")),
  fr: createFrench(createFormatters("fr")),
  ar: createArabic(createFormatters("ar")),
} satisfies Translations<InstanceMessages, AppLocale>; // a configured locale without an entry fails here

export default instanceMessages;
```

The rules the types enforce:

- **`Message`** is text, or a function of one argument: the message's one fact,
  or one object of named facts when there are two or more, so a translation
  cannot take facts in the wrong order. A function that declares a second
  parameter is not a `Message`, whether that parameter is required, optional or
  a rest parameter. The one exception is an optional or rest second parameter
  typed `unknown` or `any`: every argument fits it, so no type can refuse it.
  Do not declare one.
- **`MessageRecord`** must be declared with `type`, not `interface`: an
  interface has no index signature, so it does not satisfy the type.
- **`Translations<T, L>`** holds one `T` per locale in `L`. With `L` derived
  from the config, a configured locale without an entry fails to compile. It
  also carries any other per-locale data, such as field labels.

Name the record as each factory's return type. A factory without one still
compiles with a misspelled key next to correct ones.

To read the active locale's record, widen the set to
`Translations<InstanceMessages>`, which any locale string can index, and handle
a locale that has no entry. Pass it a locale from `negotiateLocale` or
`source.get()`:

```ts
// readInstanceMessages.ts
import type { Locale, Translations } from "@canonical/i18n-core";
import instanceMessages from "./instanceMessages.js";
import type { InstanceMessages } from "./types.js";

const records: Translations<InstanceMessages> = instanceMessages;

export default function readInstanceMessages(locale: Locale): InstanceMessages {
  const messages = records[locale];
  if (messages === undefined) {
    throw new Error(`No messages for the locale "${locale}".`);
  }
  return messages;
}
```

Each record is plain data with no request state, so concurrent server renders
can share it.

### Testing translations

Strict formatters make a translation short of a plural form fail in tests
instead of falling back to `other` at run time:

```ts
// createFrench.test.ts
import { createFormatters } from "@canonical/i18n-core";
import { describe, expect, it } from "vitest";
import createFrench from "./createFrench.js";

describe("createFrench", () => {
  const fr = createFrench(createFormatters("fr", { strict: true }));

  it("words every plural form French uses", () => {
    // strict formatters throw here if the wording lacks "one", "many" or "other"
    expect(fr.instanceCount(2)).toBe("2 instances");
  });
});
```

Write the same test for every locale. Under strict Arabic formatters,
`instanceCount` throws unless all six Arabic forms are worded.

## Formatting

```ts
import { createFormatters } from "@canonical/i18n-core";

const f = createFormatters("en-US");
f.formatNumber(1234.5); // "1,234.5"
f.formatCurrency(1234.5, "USD"); // "$1,234.50"
f.formatRelativeTime(-3, "day", { numeric: "auto" }); // "3 days ago"
f.formatList(["A", "B", "C"]); // "A, B, and C"
```

Formatters memoize their `Intl` instances by options, since constructing them
is comparatively expensive.

### Plurals, ordinals and isolation (experimental)

```ts
const f = createFormatters("en");
const count = 3;
f.selectPlural(count, { one: `${f.formatNumber(count)} row`, other: `${f.formatNumber(count)} rows` }); // "3 rows"
const position = 2;
f.selectOrdinal(position, {
  one: `${f.formatNumber(position)}st`,
  two: `${f.formatNumber(position)}nd`,
  few: `${f.formatNumber(position)}rd`,
  other: `${f.formatNumber(position)}th`,
}); // "2nd"
f.isolate("أحمد"); // "\u2068أحمد\u2069"
```

- `selectPlural(count, forms)` picks a form under the locale's cardinal
  `Intl.PluralRules`, and `selectOrdinal(position, forms)` under its ordinal rules. A
  category the locale selects but `forms` lacks falls back to `other`. The forms
  hold the whole wording, so format the count or position inside them with
  `formatNumber`.
- `isolate(text)` wraps text in FIRST STRONG ISOLATE (U+2068) and POP
  DIRECTIONAL ISOLATE (U+2069), so a name or number placed in a sentence keeps
  its own direction. An Arabic name inside an English sentence, or a Latin name
  inside an Arabic one, then cannot reorder the words around it.
- `createFormatters(locale, { strict: true })` makes `selectPlural` and `selectOrdinal`
  throw a `RangeError` naming each category the locale uses that `forms` lacks,
  even when the count selects a category that is present:
  `Missing cardinal plural forms for "fr": many.` Use it in tests.

## Message catalogs (deprecated)

> **Deprecated.** `createTranslator`, `mergeCatalogs`, `Messages`,
> `MessageValue`, `TranslateVars` and `Translator` keep working, but a later
> release removes them. Write [message records](#message-records-experimental)
> instead.

```ts
import { createTranslator, mergeCatalogs } from "@canonical/i18n-core";

const t = createTranslator("en", {
  "nav.home": "Home",
  greeting: "Hello, {name}!",
  items: { one: "{count} item", other: "{count} items" },
});

t("greeting", { name: "Ada" }); // "Hello, Ada!"
t("items", { count: 3 }); // "3 items" — via Intl.PluralRules
```

`mergeCatalogs(base, overrides)` layers app messages over a component's
built-in defaults. With records, spread instead: `{ ...defaults, ...overrides }`.
Resolution never throws: a missing key returns the key itself, an absent
placeholder is left verbatim.

### Moving from catalogs

Each catalog entry becomes one member of a record:

```ts
// Before: a catalog
const en: Messages = {
  "nav.home": "Home",
  greeting: "Hello, {name}!",
  items: { one: "{count} item", other: "{count} items" },
};

// After: a record, in createEnglish.ts
export default function createEnglish(f: Formatters) {
  return {
    navHome: "Home", // a dotted key becomes a member
    greeting: (name: string) => `Hello, ${f.isolate(name)}!`, // a placeholder becomes a typed fact
    items: (count: number) =>
      f.selectPlural(count, {
        one: `${f.formatNumber(count)} item`, // each form holds the whole wording
        other: `${f.formatNumber(count)} items`,
      }),
  } satisfies MessageRecord;
}
```

Four things change on the way:

- A count is formatted for the locale. `t` placed `String(count)`, so
  "1000 items" now reads "1,000 items".
- A name placed with `isolate` carries U+2068 and U+2069. A test that matches
  the exact text includes them (`"Hello, \u2068Ada\u2069!"`) or matches a
  substring.
- A misspelled or missing key no longer renders as the key itself: it fails to
  compile.
- A locale with no entry fails to compile when `L` comes from the config. If
  one is still missing at run time, there is no fallback: the set has no record
  to read, where a missing catalog only showed keys.

Catalogs and records can live side by side while an app moves over one domain
at a time.

## Reactive locale source

The cross-framework runtime channel. `subscribe` follows the Svelte store
contract — it calls back immediately and on every change — which also satisfies
React's `useSyncExternalStore` and a Lit reactive controller. One object drives
every framework. In the browser it persists the choice to a cookie and reflects
`<html lang dir>`; on the server those effects are inert.

```ts
import { createLocaleSource } from "@canonical/i18n-core";

const source = createLocaleSource(config, { initial: locale });
const unsubscribe = source.subscribe((next) => render(next));
source.set("ar"); // notifies subscribers; persists + reflects dir="rtl"
source.set("fr-CA"); // stores "fr": matched by language
source.set("de"); // throws a RangeError: no configured locale matches
```

`set` matches a tag as `negotiateLocale` matches an `Accept-Language` tag: the
exact configured tag first, then its base language, ignoring case. A cookie is
matched only exactly, ignoring case, so a `locale=fr-CA` cookie selects nothing
when only `fr` is configured. A locale `set` stores is always a
configured tag, so `<html lang>` names the language the words are in. A tag that
matches nothing throws a `RangeError`; negotiate requests and cookies first. A
tag that matches the current locale, such as `FR` or `fr-CA` while on `fr`,
changes nothing. `initial` is stored as given, so pass it a negotiated locale
too.

A tag from elsewhere, such as a URL segment, either goes through negotiation,
as in `source.set(negotiateLocale(config, { acceptLanguage: segment }))`, which
falls back to the default locale when the tag matches nothing, or is set inside
a `try`/`catch` for the `RangeError` that `set` throws instead.
`isSupportedLocale` checks the exact tag only, so it refuses `FR` and `fr-CA`,
which `set` accepts.

On the server, create one source **per request** — the React binding's
`I18nProvider` already does this. A module-level singleton shared across
concurrent requests leaks locale state between them.

## Server-side rendering

The source can only set `<html lang dir>` from the client. For a correct first
paint and assistive technology, render `<html lang dir>` on the server from the
negotiated locale with `getDocumentAttributes`:

```ts
import { getDocumentAttributes, negotiateLocale } from "@canonical/i18n-core";

const locale = negotiateLocale(config, {
  cookieHeader: request.headers.get("cookie"),
  acceptLanguage: request.headers.get("accept-language"),
});
const { lang, dir } = getDocumentAttributes(config, locale);
// render: <html lang={lang} dir={dir}> … </html>
```

Pass the same `locale` to the client
(`createLocaleSource(config, { initial: locale })`) so the server and first
client render agree.

## Right-to-left & accessibility

`getDirection` resolves writing direction from `rtlLocales` (base languages); a
sensible default set is `["ar", "he", "fa", "ur"]`. Flipping `dir` is necessary
but not sufficient — author UI with CSS **logical properties**
(`margin-inline-start`, `inset-inline`, `text-align: start`) and mirror
directional icons so RTL is structural, not decorative.

Values in `config.locales` must be valid BCP-47 tags — they are reflected to
`<html lang>` and passed to `Intl`. Write every locale's record in full: English
words inside a `lang="fr"` page are read aloud with French pronunciation, and
the record's return type makes a missing message a compile error.
In right-to-left wordings, wrap each name and number a message places in
`isolate`.

Messages return plain strings that the framework escapes on render; never pipe
them into `dangerouslySetInnerHTML` / `unsafeHTML` / `{@html}`. The same holds
for the deprecated `t()`, which returns a missing key verbatim (`"nav.home"`),
visible *and* read aloud.

## License

LGPL-3.0
