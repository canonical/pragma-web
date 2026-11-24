/* @canonical/generator-ds 0.9.0-experimental.12 */
import type React from "react";
import { DetailedChangeMarker, SimpleChangeMarker } from "./common/index.js";
import "./styles.css";
import type { DiffChangeMarkerProps, DiffChangeType } from "./types.js";

const componentCssClassName = "ds diff-change-marker";

/**
 * Displays a visual indicator for file changes in a diff (added, modified, deleted)
 * Can be displayed in detailed or simple style
 * @returns {React.ReactElement} - Rendered DiffChangeMarker
 */
const DiffChangeMarker = ({
  markerStyle,
  additions,
  deletions,
  type,
  className,
  ...props
}: DiffChangeMarkerProps & {
  additions?: number;
  deletions?: number;
  type?: DiffChangeType;
}): React.ReactElement => {
  const isManual = type !== undefined;

  const getChangeType = (): DiffChangeType => {
    if (isManual) {
      return type as DiffChangeType;
    }
    if (additions && deletions) {
      return "modified";
    }
    if (additions) {
      return "added";
    }
    if (deletions) {
      return "deleted";
    }
    return "modified";
  };

  const formatChangeType = (type: DiffChangeType): string => {
    switch (type) {
      case "added":
        return "Added";
      case "deleted":
        return "Removed";
      case "modified":
        return "Modified";
    }
  };

  const changeType = getChangeType();

  return (
    <div
      className={[componentCssClassName, `style-${markerStyle}`, className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {markerStyle === "detailed" ? (
        isManual ? (
          <DetailedChangeMarker
            {...{ [changeType]: formatChangeType(changeType) }}
          />
        ) : (
          <DetailedChangeMarker
            deleted={(deletions ?? 0) > 0 ? `-${deletions}` : undefined}
            added={(additions ?? 0) > 0 ? `+${additions}` : undefined}
          />
        )
      ) : (
        <SimpleChangeMarker changeType={changeType} />
      )}
    </div>
  );
};

export default DiffChangeMarker;
