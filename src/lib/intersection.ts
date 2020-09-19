// tslint:disable:variable-name
// tslint:disable:no-let
import { BoundingBox } from './boundingBox';
import { Line } from './line';
import { Point } from './point';
import { Polygon } from './polygon';
import { Polyline } from './polyline';
import { Ray } from './ray';

export class Intersection {
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
  public static RayLine(
    ray: Ray,
    line: Line,
    bothSides = false
  ): { success: boolean; rayU: number; lineU: number } {
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

  public static RayRay(
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
  public static RayPolyline(
    ray: Ray,
    polyline: Polyline,
    includeZero: boolean = false,
    bothSides = false
  ): readonly number[] {
    const intersections = new Array<number>();
    for (const edge of polyline.getSegments()) {
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

  public static RayPolygon(
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
   * Calculates the intersection between two infinite lines
   *
   * Based on:
   * https://github.com/davidfig/pixi-intersects/blob/master/src/shape.js
   *
   * @param lineA
   * @param lineB
   * @constructor
   * @returns:    sucess: true if the lines intersect. eg. aren't parallel.
   *              lineAu: parameter on lineA where the lines intersect. If 0 <= lineAu <= 1, intersection is in the bounds of the line.
   *              lineBu: parameter on lineB where the lines intersect. If 0 <= lineBu <= 1, intersection is in the bounds of the line.
   */
  public static LineLineInfinite(
    lineA: Line,
    lineB: Line
  ): { success: boolean; lineAu: number; lineBu: number } {
    const p0_x = lineA.from.x;
    const p0_y = lineA.from.y;
    const p1_x = lineA.to.x;
    const p1_y = lineA.to.y;
    const p2_x = lineB.from.x;
    const p2_y = lineB.from.y;
    const p3_x = lineB.to.x;
    const p3_y = lineB.to.y;
    const s1_x = p1_x - p0_x;
    const s1_y = p1_y - p0_y;
    const s2_x = p3_x - p2_x;
    const s2_y = p3_y - p2_y;
    const s =
      (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) /
      (-s2_x * s1_y + s1_x * s2_y);
    const t =
      (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) /
      (-s2_x * s1_y + s1_x * s2_y);

    if (isFinite(s) && isFinite(t)) {
      return { success: true, lineAu: t, lineBu: s };
    }
    return { success: false, lineAu: 0, lineBu: 0 };
  }

  /**
   * Calculates the intersection between two finite lines
   *
   * Based on:
   * https://github.com/davidfig/pixi-intersects/blob/master/src/shape.js
   *
   * @param lineA
   * @param lineB
   * @constructor
   * @returns:    sucess: true if the lines intersect. eg. aren't parallel and intersection falls between end points.
   *              lineAu: parameter on lineA where the lines intersect. Will be between 0 & 1.
   *              lineBu: parameter on lineB where the lines intersect. Will be between 0 & 1.
   */
  public static LineLine(
    lineA: Line,
    lineB: Line
  ): { success: boolean; lineAu: number; lineBu: number } {
    const p0_x = lineA.from.x;
    const p0_y = lineA.from.y;
    const p1_x = lineA.to.x;
    const p1_y = lineA.to.y;
    const p2_x = lineB.from.x;
    const p2_y = lineB.from.y;
    const p3_x = lineB.to.x;
    const p3_y = lineB.to.y;
    const s1_x = p1_x - p0_x;
    const s1_y = p1_y - p0_y;
    const s2_x = p3_x - p2_x;
    const s2_y = p3_y - p2_y;
    const s =
      (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) /
      (-s2_x * s1_y + s1_x * s2_y);
    const t =
      (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) /
      (-s2_x * s1_y + s1_x * s2_y);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
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
  public static LinePolyline(
    line: Line,
    polyline: Polyline
  ): readonly number[] {
    const intersections = new Array<number>();
    for (const edge of polyline.getSegments()) {
      const result = Intersection.LineLine(line, edge);
      if (result.success) {
        intersections.push(result.lineAu);
      }
    }
    const sortedIntersections = intersections.sort();
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
  public static HorizontalRayPolyline(
    start: Point,
    polyline: Polyline
  ): readonly number[] {
    const intersections = new Array<number>();
    for (const edge of polyline.getSegments()) {
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
  public static PolylinePolyline(a: Polyline, b: Polyline): readonly Point[] {
    const intersections = new Array<Point>();

    // The polylines can only intersect if the bounding boxes overlap
    const result = BoundingBox.intersection(a.boundingBox, b.boundingBox);
    if (result !== undefined) {
      for (const edgeA of a.getSegments()) {
        for (const edgeB of b.getSegments()) {
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
  public static HorizontalRayLine(
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
  public static HorizontalRayLineIntersection(
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
