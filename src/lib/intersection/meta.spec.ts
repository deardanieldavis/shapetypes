/* tslint:disable:readonly-keyword no-object-mutation*/
import anyTest, { TestInterface } from 'ava';
import {
  approximatelyEqual,
  BoundingBox,
  Circle,
  Intersection,
  Interval,
  Line,
  Point,
  Polygon,
  Polyline,
  Ray,
  Rectangle,
  Vector
} from '../../index';

const test = anyTest as TestInterface<{
  line: Line;
  ray: Ray;
  poly: Polyline;
}>;

test.beforeEach('Create test geometry', t => {
  t.context.line = Line.fromCoords([
    [0, 0],
    [10, 0]
  ]);
  t.context.ray = new Ray(new Point(0, 0), new Vector(1, 0));
  t.context.poly = Polyline.fromCoords([
    [0, 0],
    [5, 5],
    [10, 0]
  ]);
});

// -----------------------
// LINE
// -----------------------

test('line.point: On middle of line', t => {
  const result = Intersection.line(t.context.line, new Point(5, 0));
  t.is(result[0], 0.5);
});
test('line.point: Off end of line', t => {
  const result = Intersection.line(t.context.line, new Point(15, 0));
  t.is(result.length, 0);
});
test('line.point: Off middle of line', t => {
  const result = Intersection.line(t.context.line, new Point(5, 1));
  t.is(result.length, 0);
});

test('line.line: Line through middle', t => {
  const l = Line.fromCoords([
    [5, -10],
    [5, 10]
  ]);
  const result = Intersection.line(t.context.line, l);
  t.is(result[0], 0.5);
});
test('line.line: Line through middle touching at end', t => {
  const l = Line.fromCoords([
    [5, -10],
    [5, 0]
  ]);
  const result = Intersection.line(t.context.line, l);
  t.is(result[0], 0.5);
});
test('line.line: Line not touching', t => {
  const l = Line.fromCoords([
    [5, -10],
    [5, -5]
  ]);
  const result = Intersection.line(t.context.line, l);
  t.is(result.length, 0);
});

test('line.ray: Ray through middle', t => {
  const r = new Ray(new Point(5, 5), new Vector(0, -1));
  const result = Intersection.line(t.context.line, r);
  t.is(result[0], 0.5);
});
test('line.ray: Ray through end', t => {
  const r = new Ray(new Point(10, 5), new Vector(0, -1));
  const result = Intersection.line(t.context.line, r);
  t.is(result[0], 1);
});
test('line.ray: Ray misses end', t => {
  const r = new Ray(new Point(15, 5), new Vector(0, -1));
  const result = Intersection.line(t.context.line, r);
  t.is(result.length, 0);
});

test('line.box: Through both sides of box', t => {
  const b = new BoundingBox(new Interval(5, 10), new Interval(-5, 5));
  const result = Intersection.line(t.context.line, b);
  t.is(result[0], 0.5);
  t.is(result[1], 1);
});
test('line.box: Through only one side', t => {
  const b = new BoundingBox(new Interval(5, 15), new Interval(-5, 5));
  const result = Intersection.line(t.context.line, b);
  t.is(result.length, 1);
  t.is(result[0], 0.5);
});
test('line.box: Not touching', t => {
  const b = new BoundingBox(new Interval(11, 15), new Interval(-5, 5));
  const result = Intersection.line(t.context.line, b);
  t.is(result.length, 0);
});

test('line.circle: Through both sides', t => {
  const c = new Circle(1, new Point(5, 0));
  const result = Intersection.line(t.context.line, c);
  t.is(result[0], 0.4);
  t.is(result[1], 0.6);
});
test('line.circle: Through one sides', t => {
  const c = new Circle(1, new Point(10, 0));
  const result = Intersection.line(t.context.line, c);
  t.is(result.length, 1);
  t.is(result[0], 0.9);
});
test('line.circle: not touching', t => {
  const c = new Circle(1, new Point(15, 0));
  const result = Intersection.line(t.context.line, c);
  t.is(result.length, 0);
});

