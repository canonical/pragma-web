// =============================================================================
// `_meta.title` is NON-NULL in the contract, so this gate is about totality,
// not about correctness of any one title.
//
// It is driven FROM THE DATASET, never from a hand-listed set of URIs: a new
// entity added without a label must be caught by this test on the run it is
// added, which cannot happen if the list of things to check is maintained by
// hand alongside the data.
// =============================================================================

import { type ExecutionResult, graphql } from "graphql";
import { describe, expect, it } from "vitest";
import {
  BARE_ENTITY_URI,
  createExampleProvider,
  exampleDataset,
  isNetworkEntity,
} from "../../lib/provider/index.js";
import { EMPTY_LOCAL_NAME_DATASET, EMPTY_LOCAL_NAME_URI } from "../fixtures.js";

const provider = createExampleProvider();

const execute = async (
  source: string,
  variableValues?: Record<string, unknown>,
): Promise<ExecutionResult> =>
  graphql({
    schema: provider.schema,
    source,
    rootValue: provider.rootValue,
    variableValues,
  });

/** A title is only total if it is present AND says something. */
const expectUsableTitle = (title: unknown): void => {
  expect(typeof title).toBe("string");
  expect(title).not.toBeNull();
  expect((title as string).length).toBeGreaterThan(0);
};

describe("every entity in the dataset has a title", () => {
  it.each(exampleDataset.entities.map((entity) => entity.uri))(
    "%s",
    async (uri) => {
      const result = await execute(
        `query T($id: ID!) { node(id: $id) { _meta { title } } }`,
        { id: uri },
      );
      expect(result.errors).toBeUndefined();
      const node = (
        result.data as { node: { _meta: { title: string } } | null }
      ).node;
      expect(node).not.toBeNull();
      expectUsableTitle(node?._meta.title);
    },
  );
});

describe("every class in the dataset has a title", () => {
  it.each(exampleDataset.classes.map((cls) => cls.uri))("%s", async (uri) => {
    const result = await execute(
      `query T($uri: String!) { ontologyClass(uri: $uri) { _meta { title } } }`,
      { uri },
    );
    expect(result.errors).toBeUndefined();
    const cls = (
      result.data as { ontologyClass: { _meta: { title: string } } | null }
    ).ontologyClass;
    expect(cls).not.toBeNull();
    expectUsableTitle(cls?._meta.title);
  });
});

describe("the embeddable has a title despite having no IRI", () => {
  const embedded = exampleDataset.entities
    .filter(isNetworkEntity)
    .filter((entity) => entity.location !== undefined);

  it("has at least one embeddable in the dataset to check", () => {
    expect(embedded.length).toBeGreaterThan(0);
  });

  it.each(embedded.map((entity) => entity.uri))("%s", async (uri) => {
    const result = await execute(
      `query T($id: ID!) {
         node(id: $id) { ... on Station { location { _meta { title } } }
                         ... on Interchange { location { _meta { title } } } }
       }`,
      { id: uri },
    );
    expect(result.errors).toBeUndefined();
    const node = result.data as {
      node: { location: { _meta: { title: string } } | null } | null;
    };
    expect(node.node?.location).not.toBeNull();
    expectUsableTitle(node.node?.location?._meta.title);
  });
});

describe("titles survive a language that names a prototype member", () => {
  // `lang` is an argument a CLIENT types. A plain `labels[lang]` inherits
  // Object.prototype, so these tags returned a FUNCTION where the schema
  // promises `String!` — the field errored and nulled the whole node, which is
  // precisely the "no title answer" the chain is documented to make impossible.
  // "zxx" below is the easy half of totality (a MISSING key); these are the
  // half that actually broke it.
  it.each(["constructor", "toString", "hasOwnProperty", "__proto__"])(
    "lang=%s still answers with a usable title",
    async (lang) => {
      const uri = exampleDataset.entities[0]?.uri as string;
      const result = await execute(
        `query T($id: ID!, $lang: String) { node(id: $id) { _meta { title(lang: $lang) } } }`,
        { id: uri, lang },
      );
      expect(result.errors).toBeUndefined();
      const node = (
        result.data as { node: { _meta: { title: string } } | null }
      ).node;
      expect(node).not.toBeNull();
      expectUsableTitle(node?._meta.title);
    },
  );
});

describe("titles survive a language nobody wrote", () => {
  it.each(exampleDataset.entities.map((entity) => entity.uri))(
    "%s in an unwritten language",
    async (uri) => {
      const result = await execute(
        `query T($id: ID!) { node(id: $id) { _meta { title(lang: "zxx") } } }`,
        { id: uri },
      );
      expect(result.errors).toBeUndefined();
      const node = (
        result.data as { node: { _meta: { title: string } } | null }
      ).node;
      expectUsableTitle(node?._meta.title);
    },
  );
});

