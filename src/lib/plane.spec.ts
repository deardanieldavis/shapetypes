// tslint:disable:no-let
import anyTest, { TestInterface } from 'ava';
import { Plane } from './plane';
import { Point } from './point';
import { shapetypesSettings } from './settings';
import { Vector } from './vector';

const test = anyTest as TestInterface<{
  angled: Plane;
  flat: Plane;
}>;

test.beforeEach('Create test geometry', t => {
  t.context.angled = new Plane(new Point(3, 4), new Vector(3, 4));
  t.context.flat = new Plane(new Point(3, 4), new Vector(1, 0));
});

// -----------------------
// CONSTRUCTOR
// -----------------------
test('Constructor: Sets correct origin and axis', t => {
  const plane = new Plane(new Point(3, 4), new Vector(3, 4));
  t.true(plane.origin.equals(new Point(3, 4)));
  t.true(plane.xAxis.isParallelTo(new Vector(3, 4)));
});
test('Constructor: xAxis is unit vector', t => {
  const plane = new Plane(new Point(3, 4), new Vector(3, 4));
  t.is(plane.xAxis.length, 1);
});
test("Constructor: if no xAxis, use world's xAxis", t => {
  const plane = new Plane(new Point(3, 4));
  t.true(plane.xAxis.equals(Vector.worldX()));
});

// -----------------------
// STATIC
// -----------------------
test("worldXY: Creates a plane at 0,0 with world's xAxis", t => {
  t.true(Plane.worldXY().origin.equals(new Point(0, 0)));
  t.true(Plane.worldXY().xAxis.isParallelTo(new Vector(1, 0)));
});

test('fromPoints: Creates correct xAxis', t => {
  const plane = Plane.fromPoints(new Point(3, 4), new Point(6, 8));
  t.true(plane.origin.equals(new Point(3, 4)));
  t.true(plane.xAxis.isParallelTo(new Vector(3, 4)));
});

// -----------------------
// GET
// -----------------------
test('origin: Returns correct point', t => {
  t.true(t.context.angled.origin.equals(new Point(3, 4)));
});

test('xAxis: Returns correct Vector', t => {
  // Need to divide by 5 since length of vector is 5 and it was made into a unit.
  t.true(t.context.angled.xAxis.equals(new Vector(3 / 5, 4 / 5)));
});

test('yAxis: Returns correct Vector', t => {
  shapetypesSettings.invertY = false;
  t.true(t.context.angled.yAxis.equals(new Vector(-4 / 5, 3 / 5)));
});
test('yAxis: Returns correct Vector when inverted', t => {
  shapetypesSettings.invertY = true;
  t.true(t.context.angled.yAxis.equals(new Vector(-4 / 5, 3 / 5)));
});

// -----------------------
// Public
// -----------------------
test('equals: Correctly identifies identical planes', t => {
  const plane = new Plane(new Point(3, 4), new Vector(3, 4));
  t.true(t.context.angled.equals(plane));
});
test('equals: Correctly identifies different planes', t => {
  const plane = new Plane(new Point(3, 5), new Vector(3, 4));
  t.is(t.context.angled.equals(plane), false);
});
test('equals: Planes that are slightly different are still equal', t => {
  const plane = new Plane(new Point(3.0000001, 4), new Vector(3.0000001, 4));
  t.true(t.context.angled.equals(plane));
});
test('equals: Planes that are slightly different are not equal if tolerance is zero', t => {
  const plane = new Plane(new Point(3.0000001, 4), new Vector(3.0000001, 4));
  t.is(t.context.angled.equals(plane, 0), false);
});

interface POINTS {
  inPlane: Point; // Location of point in plane's UV coordinates
  inWorld: Point; // Location of point in world's xy coordinates
}
const FLATPOINTS: readonly POINTS[] = [
  { inPlane: new Point(0, 0), inWorld: new Point(3, 4) },
  { inPlane: new Point(2, 0), inWorld: new Point(3 + 2, 4) },
  { inPlane: new Point(0, 2), inWorld: new Point(3, 4 + 2) },
  { inPlane: new Point(-2, -2), inWorld: new Point(3 - 2, 4 - 2) }
];

test('pointAt: calculates correct position for point', t => {
  shapetypesSettings.invertY = false;
  for (const p of FLATPOINTS) {
    t.true(t.context.flat.pointAt(p.inPlane).equals(p.inWorld));
  }
});

test('remap: calculates correct position for point', t => {
  shapetypesSettings.invertY = false;
  for (const p of FLATPOINTS) {
    t.true(t.context.flat.remapToPlaneSpace(p.inWorld).equals(p.inPlane));
  }
});

test('withOrigin: correctly changes planes origin', t => {
  const plane = Plane.worldXY().withOrigin(new Point(3, 4));
  t.true(plane.origin.equals(new Point(3, 4)));
});

test('withxAxis: correctly changes planes xAxis', t => {
  const plane = Plane.worldXY().withXAxis(new Vector(0, 1));
  t.true(plane.xAxis.equals(new Vector(0, 1)));
});

// -----------------------
// TRANSFORM
// -----------------------

test('changeBasis: correctly moves origin and axis', t => {
  shapetypesSettings.invertY = false;
  const from = Plane.worldXY();
  const to = new Plane(new Point(3, 4), new Vector(0, -1));
  const before = new Plane(new Point(1, 0), new Vector(1, 0));
  const plane = before.changeBasis(from, to);
  t.true(plane.origin.equals(new Point(4, -2)));
  t.true(plane.xAxis.equals(new Vector(0, 1)));
});

test('rotate: correctly rotates the planes axis', t => {
  shapetypesSettings.invertY = false;
  const plane = Plane.worldXY().rotate(Math.PI / 2);
  t.true(plane.origin.equals(new Point(0, 0)));
  t.true(plane.xAxis.equals(new Vector(0, -1)));
});

test('translate: correctly translates origin point', t => {
  const plane = Plane.worldXY().translate(new Vector(3, 4));
  t.true(plane.origin.equals(new Point(3, 4)));
  t.true(plane.xAxis.equals(new Vector(1, 0)));
});
