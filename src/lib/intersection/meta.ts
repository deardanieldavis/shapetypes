import {
  BoundingBox,
  Circle,
  inRayRange,
  Intersection,
  Line,
  Point,
  Polygon,
  Polyline,
  Ray,
  RayRange,
  Rectangle,
  shapetypesSettings
} from '../../index';

/**
 * Returns the parameters of intersection(s) between a line and any other type of geometry.
 * @param theLine       The line to intersect.
 * @param otherGeom     The other geometry to test for intersection.
 * @returns             The parameter(s) along `theLine` where the intersections occur. Use [[Line.pointAt]] to get actual points.
 *
 * @module  Intersection
 */
export function line(
  theLine: Line,
  otherGeom:
    | Point
    | Line
    | Ray
    | BoundingBox
    | Circle
    | Rectangle
    | Polyline
    | Polygon
    | ReadonlyArray<
        | Point
        | Line
        | Ray
        | BoundingBox
        | Circle
        | Rectangle
        | Polyline
        | Polygon
      >
): readonly number[] {
  if (otherGeom instanceof Array) {
    const intersections = new Array<number>();
    for (const geom of otherGeom) {
      intersections.push(...line(theLine, geom));
    }
    return intersections.sort((a, b) => a - b); // ascending
  } else if (otherGeom instanceof Point) {
    const t = theLine.closestParameter(otherGeom, true);
    const p = theLine.pointAt(t, true);
    if (p.equals(otherGeom)) {
      return [t];
    }
  } else if (otherGeom instanceof Line) {
    const result = Intersection.lineLine(theLine, otherGeom);
    if (result.intersects) {
      return [result.lineAU];
    }
  } else if (otherGeom instanceof Ray) {
    const result = Intersection.rayLine(otherGeom, theLine, RayRange.both);
    if (result.intersects) {
      return [result.lineU];
    }
  } else if (otherGeom instanceof BoundingBox) {
    return Intersection.line(theLine, otherGeom.toPolyline());
  } else if (otherGeom instanceof Circle) {
    return Intersection.lineCircle(theLine, otherGeom).u;
  } else if (otherGeom instanceof Rectangle) {
    return Intersection.line(theLine, otherGeom.toPolyline());
  } else if (otherGeom instanceof Polyline) {
    const intersections = new Array<number>();
    const result = Intersection.lineBox(theLine, otherGeom.boundingBox);
    if (result.intersects) {
      intersections.push(...linePolyline(theLine, otherGeom));
    }
    return intersections.sort((a, b) => a - b); // ascending
  } else if (otherGeom instanceof Polygon) {
    const intersections = new Array<number>();
    const result = Intersection.lineBox(
      theLine,
      otherGeom.boundary.boundingBox
    );
    if (result.intersects) {
      intersections.push(...linePolyline(theLine, otherGeom.boundary));
      for (const hole of otherGeom.holes) {
        const holeResult = Intersection.lineBox(theLine, hole.boundingBox);
        if (holeResult.intersects) {
          intersections.push(...linePolyline(theLine, hole));
        }
      }
    }
    return intersections.sort((a, b) => a - b); // ascending
  }
  return [];
}

/**
 * Returns the parameters of intersection(s) between a ray and any other type of geometry.
 * @param theRay        The ray to intersect.
 * @param otherGeom     The other geometry to test for intersection.
 * @returns             The parameter(s) along `theRay` where the intersections occur. Use [[Ray.pointAt]] to get actual points.
 *
 * @module  Intersection
 */
