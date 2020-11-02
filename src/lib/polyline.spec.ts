import anyTest, { TestInterface } from 'ava';

import {
  CurveOrientation,
  Interval,
  IntervalSorted,
  Line,
  Plane,
  Point,
  PointContainment,
  Polyline,
  Rectangle,
  shapetypesSettings,
  Vector
} from '../index';

const test = anyTest as TestInterface<{
  triangle: Polyline;
  triangleReversed: Polyline;
  rect: Polyline;
  elbow: Polyline;
}>;

test.beforeEach('Create test geometry', t => {
  t.context.triangle = new Polyline(
    [new Point(0, 0), new Point(1, 1), new Point(2, 0)],
    true
  );
  t.context.triangleReversed = new Polyline(
    [new Point(0, 0), new Point(2, 0), new Point(1, 1)],
    true
  );
  t.context.rect = Rectangle.fromCenter(Plane.worldXY(), 10, 20).toPolyline();
  t.context.elbow = Polyline.fromCoords([
    [10, 0],
    [0, 0],
    [0, 10]
  ]);
});

// -----------------------
// CONSTRUCTOR
// -----------------------

test('Constructor: Sets the points correctly', t => {
  const poly = new Polyline([
    new Point(0, 0),
    new Point(1, 1),
    new Point(2, 0)
  ]);
  t.is(poly.points.length, 3);
  t.true(poly.from.equals(new Point(0, 0)));
  t.true(poly.to.equals(new Point(2, 0)));
});
test('Constructor: Sets the points correctly in closed polyline', t => {
  const poly = new Polyline(
    [new Point(0, 0), new Point(1, 1), new Point(2, 0)],
    true
  );
  t.is(poly.points.length, 4);
  t.true(poly.from.equals(new Point(0, 0)));
  t.true(poly.to.equals(new Point(0, 0)));
});

// -----------------------
// STATIC
// -----------------------
test('fromCoords: Sets the points correctly', t => {
  const poly = Polyline.fromCoords([
    [0, 0],
    [1, 1],
    [2, 0]
  ]);
  t.is(poly.points.length, 3);
  t.true(poly.from.equals(new Point(0, 0)));
  t.true(poly.to.equals(new Point(2, 0)));
});
test('fromCoords: Sets the points correctly in closed polyline', t => {
  const poly = Polyline.fromCoords(
    [
      [0, 0],
      [1, 1],
      [2, 0]
    ],
    true
  );
  t.true(t.context.triangle.equals(poly));
});

// -----------------------
// GET
// -----------------------
test('area: returns correct area', t => {
  t.is(t.context.triangle.area, 1);
  t.is(t.context.rect.area, 200);
});
test('area: open polyline doesnt have an area', t => {
  t.is(t.context.elbow.area, 0);
});

test('boundingBox: returns smallest bounding box', t => {
  const bb = t.context.triangle.boundingBox;
  t.is(bb.xRange.min, 0);
  t.is(bb.xRange.max, 2);
  t.is(bb.yRange.min, 0);
  t.is(bb.yRange.max, 1);
});

test('count: returns correct number of points in polyline', t => {
  t.is(t.context.triangle.count, 4);
  t.is(t.context.elbow.count, 3);
});

test('from: returns correct point', t => {
  t.true(t.context.triangle.from.equals(new Point(0, 0)));
  t.true(t.context.elbow.from.equals(new Point(10, 0)));
});

test('isClosed: correctly identifies closed and open polylines', t => {
  t.is(t.context.triangle.isClosed, true);
  t.is(t.context.elbow.isClosed, false);
});

test('length: returns correct length', t => {
  t.is(t.context.rect.length, 10 + 10 + 20 + 20);
  t.is(t.context.elbow.length, 20);
});

test('orientation: an unclosed polyline cant have an orientation', t => {
  t.is(t.context.elbow.orientation, CurveOrientation.undefined);
});
test('orientation: triangle is clockwise', t => {
  shapetypesSettings.invertY = false;
  t.is(t.context.triangle.orientation, CurveOrientation.clockwise);
  t.is(
    t.context.triangleReversed.orientation,
    CurveOrientation.counterclockwise
  );
});
test('orientation: triangle is counterclockwise if inverted', t => {
  shapetypesSettings.invertY = true;
  t.is(t.context.triangle.orientation, CurveOrientation.counterclockwise);
  t.is(t.context.triangleReversed.orientation, CurveOrientation.clockwise);
});

