import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import renderArm from "./renderArm.js";
import type { ArmProps, ProjectionMap, SiteArmProps } from "./types.js";

/** A composite's data with one typed arm, its keys plain strings. */
interface ProbeData {
  readonly __typename: string;
  readonly Node: string;
  readonly Site: string;
  readonly OntologyClass: string | null;
}

/** The native props every probe arm takes. */
interface ProbeNative {
  readonly id?: string;
}

/** An arm that prints which arm it is and the key it was handed. */
const createProbe =
  (arm: string) =>
  ({ node, id }: ArmProps<string, ProbeNative>): ReactElement => (
    <p id={id}>
      {arm} {node}
    </p>
  );

/** A site's arm that also prints the typename it was handed. */
const SiteProbe = ({
  node,
  typename,
}: SiteArmProps<ArmProps<string, ProbeNative>>): ReactElement => (
  <p>
    site {node} {typename}
  </p>
);

/** A site's arm over a composite with no site slot, which has no key. */
const SlotlessSiteProbe = ({
  typename,
}: SiteArmProps<ArmProps<unknown, ProbeNative>>): ReactElement => (
  <p>site {typename}</p>
);

const MAP: ProjectionMap<ProbeData, ProbeNative> = {
  Node: createProbe("node"),
  types: { OntologyClass: createProbe("class") },
  siteTypes: { Station: SiteProbe, OntologyClass: SiteProbe },
};

/** Render the arm `data` selects in the probe map. */
const renderData = (data: ProbeData, native: ProbeNative = {}) =>
  render(renderArm(MAP, data, native));

describe("renderArm", () => {
  it("renders a typed arm over its aliased key, before any site arm", () => {
    renderData({
      __typename: "OntologyClass",
      Node: "node-key",
      Site: "site-key",
      OntologyClass: "class-key",
    });
    expect(screen.getByText("class class-key")).toBeInTheDocument();
  });

  it("renders a site's arm over the site slot's key, with the typename", () => {
    renderData({
      __typename: "Station",
      Node: "node-key",
      Site: "site-key",
      OntologyClass: null,
    });
    expect(screen.getByText("site site-key Station")).toBeInTheDocument();
  });

  it("renders the Node arm for a type no other arm takes", () => {
    renderData({
      __typename: "Zone",
      Node: "node-key",
      Site: "site-key",
      OntologyClass: null,
    });
    expect(screen.getByText("node node-key")).toBeInTheDocument();
  });

  it("falls back past a typed arm whose alias did not resolve", () => {
    render(
      renderArm<ProbeData, ProbeNative>(
        { Node: MAP.Node, types: MAP.types },
        {
          __typename: "OntologyClass",
          Node: "node-key",
          Site: "site-key",
          OntologyClass: null,
        },
        {},
      ),
    );
    expect(screen.getByText("node node-key")).toBeInTheDocument();
  });

  it("takes no typed arm from a name the map inherits", () => {
    render(
      renderArm<ProbeData, ProbeNative>(
        { ...MAP, siteTypes: { toString: SiteProbe } },
        {
          __typename: "toString",
          Node: "node-key",
          Site: "site-key",
          OntologyClass: null,
        },
        {},
      ),
    );
    expect(screen.getByText("site site-key toString")).toBeInTheDocument();
  });

  it("renders the Node arm over a composite that spreads no site slot", () => {
    render(
      renderArm<Omit<ProbeData, "Site">, ProbeNative>(
        { Node: MAP.Node, types: MAP.types },
        { __typename: "Station", Node: "node-key", OntologyClass: null },
        {},
      ),
    );
    expect(screen.getByText("node node-key")).toBeInTheDocument();
  });

  it("throws when a site arm is listed but the composite spreads no slot", () => {
    expect(() =>
      renderArm<Omit<ProbeData, "Site">, ProbeNative>(
        {
          Node: MAP.Node,
          types: MAP.types,
          siteTypes: { Station: SlotlessSiteProbe },
        },
        { __typename: "Station", Node: "node-key", OntologyClass: null },
        {},
      ),
    ).toThrow("renderArm: the map arms Station under siteTypes");
  });

  it("hands the arm the dispatcher's native props", () => {
    renderData(
      {
        __typename: "Zone",
        Node: "node-key",
        Site: "site-key",
        OntologyClass: null,
      },
      { id: "the-arm" },
    );
    expect(document.getElementById("the-arm")?.textContent).toBe(
      "node node-key",
    );
  });
});
