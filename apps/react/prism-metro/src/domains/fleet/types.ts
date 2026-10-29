/** The way a car faces in a train: towards its front, or towards its rear. */
export type CarFacing = "front" | "rear";

/** One car as its unit lists it, read off the graph. */
export interface UnitCar {
  /** The car type's short code, such as `DM`. */
  readonly code: string;
  /** The car type's title, such as "Series 90 driving motor car". */
  readonly title: string;
  /** The car's length in whole millimetres, over couplers. */
  readonly length: number;
  /** True when the car has a driving cab at its leading end. */
  readonly hasCab: boolean;
  /** True when the car's leading end faces the rear of its unit. */
  readonly reversed: boolean;
}

/** One unit as its formation lists it, its cars from the unit's front. */
export interface FormationUnit {
  /** True when the unit runs last car first in the formation. */
  readonly reversed: boolean;
  /** The unit's cars, from the unit's own front. */
  readonly cars: readonly UnitCar[];
}

/**
 * One car in a train, in train order: its car type's facts, and the way it
 * faces in the train in place of the way it faces in its unit.
 */
export type TrainCar = Omit<UnitCar, "reversed"> & {
  /** The way the car faces in the train. */
  readonly facing: CarFacing;
  /** The place of the car's unit in the train, counted from 1. */
  readonly unitPosition: number;
};

/** One car of a train's side view: where it sits, and its outline. */
export interface CarDrawing extends TrainCar {
  /** Where the car's length starts, from the train's front. */
  readonly start: number;
  /** Where the car's length ends, from the train's front. */
  readonly end: number;
  /** The car body's outline, as SVG path data. */
  readonly path: string;
}

/** A train's side view, laid out against a scale shared with others. */
export interface TrainGeometry {
  /** The width of the drawing's space: the shared scale. */
  readonly width: number;
  /** The height of the drawing's space: one car body. */
  readonly height: number;
  /** The train's length: where its last car ends. */
  readonly length: number;
  /** Every car, from the train's front. */
  readonly cars: readonly CarDrawing[];
  /** Where each coupling between two units falls, from the front. */
  readonly couplings: readonly number[];
}

/** A stop a line calls at, with its shortest platform. */
export interface PlatformStop {
  /** The stop's title. */
  readonly title: string;
  /** The stop's shortest platform in millimetres, or null when unknown. */
  readonly platformLength: number | null;
}

/** A line a formation runs on, with the stops it calls at. */
export interface PlatformLine {
  /** The line's title. */
  readonly title: string;
  /** The line's short code. */
  readonly code: string;
  /** The stops the line calls at. */
  readonly stops: readonly PlatformStop[];
}

/** A stop whose platform a train is longer than. */
export interface Overhang {
  /** The stop's title. */
  readonly title: string;
  /** The stop's shortest platform, in millimetres. */
  readonly platformLength: number;
  /** How far the train runs past the platform, in millimetres. */
  readonly excess: number;
}

/** How a train fits the platforms of one line. */
export interface LineFit {
  /** The line's title. */
  readonly title: string;
  /** The line's short code. */
  readonly code: string;
  /** The line's shortest known platform, or null when none is known. */
  readonly shortest: number | null;
  /** Every stop the train overhangs, the largest excess first. */
  readonly overhangs: readonly Overhang[];
}

/** The kinds of fleet node that have a page of their own. */
export type FleetNodeKind = "stock" | "formation" | "unit" | "carType";

/** One fact of a fleet node: its term and its value, as a reader reads them. */
export interface FleetFact {
  readonly term: string;
  readonly value: string;
}
