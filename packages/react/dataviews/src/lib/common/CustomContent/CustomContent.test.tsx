/**
 * A field's own content: handed the value, the record, the applicability and
 * its identities; handed no value where the field does not apply; and drawn
 * again when the record returns as another type with its value unchanged.
 */
import {
  compileRecordTypeReader,
  createRowScopes,
  readProviderHost,
} from "@canonical/dataviews-core/bindings";
import { act, render } from "@testing-library/react";
import { describe, expect, it, onTestFinished } from "vitest";
import { deliverRows } from "../../../../testing/fixtures.js";
import {
  buildContainer,
  buildVirtualMachine,
  createInstanceProvider,
  type Instance,
  instances,
} from "../../../../testing/instances.js";
import type { DisplayFieldCellProps } from "../DisplayField/index.js";
import CustomContent from "./CustomContent.js";

/** One instance row's channels, typed, observed and released after the test. */
const observeInstance = () => {
  const { provider } = createInstanceProvider();
  const host = readProviderHost(provider);
  host.complete(
    host.refresh(),
    deliverRows<Instance>([buildContainer("i-1", "web-01")]),
  );
  const scopes = createRowScopes({
    rows: provider.rows,
    selection: provider.selection,
    fields: ["name"],
    readType: compileRecordTypeReader(instances),
  });
  const release = scopes.observe();
  onTestFinished(release);
  const channels = scopes.readRow("i-1");
  const channel = channels.fields["name"];
  if (channel === undefined) {
    throw new Error("the name field is observed");
  }
  const republish = (rows: readonly Instance[]) => {
    act(() => {
      host.complete(host.refresh(), deliverRows<Instance>(rows));
    });
  };
  return { channels, channel, republish };
};

const Spelled = ({
  value,
  record,
  applicability,
  rowId,
  columnId,
}: DisplayFieldCellProps) =>
  `${String(value)}:${(record as { type: string }).type}:${applicability}:${rowId}:${columnId}`;

describe("CustomContent", () => {
  it("hands its content the value, the record and its identities", () => {
    const { channels, channel } = observeInstance();
    const { container } = render(
      <CustomContent
        Content={Spelled}
        channels={channels}
        channel={channel}
        columnId="host"
        applicability="applies"
      />,
    );
    expect(container).toHaveTextContent(/^web-01:container:applies:i-1:host$/);
  });

  it("hands no value where the field does not apply", () => {
    const { channels, channel } = observeInstance();
    const { container } = render(
      <CustomContent
        Content={Spelled}
        channels={channels}
        channel={channel}
        columnId="host"
        applicability="not-applicable"
      />,
    );
    expect(container).toHaveTextContent(/^undefined:container:not-applicable/);
  });

  it("draws again when the record returns as another type, its value unchanged", () => {
    const { channels, channel, republish } = observeInstance();
    const { container } = render(
      <CustomContent
        Content={Spelled}
        channels={channels}
        channel={channel}
        columnId="host"
        applicability="applies"
      />,
    );
    republish([buildVirtualMachine("i-1", "web-01")]);
    expect(container).toHaveTextContent(/^web-01:virtual-machine:/);
  });
});
