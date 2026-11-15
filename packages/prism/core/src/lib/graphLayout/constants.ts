/**
 * The layered layout's geometry and type: every length it places by, on a
 * 16px lattice (boxes, columns and waypoints sit on multiples of 16; ports,
 * arrowheads and labels on the 4px grid inside them), and the advance
 * widths of the shipped font it measures labels with, so no browser
 * measures anything.
 */

import type { FontMetrics, PortLevel } from "./types.js";

/** The lattice every node, column, region and waypoint sits on, in px. */
export const LATTICE = 16;

/** The gap between two boxes in one column, in px. */
export const ROW_GAP = 16;

/** The slot a waypoint takes in a column's stack, in px. */
export const WAYPOINT_SLOT = 16;

/** How far a subclass bus runs from its channel's left edge, in px. */
export const BUS_OFFSET = 16;

/** The gap between a region's prefix and its class count, in px. */
export const REGION_LABEL_GAP = 8;

/** Where a self-loop leaves the top side and returns to the right side, in px from the top-right corner. */
export const LOOP_INSET = 8;

/** An arrowhead's length and width, in px. */
export const HEAD_SIZE = 8;

/** A same-column arc's least bulge, in px. */
export const ARC_BASE = 16;

/** The bulge each nesting level adds to a same-column arc, in px. */
export const ARC_NEST = 8;

/** How far a same-column arc running beside a subclass bus keeps from it, in px. */
export const BUS_CLEARANCE = 12;

/** The type size of the canvas's labels and counts, in px. */
export const LABEL_SIZE = 14;

/** The type size of a region's prefix, in px. */
export const REGION_LABEL_SIZE = 16;

/** The height of a region's label row, in px. */
export const REGION_LABEL_ROW = 32;

/** The margin of a collision box around its box, in px. */
export const COLLISION_MARGIN = 4;

/** The pitch of an edge label's stacked lines, in px. */
export const LABEL_LINE_PITCH = 16;

/** The halo around an edge label's text, in px. */
export const LABEL_HALO = 3;

/** How far above or below its anchor an edge label may sit, in px. */
export const LABEL_OFFSET = 12;

/** The fractions along an edge where its label is tried centred, in order. */
export const LABEL_CENTRED_AT: readonly number[] = [0.5, 0.35, 0.65];

/** The fractions along an edge where its label is tried above or below. */
export const LABEL_BESIDE_AT: readonly number[] = [0.5, 0.35, 0.65, 0.2, 0.8];

/** A self-loop shows at most this many predicates before "+n". */
export const LOOP_LABEL_LINES = 3;

/** The arrows an opposite pair's predicates carry. */
export const DIRECTION_ARROWS = {
  right: "→",
  left: "←",
  down: "↓",
  up: "↑",
} as const;

/**
 * The port spacings a side tries in turn: 4px apart, 8px from the corners
 * and 8px from the subclass tick; on a hub 4px from the tick. A side that
 * needs the last level fails the port rule and the layout reports it.
 */
export const PORT_LEVELS: readonly PortLevel[] = [
  { name: "strict", corner: 8, tick: 8, spacing: 4 },
  { name: "hub clearance", corner: 8, tick: 4, spacing: 4 },
  { name: "below the hub clearance", corner: 4, tick: 2, spacing: 2 },
];

/**
 * The advance widths of Ubuntu Sans, the shipped font, for ASCII 32 to 126
 * in the three faces the canvas sets (regular, bold, bold italic), with the
 * tabular figures, in font units. Read from the woff2 files under
 * `packages/styles/typography/example/fonts`, kerning ignored; any other
 * character measures 0.6em.
 */
