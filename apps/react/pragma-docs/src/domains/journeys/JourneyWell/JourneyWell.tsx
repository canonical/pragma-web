import { GraphCanvas } from "@canonical/prism-core";
import { Link } from "@canonical/router-react";
import type React from "react";
import { useMemo } from "react";
import { buildJourneyGraph } from "./buildJourneyGraph.js";
import { TAG_OFFSET, VIEW_MARGIN } from "./constants.js";
import requireHop from "./requireHop.js";
import truncateLabel from "./truncateLabel.js";
import type {
  JourneyGraphEdge,
  JourneyGraphNode,
  JourneyWellProps,
} from "./types.js";
import "./styles.css";

const componentCssClassName = "ds journey-well";

/** The corner radius of a hop's box, in SVG units. */
const NODE_RADIUS = 8;

/**
 * One hop in a journey, drawn in SVG. A JOB hop is a real router link — the
 * job is the lens's addressable thing (P-D7), so selecting one is a
 * navigation, not component state. A SURFACE hop links out to the docsite
 * route that surface lives at WHEN ONE EXISTS (`ROUTE_BY_SURFACE`); where
 * the site renders no such page the hop is plain text rather than a dead
 * link, which is the honest rendering of a surface we do not yet build.
 *
 * Every other hop is static text: coordinates and pairings are not places
 * on this site, and inventing addresses for them would be inventing pages.
 *
 * The label is cut to the node's width, since the server measures no text,
 * and the node's `<title>` keeps the full name.
 *
 * The kind rides as real text in a `data-kind` attribute AND as the hop's
 * column, so the distinction survives with styling off rather than living
 * in position alone.
 */
const Hop = ({
  node,
  selected,
}: {
  readonly node: JourneyGraphNode;
  readonly selected: boolean;
}): React.ReactElement => {
  const { data, width, height } = node;
  const text = (
    <text
      className="label"
      dominantBaseline="central"
      fill="currentColor"
      textAnchor="middle"
      x={width / 2}
      y={height / 2}
    >
      {truncateLabel(data.label)}
    </text>
  );
  let body: React.ReactElement;
  if (data.kind === "job") {
    body = (
      <Link className="link" params={{ job: data.uri }} to="journeysJob">
        {text}
      </Link>
    );
  } else if (data.href !== undefined) {
    body = (
      <a className="link" href={data.href}>
        {text}
      </a>
    );
  } else {
    body = text;
  }
  return (
    <g
      className={selected ? "hop is-selected" : "hop"}
      data-id={node.id}
      data-kind={data.kind}
      transform={`translate(${node.x},${node.y})`}
    >
      <title>{data.label}</title>
      <rect
        className="shell"
        fill="currentColor"
        height={height}
        rx={NODE_RADIUS}
        width={width}
      />
      <rect
        className="outline"
        fill="none"
        height={height}
        rx={NODE_RADIUS}
        stroke="currentColor"
        width={width}
      />
      {body}
      {data.surfaceType === undefined ? null : (
        <text
          className="tag"
          fill="currentColor"
          textAnchor="middle"
          x={width / 2}
          y={height + TAG_OFFSET}
        >
          {data.surfaceType}
        </text>
      )}
    </g>
  );
};

/**
 * An edge's path: from its source's right middle to its target's left
 * middle, a cubic that leaves and lands horizontally. The layout connects
 * only hops it has placed, so both ends are in `byId`; an end that is not
 * fails at `requireHop`.
 */
const drawEdge = (
  edge: JourneyGraphEdge,
  byId: ReadonlyMap<string, JourneyGraphNode>,
): string => {
  const source = requireHop(byId, edge.source);
  const target = requireHop(byId, edge.target);
  const x1 = source.x + source.width;
  const y1 = source.y + source.height / 2;
  const x2 = target.x;
  const y2 = target.y + target.height / 2;
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
};

/**
 * The well's legend: what the columns mean and what an edge's weight says.
 * Static markup — the vocabulary is the ontology's, fixed at build time,
 * so nothing here reads the graph.
 *
 * The LAYOUT column's note is the honest-absence statement in the
 * interface itself: most surfaces compose no layout, and the empty column
 * is the signal rather than a rendering fault.
 */
