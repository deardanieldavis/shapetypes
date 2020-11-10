/* tslint:disable:readonly-keyword */
import anyTest, { TestInterface } from 'ava';
import {
  approximatelyEqual,
  Intersection, Line,
  Point,
  Ray,
  Vector
} from '../../index';

const test = anyTest as TestInterface<{
  line: Line;
}>;

test.beforeEach('Create test geometry', t => {
  t.context.line = Line.fromCoords([[-5,0], [5,0]]);
});

// -----------------------
// rayLine
// -----------------------

test('rayLine: Meet in cross at 0,0', t => {
  const ray = new Ray(new Point(0, -5), new Vector(0, 1));
  const result = Intersection.rayLine(ray, t.context.line);
  t.true(result.intersects);
  t.is(result.rayU, 5);
  t.is(result.lineU, 0.5);
});
test('rayLine: Meet in cross at 0,0 - onlyForward is true', t => {
  const ray = new Ray(new Point(0, -5), new Vector(0, 1));
  const result = Intersection.rayLine(ray, t.context.line, true);
  t.true(result.intersects);
  t.is(result.rayU, 5);
  t.is(result.lineU, 0.5);
});
test('rayLine: Meet in cross at 0,0 - angled', t => {
  const ray = new Ray(new Point(-3, -4), new Vector(3, 4));
  const result = Intersection.rayLine(ray, t.context.line);
  t.true(result.intersects);
  t.true(approximatelyEqual(result.rayU, 5));
  t.true(approximatelyEqual(result.lineU, 0.5));
});
test('rayLine: do not meet - parallel', t => {
  const ray = new Ray(new Point(-5, 0), new Vector(1, 0));
  const result = Intersection.rayLine(ray, t.context.line);
  t.is(result.intersects, false);
  t.is(result.rayU, 0);
  t.is(result.lineU, 0);
});
test('rayLine: Meet in cross at 0,0 - even though ray starts ahead of point', t => {
  const ray = new Ray(new Point(0, -5), new Vector(0, -1));
  const result = Intersection.rayLine(ray, t.context.line);
  t.true(result.intersects);
  t.is(result.rayU, -5);
  t.is(result.lineU, 0.5);
});
test('rayLine: Do not meet because only forwards and ray starts ahead of point', t => {
  const ray = new Ray(new Point(0, -5), new Vector(0, -1));
  const result = Intersection.rayLine(ray, t.context.line, true);
  t.is(result.intersects, false);
});

// -----------------------
// rayRay
// -----------------------

test('rayRay: Meet in cross at 0,0', t => {
  const rayA = new Ray(new Point(-5, 0), new Vector(1, 0));
  const rayB = new Ray(new Point(0, -5), new Vector(0, 1));
  const result = Intersection.rayRay(rayA, rayB);
  t.true(result.intersects);
  t.is(result.rayAU, 5);
  t.is(result.rayBU, 5);
});
test('rayRay: Meet in cross at 0,0 - angled', t => {
  const rayA = new Ray(new Point(-3, -4), new Vector(3, 4));
  const rayB = new Ray(new Point(0, -5), new Vector(0, 1));
  const result = Intersection.rayRay(rayA, rayB);
  t.true(result.intersects);
  t.true(approximatelyEqual(result.rayAU, 5));
  t.true(approximatelyEqual(result.rayBU, 5));
});
test('rayRay: do not meet - parallel', t => {
  const rayA = new Ray(new Point(-5, 0), new Vector(1, 0));
  const rayB = new Ray(new Point(0, 0), new Vector(1, 0));
  const result = Intersection.rayRay(rayA, rayB);
  t.is(result.intersects, false);
  t.is(result.rayAU, 0);
  t.is(result.rayBU, 0);
});
test('rayRay: Meet in cross at 0,0 - even though A starts ahead of point', t => {
  const rayA = new Ray(new Point(5, 0), new Vector(1, 0));
  const rayB = new Ray(new Point(0, -5), new Vector(0, 1));
  const result = Intersection.rayRay(rayA, rayB);
  t.true(result.intersects);
  t.is(result.rayAU, -5);
  t.is(result.rayBU, 5);
});
test('rayRay: Meet in cross at 0,0 - with only forward', t => {
  const rayA = new Ray(new Point(-5, 0), new Vector(1, 0));
  const rayB = new Ray(new Point(0, -5), new Vector(0, 1));
  const result = Intersection.rayRay(rayA, rayB, true);
  t.true(result.intersects);
  t.is(result.rayAU, 5);
  t.is(result.rayBU, 5);
});
test('rayRay: Does not meet because only forward is selected and A is head of point  A', t => {
  const rayA = new Ray(new Point(5, 0), new Vector(1, 0));
  const rayB = new Ray(new Point(0, -5), new Vector(0, 1));
  const result = Intersection.rayRay(rayA, rayB, true);
  t.is(result.intersects, false);
});

