/* @canonical/generator-canonical-ds 0.0.1 */
import type React from "react";
import { useGitDiffViewer } from "../../../../hooks/index.js";
import "./styles.css";
import type { DiffLineProps } from "./types.js";

const componentCssClassName = "ds diff-line";
const firstHunkLineCssClassName = "is-first-hunk";

/**
 * Displays a single line of a diff as a table row with line numbers.
 *
 * @returns {React.ReactElement} - Rendered DiffLine
 */
const DiffLine = ({
  onLineClick,
  className,
  type,
  content,
  hunkHeader,
  hunkIndex,
  addLineNumber,
  removeLineNumber,
  ...props
}: DiffLineProps & {
  hunkHeader?: string;
  hunkIndex?: number;
  addLineNumber?: number;
  removeLineNumber?: number;
}): React.ReactElement => {
  const { wrapLines } = useGitDiffViewer();
  const typeClass = `diff-line-${type}`;
  const isInteractive = Boolean(onLineClick);

  return (
    <tr
      className={[
        componentCssClassName,
        typeClass,
        isInteractive && "interactive",
        className,
        type === "hunk" && hunkIndex === 0 && firstHunkLineCssClassName,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <td
        className={`diff-gutter ${wrapLines ? "wrap" : ""} ${type}`}
        tabIndex={isInteractive && type !== "hunk" ? 0 : undefined}
        onClick={onLineClick}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            onLineClick?.();
          }
        }}
        onKeyDown={undefined}
      >
        {type === "hunk" ? (
          "\u00A0"
        ) : (
          <div className="diff-line-numbers">
            {isInteractive && (
              <span className="comment-icon">
                <svg
                  width={16}
                  height={16}
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Comment</title>
                  <use href="#comment-icon" />
                </svg>
              </span>
            )}
            <span className="line-num">
              {type === "add" ? "+" : removeLineNumber}
            </span>
            <span className="line-num">
              {type === "remove" ? "-" : addLineNumber}
            </span>
          </div>
        )}
      </td>
      <td className={`diff-content ${wrapLines ? "wrap" : ""}`}>
        {type === "hunk" ? (
          <pre>{hunkHeader}</pre>
        ) : (
          <pre
            // biome-ignore lint/security/noDangerouslySetInnerHtml: syntax highlighting requires adding generated HTML
            dangerouslySetInnerHTML={{
              __html: content ? content : "\u00A0",
            }}
          />
        )}
      </td>
    </tr>
  );
};

export default DiffLine;
