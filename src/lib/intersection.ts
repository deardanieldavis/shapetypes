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

// TODO
// rayBox
// Ray needs onlyforward parameter

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
  }
  {
    const result = rayRayHelper(lineA.from, lineA.direction, lineB.from, lineB.direction);

    if (limitToFiniteSegment) {
      if (
        -shapetypesSettings.absoluteTolerance <= result.Bu &&
        result.Bu <= 1 + shapetypesSettings.absoluteTolerance &&
        -shapetypesSettings.absoluteTolerance <= result.Au &&
        result.Au <= 1 + shapetypesSettings.absoluteTolerance
      ) {
        return { intersects: true, lineAu: result.Au, lineBu: result.Bu };
      } else {
        return { intersects: false, lineAu: 0, lineBu: 0 };
      }
    }
    return {
      intersects: result.intersects,
      lineAu: result.Au,
      lineBu: result.Bu
    };
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

    const result = rayCircleHelper(theLine.from, theLine.direction, circle);

    if(result.intersects === LineCircleIntersection.single) {
      // Check intersection happened within bounds of line
      if(0 <= result.u[0] && result.u[0] <= 1) {
        return result;
      }
    }
    else if(result.intersects === LineCircleIntersection.multiple) {
      // Check intersections happened within bounds of line
      if(0 <= result.u[0] && result.u[0] <= 1) {
        if(0 <= result.u[1] && result.u[1] <= 1) {
          return result;
        }
        return { intersects: LineCircleIntersection.single, u: [result.u[0]] };
      }
      if(0 <= result.u[1] && result.u[1] <= 1) {
        return { intersects: LineCircleIntersection.single, u: [result.u[1]] };
      }
    }
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



  // -----------------------
  // RAYS
  // -----------------------

  /**
   *
   * @param theRay
   * @param circle
   */
  export function rayCircle(theRay: Ray, circle: Circle): {
    /** The number of intersections between `theRay` and `circle`. */
    intersects: LineCircleIntersection;
    /** The parameter(s) along `theRay` where the intersections occur. Use [[Ray.pointAt]] to get actual points. */
    u: readonly number[];
  } {
    return rayCircleHelper(theRay.from, theRay.direction, circle);
  }

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
  export function rayLine(
    theRay: Ray,
    theLine: Line,
    bothSides = false
  ): { intersects: boolean; rayU: number; lineU: number } {
    const result = rayRayHelper(theRay.from, theRay.direction, theLine.from, theLine.direction);

    if(result.intersects) {
      if(0 <= result.Bu && result.Bu <= 1) {
        // The ray intersects the line
        if (bothSides) {
          return { intersects: true, rayU: result.Au, lineU: result.Bu };
        } else if (0 <= result.Au) {
          return { intersects: true, rayU: result.Au, lineU: result.Bu };
        }
      }
    }

    return { intersects: false, rayU: 0, lineU: 0 };
  }

  export function rayRay(
    rayA: Ray,
    rayB: Ray,
    bothSides = false
  ): { intersects: boolean; rayAU: number; rayBU: number } {
    const result = rayRayHelper(rayA.from, rayA.direction, rayB.from, rayB.direction);

    if(result.intersects) {
      if (bothSides) {
        return { intersects: true, rayAU: result.Au, rayBU: result.Bu };
      } else if (result.Au >= 0 && result.Bu >= 0) {
        return { intersects: true, rayAU: result.Au, rayBU: result.Bu };
      }
    }

    return { intersects: false, rayAU: 0, rayBU: 0 };
  }

/*
  export function ray(theRay: Ray,
      otherGeom: Point | Line | Circle | Polyline | Polygon |
      ReadonlyArray<Point | Line | Circle | Polyline | Polygon>
  ): readonly number[]
  {
    if (otherGeom instanceof Array) {
      const intersections = new Array<number>();
      for(const geom of otherGeom) {
        intersections.push(...Intersection.ray(theRay, geom));
      }
      return intersections.sort();
    }
    else if(otherGeom instanceof Point) {
      const t = theRay.closestParameter(otherGeom);
      const p = theRay.pointAt(t);
      if(p.equals(otherGeom)) {
        return [t];
      }
    }
    else if(otherGeom instanceof Line) {
      const result = Intersection.rayLine(theRay, otherGeom);
      if(result.intersects){
        return [result.rayU];
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
  }*/








  // -----------------------
  // SPECIAL
  // -----------------------









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
      const result = Intersection.rayLine(ray, edge, bothSides);
      if (result.intersects) {
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


// -----------------------
// PRIVATE HELPERS
// -----------------------

/**
 * Returns the parameters of intersection between two rays, which are described using their
 * raw components.
 *
 * @param fromA       Start of first ray
 * @param directionA  Direction of first ray
 * @param fromB       Start of second ray
 * @param directionB  Direction of second ray
 * @private
 */
function rayRayHelper(
  fromA: Point,
  directionA: Vector,
  fromB: Point,
  directionB: Vector
): {
  intersects: boolean;
  Au: number;   // Distance along first ray, as a factor of the ray's distance (eg. the ray doesn't need to be a normal)
  Bu: number;
} {
  // Based on:
  // https://github.com/davidfig/pixi-intersects/blob/master/src/shape.js
  const aX = directionA.x;
  const aY = directionA.y;
  const bX = directionB.x;
  const bY = directionB.y;

  const denominator = -bX * aY + aX * bY;
  if(denominator !== 0) {
    const diffX = fromA.x - fromB.x;
    const diffY = fromA.y - fromB.y;

    const s = (-aY * diffX + aX * diffY) / denominator;
    const t = (bX * diffY - bY * diffX) / denominator;

    if (isFinite(s) && isFinite(t)) {
      return { intersects: true, Au: t, Bu: s };
    }
  }
  return { intersects: false, Au: 0, Bu: 0 };
}



/**
 * Returns the parameters of intersection(s) between a ray and a circle.
 * @param from      The start of the ray
 * @param direction The direction of the ray
 * @param circle    The circle
 * @private
 */
function rayCircleHelper(
  from: Point,
  direction: Vector,
  circle: Circle
): {
  intersects: LineCircleIntersection;
  u: readonly number[];
} {
  // Based on: https://stackoverflow.com/questions/1073336/circle-line-segment-collision-detection-algorithm
  const d = direction;
  const f = Vector.fromPoints(circle.center, from);
  const r = circle.radius;

  const a = d.dotProduct(d);
  const b = 2 * f.dotProduct(d);
  const c = f.dotProduct(f) - r * r;

  const discriminant = b * b - 4 * a * c;

  if (discriminant < 0) {
    // Ray never crosses circle
    return { intersects: LineCircleIntersection.none, u: [] };
  }

  const discriminant_sqrt = Math.sqrt(discriminant);
  const t1 = (-b - discriminant_sqrt) / (2 * a);
  const t2 = (-b + discriminant_sqrt) / (2 * a);

  if (approximatelyEqual(t1, t2, shapetypesSettings.absoluteTolerance)) {
    // Ray is tangent to circle
    return { intersects: LineCircleIntersection.single, u: [t1] };
  } else {
    // Ray went through both sides
    return { intersects: LineCircleIntersection.multiple, u:[t1, t2] };
  }
}


/*
function rayPolyline(theRay: Ray, polyline: Polyline): readonly number[] {
  const intersections = new Array<number>();
  for (const edge of polyline.segments) {
    const result = Intersection.rayLine(theRay, edge);
    if (result.intersects) {
      intersections.push(result.rayU);
    }
  }
  return intersections;
}*/


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


/**
 * Returns largest in list
 * @param arr   List of numbers
 * @param n     Only searches list to this point
 */
function maxi(arr: readonly number[], n: number): number {
  let m = 0;
  for (let i = 0; i < n; ++i) {
    if (m < arr[i]) {
      m = arr[i];
    }
  }
  return m;
}

/**
 * Returns smallest in list
 * @param arr   List of numbers
 * @param n     Only searches list to this point
 */
function mini(arr: readonly number[], n: number): number {
  let m = 1;
  for (let i = 0; i < n; ++i) {
    if (m > arr[i]) {
      m = arr[i];
    }
  }
  return m;
}

