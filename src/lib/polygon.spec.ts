/* tslint:disable:readonly-keyword no-object-mutation*/
import anyTest, { TestInterface } from 'ava';
import {
  approximatelyEqual,
  CurveOrientation,
  Plane,
  Point,
  PointContainment,
  Polygon,
  Polyline,
  Rectangle,
  Vector
} from '../index';

const test = anyTest as TestInterface<{
  polyline: Polyline;
  hole: Polyline;
  triangle: Polygon;
  triangleHole: Polygon;
}>;

test.beforeEach('Create test geometry', t => {
  t.context.polyline = Polyline.fromCoords(
    [
      [6, 0],
      [3, 3],
      [0, 0]
    ],
    true
  );
  t.context.hole = Polyline.fromCoords(
    [
      [2, 1],
      [3, 2],
      [4, 1],
    ],
    true
  );
  t.context.triangle = new Polygon(t.context.polyline);
  t.context.triangleHole = new Polygon(t.context.polyline, [t.context.hole]);
});

// -----------------------
// CONSTRUCTOR
// -----------------------

test('Constructor: Using an open polyline throws error', t => {
  const polyline = Polyline.fromCoords(
    [
      [0, 0],
      [3, 3],
      [6, 0]
    ],
    false
  );
  t.throws(() => {
    // tslint:disable-next-line:no-unused-expression
    new Polygon(polyline);
  });
});
test('Constructor: Changes orientation of boundary to be clockwise', t => {
  const polyline = Polyline.fromCoords(
    [
      [0, 0],
      [3, 3],
      [6, 0]
    ],
    true
  );
  const polygon = new Polygon(polyline);

  t.is(polyline.orientation(), CurveOrientation.clockwise);
  t.is(polygon.boundary.orientation(), CurveOrientation.counterclockwise);
});
test('Constructor: Using an open polyline for a hole throws error', t => {
  const polyline = Polyline.fromCoords(
    [
      [0, 0],
      [3, 3],
      [6, 0]
    ],
    true
  );
  const hole = Polyline.fromCoords(
    [
      [2, 1],
      [3, 2],
      [4, 1]
    ],
    false
  );
  t.throws(() => {
    // tslint:disable-next-line:no-unused-expression
    new Polygon(polyline, [hole]);
  });
});
test('Constructor: Changes curve orientation of hole to be anti-clockwise', t => {
  const polyline = Polyline.fromCoords(
    [
      [0, 0],
      [3, 3],
      [6, 0]
    ],
    true
  );
  const hole = Polyline.fromCoords(
    [
      [4, 1],
      [3, 2],
      [2, 1],
    ],
    true
  );
  const polygon = new Polygon(polyline, [hole]);

  t.is(hole.orientation(), CurveOrientation.counterclockwise);
  t.is(polygon.holes[0].orientation(), CurveOrientation.clockwise);
});

test('fromCoords: Can create polygon from coordinates', t => {
  const polygon = Polygon.fromCoords([
    [
      [6, 0],
      [3, 3],
      [0, 0],
      [6, 0],
    ],
    [
      [2, 1],
      [3, 2],
      [4, 1],
      [2, 1]
    ]
  ]);
  t.true(polygon.equals(t.context.triangleHole));
});
test('fromCoords: throws an error if no coorindates passed', t => {
  t.throws(() => {
    // tslint:disable-next-line:no-unused-expression
    Polygon.fromCoords([]);
  });
});

// -----------------------
// GET
// -----------------------
test('area: polygon without hole returns correct area', t => {
  const polyline = new Rectangle(Plane.worldXY(), 20, 20).toPolyline();
  const polygon = new Polygon(polyline);
  t.is(polygon.area, 20 * 20);
});
test('area: polygon with hole', t => {
  const polyline = new Rectangle(Plane.worldXY(), 20, 20).toPolyline();
  const hole = new Rectangle(Plane.worldXY(), 10, 10).toPolyline();
  const polygon = new Polygon(polyline, [hole]);
  t.is(polygon.area, 20 * 20 - 10 * 10);
});

