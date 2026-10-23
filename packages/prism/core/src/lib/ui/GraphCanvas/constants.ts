/** The narrowest and widest zoom the camera takes, from the fitted view. */
export const ZOOM_EXTENT: readonly [number, number] = [0.5, 2.4];

/** The factor one press of zoom in or zoom out applies. */
export const ZOOM_STEP = 1.2;

/**
 * The on-screen scale below which no text shows: 12px text drawn at 16px
 * would render below 12px.
 */
export const OVERVIEW_SCALE = 12 / 16;

/** The on-screen scale below which only 16px text shows: 14px text is 12px. */
export const HUBS_SCALE = 12 / 14;

/** The lattice's pitch, in world units: everything a graph draws sits on it. */
export const LATTICE_PITCH = 16;

/** The radius of one lattice dot, in world units. */
export const LATTICE_DOT_RADIUS = 1;

/**
 * How far past the graph the camera may pan, and the lattice reaches, as a
 * multiple of the viewBox's size on each side.
 */
export const PAN_MARGIN = 2;

/**
 * How far, in screen pixels, a press may move and still be a click rather
 * than a pan: the jitter of a hand on a trackpad.
 */
export const CLICK_DISTANCE = 4;

/** How long a camera move a control or a prop asks for takes, in ms. */
export const CAMERA_MOVE_MS = 200;

/** The media query under which every camera move is instant. */
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
