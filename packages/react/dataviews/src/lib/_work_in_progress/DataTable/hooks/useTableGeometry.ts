import {
  buildColumnTemplate,
  type ColumnLayoutState,
  type ColumnSizing,
  type ColumnToSize,
  type ResolvedColumn,
  resolveColumns,
} from "@canonical/dataviews-core/bindings";
import { useCallback, useMemo, useRef, useState } from "react";
import { useDataViewsValue } from "../../../hooks/index.js";
import { areTracksEqual } from "../common/utils/index.js";
import type { UseTableGeometryProps, UseTableGeometryResult } from "./types.js";

/**
 * Give a flexible last column whatever width the others leave, up to its
 * own maximum: its trailing edge is the table's own edge, so it is never
 * resized on its own and grows and shrinks as the columns before it are.
 * Space past a capped or fixed last column is the table's, not a column's,
 * and stays empty rather than stretching the column past its declaration.
 * Nothing changes once the columns no longer fit, or before the container
 * is measured.
 */
const fillLast = (
  columns: readonly ResolvedColumn[],
  available: number | null,
  sizing: ColumnSizing | undefined,
): readonly ResolvedColumn[] => {
  const last = columns.at(-1);
  if (available === null || last === undefined || sizing?.kind !== "flex") {
    return columns;
  }
  const spare =
    available - columns.reduce((total, column) => total + column.width, 0);
  const width = Math.min(
    last.width + spare,
    sizing.maxPx ?? Number.POSITIVE_INFINITY,
  );
  return width > last.width
    ? [...columns.slice(0, -1), { id: last.id, width }]
    : columns;
};

/**
 * Call `onResize` with each resize of one element. Returns the disconnect,
 * or nothing where there is no observer.
 *
 * @note Impure: observes the element until the returned disconnect is called.
 */
const observeResize = (
  element: HTMLElement,
  onResize: (entry: ResizeObserverEntry) => void,
): (() => void) | undefined => {
  if (typeof ResizeObserver === "undefined") {
    return undefined;
  }
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      onResize(entry);
    }
  });
  observer.observe(element);
  return () => {
    observer.disconnect();
  };
};

/**
 * Resolve one mounted table's geometry.
 *
 * Widths are published once, as the container's track list, rather than
 * written onto every cell. Before the container is measured the tracks are
 * declarative, so the baseline is aligned and server output deterministic;
 * afterwards the solver's pixel vector is published, which is what capping
 * and resizing need. The presentation is untouched while a resize
 * previews: the preview only replaces its own column's track.
 *
 * The columns are resolved against the container's content width less the
 * selection track, whose width is the stylesheet's: it is read back from the
 * cell that track sizes, observed for as long as that cell is there.
 *
 * Two tables on one provider read one presentation, so they share the
 * arrangement while resolving their own widths against their own container.
 */
export default function useTableGeometry({
  layout,
  interaction,
  columnIds,
}: UseTableGeometryProps): UseTableGeometryResult {
  const [container, setContainer] = useState<number | null>(null);
  const [reserved, setReserved] = useState(0);
  const interactionState = useDataViewsValue(interaction.state);

  const attach = useCallback(
    (node: HTMLDivElement): (() => void) | undefined => {
      // Inside the border, which is no room for a column. The observer's
      // first report, which follows at once, is the exact content width.
      setContainer(node.clientWidth);
      return observeResize(node, (entry) => {
        setContainer(entry.contentRect.width);
      });
    },
    [],
  );

  // Each reserving cell's last measured width: the selection column's and
  // the settings cell's are the stylesheet's tracks, and the columns share
  // what both leave.
  const reservations = useRef(new Map<HTMLDivElement, number>());
  const publishReserved = useCallback((): void => {
    let total = 0;
    for (const width of reservations.current.values()) {
      total += width;
    }
    setReserved(total);
  }, []);
  // Observed on its own: the track is sized in rem, so a root font-size
  // change moves it with no change to the container. Read as its layout
  // width every time — never its bounding box, which an ancestor's
  // transform would scale.
  const reserve = useCallback(
    (cell: HTMLDivElement): (() => void) => {
      const measure = (): void => {
        reservations.current.set(cell, cell.offsetWidth);
        publishReserved();
      };
      measure();
      const disconnect = observeResize(cell, measure);
      return () => {
        disconnect?.();
        reservations.current.delete(cell);
        publishReserved();
      };
    },
    [publishReserved],
  );

  const width = container === null ? null : Math.max(0, container - reserved);

  // Rebuilt only when the column list changes, so it runs once per layout
  // publication — never per frame of a preview, which publishes none — and
  // the tracks keep one reference while they read the same.
  const selectTracks = useCallback(
    (snapshot: ColumnLayoutState): readonly ColumnToSize[] =>
      columnIds.map((id) => ({
        id,
        // The snapshot's own override, else the declaration — whose guard
        // is the one answer to a column the layout never declared. An own
        // property only, as the layout itself reads its overrides.
        sizing:
          (Object.hasOwn(snapshot.overrides, id)
            ? snapshot.overrides[id]
            : undefined) ?? layout.readDeclared(id),
      })),
    [columnIds, layout],
  );
  const tracks = useDataViewsValue(layout.state, selectTracks, areTracksEqual);

  // Resolving against zero yields each column's own reservation, which is
  // exactly the width a resize should capture before the container is
  // measured — so the unmeasured case needs no separate fallback.
  const resolved = useMemo(
    () => resolveColumns(tracks, width ?? 0),
    [tracks, width],
  );
  const lastSizing = tracks.at(-1)?.sizing;
  const filled = useMemo(
    () => fillLast(resolved, width, lastSizing),
    [resolved, width, lastSizing],
  );
  const widths = useMemo(() => filled.map((column) => column.width), [filled]);

  const preview =
    interactionState.status === "resizing"
      ? { id: interactionState.columnId, width: interactionState.previewWidth }
      : undefined;

  // The published template is rebuilt per render rather than memoised: it
  // costs one pass over the columns, and a live preview would defeat the
  // memo anyway. The solved vector is handed over rather than re-solved:
  // before the container is measured the tracks are declarative, and after
  // it they are the widths just resolved.
  // A live preview is substituted before the last column is filled, so the
  // last column follows the edge being dragged rather than waiting for the
  // commit.
  const live =
    width === null
      ? null
      : preview === undefined
        ? filled
        : fillLast(
            resolved.map((column) =>
              column.id === preview.id
                ? { id: column.id, width: preview.width }
                : column,
            ),
            width,
            lastSizing,
          );
  return {
    attach,
    reserve,
    // No columns, no tracks: nothing is published, and a selectable table's
    // template keeps its selection track alone rather than turning invalid.
    template:
      tracks.length === 0 ? undefined : buildColumnTemplate(tracks, live),
    widths,
  };
}
