// tslint:disable:no-let
import test from 'ava';
import { Plane } from './plane';
import { Point } from './point';
import { Polygon } from './polygon';
import { Polyline } from './polyline';
import { Rectangle } from './rectangle';
import { approximatelyEqual } from './utilities';
import { Vector } from './vector';

test('Area', t => {
  // Just an outer ring
  const polyline = new Rectangle(Plane.worldXY(), 20, 20).toPolyline();
  let polygon = new Polygon(polyline);
  t.is(polygon.area, 20 * 20);

  // Inner ring too
  const inner = new Rectangle(Plane.worldXY(), 10, 10).toPolyline();
  polygon = new Polygon(polyline, [inner]);
  t.is(polygon.area, 20 * 20 - 10 * 10);
});

test('Point of Inaccessibility', t => {
  // Simple square
  let polyline = new Rectangle(Plane.worldXY(), 20, 20).toPolyline();
  let polygon = new Polygon(polyline);
  let p = polygon.pointOfInaccessibility();
  t.is(approximatelyEqual(p.x, 0), true);
  t.is(approximatelyEqual(p.y, 0), true);

  // Uneven outer edge
  polyline = new Polyline([0, 0, 3, 0, 3, 1, 2, 1, 2, 2, 0, 2, 0, 0]);
  polygon = new Polygon(polyline);
  p = polygon.pointOfInaccessibility();
  t.is(approximatelyEqual(p.x, 1), true);
  t.is(approximatelyEqual(p.y, 1), true);

  // Polygon with a hole
  const outer = new Rectangle(Plane.worldXY(), 8, 8).toPolyline();
  const hole = new Rectangle(
    new Plane(new Point(1, 1), Vector.worldX()),
    2,
    2
  ).toPolyline();
  polygon = new Polygon(outer, [hole]);
  p = polygon.pointOfInaccessibility();
  t.is(approximatelyEqual(p.x, -2), true);
  t.is(approximatelyEqual(p.y, -2), true);
});

test('Closest point', t => {
  // Simple square
  const polyline = new Rectangle(Plane.worldXY(), 20, 20).toPolyline();
  let polygon = new Polygon(polyline);

  let p = polygon.closestPoint(new Point(5, 0));
  t.is(approximatelyEqual(p.x, 10), true);
  t.is(approximatelyEqual(p.y, 0), true);

  // Square with a hole in the center
  const hole = new Rectangle(Plane.worldXY(), 8, 8).toPolyline();
  polygon = new Polygon(polyline, [hole]);

  p = polygon.closestPoint(new Point(5, 0));
  t.is(approximatelyEqual(p.x, 4), true);
  t.is(approximatelyEqual(p.y, 0), true);
});

test('Difference', t => {
  const aPolyline = new Rectangle(Plane.worldXY(), 100, 100).toPolyline();
  const aPolygon = new Polygon(aPolyline);

  // Remove single polyline
  const shapeB = new Rectangle(Plane.worldXY(), 50, 50).toPolyline();
  let result = aPolygon.difference(shapeB);
  t.is(result.length, 1);
  t.is(result[0].area, 100 * 100 - 50 * 50);
  if (!(result[0] instanceof Polygon)) {
    throw new Error('Should be a polygon');
  }
  t.is(result[0].boundary.segmentCount, 4);

  // Remove multiple polylines
  const shapeC = new Rectangle(
    new Plane(new Point(-10, 0), Vector.worldX()),
    10,
    10
  ).toPolyline();
  const shapeD = new Rectangle(
    new Plane(new Point(10, 0), Vector.worldX()),
    10,
    10
  ).toPolyline();
  result = aPolygon.difference([shapeC, shapeD]);
  t.is(result.length, 1);
  t.is(result[0].area, 100 * 100 - 10 * 10 * 2);
  if (!(result[0] instanceof Polygon)) {
    throw new Error('Should be a polygon');
  }
  t.is(result[0].boundary.segmentCount, 4);
  t.is(result[0].holes.length, 2);

  // Remove a polyline from a polygon with an existing hole
  const bPolygon = new Polygon(aPolyline, [shapeB]);
  const shapeE = new Rectangle(
    new Plane(new Point(25, 0), Vector.worldX()),
    10,
    10
  ).toPolyline();
  result = bPolygon.difference(shapeE);
  t.is(result.length, 1);
  t.is(result[0].area, 100 * 100 - 50 * 50 - 10 * 10 * 0.5);
  if (!(result[0] instanceof Polygon)) {
    throw new Error('Should be a polygon');
  }
  t.is(result[0].boundary.segmentCount, 4);
  t.is(result[0].holes.length, 1);
});
