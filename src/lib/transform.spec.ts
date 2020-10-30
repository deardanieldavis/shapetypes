import anyTest, { TestInterface } from 'ava';
import {
  approximatelyEqual,
  Plane,
  Point,
  shapetypesSettings,
  Transform,
  Vector
} from '../index';

const test = anyTest as TestInterface<{
  abc: Transform;
}>;

test.beforeEach('Create test geometry', t => {
  t.context.abc = new Transform(1, 2, 3, 4, 5, 6, 7, 8, 9);
});

// -----------------------
// CONSTRUCTOR
// -----------------------

test('Constructor: sets first value', t => {
  const tran = new Transform(1, 2, 3, 4, 5, 6, 7, 8, 9);
  t.is(tran.M00, 1);
});

// -----------------------
// STATIC
// -----------------------

test('fromDiagonal: Returns correct matrix with base and diagonal values', t => {
  const tran = Transform.fromDiagonal(2, 3);
  t.true(tran.equals(new Transform(3, 2, 2, 2, 3, 2, 2, 2, 3)));
});

test('Identity: Returns correct matrix with diagonal 1s', t => {
  t.true(Transform.identity().equals(new Transform(1, 0, 0, 0, 1, 0, 0, 0, 1)));
});

test('changeBasis: no rotation, no movement, doesnt move point', t => {
  const tran = Transform.changeBasis(Plane.worldXY(), Plane.worldXY());
  const point = tran.transformPoint(new Point(3, 4));
  t.true(point.equals(new Point(3, 4)));
});
test('changeBasis: no rotation, no movement, doesnt move vector', t => {
  const tran = Transform.changeBasis(Plane.worldXY(), Plane.worldXY());
  const vector = tran.transformVector(new Vector(3, 4));
  t.true(vector.equals(new Vector(3, 4)));
});
test('changeBasis: no rotation, translation to world, returns correct point', t => {
  const from = new Plane(new Point(3, 4), Vector.worldX());
  const tran = Transform.changeBasis(from, Plane.worldXY());
  const point = tran.transformPoint(new Point(3, 4));
  t.true(point.equals(new Point(6, 8)));
});
test('changeBasis: no rotation, translation to world, doesnt change the vector', t => {
  const from = new Plane(new Point(3, 4), Vector.worldX());
  const tran = Transform.changeBasis(from, Plane.worldXY());
  const vector = tran.transformVector(new Vector(3, 4));
  t.true(vector.equals(new Vector(3, 4)));
});
test('changeBasis: no rotation, translation to other plane, returns correct point', t => {
  const from = new Plane(new Point(3, 4), Vector.worldX());
  const to = new Plane(new Point(-3, -4), Vector.worldX());
  const tran = Transform.changeBasis(from, to);
  const point = tran.transformPoint(new Point(3, 4));
  t.true(point.equals(new Point(9, 12)));
});
test('changeBasis: rotated 90 degrees, no translation, returns correct point', t => {
  shapetypesSettings.invertY = false;
  const from = new Plane(Point.origin(), new Vector(0, -1));
  const tran = Transform.changeBasis(from, Plane.worldXY());
  const point = tran.transformPoint(new Point(3, 4));
  t.true(point.equals(new Point(4, -3)));
});
test('changeBasis: rotated 90 degrees, no translation, returns rotated vector', t => {
  shapetypesSettings.invertY = false;
  const from = new Plane(Point.origin(), new Vector(0, -1));
  const tran = Transform.changeBasis(from, Plane.worldXY());
  const vector = tran.transformVector(new Vector(3, 4));
  t.true(vector.equals(new Vector(4, -3)));
});
test('changeBasis: rotated 90 degrees with inverted y, no translation, returns correct point', t => {
  shapetypesSettings.invertY = true;
  const from = new Plane(Point.origin(), new Vector(0, -1));
  const tran = Transform.changeBasis(from, Plane.worldXY());
  const point = tran.transformPoint(new Point(3, 4));
  t.true(point.equals(new Point(4, -3)));
});
test('changeBasis: rotated 90 degrees with inverted y, no translation, returns rotated vector', t => {
  shapetypesSettings.invertY = true;
  const from = new Plane(Point.origin(), new Vector(0, -1));
  const tran = Transform.changeBasis(from, Plane.worldXY());
  const vector = tran.transformVector(new Vector(3, 4));
  t.true(vector.equals(new Vector(4, -3)));
});
test('changeBasis: rotated 90 degrees, and translate to world, returns correct point', t => {
  shapetypesSettings.invertY = false;
  const from = new Plane(new Point(3, 4), new Vector(0, -1));
  const tran = Transform.changeBasis(from, Plane.worldXY());
  const point = tran.transformPoint(new Point(3, 4));
  t.true(point.equals(new Point(7, 1)));
});
test('changeBasis: rotated 90 degrees with inverted, and translate to world, returns correct point', t => {
  shapetypesSettings.invertY = true;
  const from = new Plane(new Point(3, 4), new Vector(0, -1));
  const tran = Transform.changeBasis(from, Plane.worldXY());
  const point = tran.transformPoint(new Point(3, 4));
  t.true(point.equals(new Point(7, 1)));
});
test('changeBasis: rotated and translate to different rotated and translated plane, returns correct point', t => {
  shapetypesSettings.invertY = false;
  const from = new Plane(new Point(3, 4), new Vector(0, -1));
  const to = new Plane(new Point(-3, -4), new Vector(0, 1));
  const tran = Transform.changeBasis(from, to);
  const point = tran.transformPoint(new Point(3, 4));
  t.true(point.equals(new Point(5, -10)));
});
test('changeBasis: rotated and translate to different rotated and translated plane, returns correct vector', t => {
  shapetypesSettings.invertY = false;
  const from = new Plane(new Point(3, 4), new Vector(0, -1));
  const to = new Plane(new Point(-3, -4), new Vector(0, 1));
  const tran = Transform.changeBasis(from, to);
  const vector = tran.transformVector(new Vector(3, 4));
  t.true(vector.equals(new Vector(-3, -4)));
});
test('changeBasis: rotated and translate to different rotated and translated plane, with inverted axis, returns correct point', t => {
  shapetypesSettings.invertY = true;
  const from = new Plane(new Point(3, 4), new Vector(0, -1));
  const to = new Plane(new Point(-3, -4), new Vector(0, 1));
  const tran = Transform.changeBasis(from, to);
  const point = tran.transformPoint(new Point(3, 4));
  t.true(point.equals(new Point(5, -10)));
});
test('changeBasis: rotated and translate to different rotated and translated plane, with inverted axis, returns correct vector', t => {
  shapetypesSettings.invertY = true;
  const from = new Plane(new Point(3, 4), new Vector(0, -1));
  const to = new Plane(new Point(-3, -4), new Vector(0, 1));
  const tran = Transform.changeBasis(from, to);
  const vector = tran.transformVector(new Vector(3, 4));
  t.true(vector.equals(new Vector(-3, -4)));
});
test('changeBasis: matches Rhino', t => {
  /*
  a = Plane(Point3d(1,2,0), Vector3d(1,0,0), Vector3d(0,1,0))
  b = Plane(Point3d(4,4,0), Vector3d(0,-1,0), Vector3d(1,0,0))
  p = Point3d(2,4,0)
  basis = Transform.ChangeBasis(a, b)
  p.Transform(basis)
  print(p) #-2,-1,0
   */
  const a = new Plane(new Point(1, 2), new Vector(1, 0));
  const b = new Plane(new Point(4, 4), new Vector(0, -1));
  const p = new Point(2, 4);
  const basis = Transform.changeBasis(a, b);
  const output = basis.transformPoint(p);
  t.true(approximatelyEqual(output.x, -2));
  t.true(approximatelyEqual(output.y, -1));
});

