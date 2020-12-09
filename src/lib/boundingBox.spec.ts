/* tslint:disable:readonly-keyword no-object-mutation */
import anyTest, { TestInterface } from 'ava';

import {
  approximatelyEqual,
  BoundingBox,
  Interval,
  IntervalSorted,
  Point,
  Transform,
  Vector
} from '../index';

const test = anyTest as TestInterface<{
  xRange: IntervalSorted;
  yRange: IntervalSorted;
  bb: BoundingBox;
  bb100: BoundingBox;
  range10: IntervalSorted;
}>;

test.beforeEach('Create test geometry', t => {
  t.context.xRange = new IntervalSorted(0, 10);
  t.context.yRange = new IntervalSorted(5, 25);
  t.context.bb = new BoundingBox(t.context.xRange, t.context.yRange);
  t.context.range10 = new IntervalSorted(0, 10);
  t.context.bb100 = new BoundingBox(t.context.range10, t.context.range10);
});

// -----------------------
// CONSTRUCTOR
// -----------------------

test('Constructor: Sets correct interval ranges', t => {
  const bb = new BoundingBox(new Interval(0, 10), new Interval(5, 25));
  t.is(bb.xRange.min, 0);
  t.is(bb.xRange.max, 10);
  t.is(bb.yRange.min, 5);
  t.is(bb.yRange.max, 25);
});

// -----------------------
// STATIC
// -----------------------
test('fromCorners: Sets correct interval ranges', t => {
  const bb = BoundingBox.fromCorners(new Point(0, 5), new Point(10, 25));
  t.true(bb.xRange.equals(t.context.xRange));
  t.true(bb.yRange.equals(t.context.yRange));
});

test('fromPoints: Sets correct interval ranges', t => {
  const bb = BoundingBox.fromPoints([
    new Point(0, 5),
    new Point(1, 6),
    new Point(10, 25),
    new Point(9, 24)
  ]);
  t.true(bb.xRange.equals(t.context.xRange));
  t.true(bb.yRange.equals(t.context.yRange));
});

test('union: Creates bounding box that encapsulates inputs', t => {
  const boxA = new BoundingBox(new Interval(0, 10), new Interval(0, 10));
  const boxB = new BoundingBox(new Interval(20, 30), new Interval(-10, 10));
  const result = BoundingBox.union(boxA, boxB);
  t.is(result.xRange.min, 0);
  t.is(result.xRange.max, 30);
  t.is(result.yRange.min, -10);
  t.is(result.yRange.max, 10);
});

test("intersection: boxes that don't overlap in x-direction return undefined", t => {
  const boxA = new BoundingBox(new Interval(0, 10), new Interval(0, 10));
  const boxB = new BoundingBox(new Interval(20, 30), new Interval(0, 10));
  const result = BoundingBox.intersection(boxA, boxB);
  t.is(result, undefined);
});

test("intersection: boxes that don't overlap in y direction return undefined", t => {
  const boxA = new BoundingBox(new Interval(0, 10), new Interval(0, 10));
  const boxB = new BoundingBox(new Interval(0, 10), new Interval(20, 30));
  const result = BoundingBox.intersection(boxA, boxB);
  t.is(result, undefined);
});

test('intersection: boxes with overlaping corners returns overlapping part', t => {
  const boxA = new BoundingBox(new Interval(0, 10), new Interval(0, 10));
  const boxB = new BoundingBox(new Interval(5, 15), new Interval(5, 15));
  const result = BoundingBox.intersection(boxA, boxB);
  if (result === undefined) {
    throw new Error('No result from union');
  }
  t.is(result.min.x, 5);
  t.is(result.min.y, 5);
  t.is(result.max.x, 10);
  t.is(result.max.y, 10);
});

test('intersection: when a smaller box is inside a larger one, returns the smaller box', t => {
  const boxA = new BoundingBox(new Interval(0, 10), new Interval(0, 10));
  const boxB = new BoundingBox(new Interval(2, 7), new Interval(2, 7));
  const result = BoundingBox.intersection(boxA, boxB);
  if (result === undefined) {
    throw new Error('No result from union');
  }
  t.is(result.min.x, 2);
  t.is(result.min.y, 2);
  t.is(result.max.x, 7);
  t.is(result.max.y, 7);
});

// -----------------------
// GET & SET
// -----------------------

test('area: calculates', t => {
  t.is(t.context.bb.area, 200);
});

test('center: calculates', t => {
  t.is(t.context.bb.center.x, 5);
  t.is(t.context.bb.center.y, 15);
});