test('line.rectangle: Through both sides', t => {
  const r = Rectangle.fromCorners(new Point(5, -5), new Point(10, 10));
  const result = Intersection.line(t.context.line, r);
  t.is(result[0], 0.5);
  t.is(result[1], 1);
});
test('line.rectangle: Touches on corner, only intersects once', t => {
  const r = Rectangle.fromCorners(new Point(10, 0), new Point(20, 10));
  const result = Intersection.line(t.context.line, r);
  t.is(result.length, 1);
  t.is(result[0], 1);
});

test('line.polygon: Large polygon without a hole', t => {
  const b = Rectangle.fromCorners(
    new Point(0, -10),
    new Point(10, 10)
  ).toPolyline();
  const poly = new Polygon(b);
  const result = Intersection.line(t.context.line, poly);
  t.is(result.length, 2);
  t.is(result[0], 0);
  t.is(result[1], 1);
});
test('line.polygon: Large polygon with a hole', t => {
  const b = Rectangle.fromCorners(
    new Point(0, -10),
    new Point(10, 10)
  ).toPolyline();
  const h = Rectangle.fromCorners(
    new Point(4, -5),
    new Point(6, 5)
  ).toPolyline();
  const poly = new Polygon(b, [h]);
  const result = Intersection.line(t.context.line, poly);
  t.is(result.length, 4);
  t.true(approximatelyEqual(result[0], 0));
  t.is(result[1], 0.4);
  t.is(result[2], 0.6);
  t.is(result[3], 1);
});

test('line.array: Can apply to a number of shapes', t => {
  const p = new Point(5, 0);
  const b = Rectangle.fromCorners(
    new Point(0, -10),
    new Point(10, 10)
  ).toPolyline();
  const result = Intersection.line(t.context.line, [b, p]);
  t.is(result.length, 3);
  t.true(approximatelyEqual(result[0], 0));
  t.is(result[1], 0.5);
  t.is(result[2], 1);
});

// -----------------------
// Ray
// -----------------------

test('ray.point: In front of ray', t => {
  const result = Intersection.ray(t.context.ray, new Point(5, 0));
  t.is(result[0], 5);
});
test('ray.point: Behind ray', t => {
  const result = Intersection.ray(t.context.ray, new Point(-5, 0));
  t.is(result[0], -5);
});
test('ray.point: off ray', t => {
  const result = Intersection.ray(t.context.ray, new Point(5, 1));
  t.is(result.length, 0);
});

test('ray.line: intersecting', t => {
  const l = Line.fromCoords([
    [5, -10],
    [5, 10]
  ]);
  const result = Intersection.ray(t.context.ray, l);
  t.is(result[0], 5);
});
test('ray.line: Line not touching', t => {
  const l = Line.fromCoords([
    [5, -10],
    [5, -5]
  ]);
  const result = Intersection.ray(t.context.ray, l);
  t.is(result.length, 0);
});

test('ray.ray: intersecting', t => {
  const r = new Ray(new Point(5, 5), new Vector(0, -1));
  const result = Intersection.ray(t.context.ray, r);
  t.is(result[0], 5);
});
test('ray.ray: Parallel, not intersecting', t => {
  const r = new Ray(new Point(15, 5), new Vector(1, 0));
  const result = Intersection.ray(t.context.ray, r);
  t.is(result.length, 0);
});

test('ray.box: Through both sides of box', t => {
  const b = new BoundingBox(new Interval(5, 10), new Interval(-5, 5));
  const result = Intersection.ray(t.context.ray, b);
  t.is(result[0], 5);
  t.is(result[1], 10);
});
test('ray.box: Not touching', t => {
  const b = new BoundingBox(new Interval(5, 10), new Interval(-5, -1));
  const result = Intersection.ray(t.context.ray, b);
  t.is(result.length, 0);
});