test('planeToPlane: no rotation, no movement, doesnt move point', t => {
  const tran = Transform.planeToPlane(Plane.worldXY(), Plane.worldXY());
  const point = tran.transformPoint(new Point(3, 4));
  t.true(point.equals(new Point(3, 4)));
});
test('planeToPlane: no rotation, no movement, doesnt move vector', t => {
  const tran = Transform.planeToPlane(Plane.worldXY(), Plane.worldXY());
  const vector = tran.transformVector(new Vector(3, 4));
  t.true(vector.equals(new Vector(3, 4)));
});
test('planeToPlane: no rotation, translation to world, returns correct point', t => {
  const from = new Plane(new Point(3, 4), Vector.worldX());
  const tran = Transform.planeToPlane(from, Plane.worldXY());
  const point = tran.transformPoint(new Point(3, 4));
  t.true(point.equals(new Point(0, 0)));
});
test('planeToPlane: no rotation, translation to world, doesnt change the vector', t => {
  const from = new Plane(new Point(3, 4), Vector.worldX());
  const tran = Transform.planeToPlane(from, Plane.worldXY());
  const vector = tran.transformVector(new Vector(3, 4));
  t.true(vector.equals(new Vector(3, 4)));
});
test('planeToPlane: rotated 90 degrees, no translation, returns correct point', t => {
  shapetypesSettings.invertY = false;
  const from = new Plane(Point.origin(), new Vector(0, -1));
  const tran = Transform.planeToPlane(from, Plane.worldXY());
  const point = tran.transformPoint(new Point(0, -1));
  t.true(point.equals(new Point(1, 0)));
});
test('planeToPlane: rotated 90 degrees, no translation, returns rotated vector', t => {
  shapetypesSettings.invertY = false;
  const from = new Plane(Point.origin(), new Vector(0, -1));
  const tran = Transform.planeToPlane(from, Plane.worldXY());
  const vector = tran.transformVector(new Vector(0, -1));
  t.true(vector.equals(new Vector(1, 0)));
});
test('planeToPlane: rotated 90 degrees with inverted y, no translation, returns correct point', t => {
  shapetypesSettings.invertY = true;
  const from = new Plane(Point.origin(), new Vector(0, -1));
  const tran = Transform.planeToPlane(from, Plane.worldXY());
  const point = tran.transformPoint(new Point(0, -1));
  t.true(point.equals(new Point(1, 0)));
});
test('planeToPlane: rotated 90 degrees with inverted y, no translation, returns rotated vector', t => {
  shapetypesSettings.invertY = true;
  const from = new Plane(Point.origin(), new Vector(0, -1));
  const tran = Transform.planeToPlane(from, Plane.worldXY());
  const vector = tran.transformVector(new Vector(0, -1));
  t.true(vector.equals(new Vector(1, 0)));
});

