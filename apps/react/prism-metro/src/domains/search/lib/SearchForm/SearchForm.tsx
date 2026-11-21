// Scaffolded by @canonical/summon-component:react v0.46.0

import type { ReactElement } from "react";
import { useMessages } from "#i18n";
import type { SearchFormProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds search-form";

/**
 * The strip's Search on the search route: a GET form whose field, named
 * `q`, carries the address's text, so submitting it loads the page for
 * the new text without scripting. The field is keyed by the text, so a
 * navigation to another text resets it.
 *
 * `import { SearchForm } from "./lib/index.js";`
 *
 * @implements metro.component.search_form
 */
export default function SearchForm({
  text,
  className,
  ...props
}: SearchFormProps): ReactElement {
  const t = useMessages();
  return (
    <form
      aria-label={t("search.title")}
      method="get"
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <input
        aria-label={t("search.field")}
        className="input"
        defaultValue={text}
        key={text}
        name="q"
        placeholder={t("search.placeholder")}
        type="search"
      />
      <button className="ds button submit" type="submit">
        {t("search.submit")}
      </button>
    </form>
  );
}