test('boundingBox: returns smallest bounding box', t => {
  const bb = t.context.triangleHole.boundingBox;
  t.is(bb.xRange.min, 0);
  t.is(bb.xRange.max, 6);
  t.is(bb.yRange.min, 0);
  t.is(bb.yRange.max, 3);
});

// -----------------------
// PUBLIC
// -----------------------
test('closestLoop: returns outer loop', t => {
  const loop = t.context.triangleHole.closestLoop(new Point(3, 10));
  t.true(loop.equals(t.context.polyline));
});
test('closestLoop: returns inner loop', t => {
  const loop = t.context.triangleHole.closestLoop(new Point(3, 1.5));
  t.true(loop.equals(t.context.hole));
});

test('closestPoint: point outside triangle', t => {
  const p = t.context.triangleHole.closestPoint(new Point(3, 10));
  t.true(p.equals(new Point(3, 3)));
});
test('closestPoint: point on outside triangle', t => {
  const p = t.context.triangleHole.closestPoint(new Point(3, 3));
  t.true(p.equals(new Point(3, 3)));
});
test('closestPoint: point inside triangle', t => {
  const p = t.context.triangleHole.closestPoint(new Point(3, 2.5));
  t.true(p.equals(new Point(3, 2.5)));
});
test('closestPoint: edge of hole', t => {
  const p = t.context.triangleHole.closestPoint(new Point(3, 1));
  t.true(p.equals(new Point(3, 1)));
});
test('closestPoint: inside hole', t => {
  const p = t.context.triangleHole.closestPoint(new Point(3, 1.1));
  t.true(p.equals(new Point(3, 1)));
});

test('contains: point outside triangle', t => {
  t.is(
    t.context.triangleHole.contains(new Point(3, 10)),
    PointContainment.outside
  );
});
test('contains: point on outside triangle', t => {
  t.is(
    t.context.triangleHole.contains(new Point(3, 3)),
    PointContainment.coincident
  );
});
test('contains: point inside triangle', t => {
  t.is(
    t.context.triangleHole.contains(new Point(3, 2.5)),
    PointContainment.inside
  );
});
test('contains: edge of hole', t => {
  t.is(
    t.context.triangleHole.contains(new Point(3, 1)),
    PointContainment.coincident
  );
});
test('contains: inside hole', t => {
  t.is(
    t.context.triangleHole.contains(new Point(3, 1.1)),
    PointContainment.outside
  );
});

test('equals: wrong number of holes', t => {
  t.is(t.context.triangleHole.equals(t.context.triangle), false);
});
test('equals: wrong boundary shape', t => {
  const polyline = Polyline.fromCoords(
    [
      [0, 0],
      [3, 3],
      [7, 0]
    ],
    true
  );
  const polygon = new Polygon(polyline);
  t.is(t.context.triangle.equals(polygon), false);
});
test('equals: wrong shaped hole', t => {
  const polyline = Polyline.fromCoords(
    [
      [0, 0],
      [3, 3],
      [6, 0]
    ],
    true
  );
  const hole = Polyline.fromCoords(
    [
      [2, 1],
      [4, 1],
      [3, 2.5]
    ],
    true
  );
  const polygon = new Polygon(polyline, [hole]);
  t.is(t.context.triangleHole.equals(polygon), false);
});
test('equals: exactly the same shapes', t => {
  const polyline = Polyline.fromCoords(
    [
      [6, 0],
      [3, 3],
      [0, 0],
    ],
    true
  );
  const hole = Polyline.fromCoords(
    [
      [2, 1],
      [3, 2],
      [4, 1],
    ],
    true
  );
  const polygon = new Polygon(polyline, [hole]);
  t.is(t.context.triangleHole.equals(polygon), true);
});

test('toString: returns string in right format', t => {
  t.is(
    t.context.triangleHole.toString(),
    '[[(6,0),(3,3),(0,0),(6,0)],[(2,1),(3,2),(4,1),(2,1)]]'
  );
});

