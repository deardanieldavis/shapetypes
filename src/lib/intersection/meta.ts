import { Circle, Intersection, Line, Point, Polygon, Polyline, Ray, } from '../../index';

// TODO: BoundingBox
// TODO: For some reason circle and rectangle cause a circular import
// TODO: Should this be abstracted to a geometry super-class, which could include the commands for transformation and intersection
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
    | Circle
    | Polyline
    | Polygon
    | ReadonlyArray<Point | Line | Ray | Circle | Polyline | Polygon>
): readonly number[] {
  if (otherGeom instanceof Array) {
    const intersections = new Array<number>();
    for (const geom of otherGeom) {
      intersections.push(...line(theLine, geom));
    }
    return intersections.sort();
  } else if (otherGeom instanceof Point) {
    const t = theLine.closestParameter(otherGeom, true);
    const p = theLine.pointAt(t, true);
    if (p.equals(otherGeom)) {
      return [t];
    }
  } else if (otherGeom instanceof Line) {
    const result = Intersection.lineLine(theLine, otherGeom);
    if (result.intersects) {
      return [result.lineAu];
    }
  } else if (otherGeom instanceof Ray) {
    const result = Intersection.rayLine(otherGeom, theLine, false);
    if (result.intersects) {
      return [result.lineU];
    }
  } else if (otherGeom instanceof Polyline) {
    const intersections = new Array<number>();
    const result = Intersection.lineBox(theLine, otherGeom.boundingBox);
    if (result.intersects) {
      intersections.push(...linePolyline(theLine, otherGeom));
    }
    return intersections.sort();
  } else if (otherGeom instanceof Polygon) {
    const intersections = new Array<number>();
    const result = Intersection.lineBox(theLine, otherGeom.boundary.boundingBox);
    if (result.intersects) {
      intersections.push(...linePolyline(theLine, otherGeom.boundary));
      for (const hole of otherGeom.holes) {
        const holeResult = Intersection.lineBox(theLine, hole.boundingBox);
        if (holeResult.intersects) {
          intersections.push(...linePolyline(theLine, hole));
        }
      }
    }
    return intersections.sort();
  } else {
    throw TypeError('Wrong type of geometry');
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

/*

  /**
   * Calculates intersections between a ray and a polyline
   * @param ray:
   * @param polyline:
   * @param includeZero: Whether to include the start point of the ray in the intersections
   * @param bothSides: If true, will include intersections that happen behind the start point of the ray (eg. a negative rayU)
   * @returns: List of intersections. Each value is the distance along the ray where the intersection occurs.
   *
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
 */