// ---------------------------------------------------------------------------
// `_meta.curie` is non-null for the same reason `title` is, so it gets the
// same treatment: driven from the dataset, never a hand-listed set.
// ---------------------------------------------------------------------------

describe("every entity in the dataset has a curie", () => {
  it.each(exampleDataset.entities.map((entity) => entity.uri))(
    "%s",
    async (uri) => {
      const result = await execute(
        `query C($id: ID!) { node(id: $id) { _meta { curie } } }`,
        { id: uri },
      );
      expect(result.errors).toBeUndefined();
      const node = (
        result.data as { node: { _meta: { curie: string } } | null }
      ).node;
      expect(node).not.toBeNull();
      expectUsableTitle(node?._meta.curie);
    },
  );
});

describe("every class in the dataset has a curie", () => {
  it.each(exampleDataset.classes.map((cls) => cls.uri))("%s", async (uri) => {
    const result = await execute(
      `query C($uri: String!) { ontologyClass(uri: $uri) { _meta { curie } } }`,
      { uri },
    );
    expect(result.errors).toBeUndefined();
    const cls = (
      result.data as { ontologyClass: { _meta: { curie: string } } | null }
    ).ontologyClass;
    expect(cls).not.toBeNull();
    expectUsableTitle(cls?._meta.curie);
  });
});

describe("the embeddable has a curie despite having no IRI", () => {
  const embedded = exampleDataset.entities
    .filter(isNetworkEntity)
    .filter((entity) => entity.location !== undefined);

  it.each(embedded.map((entity) => entity.uri))("%s", async (uri) => {
    const result = await execute(
      `query C($id: ID!) {
         node(id: $id) { ... on Station { location { _meta { curie } } }
                         ... on Interchange { location { _meta { curie } } } }
       }`,
      { id: uri },
    );
    expect(result.errors).toBeUndefined();
    const data = result.data as {
      node: { location: { _meta: { curie: string } } | null } | null;
    };
    expectUsableTitle(data.node?.location?._meta.curie);
  });
});

describe("curies actually compact, and resolve per namespace", () => {
  it("uses more than one prefix across the dataset", async () => {
    const result = await execute(`{ ontologies { prefix namespace } }`);
    const ontologies = (
      result.data as { ontologies: { prefix: string; namespace: string }[] }
    ).ontologies;

    const curies = await Promise.all(
      exampleDataset.entities.map(async (entity) => {
        const one = await execute(
          `query C($id: ID!) { node(id: $id) { _meta { curie } } }`,
          { id: entity.uri },
        );
        return (one.data as { node: { _meta: { curie: string } } }).node._meta
          .curie;
      }),
    );
    const prefixes = new Set(curies.map((curie) => curie.split(":")[0]));
    // Two namespaces hold entities, so a hardcoded prefix cannot pass here.
    expect(prefixes.size).toBeGreaterThan(1);
    for (const prefix of prefixes) {
      expect(ontologies.map((ontology) => ontology.prefix)).toContain(prefix);
    }
  });

  it("is shorter than the IRI it compacts, for every entity", async () => {
    for (const entity of exampleDataset.entities) {
      const result = await execute(
        `query C($id: ID!) { node(id: $id) { uri _meta { curie } } }`,
        { id: entity.uri },
      );
      const node = (
        result.data as { node: { uri: string; _meta: { curie: string } } }
      ).node;
      expect(node._meta.curie.length).toBeLessThan(node.uri.length);
    }
  });
});

// ---------------------------------------------------------------------------
// Routes, calls and diagram points are value types: `_meta` is non-null on
// them as on GeoPoint, and with no IRI the curie tier is the typename. Driven
// from the dataset's lines and stations, so a value added anywhere is checked.
// ---------------------------------------------------------------------------