test('planeToPlane: rotated and translate to different rotated and translated plane, returns correct point', t => {
  shapetypesSettings.invertY = false;
  const from = new Plane(new Point(3, 4), new Vector(0, -1));
  const to = new Plane(new Point(-3, -4), new Vector(0, 1));
  const tran = Transform.planeToPlane(from, to);
  const point = tran.transformPoint(new Point(4, 3));
  t.true(point.equals(new Point(-4, -3)));
});
test('planeToPlane: rotated and translate to different rotated and translated plane, returns correct vector', t => {
  shapetypesSettings.invertY = false;
  const from = new Plane(new Point(3, 4), new Vector(0, -1));
  const to = new Plane(new Point(-3, -4), new Vector(0, 1));
  const tran = Transform.planeToPlane(from, to);
  const vector = tran.transformVector(new Vector(3, 4));
  t.true(vector.equals(new Vector(-3, -4)));
});

test('planeToPlane: matches Rhino', t => {
  /*
  a = Plane(Point3d(1,2,0), Vector3d(1,0,0), Vector3d(0,1,0))
  b = Plane(Point3d(4,4,0), Vector3d(0,-1,0), Vector3d(1,0,0))
  p = Point3d(2,4,0)
  tran = Transform.PlaneToPlane(a, b)
  p.Transform(tran)
  print(p) #6,3,0
   */
  const a = new Plane(new Point(1, 2), new Vector(1, 0));
  const b = new Plane(new Point(4, 4), new Vector(0, -1));
  const p = new Point(2, 4);

  const tran = Transform.planeToPlane(a, b);
  const output = tran.transformPoint(p);
  t.true(approximatelyEqual(output.x, 6));
  t.true(approximatelyEqual(output.y, 3));
});

