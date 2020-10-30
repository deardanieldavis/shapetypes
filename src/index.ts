// The order files are imported here is important to fix circular dependencies
// https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de
export * from './lib/settings';
export { PointContainment, CurveOrientation, approximatelyEqual } from './lib/utilities';

export * from './lib/geometry';

export * from './lib/transform';
export * from './lib/vector';

export * from './lib/boundingBox';
export * from './lib/circle';
export * from './lib/intersection';
export * from './lib/interval';
export * from './lib/intervalSorted';
export * from './lib/line';
export * from './lib/point';
export * from './lib/plane';
export * from './lib/polygon';
export * from './lib/polyline';
export * from './lib/ray';
export * from './lib/rectangle';

export * as Intersection from './lib/intersection/index';
