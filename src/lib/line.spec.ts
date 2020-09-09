// tslint:disable:no-let
import anyTest, {TestInterface} from 'ava';
import { Line } from './line';
import { Point } from './point';
import { shapetypesSettings } from './settings';
import { Transform } from './transform';
import { Vector } from './vector';

const test = anyTest as TestInterface<{P00: Point; P100: Point; P35: Point; P69: Point; V34: Vector, diagonal: Line; horizontal: Line}>;

test.beforeEach('Create test geometry', t => {
  // The diagonal line is used for testing because it's major components are whole numbers:
  // - It's length is 5 units
  // - It travels 3 units in the x direction
  // - It travels 4 units in the y direction
  t.context.P35 = new Point(3, 5);  // Start of line
  t.context.P69 = new Point(6, 9);  // End of line
  t.context.V34 = new Vector(3, 4); // Vector along line
  t.context.diagonal = new Line(t.context.P35, t.context.P69);

  // The horizontal line is a simple line, 10 units long, starting at 0,0
  t.context.P00 = new Point(0, 0);
  t.context.P100 = new Point(10, 0);
  t.context.horizontal = new Line(t.context.P00, t.context.P100);
});

// -----------------------
// CONSTRUCTOR
// -----------------------
test('Line constructor sets correct start and end point', t => {
  const line = new Line(new Point(3, 5), new Point(6, 9));
  t.is(line.from.x, 3);
  t.is(line.from.y, 5);
  t.is(line.to.x, 6);
  t.is(line.to.y, 9);
});


// -----------------------
// STATIC
// -----------------------
test('Line from vector, sets correct start and end', t => {
  const line = Line.fromVector(t.context.P35, t.context.V34);
  t.true(line.from.equals(t.context.P35));
  t.true(line.to.equals(t.context.P69));
  t.is(line.length, 5);
});

test('Line from vector, sets correct start and end when using custom length', t => {
  const line = Line.fromVector(t.context.P35, t.context.V34, 10);
  t.true(line.from.equals(t.context.P35));
  t.is(line.to.x, 9);
  t.is(line.to.y, 13);
  t.is(line.length, 10);
});

test('Line from existing correctly copies start and end of existing line', t => {
  const line = Line.fromExisting(t.context.diagonal);
  t.true(line.from.equals(t.context.P35));
  t.true(line.to.equals(t.context.P69));
});


// -----------------------
// GET AND SET
// -----------------------

test('Correct bounding box size', t => {
  const bb = t.context.diagonal.boundingBox;
  t.true(bb.min.equals(t.context.P35));
  t.true(bb.max.equals(t.context.P69));
});

test('The direction of the line matches the lines vector', t => {
  t.true(t.context.diagonal.direction.equals(t.context.V34));
});

test('The direction of the line matches the lines vector when reversed', t => {
  const line = new Line(t.context.P69, t.context.P35);
  t.is(line.direction.length, 5);
  t.is(line.direction.x, -3);
  t.is(line.direction.y, -4);
});

test('Can change the "from" variable of the line', t => {
  t.context.diagonal.from = new Point(2,3);
  t.is(t.context.diagonal.from.x, 2);
  t.is(t.context.diagonal.from.y, 3);
});

test('Can change the "to" variable of the line', t => {
  t.context.diagonal.to = new Point(2,3);
  t.is(t.context.diagonal.to.x, 2);
  t.is(t.context.diagonal.to.y, 3);
});

test('The line is the correct length', t => {
  t.is(t.context.diagonal.length, 5);
});

test('Can change the length of the line and the end point moves correctly', t => {
  t.context.diagonal.length = 10;
  t.is(t.context.diagonal.length, 10);
  t.is(t.context.diagonal.to.x, 9);
  t.is(t.context.diagonal.to.y, 13);
});

test('Can change the length of the line to a negative number and the end point moves correctly', t => {
  t.context.diagonal.length = -5;
  t.is(t.context.diagonal.length, 5);
  t.is(t.context.diagonal.to.x, 0);
  t.is(t.context.diagonal.to.y, 1);
});

test('Generates a correct unit vector when the y-axis is in normal orientation', t => {
  shapetypesSettings.invertY = false;
  t.is(t.context.horizontal.unitTangent.length, 1);
  t.true(t.context.horizontal.unitTangent.equals(new Vector(0, -1)));
});

test('Generates a correct unit vector when the y-axis is inverted', t => {
  shapetypesSettings.invertY = true;
  t.is(t.context.horizontal.unitTangent.length, 1);
  t.true(t.context.horizontal.unitTangent.equals(new Vector(0, 1)));
});



// -----------------------
// PUBLIC
// -----------------------

// A set of points to test closest point and closest parameter
interface Points {
  p: Point;                       // The test point
  finite: {t: number; p: Point};  // The closest point on the finite line (t= parameter, p = point)
  infinite: {t: number; p: Point}; // The closest point on the infinite line (t= parameter, p = point)
}
const POINTS: readonly Points[] = [
  // Two ends
  {p: new Point(0,0), finite: {t: 0, p: new Point(0,0)}, infinite: {t: 0, p: new Point(0,0)} },
  {p: new Point(10,0), finite: {t: 1, p: new Point(10,0)}, infinite: {t: 1, p: new Point(10,0)} },
  // Mid point
  {p: new Point(5,0), finite: {t: 0.5, p: new Point(5,0)}, infinite: {t: 0.5, p: new Point(5,0)} },
  // Off end
  {p: new Point(-10,2), finite: {t: 0, p: new Point(0,0)}, infinite: {t: -1, p: new Point(-10,0)} },
  {p: new Point(20,-2), finite: {t: 1, p: new Point(10,0)}, infinite: {t: 2, p: new Point(20,0)} },
  // Off mid
  {p: new Point(5,20), finite: {t: 0.5, p: new Point(5,0)}, infinite: {t: 0.5, p: new Point(5,0)} },
]

