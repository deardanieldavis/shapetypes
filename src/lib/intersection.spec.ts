// tslint:disable:no-let
import anyTest, { TestInterface } from 'ava';
import { BoundingBox } from './boundingBox';
import { Circle } from './circle';
import { Intersection, LineCircleIntersection } from './intersection';
import { Interval } from './interval';
import { Line } from './line';
import { Plane } from './plane';
import { Point } from './point';
import { Ray } from './ray';
import { Rectangle } from './rectangle';
import { Vector } from './vector';

const test = anyTest as TestInterface<{
  box: BoundingBox;
  boxShifted: BoundingBox;
  circle: Circle;
}>;

test.beforeEach('Create test geometry', t => {
  t.context.box = new BoundingBox(new Interval(-10, 10),new Interval(-10, 10));
  t.context.boxShifted = new BoundingBox(new Interval(-10, 10),new Interval(5, 35));
  t.context.circle = new Circle(1, new Point(3,4));
});


// -----------------------
// LINES
// -----------------------
test('lineLine: Meet in cross at 0,0', t => {
  const lineA = Line.fromCoords([[-10, 0], [10,0]]);
  const lineB = Line.fromCoords([[0, -10], [0, 10]]);
  const result = Intersection.lineLine(lineA, lineB);
  t.true(result.intersects);
  t.is(result.lineAu, 0.5);
  t.is(result.lineBu, 0.5);
});
test('lineLine: Meet in cross at 0,0, reversed', t => {
  const lineA = Line.fromCoords([[-10, 0], [10,0]]);
  const lineB = Line.fromCoords([[0, 10], [0, -10]]);
  const result = Intersection.lineLine(lineA, lineB);
  t.true(result.intersects);
  t.is(result.lineAu, 0.5);
  t.is(result.lineBu, 0.5);
});
test('lineLine: Meet in cross at -10,0', t => {
  const lineA = Line.fromCoords([[-10, 0], [10,0]]);
  const lineB = Line.fromCoords([[-10, -10], [-10, 10]]);
  const result = Intersection.lineLine(lineA, lineB);
  t.true(result.intersects);
  t.is(result.lineAu, 0);
  t.is(result.lineBu, 0.5);
});
test('lineLine: Meet in cross at 0,10', t => {
  const lineA = Line.fromCoords([[-10, 10], [10,10]]);
  const lineB = Line.fromCoords([[0, -10], [0, 10]]);
  const result = Intersection.lineLine(lineA, lineB);
  t.true(result.intersects);
  t.is(result.lineAu, 0.5);
  t.is(result.lineBu, 1);
});
test('lineLine: Meet at angle at 0,00', t => {
  const lineA = Line.fromCoords([[-10,0], [10,0]]);
  const lineB = Line.fromCoords([[-10, -10], [10, 10]]);
  const result = Intersection.lineLine(lineA, lineB);
  t.true(result.intersects);
  t.is(result.lineAu, 0.5);
  t.is(result.lineBu, 0.5);
});
test('lineLine: Do not meet', t => {
  const lineA = Line.fromCoords([[-10, 0], [10,0]]);
  const lineB = Line.fromCoords([[0, 10], [0, 20]]);
  const result = Intersection.lineLine(lineA, lineB);
  t.is(result.intersects, false);
});
test('lineLine: Infinite, meet in cross at 0,0', t => {
  const lineA = Line.fromCoords([[-10, 0], [10,0]]);
  const lineB = Line.fromCoords([[0, -10], [0, 10]]);
  const result = Intersection.lineLine(lineA, lineB, false);
  t.true(result.intersects);
  t.is(result.lineAu, 0.5);
  t.is(result.lineBu, 0.5);
});
test('lineLine: Infinite, meet below lineB', t => {
  const lineA = Line.fromCoords([[-10, 0], [10,0]]);
  const lineB = Line.fromCoords([[0, 10], [0, 20]]);
  const result = Intersection.lineLine(lineA, lineB, false);
  t.true(result.intersects);
  t.is(result.lineAu, 0.5);
  t.is(result.lineBu, -1);
});
test('lineLine: Infinite, meet at an angle at 0,0', t => {
  const lineA = Line.fromCoords([[-10, -10], [-5,-5]]);
  const lineB = Line.fromCoords([[5, -5], [10, -10]]);
  const result = Intersection.lineLine(lineA, lineB, false);
  t.true(result.intersects);
  t.is(result.lineAu, 2);
  t.is(result.lineBu, -1);
});


