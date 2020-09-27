// tslint:disable:no-let
import test from 'ava';
import { Plane } from './plane';
import { Point } from './point';
import { PointContainment, Polyline } from './polyline';
import { Rectangle } from './rectangle';
import { Vector } from './vector';

/*
test('Get points', t => {
  const polyline = new Rectangle(Plane.worldXY(), 2, 2).toPolyline();
  const points = polyline.points;

  t.is(points.length, 5);
  t.is(polyline.segmentCount, 4);
  t.is(points[0].x, -1);
  t.is(points[0].y, -1);
  t.is(points[2].x, 1);
  t.is(points[2].y, 1);
});*/

test('Get edges', t => {
  const polyline = new Rectangle(Plane.worldXY(), 2, 2).toPolyline();
  const edges = polyline.getSegments();

  t.is(edges.length, 4);
});

test('Closest point', t => {
  const polyline = new Rectangle(Plane.worldXY(), 2, 2).toPolyline();

  let point = polyline.closestPoint(new Point(1, 1));
  if (point === undefined) {
    throw new Error('Should be a point');
  }
  t.is(point.x, 1);
  t.is(point.y, 1);

  point = polyline.closestPoint(new Point(2, 2));
  if (point === undefined) {
    throw new Error('Should be a point');
  }
  t.is(point.x, 1);
  t.is(point.y, 1);

  point = polyline.closestPoint(new Point(2, 0));
  if (point === undefined) {
    throw new Error('Should be a point');
  }
  t.is(point.x, 1);
  t.is(point.y, 0);

  point = polyline.closestPoint(new Point(-0.5, 0));
  if (point === undefined) {
    throw new Error('Should be a point');
  }
  t.is(point.x, -1);
  t.is(point.y, 0);
});

test('Closest parameter', t => {
  const polyline = new Polyline([
    new Point(0, 0),
    new Point(1, 0),
    new Point(5, 0)
  ]);

  let index = polyline.closestParameter(new Point(0, 0));
  t.is(index, 0);

  index = polyline.closestParameter(new Point(1, 0));
  t.is(index, 1);

  index = polyline.closestParameter(new Point(5, 0));
  t.is(index, 2);

  index = polyline.closestParameter(new Point(0.5, 0));
  t.is(index, 0.5);

  index = polyline.closestParameter(new Point(3, 0));
  t.is(index, 1.5);

  index = polyline.closestParameter(new Point(10, 0));
  t.is(index, 2);
});

/*
test('Inward normal', t => {
  const polyline = new Rectangle(Plane.worldXY(), 2, 2).toPolyline();

  let point = new Point(1, 0);
  let u = polyline.closestParameter(point);
  let vector = polyline.normalAt(u);
  if (vector === undefined) {
    throw new Error('Should be a vector');
  }
  t.is(vector.x, -1);
  t.is(vector.y, 0);

  point = new Point(-1, 0);
  u = polyline.closestParameter(point);
  vector = polyline.normalAt(u);
  if (vector === undefined) {
    throw new Error('Should be a vector');
  }
  t.is(vector.x, 1);
  t.is(vector.y, 0);
});*/

test('polyline contains point', t => {
  const polyline = new Rectangle(Plane.worldXY(), 20, 20).toPolyline();

  t.is(polyline.contains(new Point(0, 0)), PointContainment.inside);
  t.is(polyline.contains(new Point(100, 100)), PointContainment.outside);

  t.is(polyline.contains(new Point(9, 0)), PointContainment.inside);
  t.is(polyline.contains(new Point(11, 0)), PointContainment.outside);

  t.is(polyline.contains(new Point(0, 9)), PointContainment.inside);
  t.is(polyline.contains(new Point(0, 11)), PointContainment.outside);

  t.is(polyline.contains(new Point(-9.9, 0)), PointContainment.inside);
  t.is(polyline.contains(new Point(-10.1, 0)), PointContainment.outside);

  t.is(polyline.contains(new Point(-10, 0)), PointContainment.coincident);
  t.is(polyline.contains(new Point(10, 0)), PointContainment.coincident);
  t.is(polyline.contains(new Point(0, 10)), PointContainment.coincident);
  t.is(polyline.contains(new Point(10, 10)), PointContainment.coincident);
});

