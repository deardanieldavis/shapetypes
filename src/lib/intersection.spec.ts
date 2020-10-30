// tslint:disable:no-let
import anyTest, { TestInterface } from 'ava';
import { BoundingBox, Circle, Interval, Point } from '../index';

const test = anyTest as TestInterface<{
  box: BoundingBox;
  boxShifted: BoundingBox;
  circle: Circle;
}>;

test.beforeEach('Create test geometry', t => {
  t.context.box = new BoundingBox(new Interval(-10, 10), new Interval(-10, 10));
  t.context.boxShifted = new BoundingBox(
    new Interval(-10, 10),
    new Interval(5, 35)
  );
  t.context.circle = new Circle(1, new Point(3, 4));
});

test('dummy test', t => {
  t.is(1, 1);
});

/*
// -----------------------
// LINES
// -----------------------





/*
test('LinePolyline', t => {
  const line = new Line(new Point(-20, 0), new Point(20, 0));
  const polyline = Rectangle.fromCenter(Plane.worldXY(), 20, 20).toPolyline();

  // Line through middle of square
  const intersections = Intersection.line(line, polyline);
  t.is(intersections.length, 2);
  t.is(intersections[0], 0.25);
});*/

/*
test('LineLineInfinite', t => {
  const lineA = new Line(new Point(-10, 0), new Point(10, 0));
  let lineB = new Line(new Point(0, -10), new Point(0, 10));

  // through 0,0
  let result = Intersection.LineLineInfinite(lineA, lineB);
  t.is(result.success, true);
  t.is(result.lineAu, 0.5);
  t.is(result.lineBu, 0.5);

  // at end of line A
  lineB = new Line(new Point(10, -10), new Point(10, 10));
  result = Intersection.LineLineInfinite(lineA, lineB);
  t.is(result.success, true);
  t.is(result.lineAu, 1);
  t.is(result.lineBu, 0.5);

  // beyond the end of line A, not touching
  lineB = new Line(new Point(20, -10), new Point(20, 10));
  result = Intersection.LineLineInfinite(lineA, lineB);
  t.is(result.success, true);
  t.is(result.lineAu, 1.5);
  t.is(result.lineBu, 0.5);

  // parallel
  lineB = new Line(new Point(-10, -10), new Point(10, -10));
  result = Intersection.LineLineInfinite(lineA, lineB);
  t.is(result.success, false);
});*/

/*
test('HorizontalRayLine', t => {
  const line = new Line(new Point(0, 0), new Point(0, 10));

  // To right of line
  let result = IntersectionHelpers.HorizontalRayLine(new Point(10, 0), line);
  t.is(result.success, false);

  // To left of line
  result = IntersectionHelpers.HorizontalRayLine(new Point(-10, 0), line);
  t.is(result.success, true);
  t.is(result.rayU, 10);
});*/

/*
test('PolylinePolyline', t => {
  const polylineA = new Rectangle(Plane.worldXY(), 20, 20).toPolyline();

  // Full intersection
  let center = new Plane(new Point(5, 5), Vector.worldX());
  let polylineB = new Rectangle(center, 20, 20).toPolyline();
  let result = Intersection.PolylinePolyline(polylineA, polylineB);
  t.is(result.length, 2);

  // No intersection
  center = new Plane(new Point(50, 5), Vector.worldX());
  polylineB = new Rectangle(center, 20, 20).toPolyline();
  result = Intersection.PolylinePolyline(polylineA, polylineB);
  t.is(result.length, 0);
});*/
