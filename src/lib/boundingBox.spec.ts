// tslint:disable:no-let
import test from 'ava';
import { BoundingBox } from './boundingBox';
import { Interval } from './interval';
import { IntervalSorted } from './intervalSorted';
import { Point } from './point';
import { shapetypesSettings } from './settings';
import { Transform } from './transform';
import { approximatelyEqual } from './utilities';
import { Vector } from './vector';

// -----------------------
// STATIC
// -----------------------
test('From corners', t => {
  const bb = BoundingBox.fromCorners(new Point(5,10), new Point(30, 8));
  t.is(bb.xRange.min, 5);
  t.is(bb.xRange.max, 30);
  t.is(bb.yRange.min, 8);
  t.is(bb.yRange.max, 10);
});

test('From points', t => {
  const bb = BoundingBox.fromPoints([new Point(5,10), new Point(30, 8), new Point(30,9), new Point(10,9)]);
  t.is(bb.xRange.min, 5);
  t.is(bb.xRange.max, 30);
  t.is(bb.yRange.min, 8);
  t.is(bb.yRange.max, 10);
});

test('From existing', t => {
  const old = new BoundingBox(new Interval(5, 30), new Interval(10, 8));
  const bb = BoundingBox.fromExisting(old);
  t.is(bb.xRange.min, 5);
  t.is(bb.xRange.max, 30);
  t.is(bb.yRange.min, 8);
  t.is(bb.yRange.max, 10);
});

test('Union', t => {
  const boxA = new BoundingBox(new Interval(0, 10), new Interval(0, 10));
  const boxB = new BoundingBox(new Interval(20, 30), new Interval(-10, 10));
  const result = BoundingBox.union(boxA, boxB);
  t.is(result.xRange.min, 0);
  t.is(result.xRange.max, 30);
  t.is(result.yRange.min, -10);
  t.is(result.yRange.max, 10);

});


test('Intersection', t => {
  const boxA = new BoundingBox(new Interval(0, 10), new Interval(0, 10));

  // No intersection
  let boxB = new BoundingBox(new Interval(20, 30), new Interval(0, 10));
  let result = BoundingBox.intersection(boxA, boxB);
  t.is(result, undefined);

  // Corner intersection
  boxB = new BoundingBox(new Interval(5, 15), new Interval(5, 15));
  result = BoundingBox.intersection(boxA, boxB);
  if (result === undefined) {
    throw new Error('No result from union');
  }
  t.is(result.min.x, 5);
  t.is(result.min.y, 5);
  t.is(result.max.x, 10);
  t.is(result.max.y, 10);

  // Full side intersection
  boxB = new BoundingBox(new Interval(5, 15), new Interval(-15, 15));
  result = BoundingBox.intersection(boxA, boxB);
  if (result === undefined) {
    throw new Error('No result from union');
  }
  t.is(result.min.x, 5);
  t.is(result.min.y, 0);
  t.is(result.max.x, 10);
  t.is(result.max.y, 10);

  // Fully inside
  boxB = new BoundingBox(new Interval(2, 7), new Interval(2, 7));
  result = BoundingBox.intersection(boxA, boxB);
  if (result === undefined) {
    throw new Error('No result from union');
  }
  t.is(result.min.x, 2);
  t.is(result.min.y, 2);
  t.is(result.max.x, 7);
  t.is(result.max.y, 7);
});

// -----------------------
// CONSTRUCTOR
// -----------------------

test('Construct', t => {
  const bb = new BoundingBox(new Interval(5, 30), new Interval(8, 10));
  t.is(bb.xRange.min, 5);
  t.is(bb.xRange.max, 30);
  t.is(bb.yRange.min, 8);
  t.is(bb.yRange.max, 10);
});


// -----------------------
// GET & SET
// -----------------------

test('Area', t => {
  const bb = new BoundingBox(new IntervalSorted(0, 10), new IntervalSorted(5, 25));
  t.is(bb.area, 200);
});

