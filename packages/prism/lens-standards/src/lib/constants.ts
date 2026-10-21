/**
 * The Standards lens's domain constants: the page size it asks the graph
 * for, and the language its group headings are ordered in.
 */

/**
 * One page of the bound class's instances. 100 is a size this lens chooses,
 * not a contract fact: ke-graphql clamps at 100 and silently truncates a
 * larger ask, while the metro provider does not clamp at all (it only
 * defaults to 20 when neither `first` nor `last` is given). 100 is therefore
 * safe on both. A graph may carry more standards than one page, so the index
 * pairs it with an explicit "Load more" rather than an invisible truncation,
 * and never states a total of its own: the graph's counts move.
 */
export const STANDARDS_PAGE_SIZE = 100;

/**
 * The language the index orders its groups in: the catalog's. A fixed
 * locale, never the runtime's default, so the server and the browser order
 * the groups the same way and the markup hydrates.
 */
export const COLLATION_LOCALE = "en";
