import type { ReactElement, ReactNode } from "react";

/** Spans every column of the enclosing `.grid`. */
const gridSpanAll = { gridColumn: "1 / -1" } as const;

/** The block padding around each band's component. */
const SURFACE_BAND_PADDING = "5rem";

/**
 * One full-width surface band with its component, then the next, deeper band
 * flush below. Surface levels step by nesting.
 */
function SurfaceBand({
  level,
  renderAtLevel,
}: {
  level: number;
  renderAtLevel: (level: number) => ReactNode;
}): ReactElement {
  return (
    <div
      className="surface"
      style={{
        background: "var(--surface-color-background, var(--color-background))",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
      }}
    >
      {/* `.subgrid` passes the page grid's columns through when there is one. */}
      <div className="subgrid" style={{ padding: SURFACE_BAND_PADDING }}>
        {renderAtLevel(level)}
      </div>
      {level < 2 ? (
        <SurfaceBand level={level + 1} renderAtLevel={renderAtLevel} />
      ) : null}
    </div>
  );
}

/**
 * Renders `renderAtLevel` on three nested surface bands, one per level.
 *
 * @param renderAtLevel - returns the node for a level (0-based).
 */
export default function renderSurfaces(
  renderAtLevel: (level: number) => ReactNode,
): ReactElement {
  return (
    <div style={{ minHeight: "100vh", overflow: "auto", ...gridSpanAll }}>
      <SurfaceBand level={0} renderAtLevel={renderAtLevel} />
    </div>
  );
}