test('Center', t => {
  const bb = new BoundingBox(new IntervalSorted(0, 10), new IntervalSorted(5, 25));
  t.is(bb.center.x, 5);
  t.is(bb.center.y, 15);
});

test('Min', t => {
  const bb = new BoundingBox(new IntervalSorted(0, 10), new IntervalSorted(5, 25));
  t.is(bb.min.x, 0);
  t.is(bb.min.y, 5);
});

test('Max', t => {
  const bb = new BoundingBox(new IntervalSorted(0, 10), new IntervalSorted(5, 25));
  t.is(bb.max.x, 10);
  t.is(bb.max.y, 25);
});

test('xRange', t => {
  const bb = new BoundingBox(new IntervalSorted(0, 10), new IntervalSorted(5, 25));
  t.is(bb.xRange.min, 0);
  t.is(bb.xRange.max, 10);

  bb.xRange = new IntervalSorted(-10, 5);
  t.is(bb.xRange.min, -10);
  t.is(bb.xRange.max, 5);
});

test('yRange', t => {
  const bb = new BoundingBox(new IntervalSorted(0, 10), new IntervalSorted(5, 25));
  t.is(bb.yRange.min, 5);
  t.is(bb.yRange.max, 25);

  bb.yRange = new IntervalSorted(-10, 5);
  t.is(bb.yRange.min, -10);
  t.is(bb.yRange.max, 5);
});

// -----------------------
// Public
// -----------------------

test('Closest', t => {
  const bb = new BoundingBox(new IntervalSorted(0, 10), new IntervalSorted(5, 25));

  // Inside, include inside
  const insidePoint = new Point(5, 6);
  t.is(bb.closestPoint(insidePoint).x, 5);
  t.is(bb.closestPoint(insidePoint).y, 6);

  // Inside, don't include inside
  t.is(bb.closestPoint(insidePoint, false).x, 5);
  t.is(bb.closestPoint(insidePoint, false).y, 5);

  // Outside, don't include inside
  const outsidePoint = new Point(5, 3);
  t.is(bb.closestPoint(outsidePoint).x, 5);
  t.is(bb.closestPoint(outsidePoint).y, 5);
});

test('Contains', t => {
  const bb = new BoundingBox(new IntervalSorted(0, 10), new IntervalSorted(5, 25));

  // Inside point
  const insidePoint = new Point(5, 6);
  t.is(bb.contains(insidePoint), true);
  t.is(bb.contains(insidePoint, true), true);

  // Outside point
  const outsidePoint = new Point(5, 3);
  t.is(bb.contains(outsidePoint), false);
  t.is(bb.contains(outsidePoint, true), false);

  // Edge point
  const edgePoint = new Point(5, 5);
  t.is(bb.contains(edgePoint), true);
  t.is(bb.contains(edgePoint, true), false);

  // Corner point
  const cornerPoint = new Point(0, 5);
  t.is(bb.contains(cornerPoint), true);
  t.is(bb.contains(cornerPoint, true), false);
});

test('Corner', t => {
  const bb = new BoundingBox(new IntervalSorted(0, 10), new IntervalSorted(5, 25));

  t.is(bb.corner(true, true).x, 0);
  t.is(bb.corner(true, true).y, 5);

  t.is(bb.corner(true, false).x, 0);
  t.is(bb.corner(true, false).y, 25);

  t.is(bb.corner(false, true).x, 10);
  t.is(bb.corner(false, true).y, 5);

  t.is(bb.corner(false, false).x, 10);
  t.is(bb.corner(false, false).y, 25);
});

test('Corners', t => {
  const bb = new BoundingBox(new IntervalSorted(0, 10), new IntervalSorted(5, 25));
  const corners = bb.getCorners();

  t.is(corners.length, 4);

  t.is(corners[0].x, 0);
  t.is(corners[0].y, 5);
  t.is(corners[1].x, 10);
  t.is(corners[1].y, 5);
  t.is(corners[2].x, 10);
  t.is(corners[2].y, 25);
  t.is(corners[3].x, 0);
  t.is(corners[3].y, 25);
});