test('points: returns correct points', t => {
  t.is(t.context.triangle.points.length, 4);
  t.true(t.context.triangle.points[0].equals(new Point(0, 0)));
  t.true(t.context.triangle.points[1].equals(new Point(1, 1)));
  t.true(t.context.triangle.points[2].equals(new Point(2, 0)));
  t.true(t.context.triangle.points[3].equals(new Point(0, 0)));
});

test('segmentCount: returns correct number of segments', t => {
  t.is(t.context.triangle.segmentCount, 3);
  t.is(t.context.elbow.segmentCount, 2);
});

test('segments: returns correct segments', t => {
  t.is(t.context.triangle.segments.length, 3);
  const a = new Point(0, 0);
  const b = new Point(1, 1);
  const c = new Point(2, 0);
  t.true(t.context.triangle.segments[0].equals(new Line(a, b)));
  t.true(t.context.triangle.segments[1].equals(new Line(b, c)));
  t.true(t.context.triangle.segments[2].equals(new Line(c, a)));
});

test('to: returns correct point', t => {
  t.true(t.context.triangle.to.equals(new Point(0, 0)));
  t.true(t.context.elbow.to.equals(new Point(0, 10)));
});

// -----------------------
// PUBLIC
// -----------------------

test('center: returns correct point', t => {
  t.true(t.context.rect.center().equals(new Point(0, 0)));
  t.true(t.context.elbow.center().equals(new Point(2.5, 2.5)));
  t.is(t.context.triangle.center().x, 1);
});

// A set of points to test closestPoint, closestIndex, and closestParameter
interface Points {
  p: Point; // The test point
  index: number; // Index of closest point
  closest: Point; // Closest point
  parameter: number; // Parameter of closest point
}
const POINTS: readonly Points[] = [
  // Start point
  { closest: new Point(0, 0), index: 0, parameter: 0, p: new Point(0, 0) },
  // Other corner
  { closest: new Point(2, 0), index: 2, parameter: 2, p: new Point(2, 0) },
  // Middle of line
  {
    closest: new Point(1.5, 0),
    index: 2,
    p: new Point(1.5, 0),
    parameter: 2.25
  },
  // Off middle of line
  {
    closest: new Point(1.5, 0),
    index: 2,
    p: new Point(1.5, -10),
    parameter: 2.25
  }
];

test('closestIndex: returns index of closest point', t => {
  for (const point of POINTS) {
    t.is(t.context.triangle.closestIndex(point.p), point.index);
  }
});

test('closestParameter: returns the parameter of the closest point', t => {
  for (const point of POINTS) {
    t.is(t.context.triangle.closestParameter(point.p), point.parameter);
  }
});

test('closestPoint: returns the closest point', t => {
  for (const point of POINTS) {
    t.true(t.context.triangle.closestPoint(point.p).equals(point.closest));
  }
});
test('closestPoint: returns interior point when set to true', t => {
  const p = new Point(1, 0.5);
  t.true(t.context.triangle.closestPoint(p, true).equals(p));
});

test('deleteShortSegments: doesnt change a polyline without short segments', t => {
  const result = t.context.triangle.deleteShortSegments();
  t.is(result.segmentCount, 3);
});
test('deleteShortSegments: removes short segment in middle', t => {
  const line = new Polyline(
    [new Point(0, 0), new Point(2, 0), new Point(2.1, 0), new Point(4, 0)],
    false
  );
  const result = line.deleteShortSegments(0.2);
  t.is(result.segmentCount, 2);
});
test('deleteShortSegments: removes short segment at end', t => {
  const line = new Polyline(
    [new Point(0, 0), new Point(3.8, 0), new Point(3.9, 0), new Point(4, 0)],
    false
  );
  const result = line.deleteShortSegments(0.2);
  t.is(result.segmentCount, 2);
});

test('equals: correctly identifies two identical shapes', t => {
  const triangle = new Polyline(
    [new Point(0, 0), new Point(1, 1), new Point(2, 0)],
    true
  );
  t.true(t.context.triangle.equals(triangle));
});
test('equals: correctly identifies that one shape has a point in slightly the wrong spot', t => {
  const triangle = new Polyline(
    [new Point(0, 0), new Point(2.1, 0), new Point(1, 1)],
    true
  );
  t.is(t.context.triangle.equals(triangle), false);
});
test('equals: polylines with different numbers of points arent equal', t => {
  t.is(t.context.triangle.equals(t.context.elbow), false);
});