describe("every value type has a title and a curie", () => {
  const routed = exampleDataset.entities
    .filter(isNetworkEntity)
    .filter((entity) => (entity.routes ?? []).length > 0);

  it("has routed lines in the dataset to check", () => {
    expect(routed.length).toBeGreaterThan(0);
  });

  it.each(routed.map((entity) => entity.uri))("%s's routes", async (uri) => {
    const result = await execute(
      `query V($id: ID!) {
         node(id: $id) { ... on Line { routes {
           label _meta { title curie }
           calls { _meta { title curie } }
         } } }
       }`,
      { id: uri },
    );
    expect(result.errors).toBeUndefined();
    const routes = (
      result.data as {
        node: {
          routes: {
            label: string;
            _meta: { title: string; curie: string };
            calls: { _meta: { title: string; curie: string } }[];
          }[];
        };
      }
    ).node.routes;
    expect(routes.length).toBeGreaterThan(0);
    for (const route of routes) {
      expectUsableTitle(route._meta.title);
      expect(route._meta.title).toBe(route.label);
      expect(route._meta.curie).toBe("Route");
      expect(route.calls.length).toBeGreaterThan(0);
      for (const call of route.calls) {
        expectUsableTitle(call._meta.title);
        expect(call._meta.curie).toBe("Call");
      }
    }
  });

  const positioned = exampleDataset.entities
    .filter(isNetworkEntity)
    .filter((entity) => entity.diagramPosition !== undefined);

  it("has positioned stations in the dataset to check", () => {
    expect(positioned.length).toBeGreaterThan(0);
  });

  it.each(positioned.map((entity) => entity.uri))(
    "%s's diagram position",
    async (uri) => {
      const result = await execute(
        `query V($id: ID!) {
         node(id: $id) { ... on Stop { diagramPosition { _meta { title curie } } } }
       }`,
        { id: uri },
      );
      expect(result.errors).toBeUndefined();
      const point = (
        result.data as {
          node: {
            diagramPosition: { _meta: { title: string; curie: string } } | null;
          };
        }
      ).node.diagramPosition;
      expect(point).not.toBeNull();
      expectUsableTitle(point?._meta.title);
      expect(point?._meta.curie).toBe("DiagramPoint");
    },
  );
});

// ---------------------------------------------------------------------------
// The fleet's positions are value types too: a formation's units are
// UnitPositions and a unit's cars are CarPositions. Driven from the dataset's
// formations and units, so a position added anywhere is checked.
// ---------------------------------------------------------------------------

describe("every fleet position has a title and a curie", () => {
  const formations = exampleDataset.entities.filter(
    (entity) => entity.typename === "Formation",
  );

  it("has formations in the dataset to check", () => {
    expect(formations.length).toBeGreaterThan(0);
  });

  it.each(formations.map((entity) => entity.uri))("%s's units", async (uri) => {
    const result = await execute(
      `query V($id: ID!) {
         node(id: $id) { ... on Formation { units { _meta { title curie } } } }
       }`,
      { id: uri },
    );
    expect(result.errors).toBeUndefined();
    const units = (
      result.data as {
        node: { units: { _meta: { title: string; curie: string } }[] };
      }
    ).node.units;
    expect(units.length).toBeGreaterThan(0);
    for (const unit of units) {
      expectUsableTitle(unit._meta.title);
      expect(unit._meta.curie).toBe("UnitPosition");
    }
  });

  const units = exampleDataset.entities.filter(
    (entity) => entity.typename === "Unit",
  );

  it("has units in the dataset to check", () => {
    expect(units.length).toBeGreaterThan(0);
  });

  it.each(units.map((entity) => entity.uri))("%s's cars", async (uri) => {
    const result = await execute(
      `query V($id: ID!) {
         node(id: $id) { ... on Unit { cars { _meta { title curie } } } }
       }`,
      { id: uri },
    );
    expect(result.errors).toBeUndefined();
    const cars = (
      result.data as {
        node: { cars: { _meta: { title: string; curie: string } }[] };
      }
    ).node.cars;
    expect(cars.length).toBeGreaterThan(0);
    for (const car of cars) {
      expectUsableTitle(car._meta.title);
      expect(car._meta.curie).toBe("CarPosition");
    }
  });
});

describe("the two entities that have nothing to be titled from", () => {
  it("titles the entity with no descriptive predicates at all", async () => {
    const result = await execute(
      `{ node(id: "${BARE_ENTITY_URI}") { _meta { title label comment definition } } }`,
    );
    expect(result.data).toEqual({
      node: {
        _meta: { title: "ghost", label: null, comment: null, definition: null },
      },
    });
  });

  it("titles the entity whose IRI has an empty local name", async () => {
    const custom = createExampleProvider(EMPTY_LOCAL_NAME_DATASET);
    const result = await graphql({
      schema: custom.schema,
      source: `{ node(id: "${EMPTY_LOCAL_NAME_URI}") { _meta { title } } }`,
      rootValue: custom.rootValue,
    });
    expect(result.data).toEqual({
      node: { _meta: { title: EMPTY_LOCAL_NAME_URI } },
    });
  });
});