test('Edges', t => {
  const bb = new BoundingBox(new IntervalSorted(0, 10), new IntervalSorted(5, 25));
  const edges = bb.getEdges();

  t.is(edges.length, 4);
});

test('Inflate', t => {
  let bb = new BoundingBox(new IntervalSorted(0, 10), new IntervalSorted(5, 25));
  bb.inflate(1);
  t.is(bb.xRange.min, -1);
  t.is(bb.xRange.max, 11);
  t.is(bb.yRange.min, 4);
  t.is(bb.yRange.max, 26);

  bb = new BoundingBox(new IntervalSorted(0, 10), new IntervalSorted(5, 25));
  bb.inflate(1, 5);
  t.is(bb.xRange.min, -1);
  t.is(bb.xRange.max, 11);
  t.is(bb.yRange.min, 0);
  t.is(bb.yRange.max, 30);
});

test('Point at', t => {
  const bb = new BoundingBox(new IntervalSorted(0, 10), new IntervalSorted(5, 25));

  t.is(bb.pointAt(0, 0).x, 0);
  t.is(bb.pointAt(0, 0).y, 5);
  t.is(bb.pointAt(1, 1).x, 10);
  t.is(bb.pointAt(1, 1).y, 25);
  t.is(bb.pointAt(0.1, 0.5).x, 1);
  t.is(bb.pointAt(0.1, 0.5).y, 15);
});

test('Remap', t => {
  const bb = new BoundingBox(new IntervalSorted(0, 10), new IntervalSorted(5, 25));

  const min = bb.remapToBox(new Point(0, 5));
  t.is(min.u, 0);
  t.is(min.v, 0);

  const max = bb.remapToBox(new Point(10, 25));
  t.is(max.u, 1);
  t.is(max.v, 1);

  const inside = bb.remapToBox(new Point(1, 15));
  t.is(inside.u, 0.1);
  t.is(inside.v, 0.5);
});

test('Polyline', t => {
  const bb = new BoundingBox(new IntervalSorted(0, 10), new IntervalSorted(5, 25));
  const poly = bb.toPolyline();

  t.is(poly.segmentCount, 4);
  t.is(poly.area, 200);
  t.is(poly.points[0].x, 0);
  t.is(poly.points[0].y, 5);
  t.is(poly.points[2].x, 10);
  t.is(poly.points[2].y, 25);
});

test('Transform - move', t => {
  const bb = new BoundingBox(new IntervalSorted(0, 10), new IntervalSorted(5, 25));
  const trans = Transform.translate(new Vector(1, 2));
  bb.transform(trans);

  t.is(bb.area, 200);
  t.is(bb.xRange.min, 1);
  t.is(bb.xRange.max, 11);
  t.is(bb.yRange.min, 7);
  t.is(bb.yRange.max, 27);
});

test('Transform - rotate', t => {
  const bb = new BoundingBox(new IntervalSorted(0, 10), new IntervalSorted(5, 25));
  shapetypesSettings.invertY = false;
  const trans = Transform.rotate(Math.PI / 2);
  bb.transform(trans);

  t.is(approximatelyEqual(bb.area, 200), true);
  t.is(approximatelyEqual(bb.xRange.min, 5), true);
  t.is(approximatelyEqual(bb.xRange.max, 25), true);
  t.is(approximatelyEqual(bb.yRange.min, -10), true);
  t.is(approximatelyEqual(bb.yRange.max, 0), true);
});

test('Transform - scale', t => {
  const bb = new BoundingBox(new IntervalSorted(0, 10), new IntervalSorted(5, 25));
  const trans = Transform.scale(2, 3, new Point(0, 5));
  bb.transform(trans);

  t.is(bb.xRange.min, 0);
  t.is(bb.xRange.max, 20);
  t.is(bb.yRange.min, 5);
  t.is(bb.yRange.max, 65);
});