test('ray.circle: Through both sides', t => {
  const c = new Circle(1, new Point(5, 0));
  const result = Intersection.ray(t.context.ray, c);
  t.is(result[0], 4);
  t.is(result[1], 6);
});
test('ray.circle: not touching', t => {
  const c = new Circle(1, new Point(5, 5));
  const result = Intersection.ray(t.context.ray, c);
  t.is(result.length, 0);
});

test('ray.rectangle: Through both sides', t => {
  const r = Rectangle.fromCorners(new Point(5, -5), new Point(10, 10));
  const result = Intersection.ray(t.context.ray, r);
  t.is(result[0], 5);
  t.is(result[1], 10);
});

test('ray.polygon: Large polygon without a hole', t => {
  const b = Rectangle.fromCorners(
    new Point(0, -10),
    new Point(10, 10)
  ).toPolyline();
  const poly = new Polygon(b);
  const result = Intersection.ray(t.context.ray, poly);
  t.is(result.length, 2);
  t.is(result[0], 0);
  t.is(result[1], 10);
});
test('ray.polygon: Large polygon with a hole', t => {
  const b = Rectangle.fromCorners(
    new Point(0, -10),
    new Point(10, 10)
  ).toPolyline();
  const h = Rectangle.fromCorners(
    new Point(4, -5),
    new Point(6, 5)
  ).toPolyline();
  const poly = new Polygon(b, [h]);
  const result = Intersection.ray(t.context.ray, poly);
  t.is(result.length, 4);
  t.true(approximatelyEqual(result[0], 0));
  t.is(result[1], 4);
  t.is(result[2], 6);
  t.is(result[3], 10);
});

test('ray.array: Can apply to a number of shapes', t => {
  const p = new Point(5, 0);
  const b = Rectangle.fromCorners(
    new Point(0, -10),
    new Point(10, 10)
  ).toPolyline();
  const result = Intersection.ray(t.context.ray, [b, p]);
  t.is(result.length, 3);
  t.true(approximatelyEqual(result[0], 0));
  t.is(result[1], 5);
  t.is(result[2], 10);
});

// -----------------------
// POLY
// -----------------------

test('poly.point: On middle of first segment', t => {
  const result = Intersection.polyline(t.context.poly, new Point(2.5, 2.5));
  t.is(result[0], 0.5);
});
test('poly.point: On node', t => {
  const result = Intersection.polyline(t.context.poly, new Point(5, 5));
  t.is(result.length, 1);
  t.is(result[0], 1);
});
test('poly.point: Off line', t => {
  const result = Intersection.polyline(t.context.poly, new Point(-5, 5));
  t.is(result.length, 0);
});

test('poly.box: At edges of box', t => {
  const box = new BoundingBox(new Interval(0, 10), new Interval(0, 5));
  const result = Intersection.polyline(t.context.poly, box);
  t.is(result.length, 3);
  t.is(result[0], 0);
  t.is(result[1], 1);
  t.is(result[2], 2);
});
test('poly.box: Misses box', t => {
  const box = new BoundingBox(new Interval(0, 10), new Interval(20, 25));
  const result = Intersection.polyline(t.context.poly, box);
  t.is(result.length, 0);
});

test('poly.rectangle: Cuts through line', t => {
  const rect = Rectangle.fromCorners(new Point(0, 2.5), new Point(10, 20));
  const result = Intersection.polyline(t.context.poly, rect);
  t.is(result.length, 2);
  t.is(result[0], 0.5);
  t.is(result[1], 1.5);
});
test('poly.rectangle: Misses line', t => {
  const rect = Rectangle.fromCorners(new Point(0, 6), new Point(10, 20));
  const result = Intersection.polyline(t.context.poly, rect);
  t.is(result.length, 0);
});

test('poly.array: Line and a point', t => {
  const line = Line.fromCoords([
    [0, 2.5],
    [10, 2.5]
  ]);
  const p = new Point(5, 5);
  const result = Intersection.polyline(t.context.poly, [line, p]);
  t.is(result.length, 3);
  t.is(result[0], 0.5);
  t.is(result[1], 1);
  t.is(result[2], 1.5);
});