test('Contains polyline', t => {
  let polylineInside = new Rectangle(Plane.worldXY(), 3, 3).toPolyline();
  const polylineOutside = new Rectangle(Plane.worldXY(), 3.5, 3.5).toPolyline();

  t.is(polylineOutside.containsPolyline(polylineInside), true);

  let center = new Plane(new Point(1, 0), Vector.worldX());
  polylineInside = new Rectangle(center, 3, 3).toPolyline();
  t.is(polylineOutside.containsPolyline(polylineInside), false);

  center = new Plane(new Point(10, 0), Vector.worldX());
  polylineInside = new Rectangle(center, 3, 3).toPolyline();
  t.is(polylineOutside.containsPolyline(polylineInside), false);
});

test('Area', t => {
  let polyline = new Rectangle(Plane.worldXY(), 20, 20).toPolyline();
  t.is(polyline.area, 20 * 20);

  // rectangle
  polyline = new Rectangle(Plane.worldXY(), 10, 20).toPolyline();
  t.is(polyline.area, 10 * 20);

  // triangle
  polyline = new Polyline([0, 0, 10, 0, 10, 10]);
  polyline.makeClosed();
  t.is(polyline.area, 50);

  // negative values
  const center = new Plane(new Point(-100, -50), Vector.worldX());
  polyline = new Rectangle(center, 10, 20).toPolyline();
  t.is(polyline.area, 10 * 20);
});

/*
test('Offset points', t => {
  const polyline = new Rectangle(Plane.worldXY(), 20, 20).toPolyline();
  const offset = polyline.offset(10);

  t.is(offset.area, 40 * 40);

  for (const edge of offset.getSegments()) {
    t.is(edge.length, 40);
  }
});*/

/*
test('Clockwise', t => {
  shapetypesSettings.invertY = false;
  let polyline = new Polyline([1, 1, -1, 1, -1, -1, 1, -1]);
  polyline.makeClosed();
  t.is(polyline.orientation, CurveOrientation.clockwise);

  polyline = new Polyline([1, 1, 1, -1, -1, -1, -1, 1]);
  polyline.makeClosed();
  t.is(polyline.orientation, CurveOrientation.counterclockwise);

  polyline.orientation = CurveOrientation.clockwise;
  t.is(polyline.orientation, CurveOrientation.clockwise);
});*/

test('Union', t => {
  const shapeA = new Rectangle(Plane.worldXY(), 100, 100).toPolyline();
  const center = new Plane(new Point(100, 0), Vector.worldX());
  let shapeB = new Rectangle(center, 100, 100).toPolyline();
  let result = shapeA.union(shapeB);

  // Adjacent
  t.is(result.length, 1);
  t.is(result[0].area, 100 * 100 * 2);
  if (!(result[0] instanceof Polyline)) {
    throw new Error('Should be polyline');
  }
  t.is(result[0].segmentCount, 4);

  // Inside the other shape
  shapeB = new Rectangle(Plane.worldXY(), 50, 50).toPolyline();
  result = shapeA.union(shapeB);

  t.is(result.length, 1);
  t.is(result[0].area, 100 * 100);
  if (!(result[0] instanceof Polyline)) {
    throw new Error('Should be polyline');
  }
  t.is(result[0].segmentCount, 4);
});

test('Intersection', t => {
  const shapeA = new Rectangle(Plane.worldXY(), 100, 100).toPolyline();
  let shapeB = new Rectangle(Plane.worldXY(), 10, 10).toPolyline();
  let result = shapeA.intersection(shapeB);

  // Inside larger shape
  t.is(result.length, 1);
  t.is(result[0].area, 10 * 10);
  if (!(result[0] instanceof Polyline)) {
    throw new Error('Should be polyline');
  }
  t.is(result[0].segmentCount, 4);

  // Side by size
  const center = new Plane(new Point(50, 0), Vector.worldX());
  shapeB = new Rectangle(center, 100, 100).toPolyline();
  result = shapeA.intersection(shapeB);
  t.is(result.length, 1);
  t.is(result[0].area, 50 * 100);
  if (!(result[0] instanceof Polyline)) {
    throw new Error('Should be polyline');
  }
  t.is(result[0].segmentCount, 4);
});

test('Difference', t => {
  const shapeA = new Rectangle(Plane.worldXY(), 100, 100).toPolyline();
  const center = new Plane(new Point(50, 0), Vector.worldX());
  const shapeB = new Rectangle(center, 100, 100).toPolyline();
  const result = shapeA.difference(shapeB);

  // Inside larger shape
  t.is(result.length, 1);
  t.is(result[0].area, 50 * 100);
  if (!(result[0] instanceof Polyline)) {
    throw new Error('Should be polyline');
  }
  t.is(result[0].segmentCount, 4);
});
