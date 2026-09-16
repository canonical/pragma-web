/**
 * A row's declared type was read by each renderer: a table row and a card
 * each took a reader from its renderer, which asked the provider's host, and
 * each subscribed to the whole record to run it. The same fact had one
 * reading per renderer and none in the row scopes that hold every other
 * per-row fact.
 *
 * The row scopes read it with the collection's compiled reader and publish
 * it on each row's `type` channel, which notifies only when a record returns
 * as another type.
 */

import { describe, expect, it } from "vitest";
import buildRowModel from "../../../testing/buildRowModel.js";
import { compileRecordTypeReader } from "../../lib/bindings/index.js";
import { createCollection } from "../../lib/collection/index.js";
import { createChannel } from "../../lib/observable/index.js";
import { createRowScopes, type RowModel } from "../../lib/rows/index.js";
import { createSelection } from "../../lib/selection/index.js";

type Instance = {
  readonly id: string;
  readonly type: string;
  readonly name: string;
};

const identify = (instance: Instance): string => instance.id;

describe("a row's declared type", () => {
  it("is published by the row's scopes, read by the collection's reader", () => {
    const collection = createCollection({
      identify,
      discriminator: "type",
      fields: [
        { field: "type", kind: "choices", options: ["container", "vm"] },
        { field: "name", kind: "text" },
      ],
    });
    const rows = createChannel<RowModel<Instance>>(
      buildRowModel({
        identify,
        rows: [{ id: "i-1", type: "container", name: "a" }],
      }),
    );
    const scopes = createRowScopes({
      rows,
      selection: createSelection(),
      fields: ["name"],
      readType: compileRecordTypeReader(collection),
    });
    const detach = scopes.observe();
    const type = scopes.readRow("i-1").type;
    let heard = 0;
    const stop = type.subscribe(() => {
      heard += 1;
    });
    const publish = (next: Instance): void => {
      rows.set(buildRowModel({ identify, rows: [next], previous: rows.get() }));
    };
    // Renamed, same type: nothing for a type watcher.
    publish({ id: "i-1", type: "container", name: "b" });
    expect(heard).toBe(0);
    publish({ id: "i-1", type: "vm", name: "b" });
    expect(type.get()).toBe("vm");
    expect(heard).toBe(1);
    // A name the collection does not declare is no type.
    publish({ id: "i-1", type: "appliance", name: "b" });
    expect(type.get()).toBeNull();
    stop();
    detach();
  });
});