// -----------------------
// Boolean
// -----------------------
test('Union: two adjacent rectangles join to become one', t => {
  const rectA = new Polygon(
    Rectangle.fromCorner(Plane.worldXY(), 10, 20).toPolyline()
  );
  const center = new Plane(new Point(10, 0), Vector.worldX());
  const rectB = new Polygon(Rectangle.fromCorner(center, 10, 20).toPolyline());
  const result = rectA.union(rectB);

  t.is(result.length, 1);
  if (!(result[0] instanceof Polygon)) {
    throw new Error('Should be polygon');
  }
  t.is(result[0].area, 20 * 20);
});
test('Union: a big rectangle over the trinagle returns the big rectangle', t => {
  const rectA = new Polygon(
    Rectangle.fromCorner(Plane.worldXY(), 20, 20).toPolyline()
  );
  const result = rectA.union(t.context.triangleHole);

  t.is(result.length, 1);
  t.is(result[0].area, 20 * 20);
});

test('intersection: two corner overlaps returns correct part', t => {
  const rectA = new Polygon(
    Rectangle.fromCorner(Plane.worldXY(), 10, 20).toPolyline()
  );
  const center = new Plane(new Point(5, 10), Vector.worldX());
  const rectB = new Polygon(Rectangle.fromCorner(center, 10, 20).toPolyline());
  const result = rectA.intersection(rectB);

  t.is(result.length, 1);
  t.is(result[0].area, 5 * 10);
});
test('intersection: rectangle over half the triangle should return half triangle', t => {
  const rectA = new Polygon(
    Rectangle.fromCorner(Plane.worldXY(), 6, 20).toPolyline()
  );
  const result = rectA.intersection(t.context.triangleHole);

  t.is(result.length, 1);
  t.is(result[0].area, 3 * 3 * 0.5 - 1 * 1 * 0.5);
});

test('difference: cuts corner out of one of them', t => {
  const rectA = new Polygon(
    Rectangle.fromCorner(Plane.worldXY(), 10, 20).toPolyline()
  );
  const center = new Plane(new Point(5, 10), Vector.worldX());
  const rectB = new Polygon(Rectangle.fromCorner(center, 10, 20).toPolyline());
  const result = rectA.difference(rectB);

  t.is(result.length, 1);
  t.is(result[0].area, 10 * 20 - 5 * 10);
});
test('difference: can cut a hole out of another rectangle', t => {
  const rectA = new Polygon(
    Rectangle.fromCorner(Plane.worldXY(), 10, 10).toPolyline()
  );
  const rectB = new Polygon(
    Rectangle.fromCorner(Plane.worldXY(), 1, 1).toPolyline()
  );
  const result = rectA.difference(rectB);

  t.is(result.length, 1);
  t.is(result[0].holes.length, 1);
  t.is(result[0].area, 10 * 10 - 1);
});

// -----------------------
// Translate
// -----------------------

test('changeBasis: can shift polygon', t => {
  const from = Plane.worldXY();
  const to = new Plane(new Point(3, 4), Vector.worldX());
  const changed = t.context.triangleHole.changeBasis(from, to);
  t.true(changed.boundary.from.equals(new Point(6 - 3, -4)));
});

test('rotate: can rotate the polygon', t => {
  const rotated = t.context.triangleHole.rotate(Math.PI / 2);
  const bb = rotated.boundingBox;
  t.is(bb.xRange.min, -3);
  t.true(approximatelyEqual(bb.xRange.max, 0));
  t.true(approximatelyEqual(bb.yRange.min, 0));
  t.is(bb.yRange.max, 6);
});

test('scale: can scale the polygon', t => {
  const scaled = t.context.triangleHole.scale(2, 3);
  const bb = scaled.boundingBox;
  t.is(bb.xRange.min, 0);
  t.is(bb.xRange.max, 6 * 2);
  t.is(bb.yRange.min, 0);
  t.is(bb.yRange.max, 3 * 3);
});

test('translate: can move the polygon', t => {
  const moved = t.context.triangleHole.translate(new Vector(3, 4));
  t.true(moved.boundary.from.equals(new Point(6+3, 4)));
  t.true(moved.holes[0].from.equals(new Point(2 + 3, 1 + 4)));
});
