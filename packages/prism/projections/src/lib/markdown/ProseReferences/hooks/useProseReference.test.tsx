import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import createReferencesPage from "../../../../../testing/createReferencesPage.js";
import {
  ONTOLOGY_CLASS_NODE,
  UNREFERENCED_HREF,
} from "../../../../../testing/fixtures.js";
import useProseReference from "./useProseReference.js";

/** Prints whether `href` resolves to one of the page's references. */
const ReferenceProbe = ({
  href,
}: {
  readonly href: string | undefined;
}): ReactElement => (
  <p>{useProseReference(href) === undefined ? "no reference" : "reference"}</p>
);

describe("useProseReference", () => {
  it("resolves an absolute IRI the references hold", () => {
    render(
      createReferencesPage(<ReferenceProbe href={ONTOLOGY_CLASS_NODE.uri} />),
    );
    expect(screen.getByText("reference")).toBeInTheDocument();
  });

  it("resolves a compact address the references hold", () => {
    render(
      createReferencesPage(<ReferenceProbe href="metro:station/kings-cross" />),
    );
    expect(screen.getByText("reference")).toBeInTheDocument();
  });

  it("resolves nothing for an href the references do not hold", () => {
    render(createReferencesPage(<ReferenceProbe href={UNREFERENCED_HREF} />));
    expect(screen.getByText("no reference")).toBeInTheDocument();
  });

  it("resolves nothing for a link without an href", () => {
    render(createReferencesPage(<ReferenceProbe href={undefined} />));
    expect(screen.getByText("no reference")).toBeInTheDocument();
  });

  it("resolves nothing with no ProseReferencesProvider above", () => {
    render(<ReferenceProbe href={ONTOLOGY_CLASS_NODE.uri} />);
    expect(screen.getByText("no reference")).toBeInTheDocument();
  });
});
