// tslint:disable:no-let
// npx ava build/main/lib/vector.spec.js
import test from 'ava';
import { Point } from './point';
import { shapetypesSettings } from './settings';
import { approximatelyEqual } from './utilities';
import { Vector } from './vector';

test('Length', t => {
  let vector = new Vector(10, 0);
  t.is(vector.length, 10);

  vector = new Vector(0, -10);
  t.is(vector.length, 10);

  vector = new Vector(3, 4);
  t.is(vector.length, 5);
});

test('From Points', t => {
  let vector = Vector.fromPoints(new Point(1, 2), new Point(5, 10));
  t.is(vector.x, 4);
  t.is(vector.y, 8);

  vector = Vector.fromPoints(new Point(1, 2), new Point(-5, -10));
  t.is(vector.x, -6);
  t.is(vector.y, -12);
});

test('Vertical and horizontal', t => {
  let vector = new Vector(4, 0);
  t.is(vector.isVertical(), false);
  t.is(vector.isHorizontal(), true);

  vector = new Vector(0, -4);
  t.is(vector.isVertical(), true);
  t.is(vector.isHorizontal(), false);
});

test('Perpendicular', t => {
  let vector = new Vector(4, 2);
  let perp = vector.perpendicular();

  t.is(perp.length, vector.length);

  vector = new Vector(4, 0);
  perp = vector.perpendicular();

  t.is(vector.isHorizontal(), true);
  t.is(perp.isVertical(), true);
});

test('Rotate', t => {
  // rotate 180
  let vector = new Vector(1, 0);
  vector.rotate(Math.PI);
  t.is(approximatelyEqual(vector.x, -1), true);
  t.is(approximatelyEqual(vector.y, 0), true);

  // rotate 90 - normal y
  shapetypesSettings.invertY = false;
  vector = new Vector(1, 0);
  vector.rotate(Math.PI / 2);
  t.is(approximatelyEqual(vector.x, 0), true);
  t.is(approximatelyEqual(vector.y, -1), true);

  // rotate 90 - inverted y
  shapetypesSettings.invertY = true;
  vector = new Vector(1, 0);
  vector.rotate(Math.PI / 2);
  t.is(approximatelyEqual(vector.x, 0), true);
  t.is(approximatelyEqual(vector.y, 1), true);

  // rotate 270 - normal y
  shapetypesSettings.invertY = false;
  vector = new Vector(1, 0);
  vector.rotate((Math.PI * 3) / 2);
  t.is(approximatelyEqual(vector.x, 0), true);
  t.is(approximatelyEqual(vector.y, 1), true);

  // rotate 270 - inverted y
  shapetypesSettings.invertY = true;
  vector = new Vector(1, 0);
  vector.rotate((Math.PI * 3) / 2);
  t.is(approximatelyEqual(vector.x, 0), true);
  t.is(approximatelyEqual(vector.y, -1), true);
});

test('Angle between vectors', t => {
  // 90 degree
  const a = new Vector(1, 0);
  let b = new Vector(0, 1);

  t.is(approximatelyEqual(Vector.vectorAngle(a, b), Math.PI / 2), true);

  // 45 degree
  b = new Vector(10, 10);
  t.is(approximatelyEqual(Vector.vectorAngle(a, b), Math.PI / 4), true);

  // 90 degree reverse
  b = new Vector(0, -1);
  t.is(approximatelyEqual(Vector.vectorAngle(a, b), Math.PI / 2), true);

  // 180 degree
  b = new Vector(-1, 0);
  t.is(approximatelyEqual(Vector.vectorAngle(a, b), Math.PI), true);

  // 0 degree
  b = new Vector(1, 0);
  t.is(approximatelyEqual(Vector.vectorAngle(a, b), 0), true);
});

test('Signed Angle between vectors', t => {
  const a = new Vector(1, 0);

  // 90 degree - normal y
  shapetypesSettings.invertY = false;
  let b = new Vector(0, 1);
  t.is(approximatelyEqual(Vector.vectorAngleSigned(a, b), -Math.PI / 2), true);

  // 90 degree - inverted y
  shapetypesSettings.invertY = true;
  b = new Vector(0, 1);
  t.is(approximatelyEqual(Vector.vectorAngleSigned(a, b), Math.PI / 2), true);

  // 45 degree
  shapetypesSettings.invertY = true;
  b = new Vector(10, 10);
  t.is(approximatelyEqual(Vector.vectorAngleSigned(a, b), Math.PI / 4), true);

  // 90 degree reverse - normal
  shapetypesSettings.invertY = false;
  b = new Vector(0, -1);
  t.is(approximatelyEqual(Vector.vectorAngleSigned(a, b), Math.PI / 2), true);

  // 90 degree reverse - inverted y
  shapetypesSettings.invertY = true;
  b = new Vector(0, -1);
  t.is(approximatelyEqual(Vector.vectorAngleSigned(a, b), -Math.PI / 2), true);

  // 180 degree
  b = new Vector(-1, 0);
  t.is(approximatelyEqual(Vector.vectorAngleSigned(a, b), Math.PI), true);

  // 0 degree
  b = new Vector(1, 0);
  t.is(approximatelyEqual(Vector.vectorAngleSigned(a, b), 0), true);
});

test('Is parallel', t => {
  // Exactly the same
  let a = new Vector(1, 0);
  let b = new Vector(1, 0);
  t.is(a.isParallelTo(b), true);

  // Different lengths
  a = new Vector(1, 1);
  b = new Vector(10, 10);
  t.is(a.isParallelTo(b), true);

  // Different directions lengths
  a = new Vector(1, 1);
  b = new Vector(-10, -10);
  t.is(a.isParallelTo(b), true);

  // Not parallel
  a = new Vector(1, 1);
  b = new Vector(-11, -10);
  t.is(a.isParallelTo(b), false);
});
