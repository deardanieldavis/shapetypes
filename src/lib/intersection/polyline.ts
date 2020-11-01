import { BoundingBox, Intersection, Point, Polyline } from '../../index';


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
