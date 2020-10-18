// tslint:disable:variable-name
// tslint:disable:no-let
import { BoundingBox } from './boundingBox';
import { Line } from './line';
import { Point } from './point';
import { Polygon } from './polygon';
import { Polyline } from './polyline';
import { Ray } from './ray';
import { shapetypesSettings } from './settings';

// TODO: Line circle
// TODO: Ray circle

// tslint:disable-next-line:no-namespace no-internal-module
export module Intersection {

  // -----------------------
  // LINES
  // -----------------------
  /**
   * Returns the parameters of an intersection between two lines.
   *
   * @param lineA
   * @param lineB
   * @constructor
   * @returns:    success: true if the lines intersect. eg. aren't parallel and intersection falls between end points.
   *              lineAu: parameter on lineA where the lines intersect. Will be between 0 & 1.
   *              lineBu: parameter on lineB where the lines intersect. Will be between 0 & 1.
   */
  export function LineLine(
    lineA: Line,
    lineB: Line,
    isInfinite: boolean = false
  ): { success: boolean; lineAu: number; lineBu: number } {
    // Based on:
    // https://github.com/davidfig/pixi-intersects/blob/master/src/shape.js
    const aX = lineA.direction.x;
    const aY = lineA.direction.y;
    const bX = lineB.direction.x;
    const bY = lineB.direction.y;

    const denominator = (-bX * aY + aX * bY);
    const diffX = (lineA.from.x - lineB.from.x);
    const diffY = (lineA.from.y - lineB.from.y);

    const s = (-aY * diffX + aX * diffY) / denominator;
    const t = (bX * diffY - bY * diffX) / denominator;


    if(isInfinite) {
      if (isFinite(s) && isFinite(t)) {
        return { success: true, lineAu: t, lineBu: s };
      }
    }
    if (-shapetypesSettings.absoluteTolerance <= s  && s <= 1+shapetypesSettings.absoluteTolerance && -shapetypesSettings.absoluteTolerance <= t && t <= 1+shapetypesSettings.absoluteTolerance) {
      return { success: true, lineAu: t, lineBu: s };
    }
    return { success: false, lineAu: 0, lineBu: 0 };
  }


  /**
   * Calculates intersection between a line and polyline
   * @param line
   * @param polyline
   * @returns: The parameters down [line] where intersections occur. If list empty, there were no intersections.
   */
  /*
  export function LinePoly(
    line: Line,
    poly: Polyline | Polygon
  ): readonly number[] {
    if(poly instanceof Polyline) {
      const intersections = new Array<number>();
      for (const edge of poly.segments) {
        const result = Intersection.LineLine(line, edge);
        if (result.success) {
          intersections.push(result.lineAu);
        }
      }
      return intersections.sort();
    } else {
      const intersections = new Array<number>();
      intersections.push(...Intersection.
      poly.boundary)
    }
  }*/






  // -----------------------
  // RAYS
  // -----------------------







  /**
   * Calculates the intersection between a ray and a line
   *
   * Based on:
   * https://github.com/davidfig/pixi-intersects/blob/master/src/shape.js
   *
   * @param ray: Ray to shoot into line
   * @param line: Line to test intersection with
   * @param bothSides: If true, will include intersections that happen behind the start point (eg. a negative rayU)
   * @returns:    success: true if the lines intersect. eg. aren't parallel.
   *              rayU: parameter along ray where intersection occurs. U is the same as distance since the ray is normalized.
   *              lineU: parameter on the line where the ray intersects. Will always be between 0 & 1, the bounds of the line.
   *
   */
  export function RayLine(
    ray: Ray,
    line: Line,
    bothSides = false
  ): { success: boolean; rayU: number; lineU: number } {
    // @ts-ignore
    // const a = dada();
    // const b = MyModule.data2();
    const p0_x = ray.from.x;
    const p0_y = ray.from.y;
    const p2_x = line.from.x;
    const p2_y = line.from.y;
    const s1_x = ray.direction.x;
    const s1_y = ray.direction.y;
    const s2_x = line.direction.x;
    const s2_y = line.direction.y;
    const s =
      (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) /
      (-s2_x * s1_y + s1_x * s2_y);
    const t =
      (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) /
      (-s2_x * s1_y + s1_x * s2_y);

    if (s >= 0 && s <= 1) {
      if (bothSides) {
        return { success: true, rayU: t, lineU: s };
      } else if (t >= 0) {
        return { success: true, rayU: t, lineU: s };
      }
    }
    return { success: false, rayU: 0, lineU: 0 };
  }

  export function RayRay(
    rayA: Ray,
    rayB: Ray,
    bothSides = false
  ): { success: boolean; rayAU: number; rayBU: number } {
    const p0_x = rayA.from.x;
    const p0_y = rayA.from.y;
    const p2_x = rayB.from.x;
    const p2_y = rayB.from.y;
    const s1_x = rayA.direction.x;
    const s1_y = rayA.direction.y;
    const s2_x = rayB.direction.x;
    const s2_y = rayB.direction.y;
    const s =
      (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) /
      (-s2_x * s1_y + s1_x * s2_y);
    const t =
      (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) /
      (-s2_x * s1_y + s1_x * s2_y);

    if (bothSides) {
      return { success: true, rayAU: t, rayBU: s };
    } else if (t >= 0 && s >= 0) {
      return { success: true, rayAU: t, rayBU: s };
    }

    return { success: false, rayAU: 0, rayBU: 0 };
  }

