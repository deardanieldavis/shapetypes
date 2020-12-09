/* tslint:disable:readonly-keyword no-object-mutation*/
import anyTest, { TestInterface } from 'ava';
import { inRayRange, Plane, Point, Ray, RayRange, Vector } from '../index';

const test = anyTest as TestInterface<{
  angled: Ray;
  flat: Ray;
}>;

test.beforeEach('Create test geometry', t => {
  t.context.angled = new Ray(new Point(3, 4), new Vector(3, 4));
  t.context.flat = new Ray(new Point(3, 4), new Vector(1, 0));
});

// -----------------------
// UTILITY
// -----------------------
test('inRayRange: A positive number returns true for all ranges', t => {
  t.is(inRayRange(1, RayRange.positive), true);
  t.is(inRayRange(1, RayRange.positiveAndZero), true);
  t.is(inRayRange(1, RayRange.both), true);
});
test('inRayRange: Zero returns false for `positive` range', t => {
  t.is(inRayRange(0, RayRange.positive), false);
  t.is(inRayRange(0, RayRange.positiveAndZero), true);
  t.is(inRayRange(0, RayRange.both), true);
});
test('inRayRange: A negative number only returns true for `both`', t => {
  t.is(inRayRange(-1, RayRange.positive), false);
  t.is(inRayRange(-1, RayRange.positiveAndZero), false);
  t.is(inRayRange(-1, RayRange.both), true);
});

// -----------------------
// CONSTRUCTOR
// -----------------------
test('Constructor: Sets correct from and direction', t => {
  const ray = new Ray(new Point(3, 4), new Vector(3, 4));
  t.true(ray.from.equals(new Point(3, 4)));
  t.true(ray.direction.isParallelTo(new Vector(3, 4)));
});

// -----------------------
// STATIC
// -----------------------

test('fromPoints: Creates correct direction', t => {
  const ray = Ray.fromPoints(new Point(3, 4), new Point(6, 8));
  t.true(ray.from.equals(new Point(3, 4)));
  t.true(ray.direction.isParallelTo(new Vector(3, 4)));
});

// -----------------------
// GET
// -----------------------
test('from: Returns correct point', t => {
  t.true(t.context.angled.from.equals(new Point(3, 4)));
});

test('direction: Returns correct Vector', t => {
  // Need to divide by 5 since length of vector is 5 and it was made into a unit.
  t.true(t.context.angled.direction.equals(new Vector(3 / 5, 4 / 5)));
});

// -----------------------
// PUBLIC
// -----------------------
test('pointAt: Returns correct point', t => {
  t.true(t.context.angled.pointAt(0).equals(new Point(3, 4)));
  t.true(t.context.angled.pointAt(5).equals(new Point(6, 8)));
  t.true(t.context.angled.pointAt(-5).equals(new Point(0, 0)));
});

test('closestParameter: Returns correct parameter', t => {
  t.is(t.context.angled.closestParameter(new Point(6, 8)), 5);
});
test('closestParameter: Returns correct parameter depending on if positive or not', t => {
  t.is(t.context.angled.closestParameter(new Point(0, 0)), -5);
  t.is(t.context.angled.closestParameter(new Point(0, 0), RayRange.both), -5);
  t.is(
    t.context.angled.closestParameter(new Point(0, 0), RayRange.positive),
    0
  );
});
test('closestParameter: Returns correct parameter when point is off line', t => {
  t.is(t.context.flat.closestParameter(new Point(4, 0)), 1);
});

test('closestPoint: Returns correct point', t => {
  t.true(
    t.context.angled.closestPoint(new Point(6, 8)).equals(new Point(6, 8))
  );
});
test('closestPoint: Returns correct point depending on if onlyPositive or not', t => {
  t.true(
    t.context.angled.closestPoint(new Point(0, 0)).equals(new Point(0, 0))
  );
  t.true(
    t.context.angled
      .closestPoint(new Point(0, 0), RayRange.both)
      .equals(new Point(0, 0))
  );
  t.true(
    t.context.angled
      .closestPoint(new Point(0, 0), RayRange.positive)
      .equals(new Point(3, 4))
  );
});
test('closestPoint: Returns correct point when point is off line', t => {
  t.true(t.context.flat.closestPoint(new Point(4, 0)).equals(new Point(4, 4)));
});

test('equals: Identifies identical rays', t => {
  t.is(
    t.context.angled.equals(new Ray(new Point(3, 4), new Vector(3, 4))),
    true
  );
});
test('equals: Identifies that a ray is slightly different', t => {
  t.is(
    t.context.angled.equals(new Ray(new Point(3.01, 4), new Vector(3, 4))),
    false
  );
});

test('intersection: generates correct intersections', t => {
  const result = t.context.flat.intersection([
    new Point(5, 4),
    new Point(6, 4)
  ]);
  t.is(result[0], 2);
  t.is(result[1], 3);
});

test('toString: returns string in correct format', t => {
  t.is(t.context.flat.toString(), '[(3,4),⟨1,0⟩]');
});

test('withFrom: correctly replaces from', t => {
  const ray = t.context.angled.withFrom(new Point(20, 30));
  t.true(ray.from.equals(new Point(20, 30)));
});

test('withDirection: correctly replaces direction', t => {
  const ray = t.context.angled.withDirection(new Vector(20, 30));
  t.true(ray.direction.isParallelTo(new Vector(20, 30)));
});

// -----------------------
// TRANSFORM
// -----------------------

test('changeBasis: correctly moves origin and axis', t => {
  const from = Plane.worldXY();
  const to = new Plane(new Point(3, 4), new Vector(0, -1));
  const ray = t.context.flat.changeBasis(from, to);
  t.true(ray.from.equals(new Point(0, 0)));
  t.true(ray.direction.equals(new Vector(0, 1)));
});

test('rotate: correctly rotates the planes axis', t => {
  const ray = t.context.flat.rotate(Math.PI / 2, new Point(3, 4));
  t.true(ray.from.equals(new Point(3, 4)));
  t.true(ray.direction.equals(new Vector(0, 1)));
});

test('translate: correctly translates origin point', t => {
  const ray = t.context.flat.translate(new Vector(3, 4));
  t.true(ray.from.equals(new Point(6, 8)));
  t.true(ray.direction.equals(new Vector(1, 0)));
});