test('lineBox: Above the box', t => {
  const line = Line.fromCoords([[-5, 20], [5,20]]);
  const result = Intersection.lineBox(line, t.context.box);
  t.is(result.intersects, false);
  t.is(result.domain.min, 0);
  t.is(result.domain.max, 0);
});
test('lineBox: Below the box', t => {
  const line = Line.fromCoords([[-5, -20], [5,-20]]);
  const result = Intersection.lineBox(line, t.context.box);
  t.is(result.intersects, false);
});
test('lineBox: Left of the box', t => {
  const line = Line.fromCoords([[-20, -5], [-20,5]]);
  const result = Intersection.lineBox(line, t.context.box);
  t.is(result.intersects, false);
});
test('lineBox: Right of the box', t => {
  const line = Line.fromCoords([[20, -5], [20,5]]);
  const result = Intersection.lineBox(line, t.context.box);
  t.is(result.intersects, false);
});
test('lineBox: Through left side', t => {
  const line = Line.fromCoords([[-20, 0], [0,0]]);
  const result = Intersection.lineBox(line, t.context.box);
  t.is(result.intersects, true);
  t.is(result.domain.min, 0.5);
  t.is(result.domain.max, 1);
});
test('lineBox: Through right side', t => {
  const line = Line.fromCoords([[9, 0], [19,0]]);
  const result = Intersection.lineBox(line, t.context.box);
  t.is(result.intersects, true);
  t.is(result.domain.min, 0);
  t.is(result.domain.max, 0.1);
});
test('lineBox: Through bottom side', t => {
  const line = Line.fromCoords([[0, 0], [0,-20]]);
  const result = Intersection.lineBox(line, t.context.box);
  t.is(result.intersects, true);
  t.is(result.domain.min, 0);
  t.is(result.domain.max, 0.5);
});
test('lineBox: Through top side', t => {
  const line = Line.fromCoords([[0, 0], [0,20]]);
  const result = Intersection.lineBox(line, t.context.box);
  t.is(result.intersects, true);
  t.is(result.domain.min, 0);
  t.is(result.domain.max, 0.5);
});
test('lineBox: Through top right corner', t => {
  const line = Line.fromCoords([[0, 0], [100,100]]);
  const result = Intersection.lineBox(line, t.context.box);
  t.is(result.intersects, true);
  t.is(result.domain.min, 0);
  t.is(result.domain.max, 0.1);
});
test('lineBox: Through two corners', t => {
  const line = Line.fromCoords([[-20, 20], [20,-20]]);
  const result = Intersection.lineBox(line, t.context.box);
  t.is(result.intersects, true);
  t.is(result.domain.min, 0.25);
  t.is(result.domain.max, 0.75);
});
test('lineBox: Touching top right corner', t => {
  const line = Line.fromCoords([[0, 20], [20,0]]);
  const result = Intersection.lineBox(line, t.context.box);
  t.is(result.intersects, true);
  t.is(result.domain.min, 0.5);
  t.is(result.domain.max, 0.5);
});
test('lineBox: Just above top right corner', t => {
  const line = Line.fromCoords([[0, 21], [20,1]]);
  const result = Intersection.lineBox(line, t.context.box);
  t.is(result.intersects, false);
});
test('lineBox: fully inside box', t => {
  const line = Line.fromCoords([[-5, 5], [0,0]]);
  const result = Intersection.lineBox(line, t.context.box);
  t.is(result.intersects, true);
  t.is(result.domain.min, 0);
  t.is(result.domain.max, 1);
});


