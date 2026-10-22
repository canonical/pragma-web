import { useTranslation } from "@canonical/i18n-react";
import { Head } from "@canonical/react-head";
import { type ReactElement, Suspense } from "react";
import { CodeMessage, ExampleComponent, LazyComponent } from "#lib/index.js";

export default function HomePage(): ReactElement {
  const { t } = useTranslation();

  return (
    <section aria-labelledby="home-title">
      <Head title={t("home.title")} />
      <h1 id="home-title">{t("home.heading")}</h1>
      <p>{t("home.tagline")}</p>

      <h2>{t("home.exampleHeading")}</h2>
      {/*
        The explanatory paragraphs name files and APIs. They are translated
        like the rest of the page; the names themselves sit between backticks
        in every catalog, and CodeMessage renders them as code.
      */}
      <CodeMessage message={t("home.exampleBody")} />
      <ExampleComponent>{t("home.exampleGreeting")}</ExampleComponent>

      <h2>{t("home.streamingHeading")}</h2>
      <CodeMessage message={t("home.streamingBody")} />
      <Suspense fallback={<p>{t("home.streamFallback")}</p>}>
        <LazyComponent />
      </Suspense>
    </section>
  );
}
