/**
 * The settings cell, mounted on its own in a header row: it draws what the
 * table was given as its settings, hands that the table's settings menu,
 * and attaches to the table's geometry.
 */
import { render, screen } from "@testing-library/react";
import { type ReactNode, useContext } from "react";
import { describe, expect, it, vi } from "vitest";
import { SettingsMenuContext } from "../../../../common/index.js";
import type { SettingsMenuProps } from "../SettingsMenu/index.js";
import SettingsCell from "./SettingsCell.js";
import type { SettingsCellProps } from "./types.js";

/** The table's header row, as it draws it: a div with the role. */
const HeaderRow = ({ children }: { readonly children: ReactNode }) => (
  // biome-ignore lint/a11y/useSemanticElements: the table's own header row is a div with this role, which the cell sits in
  // biome-ignore lint/a11y/useFocusableInteractive: the row is structure, as the table's is
  <div role="row">{children}</div>
);

/** What a table's settings draw: the menu the cell hands them. */
const Settings = () => useContext(SettingsMenuContext);

/** A menu over no columns, every callback a spy. */
const MENU: SettingsMenuProps = {
  settings: [],
  resettable: false,
  hydrated: true,
  onChange: () => {},
  onReset: () => {},
  listDestinations: () => null,
};

/** The cell given these settings, its geometry a spy. */
const mount = (props: Partial<SettingsCellProps> = {}) => {
  const release = vi.fn();
  const reserve = vi.fn((_cell: HTMLDivElement) => release);
  const view = render(
    <HeaderRow>
      <SettingsCell
        settings={<Settings />}
        menu={MENU}
        reserve={reserve}
        {...props}
      />
    </HeaderRow>,
  );
  return { ...view, reserve, release };
};

describe("SettingsCell", () => {
  it("is a column header drawing the settings it was given", () => {
    mount({ settings: <span>Arrange</span> });
    expect(screen.getByRole("columnheader")).toHaveTextContent("Arrange");
  });

  it("hands the settings the table's menu, rendered", () => {
    mount();
    expect(screen.getByRole("columnheader")).toContainElement(
      screen.getByRole("button", { name: "Table settings" }),
    );
  });

  it("attaches itself to the table's geometry, and lets go on unmount", () => {
    const { reserve, release, unmount } = mount();
    expect(reserve).toHaveBeenCalledWith(screen.getByRole("columnheader"));
    unmount();
    expect(release).toHaveBeenCalledTimes(1);
  });

  it("draws as the header cell's settings part", () => {
    mount();
    expect(screen.getByRole("columnheader")).toHaveClass(
      "ds",
      "data-table-header-cell",
      "settings",
    );
  });
});
