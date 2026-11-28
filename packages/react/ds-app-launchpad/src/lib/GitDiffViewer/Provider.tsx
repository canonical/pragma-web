import { forwardRef, useCallback, useState } from "react";
import Context from "./Context.js";
import "./styles.css";
import type { ContextOptions, ProviderOptions } from "./types.js";

const componentCssClassName = "ds git-diff-viewer";

const Provider = forwardRef<HTMLDivElement, ProviderOptions>(
  (
    {
      className,
      children,
      diff,
      lineDecorations,
      wrapLines,
      isCollapsed,
      onCollapseToggle,
      ...props
    },
    ref,
  ): React.ReactElement => {
    const [addCommentOpenLocations, setAddCommentOpenLocations] = useState<
      Set<number>
    >(new Set());

    const toggleAddCommentLocation = useCallback(
      (lineNumber: number) => {
        const newSet = new Set(addCommentOpenLocations);
        if (newSet.has(lineNumber)) {
          newSet.delete(lineNumber);
        } else {
          newSet.add(lineNumber);
        }
        setAddCommentOpenLocations(newSet);
      },
      [addCommentOpenLocations],
    );

    return (
      <Context.Provider
        // Each all-or-none option group arrives whole from the props type;
        // destructuring it out of the native props only hides that pairing.
        value={
          {
            diff,
            lineDecorations,
            wrapLines,
            isCollapsed,
            onCollapseToggle,
            addCommentOpenLocations,
            toggleAddCommentLocation,
          } as ContextOptions
        }
      >
        <div
          className={[componentCssClassName, className]
            .filter(Boolean)
            .join(" ")}
          {...props}
          ref={ref}
        >
          {children}
        </div>
      </Context.Provider>
    );
  },
);

export default Provider;