test('makeClosed: correctly closes an open curve', t => {
  const closed = t.context.elbow.makeClosed();
  t.is(closed.segmentCount, 3);
  t.true(closed.to.equals(new Point(10, 0)));
});
test('makeClosed: if curve is already closed, returns same curve', t => {
  const closed = t.context.triangle.makeClosed();
  t.true(t.context.triangle.equals(closed));
});

test('mergeColinear: joins the two colinear segments', t => {
  const line = new Polyline(
    [new Point(0, 0), new Point(1, 0), new Point(2, 0), new Point(2, 2)],
    false
  );
  const result = line.mergeColinearSegments();
  t.is(result.segmentCount, 2);
  t.true(result.points[0].equals(new Point(0, 0)));
  t.true(result.points[1].equals(new Point(2, 0)));
  t.true(result.points[2].equals(new Point(2, 2)));
});
test('mergeColinear: merges segments that are slightly off', t => {
  const line = new Polyline(
    [new Point(0, 0), new Point(1, 0.00001), new Point(2, 0), new Point(2, 2)],
    false
  );
  const result = line.mergeColinearSegments();
  t.is(result.segmentCount, 2);
  t.true(result.points[0].equals(new Point(0, 0)));
  t.true(result.points[1].equals(new Point(2, 0)));
  t.true(result.points[2].equals(new Point(2, 2)));
});
test('mergeColinear: on closed polylines, merges final points if needed', t => {
  const line = new Polyline(
    [new Point(0, 0), new Point(1, 0), new Point(0, 2), new Point(-1, 0)],
    true
  );
  const result = line.mergeColinearSegments();
  t.is(result.segmentCount, 3);
  t.true(result.points[0].equals(new Point(1, 0)));
  t.true(result.points[1].equals(new Point(0, 2)));
  t.true(result.points[2].equals(new Point(-1, 0)));
});

test('normalAt: returns inward vector on closed shape', t => {
  shapetypesSettings.invertY = false;
  const normal = t.context.triangle.normalAt(2.5);
  t.true(normal.equals(new Vector(0, 1)));
});
test('normalAt: returns inward vector on closed shape if axis inverted', t => {
  shapetypesSettings.invertY = true;
  const normal = t.context.triangle.normalAt(2.5);
  t.true(normal.equals(new Vector(0, 1)));
});
test('normalAt: returns inward vector on closed shape when anticlockwise', t => {
  shapetypesSettings.invertY = false;
  const normal = t.context.triangleReversed.normalAt(0.5);
  t.true(normal.equals(new Vector(0, 1)));
});
test('normalAt: returns inward vector on closed shape when anticlockwise if axis inverted', t => {
  shapetypesSettings.invertY = true;
  const normal = t.context.triangleReversed.normalAt(0.5);
  t.true(normal.equals(new Vector(0, 1)));
});
test('normalAt: returns vector on left when not closed', t => {
  shapetypesSettings.invertY = false;
  const normal = t.context.elbow.normalAt(0.5);
  t.true(normal.equals(new Vector(0, -1)));
});
test('normalAt: returns vector on right when not closed and axis inverted', t => {
  shapetypesSettings.invertY = true;
  const normal = t.context.elbow.normalAt(0.5);
  t.true(normal.equals(new Vector(0, -1)));
});

test('pointAt: returns correct point', t => {
  for (const point of POINTS) {
    t.true(t.context.triangle.pointAt(point.parameter).equals(point.closest));
  }
});

test('segmentAt: returns correct line', t => {
  const segment = t.context.triangle.segmentAt(1);
  t.true(segment.equals(new Line(new Point(1, 1), new Point(2, 0))));
});
test('segmentAt: throws error if out of bounds', t => {
  t.throws(() => {
    t.context.triangle.segmentAt(-1);
  });
  t.throws(() => {
    t.context.triangle.segmentAt(100);
  });
});