const JourneyLegend = (): React.ReactElement => (
  <div className="journey-furniture journey-legend">
    <p className="journey-legend-title">Reading a row</p>
    <ol className="journey-legend-columns">
      <li>Coordinate — who, in what role, at what fluency</li>
      <li>Job — the demand, in the reader&rsquo;s own words</li>
      <li>Pairing — the commitment that serves it</li>
      <li>Surface — where it is served</li>
      <li>Layout — the composition, where one is composed</li>
    </ol>
    <p className="journey-legend-note">
      A row that ends at its surface composes no layout. That is the
      model&rsquo;s own silence, not a missing link.
    </p>
  </div>
);

/**
 * The Journeys lens's centre panel: the demand model's left-to-right
 * spine in an underground well (the `.ds.underground` hook — the
 * depression you look INTO, AX.3), drawn as SVG in prism-core's
 * `GraphCanvas`, which pans and zooms it.
 *
 * THE SSR DETERMINISM CONTRACT, in one place:
 *   - positions come from `buildJourneyGraph` and are pure over the data;
 *   - node dimensions are explicit constants, never measured;
 *   - the viewBox is the nodes' bounds with a margin, so the first paint
 *     fits the graph with no measurement, and the camera's transform is
 *     written on the client only;
 *   - there is NO client-only state in this component at all — no hover,
 *     no focus, no filter. The whole component is a pure function of its
 *     props, so the first client render reproduces the server's markup by
 *     construction rather than by argument.
 *
 * WHAT DECORATION MEANS HERE. `pairingRole` becomes edge WEIGHT and
 * `arrival` becomes edge DECORATION, both through classNames the
 * stylesheet owns (see `buildJourneyGraph`'s `roleClassName` /
 * `arrivalClassName`). Neither ever moves a node: the layout is a function
 * of the model's shape alone, so two renders of the same data are
 * byte-identical whatever the roles say.
 *
 * Accessibility posture: the well carries an accessible name and its job
 * hops are real links — but the COMPLETE keyboard path through the lens
 * is the JourneyRail, which lists every job this graph draws; the well is
 * a spatial view over the same nouns, never the only route to any of them.
 *
 * Containment: nothing inside the well uses `position: fixed` — the
 * canvas's `container-type` makes it the containing block for fixed
 * descendants (INTRINSIC-GRID.md entry 5), so a fixed element here would
 * silently anchor to the wrong box.
 */
const JourneyWell = ({
  className,
  coordinates,
  job,
}: JourneyWellProps): React.ReactElement => {
  const { nodes, edges } = useMemo(
    () => buildJourneyGraph(coordinates),
    [coordinates],
  );
  const byId = useMemo(
    () => new Map(nodes.map((node) => [node.id, node])),
    [nodes],
  );
  // The nodes' bounds with a margin; the layout's origin is its top-left
  // node, and a surface's tag below its node stays inside the margin.
  const viewBox = useMemo(() => {
    const right = Math.max(0, ...nodes.map((node) => node.x + node.width));
    const bottom = Math.max(0, ...nodes.map((node) => node.y + node.height));
    return {
      x: -VIEW_MARGIN,
      y: -VIEW_MARGIN,
      width: right + 2 * VIEW_MARGIN,
      height: bottom + 2 * VIEW_MARGIN,
    };
  }, [nodes]);
  // Selection is the URL's job: the camera pans it into view.
  const selected = job === undefined ? undefined : byId.get(job);

  return (
    <div
      className={[componentCssClassName, "underground", className]
        .filter(Boolean)
        .join(" ")}
      data-slot="journeys-canvas"
    >
      {/* The ONE floating hint over the graph, which the canvas hangs under
          its controls bar. Its text is a pure function of `job` (the URL —
          identical on server and client), so it costs the hydration
          argument nothing. */}
      <GraphCanvas
        hint={
          job === undefined
            ? "Showing the default coordinate — select a job, from the rail or the diagram, to centre the graph on it"
            : "Drag to pan · scroll to zoom · select a job to inspect it"
        }
        label="Journeys from demand to surface"
        reveal={selected}
        viewBox={viewBox}
      >
        <g className="edges">
          {edges.map((edge) => (
            <path
              className={["edge", edge.className].filter(Boolean).join(" ")}
              d={drawEdge(edge, byId)}
              data-source={edge.source}
              data-target={edge.target}
              fill="none"
              key={edge.id}
              stroke="currentColor"
            />
          ))}
        </g>
        <g className="hops">
          {nodes.map((node) => (
            <Hop key={node.id} node={node} selected={node.id === job} />
          ))}
        </g>
      </GraphCanvas>
      <JourneyLegend />
    </div>
  );
};

export default JourneyWell;
