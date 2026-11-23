/**
 * The decorators every story of the package shares: the application scope
 * the parts assume, the root over the machines, and the frames a layout or
 * a panel would put them in.
 */

export { default as withAppScope } from "./withAppScope.js";
export { default as withFrame } from "./withFrame.js";
export { default as withMachineRoot } from "./withMachineRoot.js";
export { default as withScrollingFrame } from "./withScrollingFrame.js";
