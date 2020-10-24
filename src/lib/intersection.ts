// tslint:disable:variable-name
// tslint:disable:no-let
import { BoundingBox } from './boundingBox';
import { Circle } from './circle';
import { IntervalSorted } from './intervalSorted';
import { Line } from './line';
import { Point } from './point';
import { Polygon } from './polygon';
import { Polyline } from './polyline';
import { Ray } from './ray';
import { shapetypesSettings } from './settings';
import { approximatelyEqual } from './utilities';
import { Vector } from './vector';

export enum LineCircleIntersection {
  none,
  single,
  multiple
}

// tslint:disable-next-line:no-namespace no-internal-module
export module Intersection {
  // -----------------------
  // LINES
  // -----------------------

  /**
   * Returns the parameters of an intersection between two lines.
   *
   * @param lineA                 The first line
   * @param lineB                 The second line
   * @param limitToFiniteSegment  If true, an intersection only counts if it falls within the bounds of the lines. If false, the lines will be treated as infinite.
   * @return
   */
  export function lineLine(
    lineA: Line,
    lineB: Line,
    limitToFiniteSegment: boolean = true
  ): {
    /** True if the two lines intersect. */
    intersects: boolean;
    /** The parameter along `lineA` where the intersection occurs. Use [[Line.pointAt]] to get actual point. */
    lineAu: number;
    /** The parameter along `lineB` where the intersection occurs. Use [[Line.pointAt]] to get actual point. */
    lineBu: number;
  } {
    // Based on:
    // https://github.com/davidfig/pixi-intersects/blob/master/src/shape.js
    const aX = lineA.direction.x;
    const aY = lineA.direction.y;
    const bX = lineB.direction.x;
    const bY = lineB.direction.y;

    const denominator = -bX * aY + aX * bY;
    const diffX = lineA.from.x - lineB.from.x;
    const diffY = lineA.from.y - lineB.from.y;

    const s = (-aY * diffX + aX * diffY) / denominator;
    const t = (bX * diffY - bY * diffX) / denominator;

    if (limitToFiniteSegment) {
      if (
        -shapetypesSettings.absoluteTolerance <= s &&
        s <= 1 + shapetypesSettings.absoluteTolerance &&
        -shapetypesSettings.absoluteTolerance <= t &&
        t <= 1 + shapetypesSettings.absoluteTolerance
      ) {
        return { intersects: true, lineAu: t, lineBu: s };
      }
    } else {
      if (isFinite(s) && isFinite(t)) {
        return { intersects: true, lineAu: t, lineBu: s };
      }
    }

    return { intersects: false, lineAu: 0, lineBu: 0 };
  }

  /**
   * Returns the parameters of an intersection between a line and a bounding box.
   * @param theLine   The line
   * @param box       The bounding box
   */
  export function lineBox(
    theLine: Line,
    box: BoundingBox
  ): {
    /** True if the line intersects the bounding box */
    intersects: boolean;
    /** The portion of `lineA` within the `box`. Use [[Line.pointAt]] to get actual points. */
    domain: IntervalSorted;
  } {
    // Reject lines that obviously wont intersect
    if (theLine.from.x < box.xRange.min && theLine.to.x < box.xRange.min) {
      // Fully to left
      return { intersects: false, domain: new IntervalSorted(0, 0) };
    } else if (theLine.from.x > box.xRange.max && theLine.to.x > box.xRange.max) {
      // Fully to right
      return { intersects: false, domain: new IntervalSorted(0, 0) };
    } else if (theLine.from.y < box.yRange.min && theLine.to.y < box.yRange.min) {
      // Fully below box
      return { intersects: false, domain: new IntervalSorted(0, 0) };
    } else if (theLine.from.y > box.yRange.max && theLine.to.y > box.yRange.max) {
      // Fully above box
      return { intersects: false, domain: new IntervalSorted(0, 0) };
    }

    // Use Liang-Barsky's algorithm to find possible intersections
    // https://en.wikipedia.org/wiki/Liang–Barsky_algorithm

    // defining variables
    const p1 = -theLine.direction.x;
    const p2 = theLine.direction.x;
    const p3 = -theLine.direction.y;
    const p4 = theLine.direction.y;

    const q1 = theLine.from.x - box.xRange.min;
    const q2 = box.xRange.max - theLine.from.x;
    const q3 = theLine.from.y - box.yRange.min;
    const q4 = box.yRange.max - theLine.from.y;

    const posarr = new Array<number>(3);
    const negarr = new Array<number>(3);
    let posind = 1;
    let negind = 1;
    posarr[0] = 1;
    negarr[0] = 0;

    if (
      (p1 === 0 && q1 < 0) ||
      (p2 === 0 && q2 < 0) ||
      (p3 === 0 && q3 < 0) ||
      (p4 === 0 && q4 < 0)
    ) {
      // Line is parallel to box
      return { intersects: false, domain: new IntervalSorted(0, 0) };
    }
    if (p1 !== 0) {
      const r1 = q1 / p1;
      const r2 = q2 / p2;
      if (p1 < 0) {
        negarr[negind++] = r1; // for negative p1, add it to negative array
        posarr[posind++] = r2; // and add p2 to positive array
      } else {
        negarr[negind++] = r2;
        posarr[posind++] = r1;
      }
    }
    if (p3 !== 0) {
      const r3 = q3 / p3;
      const r4 = q4 / p4;
      if (p3 < 0) {
        negarr[negind++] = r3;
        posarr[posind++] = r4;
      } else {
        negarr[negind++] = r4;
        posarr[posind++] = r3;
      }
    }

    const rn1 = maxi(negarr, negind); // maximum of negative array
    const rn2 = mini(posarr, posind); // minimum of positive array

    if (rn1 > rn2) {
      // reject
      // Line is outside the box
      return { intersects: false, domain: new IntervalSorted(0, 0) };
    }
    return { intersects: true, domain: new IntervalSorted(rn1, rn2) };
  }