test('trim: if domain of full line, should return original line', t => {
  const trimmed = t.context.triangle.trim(new IntervalSorted(0, 3));
  t.true(trimmed.equals(t.context.triangle));
});
test('trim: shortens a line', t => {
  const line = new Polyline([new Point(0, 0), new Point(1, 0)]);
  const trimmed = line.trim(new IntervalSorted(0.25, 0.75));
  t.true(trimmed.from.equals(new Point(0.25, 0)));
  t.true(trimmed.to.equals(new Point(0.75, 0)));
});
test('trim: works on a closed polyline', t => {
  const trimmed = t.context.triangle.trim(new IntervalSorted(0.5, 2.5));
  t.is(trimmed.isClosed, false);
  t.is(trimmed.count, 4);
  t.true(trimmed.points[0].equals(new Point(0.5, 0.5)));
  t.true(trimmed.points[1].equals(new Point(1, 1)));
  t.true(trimmed.points[2].equals(new Point(2, 0)));
  t.true(trimmed.points[3].equals(new Point(1, 0)));
});
test('trim: reverses line if descending', t => {
  const trimmed = t.context.triangle.trim(new Interval(3, 0));
  t.true(trimmed.equals(t.context.triangleReversed));
});

test('reverse: reverses a polyline', t => {
  const reversed = t.context.triangle.reverse();
  t.true(t.context.triangleReversed.equals(reversed));
});

test('toString: returns string in correct format', t => {
  t.is(t.context.triangle.toString(), '[(0,0),(1,1),(2,0),(0,0)]');
});

// -----------------------
// CLOSED
// -----------------------
test('contains: a point a long way outside isnt contained', t => {
  t.is(t.context.rect.contains(new Point(100, 0)), PointContainment.outside);
});
test('contains: point on edge', t => {
  t.is(t.context.rect.contains(new Point(5, 0)), PointContainment.coincident);
});
test('contains: point inside', t => {
  t.is(t.context.rect.contains(new Point(4, 0)), PointContainment.inside);
});
test('contains: point inside bounding box but outside curve is still outside', t => {
  t.is(t.context.triangle.contains(new Point(0, 1)), PointContainment.outside);
});
test('contains: throws error if applied to an open curve', t => {
  t.throws(() => {
    t.context.elbow.contains(new Point(0, 0));
  });
});

test('withOrientation: returns same curve when orienting in current direction', t => {
  shapetypesSettings.invertY = false;
  const oriented = t.context.triangle.withOrientation(
    CurveOrientation.clockwise
  );
  t.true(oriented.equals(t.context.triangle));
});
test('withOrientation: reverses direction of curve', t => {
  shapetypesSettings.invertY = false;
  const oriented = t.context.triangle.withOrientation(
    CurveOrientation.counterclockwise
  );
  t.true(oriented.equals(t.context.triangleReversed));
});
test('withOrientation: setting open curve to undefiend returns same curve', t => {
  const oriented = t.context.elbow.withOrientation(CurveOrientation.undefined);
  t.true(oriented.equals(t.context.elbow));
});
test('withOrientation: throws error if applied to an open curve', t => {
  t.throws(() => {
    t.context.elbow.withOrientation(CurveOrientation.clockwise);
  });
});


// -----------------------
// TRANSFORMABLE
// -----------------------
test('changeBasis: can shift polyline', t => {
  const from = Plane.worldXY();
  const to = new Plane(new Point(3, 4), Vector.worldX());
  const changed = t.context.rect.changeBasis(from, to);
  t.is(changed.area, 10 * 20);
  t.true(changed.center().equals(new Point(-3, -4)));
});

test('planeToPlane: can shift polyline', t => {
  const from = Plane.worldXY();
  const to = new Plane(new Point(3, 4), Vector.worldX());
  const planed = t.context.rect.planeToPlane(from, to);
  t.is(planed.area, 10 * 20);
  t.true(planed.center().equals(new Point(3, 4)));
});

test('rotate: can rotate the polyline', t => {
  const rotated = t.context.rect.rotate(Math.PI / 2);
  t.is(rotated.area, 10 * 20);
  t.true(rotated.center().equals(new Point(0, 0)));
});

test('scale: can unevenly scale the polyline', t => {
  const scaled = t.context.rect.scale(2, 3);
  t.true(scaled.isClosed);
  t.is(scaled.area, 10 * 2 * 3 * 20);
});

test('translate: can move the polyline', t => {
  const moved = t.context.rect.translate(new Vector(3, 4));
  t.true(moved.center().equals(new Point(3, 4)));
});
