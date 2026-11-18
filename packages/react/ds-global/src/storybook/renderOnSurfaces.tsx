import type { ReactElement, ReactNode } from "react";

/** Spans every column of the enclosing `.grid`. */
const gridSpanAll = { gridColumn: "1 / -1" } as const;

/** The padding around each band's component. */
const SURFACE_BAND_PADDING = "5rem";

/**
 * Renders one full-width surface band, with the next level nested below it.
 * @param level - this band's surface level (0-based).
 * @param renderAtLevel - the component to place at a given level.
 */
const SurfaceBand = ({
  level,
  renderAtLevel,
}: {
  level: number;
  renderAtLevel: (level: number) => ReactNode;
}): ReactElement => (
  <div
    className="surface"
    style={{
      background: "var(--surface-color-background, var(--color-background))",
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
    }}
  >
    <div className="subgrid" style={{ padding: SURFACE_BAND_PADDING }}>
      {renderAtLevel(level)}
    </div>
    {level < 2 ? (
      <SurfaceBand level={level + 1} renderAtLevel={renderAtLevel} />
    ) : null}
  </div>
);

/**
 * Renders a component on three nested surface bands, one per level.
 * @param renderAtLevel - returns the node to place at a given level (0-based).
 */
export default function renderOnSurfaces(
  renderAtLevel: (level: number) => ReactNode,
): ReactElement {
  return (
    <div style={{ minHeight: "100vh", overflow: "auto", ...gridSpanAll }}>
      <SurfaceBand level={0} renderAtLevel={renderAtLevel} />
    </div>
  );
}