test('min: calculates', t => {
  t.is(t.context.bb.min.x, 0);
  t.is(t.context.bb.min.y, 5);
});

test('max: calculates', t => {
  t.is(t.context.bb.max.x, 10);
  t.is(t.context.bb.max.y, 25);
});

// -----------------------
// Public
// -----------------------

test('closestPoint: works when point is outside the corner', t => {
  const point = new Point(-2, 3);
  t.is(t.context.bb.closestPoint(point).x, 0);
  t.is(t.context.bb.closestPoint(point).y, 5);
});
test('closestPoint: works when point is outside the edge', t => {
  const point = new Point(5, 3);
  t.is(t.context.bb.closestPoint(point).x, 5);
  t.is(t.context.bb.closestPoint(point).y, 5);
});
test('closestPoint: works when point is outside the other edge', t => {
  const point = new Point(12, 15);
  t.is(t.context.bb.closestPoint(point).x, 10);
  t.is(t.context.bb.closestPoint(point).y, 15);
});
test('closestPoint: works when point is inside the box', t => {
  const point = new Point(5, 6);
  t.is(t.context.bb.closestPoint(point).x, 5);
  t.is(t.context.bb.closestPoint(point).y, 6);
});
test("closestPoint: works when point is inside the box but interior isn't included", t => {
  const point = new Point(5, 6);
  t.is(t.context.bb.closestPoint(point, false).x, 5);
  t.is(t.context.bb.closestPoint(point, false).y, 5);
});
test("closestPoint: works when point is inside the box but interior isn't included on other edge", t => {
  const point = new Point(9, 15);
  t.is(t.context.bb.closestPoint(point, false).x, 10);
  t.is(t.context.bb.closestPoint(point, false).y, 15);
});

test('contains: works when point is inside the box', t => {
  const insidePoint = new Point(5, 6);
  t.is(t.context.bb.contains(insidePoint), true);
  t.is(t.context.bb.contains(insidePoint, true), true);
});

test('contains: works when point is outside the box', t => {
  const outsidePoint = new Point(5, 3);
  t.is(t.context.bb.contains(outsidePoint), false);
  t.is(t.context.bb.contains(outsidePoint, true), false);
});

test('contains: works when point is on edge of box', t => {
  const edgePoint = new Point(5, 5);
  t.is(t.context.bb.contains(edgePoint), true);
  t.is(t.context.bb.contains(edgePoint, true), false);
});

test('corner: Generates points in right position', t => {
  t.is(t.context.bb.corner(true, true).x, 0);
  t.is(t.context.bb.corner(true, true).y, 5);

  t.is(t.context.bb.corner(true, false).x, 0);
  t.is(t.context.bb.corner(true, false).y, 25);

  t.is(t.context.bb.corner(false, true).x, 10);
  t.is(t.context.bb.corner(false, true).y, 5);

  t.is(t.context.bb.corner(false, false).x, 10);
  t.is(t.context.bb.corner(false, false).y, 25);
});

test('getCorners: Generates points in correct order', t => {
  const corners = t.context.bb.getCorners();
  t.is(corners.length, 4);
  t.is(corners.length, 4);
  t.is(corners[0].x, 0);
  t.is(corners[0].y, 5);
  t.is(corners[1].x, 0);
  t.is(corners[1].y, 25);
  t.is(corners[2].x, 10);
  t.is(corners[2].y, 25);
  t.is(corners[3].x, 10);
  t.is(corners[3].y, 5);
});

test('getEdges: Generates correct number of edges', t => {
  const edges = t.context.bb.getEdges();
  t.is(edges.length, 4);
});

test('inflate: can inflate the box evenly', t => {
  const bb = t.context.bb.inflate(1);
  t.is(bb.xRange.min, -1);
  t.is(bb.xRange.max, 11);
  t.is(bb.yRange.min, 4);
  t.is(bb.yRange.max, 26);
});

test('inflate: can inflate the box differently on x and y axis', t => {
  const bb = t.context.bb.inflate(1, 5);
  t.is(bb.xRange.min, -1);
  t.is(bb.xRange.max, 11);
  t.is(bb.yRange.min, 0);
  t.is(bb.yRange.max, 30);
});

