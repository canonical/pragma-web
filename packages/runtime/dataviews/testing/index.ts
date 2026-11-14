/**
 * Test doubles for the core and its framework bindings: a manual source, a
 * recording location, stand-in stores, and builders of pages, counts,
 * stored views and display statuses.
 */

export { default as buildPage } from "./buildPage.js";
export { default as buildStoredView } from "./buildStoredView.js";
export { default as countExactly } from "./countExactly.js";
export { default as createManualSource } from "./createManualSource.js";
export { default as createRecordingLocation } from "./createRecordingLocation.js";
export { default as createStandInPresentationStore } from "./createStandInPresentationStore.js";
export { default as createStandInViewStore } from "./createStandInViewStore.js";
export { default as readDisplayStatus } from "./readDisplayStatus.js";
export type {
  ManualCall,
  ManualSource,
  ManualSourceConfig,
  RecordedWrite,
  RecordingLocation,
} from "./types.js";