interface ROTATEPOINT {
  angle: number; // Angle of rotation
  normalY: Point; // Location of point in plane's UV coordinates
  invertY: Point; // Location of point in world's xy coordinates
}
const ROTATEPOINTS: readonly ROTATEPOINT[] = [
  { angle: 0, normalY: new Point(1, 0), invertY: new Point(1, 0) },
  { angle: Math.PI / 2, normalY: new Point(0, -1), invertY: new Point(0, 1) },
  { angle: Math.PI, normalY: new Point(-1, 0), invertY: new Point(-1, 0) },
  {
    angle: (Math.PI * 3) / 2,
    invertY: new Point(0, -1),
    normalY: new Point(0, 1)
  },
  { angle: Math.PI * 2, normalY: new Point(1, 0), invertY: new Point(1, 0) }
];
test('rotate: rotates clockwise', t => {
  shapetypesSettings.invertY = false;
  for (const p of ROTATEPOINTS) {
    const tran = Transform.rotate(p.angle);
    const point = tran.transformPoint(new Point(1, 0));
    t.true(point.equals(p.normalY));
  }
});
test('rotate: rotates clockwise with inverted y-axis', t => {
  shapetypesSettings.invertY = true;
  for (const p of ROTATEPOINTS) {
    const tran = Transform.rotate(p.angle);
    const point = tran.transformPoint(new Point(1, 0));
    t.true(point.equals(p.invertY));
  }
});
test('rotate: rotating about a point changes x and y values correctly', t => {
  shapetypesSettings.invertY = false;
  const tran = Transform.rotate(Math.PI / 2, new Point(9, 9));
  const point = tran.transformPoint(new Point(10, 10));
  t.true(approximatelyEqual(point.x, 9 + 1));
  t.true(approximatelyEqual(point.y, 9 - 1));
});
test('rotate: rotates vector clockwise', t => {
  shapetypesSettings.invertY = false;
  for (const p of ROTATEPOINTS) {
    const tran = Transform.rotate(p.angle);
    const vector = tran.transformVector(new Vector(1, 0));
    t.true(approximatelyEqual(vector.x, p.normalY.x));
    t.true(approximatelyEqual(vector.y, p.normalY.y));
  }
});
test('rotate: rotates vector clockwise with inverted y axis', t => {
  shapetypesSettings.invertY = true;
  for (const p of ROTATEPOINTS) {
    const tran = Transform.rotate(p.angle);
    const vector = tran.transformVector(new Vector(1, 0));
    t.true(approximatelyEqual(vector.x, p.invertY.x));
    t.true(approximatelyEqual(vector.y, p.invertY.y));
  }
});
test('rotate: rotating about a vector about a point ignores pivot point', t => {
  shapetypesSettings.invertY = false;
  const tran = Transform.rotate(Math.PI / 2, new Point(9, 9));
  const vector = tran.transformVector(new Vector(10, 10));
  t.true(approximatelyEqual(vector.x, 10));
  t.true(approximatelyEqual(vector.y, -10));
});

test('Scale: correctly scales a point', t => {
  const tran = Transform.scale(2);
  const p = tran.transformPoint(new Point(3, 4));
  t.is(p.x, 6);
  t.is(p.y, 8);
});
test('Scale: unevenly scales a point', t => {
  const tran = Transform.scale(2, 3);
  const p = tran.transformPoint(new Point(3, 4));
  t.is(p.x, 6);
  t.is(p.y, 12);
});
test('Scale: correctly scales from a pivot point', t => {
  const tran = Transform.scale(2, 2, new Point(6, 8));
  const p = tran.transformPoint(new Point(3, 4));
  t.is(p.x, 0);
  t.is(p.y, 0);
});
test('Scale: correctly scales a vector', t => {
  const tran = Transform.scale(2);
  const p = tran.transformVector(new Vector(3, 4));
  t.is(p.x, 6);
  t.is(p.y, 8);
});
test('Scale: unevenly scales a vector', t => {
  const tran = Transform.scale(2, 3);
  const p = tran.transformVector(new Vector(3, 4));
  t.is(p.x, 6);
  t.is(p.y, 12);
});
test('Scale: correctly scales vector and ignores pivot point', t => {
  const tran = Transform.scale(2, 2, new Point(6, 8));
  const p = tran.transformVector(new Vector(3, 4));
  t.is(p.x, 6);
  t.is(p.y, 8);
});