export const FONT_METRICS: FontMetrics = {
  unitsPerEm: 1000,
  ascender: 940,
  descender: -260,
  fallbackEm: 0.6,
  faces: {
    regular: {
      advances: {
        "0": 564,
        "1": 564,
        "2": 564,
        "3": 564,
        "4": 564,
        "5": 564,
        "6": 564,
        "7": 564,
        "8": 564,
        "9": 564,
        " ": 229,
        "!": 275,
        '"': 400,
        "#": 658,
        $: 564,
        "%": 841,
        "&": 654,
        "'": 241,
        "(": 315,
        ")": 315,
        "*": 475,
        "+": 564,
        ",": 246,
        "-": 289,
        ".": 246,
        "/": 368,
        ":": 246,
        ";": 246,
        "<": 564,
        "=": 564,
        ">": 564,
        "?": 389,
        "@": 944,
        A: 650,
        B: 635,
        C: 613,
        D: 706,
        E: 561,
        F: 526,
        G: 663,
        H: 697,
        I: 256,
        J: 492,
        K: 609,
        L: 509,
        M: 869,
        N: 714,
        O: 776,
        P: 598,
        Q: 776,
        R: 624,
        S: 524,
        T: 556,
        U: 683,
        V: 635,
        W: 924,
        X: 616,
        Y: 579,
        Z: 566,
        "[": 317,
        "\\": 368,
        "]": 317,
        "^": 564,
        _: 491,
        "`": 366,
        a: 514,
        b: 585,
        c: 465,
        d: 585,
        e: 552,
        f: 381,
        g: 575,
        h: 571,
        i: 243,
        j: 243,
        k: 505,
        l: 262,
        m: 863,
        n: 571,
        o: 585,
        p: 585,
        q: 585,
        r: 379,
        s: 434,
        t: 393,
        u: 571,
        v: 488,
        w: 776,
        x: 505,
        y: 482,
        z: 460,
        "{": 325,
        "|": 269,
        "}": 325,
        "~": 564,
      },
      tabular: {
        "0": 564,
        "1": 564,
        "2": 564,
        "3": 564,
        "4": 564,
        "5": 564,
        "6": 564,
        "7": 564,
        "8": 564,
        "9": 564,
      },
    },
    bold: {
      advances: {
        "0": 564,
        "1": 564,
        "2": 564,
        "3": 564,
        "4": 564,
        "5": 564,
        "6": 564,
        "7": 564,
        "8": 564,
        "9": 564,
        " ": 237,
        "!": 283,
        '"': 449,
        "#": 689,
        $: 564,
        "%": 899,
        "&": 692,
        "'": 245,
        "(": 346,
        ")": 346,
        "*": 495,
        "+": 564,
        ",": 246,
        "-": 327,
        ".": 246,
        "/": 420,
        ":": 246,
        ";": 246,
        "<": 564,
        "=": 564,
        ">": 564,
        "?": 438,
        "@": 966,
        A: 703,
        B: 663,
        C: 639,
        D: 729,
        E: 595,
        F: 562,
        G: 692,
        H: 725,
        I: 301,
        J: 520,
        K: 665,
        L: 549,
        M: 890,
        N: 746,
        O: 786,
        P: 632,
        Q: 786,
        R: 656,
        S: 568,
        T: 599,
        U: 701,
        V: 700,
        W: 942,
        X: 660,
        Y: 641,
        Z: 599,
        "[": 357,
        "\\": 420,
        "]": 357,
        "^": 564,
        _: 498,
        "`": 306,
        a: 543,
        b: 599,
        c: 491,
        d: 599,
        e: 576,
        f: 412,
        g: 589,
        h: 585,
        i: 278,
        j: 278,
        k: 560,
        l: 302,
        m: 862,
        n: 585,
        o: 601,
        p: 599,
        q: 599,
        r: 411,
        s: 472,
        t: 431,
        u: 585,
        v: 534,
        w: 782,
        x: 542,
        y: 531,
        z: 490,
        "{": 359,
        "|": 309,
        "}": 359,
        "~": 564,
      },
      tabular: {
        "0": 564,
        "1": 564,
        "2": 564,
        "3": 564,
        "4": 564,
        "5": 564,
        "6": 564,
        "7": 564,
        "8": 564,
        "9": 564,
      },
    },
    boldItalic: {
      advances: {
        "0": 564,
        "1": 564,
        "2": 564,
        "3": 564,
        "4": 564,
        "5": 564,
        "6": 564,
        "7": 564,
        "8": 564,
        "9": 564,
        " ": 238,
        "!": 290,
        '"': 472,
        "#": 662,
        $: 564,
        "%": 861,
        "&": 667,
        "'": 269,
        "(": 354,
        ")": 354,
        "*": 496,
        "+": 564,
        ",": 258,
        "-": 339,
        ".": 260,
        "/": 433,
        ":": 260,
        ";": 259,
        "<": 564,
        "=": 564,
        ">": 564,
        "?": 426,
        "@": 948,
        A: 704,
        B: 658,
        C: 642,
        D: 724,
        E: 589,
        F: 569,
        G: 687,
        H: 711,
        I: 304,
        J: 512,
        K: 658,
        L: 554,
        M: 878,
        N: 737,
        O: 765,
        P: 633,
        Q: 765,
        R: 653,
        S: 553,
        T: 589,
        U: 685,
        V: 678,
        W: 931,
        X: 653,
        Y: 641,
        Z: 628,
        "[": 368,
        "\\": 406,
        "]": 368,
        "^": 564,
        _: 523,
        "`": 277,
        a: 584,
        b: 580,
        c: 487,
        d: 589,
        e: 531,
        f: 430,
        g: 581,
        h: 572,
        i: 282,
        j: 288,
        k: 557,
        l: 314,
        m: 852,
        n: 572,
        o: 573,
        p: 575,
        q: 588,
        r: 423,
        s: 475,
        t: 417,
        u: 578,
        v: 536,
        w: 814,
        x: 538,
        y: 524,
        z: 514,
        "{": 367,
        "|": 306,
        "}": 367,
        "~": 564,
      },
      tabular: {
        "0": 564,
        "1": 564,
        "2": 564,
        "3": 564,
        "4": 564,
        "5": 564,
        "6": 564,
        "7": 564,
        "8": 564,
        "9": 564,
      },
    },
  },
};
