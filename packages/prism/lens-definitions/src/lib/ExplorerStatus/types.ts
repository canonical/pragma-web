/** Props accepted by `ExplorerStatus`. */
export interface ExplorerStatusProps {
  /** Additional CSS class names. */
  className?: string;
  /** How many classes the graph currently shows. */
  readonly visible: number;
  /** How many classes exist in total, across every ontology. */
  readonly total: number;
  /** How many of the visible classes are abstract. */
  readonly abstract: number;
}