// t.context.circle = new Circle(10, new Point(3,4));
test('lineCircle: straight through middle', t => {
  const line = Line.fromCoords([[1, 4], [5,4]]);
  const result = Intersection.lineCircle(line, t.context.circle);
  t.is(result.intersects, LineCircleIntersection.multiple);
  t.is(result.u[0], 0.25);
  t.is(result.u[1], 0.75);
});
test('lineCircle: enters but no exit', t => {
  const line = Line.fromCoords([[1, 4], [3,4]]);
  const result = Intersection.lineCircle(line, t.context.circle);
  t.is(result.intersects, LineCircleIntersection.single);
  t.is(result.u[0], 0.5);
});
test('lineCircle: starts inside', t => {
  const line = Line.fromCoords([[3, 4], [5,4]]);
  const result = Intersection.lineCircle(line, t.context.circle);
  t.is(result.intersects, LineCircleIntersection.single);
  t.is(result.u[0], 0.5);
});
test('lineCircle: tangent', t => {
  const line = Line.fromCoords([[1, 3], [5,3]]);
  const result = Intersection.lineCircle(line, t.context.circle);
  t.is(result.intersects, LineCircleIntersection.single);
  t.is(result.u[0], 0.5);
});
test('lineCircle: below', t => {
  const line = Line.fromCoords([[1, -3], [5,-3]]);
  const result = Intersection.lineCircle(line, t.context.circle);
  t.is(result.intersects, LineCircleIntersection.none);
  t.is(result.u.length, 0);
});
test('lineCircle: doesnt enter', t => {
  const line = Line.fromCoords([[0, 4], [1,4]]);
  const result = Intersection.lineCircle(line, t.context.circle);
  t.is(result.intersects, LineCircleIntersection.none);
  t.is(result.u.length, 0);
});



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







test('RayLine', t => {
  let line = new Line(new Point(0, 0), new Point(0, 10));
  let ray = new Ray(new Point(-1, 5), new Vector(1, 0));

  // Middle of line
  let result = Intersection.RayLine(ray, line);
  t.is(result.success, true);
  t.is(result.rayU, 1);
  t.is(result.lineU, 0.5);

  // Independent of ray direction magnitude
  ray = new Ray(new Point(-2, 5), new Vector(100, 0));
  result = Intersection.RayLine(ray, line);
  t.is(result.success, true);
  t.is(result.rayU, 2);
  t.is(result.lineU, 0.5);

  // Behind ray
  ray = new Ray(new Point(2, 5), new Vector(1, 0));
  result = Intersection.RayLine(ray, line);
  t.is(result.success, false);

  result = Intersection.RayLine(ray, line, true);
  t.is(result.success, true);
  t.is(result.rayU, -2);

  // At u = 0
  ray = new Ray(new Point(0, 5), new Vector(1, 0));
  result = Intersection.RayLine(ray, line);
  t.is(result.success, true);
  t.is(result.rayU, 0);

  // Angled
  line = new Line(new Point(-5, -5), new Point(5, 5));
  ray = new Ray(new Point(5, -5), new Vector(-5, 5));
  result = Intersection.RayLine(ray, line);
  t.is(result.success, true);
  const intersectionPoint = ray.pointAt(result.rayU);
  t.is(intersectionPoint.x, 0);
  t.is(intersectionPoint.y, 0);
});

test('RayPolyline', t => {
  const ray = new Ray(new Point(-10, 0), new Vector(10, 0));
  const polyline = Rectangle.fromCenter(Plane.worldXY(), 20, 20).toPolyline();

  // Line through middle of square
  let intersections = Intersection.RayPolyline(ray, polyline);
  t.is(intersections.length, 1);
  t.is(intersections[0], 20);

  // Include zero
  intersections = Intersection.RayPolyline(ray, polyline, true);
  t.is(intersections.length, 2);
  t.is(intersections.includes(0), true);
  t.is(intersections.includes(20), true);
});




test('HorizontalRayPolyline', t => {
  const polyline = Rectangle.fromCenter(Plane.worldXY(), 20, 20).toPolyline();

  // To right of polyline
  let results = Intersection.HorizontalRayPolyline(new Point(20, 0), polyline);
  t.is(results.length, 0);

  // Middle of polyline
  results = Intersection.HorizontalRayPolyline(new Point(0, 0), polyline);
  t.is(results.length, 1);
  t.is(results[0], 10);

  // Left of polyline
  results = Intersection.HorizontalRayPolyline(new Point(-20, 0), polyline);
  t.is(results.length, 2);

  // Above polyline
  results = Intersection.HorizontalRayPolyline(new Point(0, 20), polyline);
  t.is(results.length, 0);
});
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
});
