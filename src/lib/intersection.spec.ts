// tslint:disable:no-let
import test from 'ava';
import { Intersection } from './intersection';
import { Line } from './line';
import { Plane } from './plane';
import { Point } from './point';
import { Ray } from './ray';
import { Rectangle } from './rectangle';
import { Vector } from './vector';




// -----------------------
// LINES
// -----------------------
test('LineLine: Meet in cross at 0,0', t => {
  const lineA = Line.fromCoords([[-10, 0], [10,0]]);
  const lineB = Line.fromCoords([[0, -10], [0, 10]]);
  const result = Intersection.LineLine(lineA, lineB);
  t.true(result.success);
  t.is(result.lineAu, 0.5);
  t.is(result.lineBu, 0.5);
});
test('LineLine: Meet in cross at 0,0, reversed', t => {
  const lineA = Line.fromCoords([[-10, 0], [10,0]]);
  const lineB = Line.fromCoords([[0, 10], [0, -10]]);
  const result = Intersection.LineLine(lineA, lineB);
  t.true(result.success);
  t.is(result.lineAu, 0.5);
  t.is(result.lineBu, 0.5);
});
test('LineLine: Meet in cross at -10,0', t => {
  const lineA = Line.fromCoords([[-10, 0], [10,0]]);
  const lineB = Line.fromCoords([[-10, -10], [-10, 10]]);
  const result = Intersection.LineLine(lineA, lineB);
  t.true(result.success);
  t.is(result.lineAu, 0);
  t.is(result.lineBu, 0.5);
});
test('LineLine: Meet in cross at 0,10', t => {
  const lineA = Line.fromCoords([[-10, 10], [10,10]]);
  const lineB = Line.fromCoords([[0, -10], [0, 10]]);
  const result = Intersection.LineLine(lineA, lineB);
  t.true(result.success);
  t.is(result.lineAu, 0.5);
  t.is(result.lineBu, 1);
});
test('LineLine: Meet at angle at 0,00', t => {
  const lineA = Line.fromCoords([[-10,0], [10,0]]);
  const lineB = Line.fromCoords([[-10, -10], [10, 10]]);
  const result = Intersection.LineLine(lineA, lineB);
  t.true(result.success);
  t.is(result.lineAu, 0.5);
  t.is(result.lineBu, 0.5);
});
test('LineLine: Do not meet', t => {
  const lineA = Line.fromCoords([[-10, 0], [10,0]]);
  const lineB = Line.fromCoords([[0, 10], [0, 20]]);
  const result = Intersection.LineLine(lineA, lineB);
  t.is(result.success, false);
});
test('LineLine: Infinite, meet in cross at 0,0', t => {
  const lineA = Line.fromCoords([[-10, 0], [10,0]]);
  const lineB = Line.fromCoords([[0, -10], [0, 10]]);
  const result = Intersection.LineLine(lineA, lineB, true);
  t.true(result.success);
  t.is(result.lineAu, 0.5);
  t.is(result.lineBu, 0.5);
});
test('LineLine: Infinite, meet below lineB', t => {
  const lineA = Line.fromCoords([[-10, 0], [10,0]]);
  const lineB = Line.fromCoords([[0, 10], [0, 20]]);
  const result = Intersection.LineLine(lineA, lineB, true);
  t.true(result.success);
  t.is(result.lineAu, 0.5);
  t.is(result.lineBu, -1);
});
test('LineLine: Infinite, meet at an angle at 0,0', t => {
  const lineA = Line.fromCoords([[-10, -10], [-5,-5]]);
  const lineB = Line.fromCoords([[5, -5], [10, -10]]);
  const result = Intersection.LineLine(lineA, lineB, true);
  t.true(result.success);
  t.is(result.lineAu, 2);
  t.is(result.lineBu, -1);
});






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


/*
test('LinePolyline', t => {
  const line = new Line(new Point(-20, 0), new Point(20, 0));
  const polyline = Rectangle.fromCenter(Plane.worldXY(), 20, 20).toPolyline();

  // Line through middle of square
  const intersections = Intersection.LinePolyline(line, polyline);
  t.is(intersections.length, 2);
  t.is(intersections[0], 0.25);
});*/

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
