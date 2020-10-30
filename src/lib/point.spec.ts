import anyTest, { TestInterface } from 'ava';
import {
  approximatelyEqual,
  Point,
  shapetypesSettings,
  Transform,
  Vector
} from '../index';

const test = anyTest as TestInterface<{
  basic: Point;
  diagonal: Point;
}>;

test.beforeEach('Create test geometry', t => {
  t.context.basic = new Point(3, 4);
  t.context.diagonal = new Point(10, 10);
});

// -----------------------
// CONSTRUCTOR
// -----------------------

test('constructor: sets correct x and y values', t => {
  const point = new Point(3, 4);
  t.is(point.x, 3);
  t.is(point.y, 4);
});

// -----------------------
// STATIC
// -----------------------
test('origin: returns point at 0,0', t => {
  t.is(Point.origin().x, 0);
  t.is(Point.origin().y, 0);
});

// -----------------------
// GET
// -----------------------

test('x: returns correct value', t => {
  t.is(t.context.basic.x, 3);
});

test('y: returns correct value', t => {
  t.is(t.context.basic.y, 4);
});

// -----------------------
// PUBLIC
// -----------------------

test('add: correctly adds a point', t => {
  const point = t.context.basic.add(new Point(1, 2));
  t.is(point.x, 3 + 1);
  t.is(point.y, 4 + 2);
});
test('add: can add vector', t => {
  const point = t.context.basic.add(new Vector(1, 2));
  t.is(point.x, 3 + 1);
  t.is(point.y, 4 + 2);
});
test('add: can add x and y values', t => {
  const point = t.context.basic.add(1, 2);
  t.is(point.x, 3 + 1);
  t.is(point.y, 4 + 2);
});

test('distance: calculates correct length', t => {
  t.is(Point.origin().distanceTo(t.context.basic), 5);
  t.is(t.context.basic.distanceTo(Point.origin()), 5);
});

test('divide: correctly divides x and y components of point', t => {
  t.is(t.context.diagonal.divide(2).x, 5);
  t.is(t.context.diagonal.divide(2).y, 5);
});
test('divide: can divide by different x and y values', t => {
  t.is(t.context.diagonal.divide(2, 5).x, 5);
  t.is(t.context.diagonal.divide(2, 5).y, 2);
});

test('equals: returns true when points are exact match', t => {
  t.true(t.context.basic.equals(new Point(3, 4)));
});
test('equals: returns false when points are slightly off and there is no tolerance', t => {
  t.is(t.context.basic.equals(new Point(3, 4.1), 0), false);
});
test('equals: returns true when points are slightly off but it is within tolerance', t => {
  t.is(t.context.basic.equals(new Point(3, 4.1), 0.2), true);
});
test('equals: returns false when points are slightly off and it is not within tolerance', t => {
  t.is(t.context.basic.equals(new Point(3, 4.1), 0.05), false);
});

test('multiply: correctly multiplies the x and y components of point', t => {
  t.is(t.context.diagonal.multiply(2).x, 20);
  t.is(t.context.diagonal.multiply(2).y, 20);
});
test('multiply: can multiply by different x and y values', t => {
  t.is(t.context.diagonal.multiply(2, 5).x, 20);
  t.is(t.context.diagonal.multiply(2, 5).y, 50);
});

test('subtract: can subtract a point', t => {
  const point = t.context.basic.subtract(new Point(1, 2));
  t.is(point.x, 3 - 1);
  t.is(point.y, 4 - 2);
});
test('subtract: can subtract vector', t => {
  const point = t.context.basic.subtract(new Vector(1, 2));
  t.is(point.x, 3 - 1);
  t.is(point.y, 4 - 2);
});
test('subtract: can subtract x and y values', t => {
  const point = t.context.basic.subtract(1, 2);
  t.is(point.x, 3 - 1);
  t.is(point.y, 4 - 2);
});

test('toString: creates string in correct format', t => {
  t.is(t.context.basic.toString(), '(3,4)');
});

test('withX: creates new point with correct x value', t => {
  t.is(t.context.basic.withX(20).x, 20);
  t.is(t.context.basic.withX(20).y, 4);
});

test('withY: creates new point with correct y value', t => {
  t.is(t.context.basic.withY(20).x, 3);
  t.is(t.context.basic.withY(20).y, 20);
});

// -----------------------
// TRANSFORMABLE
// -----------------------

test('transform: correctly applies transformation and changes x and y components', t => {
  const tran = Transform.scale(2);
  const point = t.context.basic.transform(tran);
  t.is(point.x, 3 * 2);
  t.is(point.y, 4 * 2);
});

test('rotate: rotating 90 degrees changes x and y values correctly', t => {
  shapetypesSettings.invertY = false;
  const point = t.context.basic.rotate(Math.PI / 2);
  t.true(approximatelyEqual(point.x, 4));
  t.true(approximatelyEqual(point.y, -3));
});
test('rotate: inverting y-axis rotates in other direction', t => {
  shapetypesSettings.invertY = true;
  const point = t.context.basic.rotate(Math.PI / 2);
  t.true(approximatelyEqual(point.x, -4));
  t.true(approximatelyEqual(point.y, 3));
});
test('rotate: rotating about a point changes x and y values correctly', t => {
  shapetypesSettings.invertY = false;
  const point = t.context.diagonal.rotate(Math.PI / 2, new Point(9, 9));
  t.true(approximatelyEqual(point.x, 9 + 1));
  t.true(approximatelyEqual(point.y, 9 - 1));
});

test('scale: applies uniform scale to x and y components', t => {
  const point = t.context.basic.scale(2);
  t.is(point.x, 3 * 2);
  t.is(point.y, 4 * 2);
});
test('scale: unevenly scales x and y components', t => {
  const point = t.context.basic.scale(2, 3);
  t.is(point.x, 3 * 2);
  t.is(point.y, 4 * 3);
});
test('scale: scales to x and y components using pivot point', t => {
  const point = Point.origin().scale(2, 2, new Point(1, 1));
  t.is(point.x, -1);
  t.is(point.y, -1);
});

// TODO: Point to point
// TODO: Translate - need to test both my method and the matrix