test('overlaps: returns true because boxes overlap', t => {
  const b = new BoundingBox(
    new IntervalSorted(5, 15),
    new IntervalSorted(5, 25)
  );
  t.is(t.context.bb.overlaps(b), true);
});
test('overlaps: returns false because boxes dont overlap on xaxis', t => {
  const b = new BoundingBox(
    new IntervalSorted(15, 25),
    new IntervalSorted(5, 25)
  );
  t.is(t.context.bb.overlaps(b), false);
});
test('overlaps: returns false because boxes dont overlap on yaxis', t => {
  const b = new BoundingBox(
    new IntervalSorted(0, 10),
    new IntervalSorted(35, 45)
  );
  t.is(t.context.bb.overlaps(b), false);
});

test('equals: can identify when boxes are exactly identical and slightly different', t => {
  t.is(
    t.context.bb.equals(
      new BoundingBox(new Interval(0, 10), new Interval(5, 25))
    ),
    true
  ); // Totally the same
  t.is(
    t.context.bb.equals(
      new BoundingBox(new Interval(1, 10), new Interval(5, 25))
    ),
    false
  ); // Slightly different
});

// An array containing pairs of points. The first point global coordinates for the point. The second point is the local coordinates for the same point.
const MAPPEDPOINTS: ReadonlyArray<any> = [
  [new Point(0, 5), new Point(0, 0)],
  [new Point(10, 25), new Point(1, 1)],
  [new Point(1, 15), new Point(0.1, 0.5)]
];

test('pointAt: Converts a local point to global coordinates', t => {
  for (const p of MAPPEDPOINTS) {
    const global = p[0];
    const local = p[1];
    t.true(t.context.bb.pointAt(local).equals(global));
  }
});
test('pointAt: Converts a local point to global coordinates, using xy', t => {
  for (const p of MAPPEDPOINTS) {
    const global = p[0];
    const local = p[1];
    t.true(t.context.bb.pointAt(local.x, local.y).equals(global));
  }
});

test('remap: Converts a global point to local coordinates', t => {
  for (const p of MAPPEDPOINTS) {
    const global = p[0];
    const local = p[1];
    const result = t.context.bb.remapToBox(global);
    t.is(result.x, local.x);
    t.is(result.y, local.y);
  }
});

test('toPolyline: Converts box to polyline that is the right size', t => {
  const poly = t.context.bb.toPolyline();
  t.is(poly.segmentCount, 4);
  t.is(poly.area, 200);
  t.is(poly.points[0].x, 0);
  t.is(poly.points[0].y, 5);
  t.is(poly.points[2].x, 10);
  t.is(poly.points[2].y, 25);
});

test('toString: Returns string in correct format', t => {
  t.is(t.context.bb.toString(), '[[0,10],[5,25]]');
});

test('withXRange: can change interval', t => {
  const bb = t.context.bb.withXRange(new IntervalSorted(-10, 5));
  t.is(bb.xRange.min, -10);
  t.is(bb.xRange.max, 5);
});

test('withYRange: can change interval', t => {
  const bb = t.context.bb.withYRange(new IntervalSorted(-10, 5));
  t.is(bb.yRange.min, -10);
  t.is(bb.yRange.max, 5);
});

// -----------------------
// TRANSFORMABLE
// -----------------------

test('transform: Translates the bounding box and updates x and y ranges', t => {
  const trans = Transform.translate(new Vector(1, 2));
  const bb = t.context.bb.transform(trans);

  t.is(bb.area, 200);
  t.is(bb.xRange.min, 1);
  t.is(bb.xRange.max, 11);
  t.is(bb.yRange.min, 7);
  t.is(bb.yRange.max, 27);
});

test('translate: Translates the bounding box and updates x and y ranges', t => {
  const bb = t.context.bb.translate(new Vector(1, 2));

  t.is(bb.area, 200);
  t.is(bb.xRange.min, 1);
  t.is(bb.xRange.max, 11);
  t.is(bb.yRange.min, 7);
  t.is(bb.yRange.max, 27);
});

test('rotate: Rotates the bounding box 90 degrees', t => {
  const bb = t.context.bb.rotate(Math.PI / 2);

  t.is(approximatelyEqual(bb.area, 200), true);
  t.is(approximatelyEqual(bb.xRange.min, -25), true);
  t.is(approximatelyEqual(bb.xRange.max, -5), true);
  t.is(approximatelyEqual(bb.yRange.min, 0), true);
  t.is(approximatelyEqual(bb.yRange.max, 10), true);
});

test('scale: Scales the bounding box', t => {
  const bb = t.context.bb.scale(2, 3, new Point(0, 5));

  t.is(bb.xRange.min, 0);
  t.is(bb.xRange.max, 20);
  t.is(bb.yRange.min, 5);
  t.is(bb.yRange.max, 65);
});