test('Translate: correctly moves a point', t => {
  const tran = Transform.translate(new Vector(3, 4));
  const p = tran.transformPoint(new Point(3, 4));
  t.is(p.x, 6);
  t.is(p.y, 8);
});
test('Translate: correctly moves a point set distance', t => {
  const tran = Transform.translate(new Vector(3, 4), 10);
  const p = tran.transformPoint(new Point(3, 4));
  t.is(p.x, 9);
  t.is(p.y, 12);
});
test('Translate: doesnt move a vector because vectors cant move', t => {
  const tran = Transform.translate(new Vector(3, 4));
  const p = tran.transformVector(new Vector(3, 4));
  t.is(p.x, 3);
  t.is(p.y, 4);
});

// -----------------------
// GET
// -----------------------
test('determinant: returns correct value', t => {
  // Example from: https://www.mathsisfun.com/algebra/matrix-determinant.html
  const tran = new Transform(6, 1, 1, 4, -2, 5, 2, 8, 7);
  t.is(tran.determinant, -306);
});

test('get m: values mapped between matrix and getters correctly', t => {
  t.is(t.context.abc.M00, 1);
  t.is(t.context.abc.M10, 2);
  t.is(t.context.abc.M20, 3);

  t.is(t.context.abc.M01, 4);
  t.is(t.context.abc.M11, 5);
  t.is(t.context.abc.M21, 6);

  t.is(t.context.abc.M02, 7);
  t.is(t.context.abc.M12, 8);
  t.is(t.context.abc.M22, 9);
});

// -----------------------
// PUBLIC
// -----------------------
test('equals: identifies identical matrices', t => {
  const tran = new Transform(1, 2, 3, 4, 5, 6, 7, 8, 9);
  t.true(t.context.abc.equals(tran));
});
test('equals: identifies different matrices', t => {
  const tran = new Transform(1.5, 2, 3, 4, 5, 6, 7, 8, 9);
  t.is(t.context.abc.equals(tran), false);
});

test('inverse: correctly inverts a matrix', t => {
  // Example calculated at https://matrix.reshish.com/inverCalculation.php
  const a = new Transform(3, 0, 2, 2, 0, -2, 0, 1, 1);
  const outcome = a.inverse();
  if (!outcome.success) {
    throw new Error('Did not get result for matrix inverse');
  }

  t.is(approximatelyEqual(outcome.result.M00, 0.2), true);
  t.is(approximatelyEqual(outcome.result.M10, 0.2), true);
  t.is(approximatelyEqual(outcome.result.M20, 0), true);

  t.is(approximatelyEqual(outcome.result.M01, -0.2), true);
  t.is(approximatelyEqual(outcome.result.M11, 0.3), true);
  t.is(approximatelyEqual(outcome.result.M21, 1), true);

  t.is(approximatelyEqual(outcome.result.M02, 0.2), true);
  t.is(approximatelyEqual(outcome.result.M12, -0.3), true);
  t.is(approximatelyEqual(outcome.result.M22, 0), true);
});
test('inverse: if determinant is zero, returns success value of false', t => {
  const a = new Transform(0, 0, 0, 0, 0, 0, 0, 0, 0);
  t.is(a.inverse().success, false);
});

test('multiply: correctly multiplies to matrix', t => {
  const result = t.context.abc.multiply(t.context.abc);

  t.is(result.M00, 30);
  t.is(result.M10, 36);
  t.is(result.M20, 42);

  t.is(result.M01, 66);
  t.is(result.M11, 81);
  t.is(result.M21, 96);

  t.is(result.M02, 102);
  t.is(result.M12, 126);
  t.is(result.M22, 150);
});

// TODO: Transforms

test('toString: returns correctly formatted string', t => {
  t.is(t.context.abc.toString(), '[1,2,3,4,5,6,7,8,9]');
});

test('withValues: can override all values', t => {
  const tran = t.context.abc.withValues(11, 12, 13, 14, 15, 16, 17, 18, 19);
  t.true(tran.equals(new Transform(11, 12, 13, 14, 15, 16, 17, 18, 19)));
});
test('withValues: can override select values', t => {
  const tran = t.context.abc.withValues(
    undefined,
    12,
    13,
    14,
    15,
    16,
    undefined,
    18,
    undefined
  );
  t.true(tran.equals(new Transform(1, 12, 13, 14, 15, 16, 7, 18, 9)));
});
