import type { ElementType, ReactElement } from "react";

/** The size of the canvas `withSvg` draws a story on, in pixels. */
interface SvgCanvas {
  readonly width: number;
  readonly height: number;
}

/**
 * Storybook decorator that puts an SVG component in the canvas it draws on:
 * an `<svg>` of the size the story's `svg` parameter names, its user units
 * the canvas's pixels, as a graph draws its nodes, so a graph node's `<g>`
 * root renders as native SVG.
 *
 * @returns The decorator.
 *
 * @example
 * ```ts
 * decorators: [withSvg()],
 * parameters: { svg: { width: 240, height: 50 } },
 * ```
 */
const withSvg =
  () =>
  (
    Story: ElementType,
    { parameters }: { readonly parameters: { readonly svg?: SvgCanvas } },
  ): ReactElement => {
    const { width, height } = parameters.svg ?? { width: 0, height: 0 };
    return (
      <svg
        aria-label="Graph"
        height={height}
        role="img"
        viewBox={`0 0 ${width} ${height}`}
        width={width}
      >
        <Story />
      </svg>
    );
  };

export default withSvg;
