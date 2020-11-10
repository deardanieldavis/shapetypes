/* tslint:disable:readonly-keyword no-object-mutation*/
import anyTest, { TestInterface } from 'ava';
import { Circle, Intersection, Line, Point, Ray, Vector } from '../../index';

const test = anyTest as TestInterface<{
  circle: Circle;
}>;

test.beforeEach('Create test geometry', t => {
  t.context.circle = new Circle(1, new Point(3, 4));
});

// -----------------------
// LINE
// -----------------------
test('lineCircle: straight through middle', t => {
  const line = Line.fromCoords([
    [1, 4],
    [5, 4]
  ]);
  const result = Intersection.lineCircle(line, t.context.circle);
  t.is(result.intersects, Intersection.LineCircleIntersection.multiple);
  t.is(result.u[0], 0.25);
  t.is(result.u[1], 0.75);
});
test('lineCircle: enters but no exit', t => {
  const line = Line.fromCoords([
    [1, 4],
    [3, 4]
  ]);
  const result = Intersection.lineCircle(line, t.context.circle);
  t.is(result.intersects, Intersection.LineCircleIntersection.single);
  t.is(result.u[0], 0.5);
});
test('lineCircle: starts inside', t => {
  const line = Line.fromCoords([
    [3, 4],
    [5, 4]
  ]);
  const result = Intersection.lineCircle(line, t.context.circle);
  t.is(result.intersects, Intersection.LineCircleIntersection.single);
  t.is(result.u[0], 0.5);
});
test('lineCircle: tangent', t => {
  const line = Line.fromCoords([
    [1, 3],
    [5, 3]
  ]);
  const result = Intersection.lineCircle(line, t.context.circle);
  t.is(result.intersects, Intersection.LineCircleIntersection.single);
  t.is(result.u[0], 0.5);
});
test('lineCircle: below', t => {
  const line = Line.fromCoords([
    [1, -3],
    [5, -3]
  ]);
  const result = Intersection.lineCircle(line, t.context.circle);
  t.is(result.intersects, Intersection.LineCircleIntersection.none);
  t.is(result.u.length, 0);
});
test('lineCircle: doesnt enter', t => {
  const line = Line.fromCoords([
    [0, 4],
    [1, 4]
  ]);
  const result = Intersection.lineCircle(line, t.context.circle);
  t.is(result.intersects, Intersection.LineCircleIntersection.none);
  t.is(result.u.length, 0);
});

// -----------------------
// RAY
// -----------------------
// t.context.circle = new Circle(1, new Point(3, 4));
test('rayCircle: straight through middle', t => {
  const ray = new Ray(new Point(1, 4), new Vector(1, 0));
  const result = Intersection.rayCircle(ray, t.context.circle);
  t.is(result.intersects, Intersection.LineCircleIntersection.multiple);
  t.is(result.u[0], 1);
  t.is(result.u[1], 3);
});
test('rayCircle: starts inside', t => {
  const ray = new Ray(new Point(3, 4), new Vector(1, 0));
  const result = Intersection.rayCircle(ray, t.context.circle);
  t.is(result.intersects, Intersection.LineCircleIntersection.multiple);
  t.is(result.u[0], -1);
  t.is(result.u[1], 1);
});
test('rayCircle: starts inside, only forward', t => {
  const ray = new Ray(new Point(3, 4), new Vector(1, 0));
  const result = Intersection.rayCircle(ray, t.context.circle, true);
  t.is(result.intersects, Intersection.LineCircleIntersection.single);
  t.is(result.u[0], 1);
});
test('rayCircle: starts beyond, will intersect, only forward', t => {
  const ray = new Ray(new Point(10, 4), new Vector(1, 0));
  const result = Intersection.rayCircle(ray, t.context.circle, true);
  t.is(result.intersects, Intersection.LineCircleIntersection.none);
});
test('rayCircle: tangent', t => {
  const ray = new Ray(new Point(1, 3), new Vector(1, 0));
  const result = Intersection.rayCircle(ray, t.context.circle);
  t.is(result.intersects, Intersection.LineCircleIntersection.single);
  t.is(result.u[0], 2);
});
test('rayCircle: below circle', t => {
  const ray = new Ray(new Point(1, -3), new Vector(1, 0));
  const result = Intersection.rayCircle(ray, t.context.circle);
  t.is(result.intersects, Intersection.LineCircleIntersection.none);
});