test('Finds the closest parameter of the test points on the finite line', t => {
  for(const point of POINTS) {
    t.is(t.context.horizontal.closestParameter(point.p), point.finite.t);
    t.is(t.context.horizontal.closestParameter(point.p, true), point.finite.t);
  }
});

test('Finds the closest parameter of the test points on the infinite line', t => {
  for(const point of POINTS) {
    t.is(t.context.horizontal.closestParameter(point.p, false), point.infinite.t);
  }
});

test('Finds the closest point to the test points on the finite line', t => {
  for(const point of POINTS) {
    t.true(t.context.horizontal.closestPoint(point.p).equals(point.finite.p));
    t.true(t.context.horizontal.closestPoint(point.p, true).equals(point.finite.p));
  }
});

test('Finds the closest point to the test points on the infinite line', t => {
  for(const point of POINTS) {
    t.true(t.context.horizontal.closestPoint(point.p, false).equals(point.infinite.p));
  }
});

test('Finds the distance between the closest point and the line when limited to the finite line', t => {
  for(const point of POINTS) {
    t.true(t.context.horizontal.distanceTo(point.p) === point.p.distanceTo(point.finite.p));
    t.true(t.context.horizontal.distanceTo(point.p, true) === point.p.distanceTo(point.finite.p));
  }
});

test('Finds the distance between the closest point and the line when limited to the infinite line', t => {
  for(const point of POINTS) {
    t.true(t.context.horizontal.distanceTo(point.p, false) === point.p.distanceTo(point.infinite.p));
  }
});

test('Finds the minimal distance between two lines', t => {
  t.is(t.context.horizontal.distanceTo(t.context.P35), 5);
  t.is(t.context.horizontal.distanceTo(t.context.diagonal), 5);
});

test('Can correctly identify lines that are exact matches', t => {
  t.is(t.context.horizontal.equals(new Line(new Point(0,0), new Point(10, 0))), true);      // Exact match
  t.is(t.context.horizontal.equals(new Line(new Point(10, 0), new Point(0,0))), false);      // Reversed
  t.is(t.context.horizontal.equals(new Line(new Point(0,0.1), new Point(10.5, 0))), false); // Both off
  t.is(t.context.horizontal.equals(new Line(new Point(0,0), new Point(10.1, 0))), false);   // End slightly off
});

test('Correctly extends the lines and moves the end points', t => {
  t.context.horizontal.extend(1, 2);
  t.is(t.context.horizontal.from.x, -1);
  t.is(t.context.horizontal.from.y, 0);
  t.is(t.context.horizontal.to.x, 12);
  t.is(t.context.horizontal.to.y, 0);
});

test('Correctly flips the line and switches the end points', t => {
  t.context.horizontal.flip();
  t.true(t.context.horizontal.from.equals(t.context.P100));
  t.true(t.context.horizontal.to.equals(t.context.P00));
});

test('Generates the correct point from a parameter when limited to a finite line', t => {
  for(const point of POINTS) {
    t.true(t.context.horizontal.pointAt(point.infinite.t).equals(point.finite.p));
    t.true(t.context.horizontal.pointAt(point.infinite.t, true).equals(point.finite.p));
  }
});

test('Generates the correct point from a parameter when limited to an infinite line', t => {
  for(const point of POINTS) {
    t.true(t.context.horizontal.pointAt(point.infinite.t, false).equals(point.infinite.p));
  }
});


test('Generates the correct point from a length', t => {
  t.is(t.context.horizontal.pointAtLength(0).x, 0);
  t.is(t.context.horizontal.pointAtLength(10).x, 10);
  t.is(t.context.horizontal.pointAtLength(5).x, 5);
  t.is(t.context.horizontal.pointAtLength(20).x, 10);
  t.is(t.context.horizontal.pointAtLength(20, true).x, 10);
  t.is(t.context.horizontal.pointAtLength(20, false).x, 20);
});

test('Converts the line to a string', t => {
  t.true(t.context.horizontal.toString().length > 0);
});

test('Translates the line and repositions the end points correctly', t => {
  t.context.horizontal.transform(Transform.translate(new Vector(2, 1)));
  t.is(t.context.horizontal.from.x, 2);
  t.is(t.context.horizontal.from.y, 1);
  t.is(t.context.horizontal.to.x, 12);
  t.is(t.context.horizontal.to.y, 1);
});

test('Rotates the line and repositions the end points correctly', t => {
  shapetypesSettings.invertY = false;
  t.context.horizontal.transform(Transform.rotate(Math.PI / 2));
  t.is(t.context.horizontal.from.x, 0);
  t.is(t.context.horizontal.from.y, 0);
  t.true(t.context.horizontal.to.equals(new Point(0, -10), 0.001));
});