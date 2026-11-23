/**
 * The decorators every story of the package shares: the application scope
 * the parts assume, the root over the machines, the frames a layout or a
 * panel would put them in, a right-to-left context, and the markup a server
 * sends.
 */

export { default as withAppScope } from "./withAppScope.js";
export { default as withFrame } from "./withFrame.js";
export { default as withMachineRoot } from "./withMachineRoot.js";
export { default as withRightToLeft } from "./withRightToLeft.js";
export { default as withScrollingFrame } from "./withScrollingFrame.js";
export { default as withServerMarkup } from "./withServerMarkup.js";