  /**
   * Returns the parameters of intersection(s) between a line and a circle.
   * @param theLine   The line
   * @param circle    The circle
   */
  export function lineCircle(
    theLine: Line,
    circle: Circle
  ): {
    /** The number of intersections between `lineA` and `circle`. */
    intersects: LineCircleIntersection;
    /** The parameter(s) along `lineA` where the intersections occur. Use [[Line.pointAt]] to get actual points. */
    u: readonly number[];
  } {
    // Based on: https://stackoverflow.com/questions/1073336/circle-line-segment-collision-detection-algorithm
    const d = theLine.direction;
    const f = Vector.fromPoints(circle.center, theLine.from);
    const r = circle.radius;

    const a = d.dotProduct(d);
    const b = 2 * f.dotProduct(d);
    const c = f.dotProduct(f) - r * r;

    const discriminant = b * b - 4 * a * c;

    if (discriminant < 0) {
      // Line never crosses circle
      return { intersects: LineCircleIntersection.none, u: [] };
    }

    const discriminant_sqrt = Math.sqrt(discriminant);
    const t1 = (-b - discriminant_sqrt) / (2 * a);
    const t2 = (-b + discriminant_sqrt) / (2 * a);

    if (t1 >= 0 && t1 <= 1) {
      if (t2 >= 0 && t2 <= 1) {
        if (approximatelyEqual(t1, t2, shapetypesSettings.absoluteTolerance)) {
          // Line is tangent to circle
          return { intersects: LineCircleIntersection.single, u: [t1] };
        } else {
          // Line went through both sides
          return { intersects: LineCircleIntersection.multiple, u: [t1, t2] };
        }
      } else {
        // Line crossed once but ended before making it through to other side
        return { intersects: LineCircleIntersection.single, u: [t1] };
      }
    }

    if (t2 >= 0 && t2 <= 1) {
      // Line started inside and exited in one place
      return { intersects: LineCircleIntersection.single, u: [t2] };
    }

    // Line is either completely inside the circle or completely outside.
    return { intersects: LineCircleIntersection.none, u: [] };
  }

  // TODO: BoundingBox
  // TODO: Ray
  // TODO: For some reason circle and rectangle cause a circular import
  /*
else if(otherGeom instanceof Circle) {
  return Intersection.lineCircle(lineA, otherGeom).u;
/*}else if(otherGeom instanceof Rectangle)
  return Intersection.line(lineA, otherGeom.toPolyline());
}
}
*/


  /**
   * Returns the parameters of intersection(s) between a line and any other type of geometry.
   * @param theLine      The line to intersect.
   * @param otherGeom   The other geometry to test for intersection.
   * @returns           The parameter(s) along `lineA` where the intersections occur. Use [[Line.pointAt]] to get actual points.
   */

  export function line(
    theLine: Line,
    // @ts-ignore
    otherGeom: Point | Line | Circle | Polyline | Polygon |
      ReadonlyArray<Point | Line | Circle | Polyline | Polygon>
  ): readonly number[]
  {
    if (otherGeom instanceof Array) {
      const intersections = new Array<number>();
      for(const geom of otherGeom) {
        intersections.push(...Intersection.line(theLine, geom));
      }
      return intersections.sort();
    }
    else if(otherGeom instanceof Point) {
      const t = theLine.closestParameter(otherGeom, true);
      const p = theLine.pointAt(t, true);
      if(p.equals(otherGeom)) {
        return [t];
      }
    }
    else if(otherGeom instanceof Line) {
      const result = Intersection.lineLine(theLine, otherGeom);
      if(result.intersects){
        return [result.lineAu];
      }
    }

    else if(otherGeom instanceof Polyline) {
      const intersections = new Array<number>();
      const result = Intersection.lineBox(theLine, otherGeom.boundingBox);
      if(result.intersects) {
        intersections.push(...linePolyline(theLine, otherGeom));
      }
      return intersections.sort();
    }
    else if(otherGeom instanceof Polygon) {
      const intersections = new Array<number>();
      const result = Intersection.lineBox(theLine, otherGeom.boundary.boundingBox);
      if(result.intersects) {
        intersections.push(...linePolyline(theLine, otherGeom.boundary));
        for(const hole of otherGeom.holes) {
          const holeResult = Intersection.lineBox(theLine, hole.boundingBox);
          if(holeResult.intersects) {
            intersections.push(...linePolyline(theLine, hole));
          }
        }
      }
      return intersections.sort();
    }
    else {
      throw TypeError("Wrong type of geometry");
    }
    return [];
  }


  function linePolyline(theLine: Line, polyline: Polyline): readonly number[] {
    const intersections = new Array<number>();
    for (const edge of polyline.segments) {
      const result = Intersection.lineLine(theLine, edge);
      if (result.intersects) {
        intersections.push(result.lineAu);
      }
    }
    return intersections;
  }





  // -----------------------
  // RAYS
  // -----------------------

  // TODO: Ray circle

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
          const result2 = Intersection.lineLine(edgeA, edgeB);
          if (result2.intersects) {
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

// this function gives the maximum
function maxi(arr: readonly number[], n: number): number {
  let m = 0;
  for (let i = 0; i < n; ++i) {
    if (m < arr[i]) {
      m = arr[i];
    }
  }
  return m;
}
function mini(arr: readonly number[], n: number): number {
  let m = 1;
  for (let i = 0; i < n; ++i) {
    if (m > arr[i]) {
      m = arr[i];
    }
  }
  return m;
}
