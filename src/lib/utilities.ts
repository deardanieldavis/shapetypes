// tslint:disable:readonly-array
import { Polygon, Polyline, shapetypesSettings } from '../index';

/**
 * The relationship between a point and an object. The point can either be [[inside]],
 * [[outside]], [[coincident]] (meaning it is on the edge), or [[unset]].
 */
export enum PointContainment {
  unset,
  inside,
  outside,
  coincident
}

/**
 * The orientation of a curve. The orientation can either be [[clockwise]], [[counterclockwise]], or [[undefined]].
 */
export enum CurveOrientation {
  undefined,
  clockwise,
  counterclockwise
}

/**
 * @ignore
 *
 * Checks whether two values are equal within a set tolerance
 *
 * https://stackoverflow.com/questions/14582122/check-whether-the-number-is-nearly-equal-javascript
 *
 * @param value1
 * @param value2
 * @param epsilon
 */
export function approximatelyEqual(
  value1: number,
  value2: number,
  epsilon: number = shapetypesSettings.absoluteTolerance
): boolean {
  return Math.abs(value1 - value2) <= epsilon;
}

/**
 * @ignore
 */
export function isPolylineArray(value: any): value is Polyline[] {
  if (value instanceof Array) {
    if (value.length > 0) {
      if (value[0] instanceof Polyline) {
        return true;
      }
    }
  }
  return false;
}

/**
 * @ignore
 */
export function isPolygonArray(value: any): value is Polygon[] {
  if (value instanceof Array) {
    if (value.length > 0) {
      if (value[0] instanceof Polygon) {
        return true;
      }
    }
  }
  return false;
}