export function ray(
  theRay: Ray,
  otherGeom:
    | Point
    | Line
    | Ray
    | BoundingBox
    | Circle
    | Rectangle
    | Polyline
    | Polygon
    | ReadonlyArray<
        | Point
        | Line
        | Ray
        | BoundingBox
        | Circle
        | Rectangle
        | Polyline
        | Polygon
      >,
  range: RayRange = RayRange.both
): readonly number[] {
  if (otherGeom instanceof Array) {
    const intersections = new Array<number>();
    for (const geom of otherGeom) {
      intersections.push(...ray(theRay, geom, range));
    }
    return intersections.sort((a, b) => a - b); // ascending
  } else if (otherGeom instanceof Point) {
    const t = theRay.closestParameter(otherGeom);
    if(inRayRange(t, range)) {
      const p = theRay.pointAt(t);
      if (p.equals(otherGeom)) {
        return [t];
      }
    }
  } else if (otherGeom instanceof Line) {
    const result = Intersection.rayLine(theRay, otherGeom, range);
    if (result.intersects) {
      return [result.rayU];
    }
  } else if (otherGeom instanceof Ray) {
    const result = Intersection.rayRay(theRay, otherGeom, range);
    if (result.intersects) {
      return [result.rayAU];
    }
  } else if (otherGeom instanceof BoundingBox) {
    return Intersection.ray(theRay, otherGeom.toPolyline(), range);
  } else if (otherGeom instanceof Circle) {
    return Intersection.rayCircle(theRay, otherGeom, range).u;
  } else if (otherGeom instanceof Rectangle) {
    return Intersection.ray(theRay, otherGeom.toPolyline(), range);
  } else if (otherGeom instanceof Polyline) {
    const intersections = new Array<number>();
    const result = Intersection.rayBox(theRay, otherGeom.boundingBox, range);
    if (result.intersects) {
      intersections.push(...rayPolyline(theRay, otherGeom, range));
    }
    return intersections.sort((a, b) => a - b); // ascending
  } else if (otherGeom instanceof Polygon) {
    const intersections = new Array<number>();
    const result = Intersection.rayBox(theRay, otherGeom.boundary.boundingBox, range);
    if (result.intersects) {
      intersections.push(...rayPolyline(theRay, otherGeom.boundary, range));
      for (const hole of otherGeom.holes) {
        const holeResult = Intersection.rayBox(theRay, hole.boundingBox, range);
        if (holeResult.intersects) {
          intersections.push(...rayPolyline(theRay, hole, range));
        }
      }
    }
    return intersections.sort((a, b) => a - b); // ascending
  }
  return [];
}

/**
 * Returns the parameters of intersection(s) between a polyline and any other type of geometry.
 * @param thePolyline   The polyline to intersect.
 * @param otherGeom     The other geometry to test for intersection.
 * @returns             The parameter(s) along `thePolyline` where the intersections occur. Use [[Polyline.pointAt]] to get actual points.
 *
 * @module  Intersection
 */
export function polyline(
  thePolyline: Polyline,
  otherGeom:
    | Point
    | Line
    | Ray
    | BoundingBox
    | Circle
    | Rectangle
    | Polyline
    | Polygon
    | ReadonlyArray<
        | Point
        | Line
        | Ray
        | BoundingBox
        | Circle
        | Rectangle
        | Polyline
        | Polygon
      >
): readonly number[] {
  if (otherGeom instanceof Array) {
    const arrayIntersections = new Array<number>();
    for (const geom of otherGeom) {
      arrayIntersections.push(...polyline(thePolyline, geom));
    }
    return arrayIntersections.sort((a, b) => a - b); // ascending
  } else if (otherGeom instanceof Point) {
    if (
      !thePolyline.boundingBox.contains(
        otherGeom,
        false,
        shapetypesSettings.absoluteTolerance
      )
    ) {
      return [];
    }
  } else if (otherGeom instanceof BoundingBox) {
    if (!thePolyline.boundingBox.overlaps(otherGeom)) {
      return [];
    }
  } else if (!(otherGeom instanceof Ray)) {
    // @ts-ignore
    if (!thePolyline.boundingBox.overlaps(otherGeom.boundingBox)) {
      return [];
    }
  }

  const intersections = new Array<number>();
  // tslint:disable-next-line:prefer-for-of no-let
  for (let i = 0; i < thePolyline.segments.length; i++) {
    const edge = thePolyline.segments[i];
    for (const num of line(edge, otherGeom)) {
      intersections.push(i + num);
    }
  }
  // tslint:disable-next-line:readonly-array
  const unique = [...new Set(intersections)];
  return unique.sort((a, b) => a - b); // ascending
}

// -----------------------
// HELPER
// -----------------------

function linePolyline(theLine: Line, thePolyline: Polyline): readonly number[] {
  const intersections = new Array<number>();
  for (const edge of thePolyline.segments) {
    const result = Intersection.lineLine(theLine, edge);
    if (result.intersects) {
      intersections.push(result.lineAU);
    }
  }
  return intersections;
}

function rayPolyline(theRay: Ray, thePolyline: Polyline, range: RayRange): readonly number[] {
  const intersections = new Array<number>();
  for (const edge of thePolyline.segments) {
    const result = Intersection.rayLine(theRay, edge, range);
    if (result.intersects) {
      intersections.push(result.rayU);
    }
  }
  return intersections;
}
