import { render, screen } from "@testing-library/react";
import { Profiler } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  elementAt,
  observeWorkloadRows,
  silenceRenderErrors,
  WORKLOAD_RECORDS,
  WORKLOAD_RETYPED,
} from "../../../../testing/index.js";
import type { DisplayFieldCellProps } from "../DisplayField/index.js";
import FieldContent from "./FieldContent.js";

const web = elementAt(WORKLOAD_RECORDS, 0);

describe("FieldContent", () => {
  describe("the default text", () => {
    it("spells the value where the field applies", () => {
      const { scopes, readApplicability } = observeWorkloadRows();
      const channels = scopes.readRow("w-1");
      const { container } = render(
        <FieldContent
          channels={channels}
          field="image"
          columnId="image"
          cell={undefined}
          readApplicability={readApplicability}
        />,
      );
      expect(container).toHaveTextContent(/^ubuntu\/24\.04$/);
    });

    it("redraws when the record returns as another type", () => {
      const { scopes, readApplicability, replace } = observeWorkloadRows();
      const channels = scopes.readRow("w-1");
      const { container } = render(
        <FieldContent
          channels={channels}
          field="cores"
          columnId="cores"
          cell={undefined}
          readApplicability={readApplicability}
        />,
      );
      replace([WORKLOAD_RETYPED]);
      expect(container).toHaveTextContent(/^4$/);
    });
  });

  describe("a field's own content", () => {
    it("is handed the value, the record and the applicability", () => {
      const { scopes, readApplicability } = observeWorkloadRows();
      const channels = scopes.readRow("w-1");
      const drawn = vi.fn(
        ({ value, record, applicability }: DisplayFieldCellProps) =>
          `${String(value)} of ${String(record["name"])}: ${applicability}`,
      );
      render(
        <FieldContent
          channels={channels}
          field="image"
          columnId="runs"
          cell={drawn}
          readApplicability={readApplicability}
        />,
      );
      expect(screen.getByText("ubuntu/24.04 of web: applies")).toBeVisible();
      expect(drawn).toHaveBeenLastCalledWith(
        {
          value: "ubuntu/24.04",
          record: web,
          applicability: "applies",
          rowId: "w-1",
          columnId: "runs",
        },
        undefined,
      );
    });

    it("is handed no value where the field does not apply", () => {
      const { scopes, readApplicability } = observeWorkloadRows();
      const channels = scopes.readRow("w-1");
      const drawn = vi.fn(
        ({ value, applicability }: DisplayFieldCellProps) =>
          `${String(value)}: ${applicability}`,
      );
      render(
        <FieldContent
          channels={channels}
          field="cores"
          columnId="cores"
          cell={drawn}
          readApplicability={readApplicability}
        />,
      );
      expect(screen.getByText("undefined: not-applicable")).toBeVisible();
    });

    it("draws again once for a replaced record, while the default text does not", () => {
      const { scopes, readApplicability, replace } = observeWorkloadRows();
      const channels = scopes.readRow("w-1");
      const drawn = vi.fn(({ record }: DisplayFieldCellProps) =>
        String(record["image"]),
      );
      const plain = vi.fn();
      render(
        <>
          <FieldContent
            channels={channels}
            field="image"
            columnId="custom"
            cell={drawn}
            readApplicability={readApplicability}
          />
          <Profiler id="plain" onRender={plain}>
            <FieldContent
              channels={channels}
              field="image"
              columnId="image"
              cell={undefined}
              readApplicability={readApplicability}
            />
          </Profiler>
        </>,
      );
      expect(drawn).toHaveBeenCalledTimes(1);
      // The same image, another name: only the record moved.
      replace([{ ...web, name: "web-2" }]);
      expect(drawn).toHaveBeenCalledTimes(2);
      expect(plain).toHaveBeenCalledTimes(1);
    });
  });

  it("throws for a field the row's channels do not observe", () => {
    silenceRenderErrors();
    const { scopes, readApplicability } = observeWorkloadRows();
    const channels = scopes.readRow("w-1");
    expect(() =>
      render(
        <FieldContent
          channels={channels}
          field="zone"
          columnId="zone"
          cell={undefined}
          readApplicability={readApplicability}
        />,
      ),
    ).toThrow('no channel observes the field "zone"');
  });
});