  /**
   * Calculates intersections between a ray and a polyline
   * @param ray:
   * @param polyline:
   * @param includeZero: Whether to include the start point of the ray in the intersections
   * @param bothSides: If true, will include intersections that happen behind the start point of the ray (eg. a negative rayU)
   * @returns: List of intersections. Each value is the distance along the ray where the intersection occurs.
   */
  export function RayPolyline(
    ray: Ray,
    polyline: Polyline,
    includeZero: boolean = false,
    bothSides = false
  ): readonly number[] {
    const intersections = new Array<number>();
    for (const edge of polyline.segments) {
      const result = Intersection.RayLine(ray, edge, bothSides);
      if (result.success) {
        if (includeZero) {
          intersections.push(result.rayU);
        } else {
          if (result.rayU > 0.0001 || result.rayU < -0.0001) {
            intersections.push(result.rayU);
          }
        }
      }
    }
    // tslint:disable-next-line:only-arrow-functions typedef
    const sortedIntersections = intersections.sort(function(a, b) {
      return a - b;
    });
    return sortedIntersections;
  }

  export function RayPolygon(
    ray: Ray,
    polygon: Polygon,
    includeZero: boolean = false,
    bothSides = false
  ): readonly number[] {
    const intersections = new Array<number>();

    intersections.push(
      ...Intersection.RayPolyline(ray, polygon.boundary, includeZero, bothSides)
    );
    for (const hole of polygon.holes) {
      intersections.push(
        ...Intersection.RayPolyline(ray, hole, includeZero, bothSides)
      );
    }

    // tslint:disable-next-line:only-arrow-functions typedef
    const sortedIntersections = intersections.sort(function(a, b) {
      return a - b;
    });
    return sortedIntersections;
  }







  /**
   * Calculates the intersection between a horizontal ray and the polyline.
   *
   * This is more efficient than RayPolyline because it uses HorizontalRayLine to discard edges before calling the intersection calcultation
   * @param start
   * @param polyline
   * @constructor
   */
  export function HorizontalRayPolyline(
    start: Point,
    polyline: Polyline
  ): readonly number[] {
    const intersections = new Array<number>();
    for (const edge of polyline.segments) {
      const result = Intersection.HorizontalRayLine(start, edge);
      if (result.success) {
        intersections.push(result.rayU);
      }
    }

    return intersections;
  }

  /**
   * Calculates the intersection between two polylines
   * @param a
   * @param b
   * @constructor
   * @returns: List of all the points where the polylines intersect
   */
  export function PolylinePolyline(a: Polyline, b: Polyline): readonly Point[] {
    const intersections = new Array<Point>();

    // The polylines can only intersect if the bounding boxes overlap
    const result = BoundingBox.intersection(a.boundingBox, b.boundingBox);
    if (result !== undefined) {
      for (const edgeA of a.segments) {
        for (const edgeB of b.segments) {
          const result2 = Intersection.LineLine(edgeA, edgeB);
          if (result2.success) {
            intersections.push(edgeA.pointAt(result2.lineAu));
          }
        }
      }
    }
    return intersections;
  }

  /**
   * Calculates the intersection between a horizontal ray starting at [start] and intersecting with [line].
   *
   * This is more efficient than the LineLineInfinite algorithm because it can identify whether a line will intersect with
   * the ray prior to running the intersection calculation. This allows many lines to be discarded early.
   *
   * @param start: The start point for the ray, which will run in the [1,0] direction
   * @param line: The line to test the intersection with
   * @constructor
   */
  export function HorizontalRayLine(
    start: Point,
    line: Line
  ): { success: boolean; rayU: number; lineU: number } {
    let isAbove = false;
    let isBelow = false;

    // For an intersection to happen, at least one end of the line must be in front of the ray start point.
    if (line.from.x >= start.x || line.to.x >= start.x) {
      // For an intersection to happen, one end of the line must be above the ray, and the other end must be below it
      if (line.from.y === start.y) {
        isAbove = true;
        isBelow = true;
      } else if (line.from.y > start.y) {
        isAbove = true;
      } else {
        isBelow = true;
      }

      if (line.to.y === start.y) {
        isAbove = true;
        isBelow = true;
      } else if (line.to.y > start.y) {
        isAbove = true;
      } else {
        isBelow = true;
      }

      if (isAbove && isBelow) {
        const result = Intersection.HorizontalRayLineIntersection(start, line);
        if (result.success) {
          if (result.lineU >= 0 && result.lineU <= 1) {
            if (result.rayU > 0.0001) {
              return result;
            }
          }
        }
      }
    }
    return { success: false, rayU: 0, lineU: 0 };
  }

  /**
   * An optimized version of RayLine, that assumes the ray is always horizontal.
   *
   * Based on:
   * https://github.com/davidfig/pixi-intersects/blob/master/src/shape.js
   *
   * @param start: Start point for the ray
   * @param line:
   * @constructor
   * @returns:    sucess: true if the lines intersect. eg. aren't parallel.
   *              rayU: parameter on ray where the intersection occurs.
   *              lineU: parameter on line where the intersection occurs. If 0 <= lineBu <= 1, intersection is in the bounds of the line.
   */
  export function HorizontalRayLineIntersection(
    start: Point,
    line: Line
  ): { success: boolean; rayU: number; lineU: number } {
    const p0_x = start.x;
    const p0_y = start.y;
    const p2_x = line.from.x;
    const p2_y = line.from.y;
    const s2_x = line.direction.x;
    const s2_y = line.direction.y;
    const s = (p0_y - p2_y) / s2_y;
    const t = (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / s2_y;

    if (isFinite(s) && isFinite(t)) {
      return { success: true, rayU: t, lineU: s };
    }
    return { success: false, rayU: 0, lineU: 0 };
  }
}
