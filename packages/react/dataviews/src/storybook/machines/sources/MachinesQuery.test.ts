import { describe, expect, it } from "vitest";
import { MACHINES_QUERY_TEXT, MACHINES_QUERY_VARIABLES } from "../api/index.js";
import MachinesQuery from "./MachinesQuery.js";

describe("MachinesQuery", () => {
  it("is the request for the endpoint's query text", () => {
    expect(MachinesQuery.kind).toBe("Request");
    expect(MachinesQuery.params).toMatchObject({
      name: "MachinesQuery",
      operationKind: "query",
      text: MACHINES_QUERY_TEXT,
    });
  });

  it("declares every variable as a local argument", () => {
    expect(
      MachinesQuery.fragment.argumentDefinitions.map(({ name }) => name),
    ).toEqual(MACHINES_QUERY_VARIABLES);
    expect(MachinesQuery.operation.argumentDefinitions).toBe(
      MachinesQuery.fragment.argumentDefinitions,
    );
  });

  it("selects the machines connection, passing each variable", () => {
    const machines = MachinesQuery.operation.selections.at(0);
    expect(machines).toMatchObject({
      kind: "LinkedField",
      name: "machines",
      concreteType: "MachineConnection",
      plural: false,
    });
    expect(machines).toHaveProperty(
      "args",
      MACHINES_QUERY_VARIABLES.map((name) => ({
        kind: "Variable",
        name,
        variableName: name,
      })),
    );
    expect(MachinesQuery.fragment.selections.at(0)).toBe(machines);
  });

  it("selects each machine's fields on a plural edge list", () => {
    const machines = MachinesQuery.operation.selections.at(0);
    const selections =
      machines !== undefined && "selections" in machines
        ? machines.selections
        : [];
    const edges = selections.find(
      (selection) => "name" in selection && selection.name === "edges",
    );
    expect(edges).toMatchObject({ plural: true, concreteType: "MachineEdge" });
    expect(JSON.stringify(edges)).toContain('"concreteType":"Machine"');
    for (const field of ["id", "name", "status", "cores", "region", "owner"]) {
      expect(JSON.stringify(edges)).toContain(
        `{"alias":null,"args":null,"kind":"ScalarField","name":"${field}","storageKey":null}`,
      );
    }
    expect(
      selections.find(
        (selection) => "name" in selection && selection.name === "facets",
      ),
    ).toHaveProperty("args", [
      { kind: "Variable", name: "fields", variableName: "facets" },
    ]);
  });
});
