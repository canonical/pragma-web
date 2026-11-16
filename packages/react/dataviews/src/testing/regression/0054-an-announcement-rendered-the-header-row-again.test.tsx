/**
 * Regression: an announcement rendered the table's header row again.
 *
 * Before the fix, what the table last announced was state of the table
 * itself, so saying something — "Name is always shown", which changes no
 * arrangement — rendered the table again and every header cell with it.
 * The announcer holds what it says, and saying something renders its region
 * alone.
 *
 * Header cells are counted by a pass-through counter: a spy that runs the
 * real cell on every render. React offers no per-component render count to
 * read otherwise, as regression 0014 found.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  buildMachine,
  createMachineProvider,
  fakeAnnouncerClock,
  installPopoverStandIn,
  openMenuFrom,
  readAnnouncements,
} from "../../../testing/index.js";
import HeaderCell from "../../lib/_work_in_progress/common/ScopedDataTable/common/HeaderCell/HeaderCell.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";
import { DataViews } from "../../lib/_work_in_progress/DataViews/index.js";

vi.mock(
  "../../lib/_work_in_progress/common/ScopedDataTable/common/HeaderCell/HeaderCell.js",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../lib/_work_in_progress/common/ScopedDataTable/common/HeaderCell/HeaderCell.js")
      >();
    return { default: vi.fn(actual.default) };
  },
);

const renders = vi.mocked(HeaderCell);

beforeEach(() => {
  fakeAnnouncerClock();
});

describe("regression 0054 — an announcement rendered the header row again", () => {
  let uninstallPopovers: () => void;
  beforeAll(() => {
    uninstallPopovers = installPopoverStandIn();
  });
  afterAll(() => {
    uninstallPopovers();
  });

  it("renders no header cell to say that a column is always shown", async () => {
    const { provider } = createMachineProvider({
      rows: [buildMachine("m-1", "alpha")],
    });
    render(
      <DataTable
        provider={provider}
        columns={[
          { id: "name", header: "Name", hideable: false },
          { id: "status", header: "Status" },
        ]}
        label="Machines"
        settings={<DataViews.Settings />}
      />,
    );
    await openMenuFrom(screen.getByRole("button", { name: "Table settings" }));
    const item = screen.getByRole("menuitem", {
      name: "Name is always shown",
    });
    expect(renders).toHaveBeenCalled();
    renders.mockClear();
    fireEvent.click(item);
    expect(await readAnnouncements()).toEqual(["Name is always shown"]);
    expect(renders).not.toHaveBeenCalled();
  });
});
