import type { ReactElement } from "react";
import { DateTime } from "../DateTime/index.js";
import { Marker } from "../Marker/index.js";
import type { EventProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds data-timeline-event";

/**
 * One event: its marker on the axis, then its actor, description and date,
 * and any custom content beneath. A fully custom event draws its marker and
 * its custom content alone.
 */
export default function Event({
  item,
  markerSize,
  dateTimePosition,
  formats,
  control,
}: EventProps): ReactElement {
  const actor =
    item.showName === false ? undefined : (item.actorName ?? item.actorId);
  const actorNode =
    actor === undefined ? null : item.actorLink === undefined ? (
      <span className="actor">{actor}</span>
    ) : (
      <a className="actor" href={item.actorLink}>
        {actor}
      </a>
    );
  const written =
    item.showDateTime === false || item.dateTime === ""
      ? null
      : formats.format(item.dateTime);
  const dateNode =
    written === null || written.display === "" ? null : (
      <DateTime
        value={item.dateTime}
        display={written.display}
        alternate={written.alternate}
        tooltip={formats.tooltip}
        toggleable={formats.toggleable}
        pressed={formats.mode === "relative"}
        onToggle={formats.toggle}
      />
    );
  const description =
    item.showDescription === false || item.description === undefined ? null : (
      <div className="payload">{item.description}</div>
    );
  const leading = dateTimePosition === "leading";
  return (
    <div
      className={[componentCssClassName, item.criticality]
        .filter(Boolean)
        .join(" ")}
    >
      {leading ? dateNode : null}
      <div className="marker">
        <Marker
          size={markerSize}
          marker={item.marker}
          href={item.actorLink}
          label={item.actorName ?? item.actorId}
          redundant={actorNode !== null && item.actorLink !== undefined}
        />
      </div>
      {item.fullyCustom === true ? (
        <div className="custom full">
          {control}
          {item.customContent ?? item.description}
        </div>
      ) : (
        <div className="content">
          <div className="row">
            {control}
            {actorNode}
            {description}
            {leading ? null : dateNode}
          </div>
          {item.customContent === undefined ? null : (
            <div className="custom">{item.customContent}</div>
          )}
        </div>
      )}
    </div>
  );
}
