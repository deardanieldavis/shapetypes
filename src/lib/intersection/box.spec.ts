/* tslint:disable:readonly-keyword no-object-mutation*/
import anyTest, { TestInterface } from 'ava';
import {
  BoundingBox,
  Intersection,
  Interval,
  Line,
  Point,
  Ray,
  Vector
} from '../../index';

const test = anyTest as TestInterface<{
  box: BoundingBox;
  boxShifted: BoundingBox;
}>;

test.beforeEach('Create test geometry', t => {
  t.context.box = new BoundingBox(new Interval(-10, 10), new Interval(-10, 10));
  t.context.boxShifted = new BoundingBox(
    new Interval(-10, 10),
    new Interval(5, 35)
  );
});

// -----------------------
// LINE
// -----------------------
test('lineBox: Above the box', t => {
  const line = Line.fromCoords([
    [-5, 20],
    [5, 20]
  ]);
  const result = Intersection.lineBox(line, t.context.box);
  t.is(result.intersects, false);
  t.is(result.domain.min, 0);
  t.is(result.domain.max, 0);
});
test('lineBox: Below the box', t => {
  const line = Line.fromCoords([
    [-5, -20],
    [5, -20]
  ]);
  const result = Intersection.lineBox(line, t.context.box);
  t.is(result.intersects, false);
});
test('lineBox: Left of the box', t => {
  const line = Line.fromCoords([
    [-20, -5],
    [-20, 5]
  ]);
  const result = Intersection.lineBox(line, t.context.box);
  t.is(result.intersects, false);
});
test('lineBox: Right of the box', t => {
  const line = Line.fromCoords([
    [20, -5],
    [20, 5]
  ]);
  const result = Intersection.lineBox(line, t.context.box);
  t.is(result.intersects, false);
});
test('lineBox: Through left side', t => {
  const line = Line.fromCoords([
    [-20, 0],
    [0, 0]
  ]);
  const result = Intersection.lineBox(line, t.context.box);
  t.is(result.intersects, true);
  t.is(result.domain.min, 0.5);
  t.is(result.domain.max, 1);
});
test('lineBox: Through right side', t => {
  const line = Line.fromCoords([
    [9, 0],
    [19, 0]
  ]);
  const result = Intersection.lineBox(line, t.context.box);
  t.is(result.intersects, true);
  t.is(result.domain.min, 0);
  t.is(result.domain.max, 0.1);
});
test('lineBox: Through bottom side', t => {
  const line = Line.fromCoords([
    [0, 0],
    [0, -20]
  ]);
  const result = Intersection.lineBox(line, t.context.box);
  t.is(result.intersects, true);
  t.is(result.domain.min, 0);
  t.is(result.domain.max, 0.5);
});
test('lineBox: Through top side', t => {
  const line = Line.fromCoords([
    [0, 0],
    [0, 20]
  ]);
  const result = Intersection.lineBox(line, t.context.box);
  t.is(result.intersects, true);
  t.is(result.domain.min, 0);
  t.is(result.domain.max, 0.5);
});
test('lineBox: Through top right corner', t => {
  const line = Line.fromCoords([
    [0, 0],
    [100, 100]
  ]);
  const result = Intersection.lineBox(line, t.context.box);
  t.is(result.intersects, true);
  t.is(result.domain.min, 0);
  t.is(result.domain.max, 0.1);
});
test('lineBox: Through two corners', t => {
  const line = Line.fromCoords([
    [-20, 20],
    [20, -20]
  ]);
  const result = Intersection.lineBox(line, t.context.box);
  t.is(result.intersects, true);
  t.is(result.domain.min, 0.25);
  t.is(result.domain.max, 0.75);
});
test('lineBox: Touching top right corner', t => {
  const line = Line.fromCoords([
    [0, 20],
    [20, 0]
  ]);
  const result = Intersection.lineBox(line, t.context.box);
  t.is(result.intersects, true);
  t.is(result.domain.min, 0.5);
  t.is(result.domain.max, 0.5);
});
test('lineBox: Just above top right corner', t => {
  const line = Line.fromCoords([
    [0, 21],
    [20, 1]
  ]);
  const result = Intersection.lineBox(line, t.context.box);
  t.is(result.intersects, false);
});
test('lineBox: fully inside box', t => {
  const line = Line.fromCoords([
    [-5, 5],
    [0, 0]
  ]);
  const result = Intersection.lineBox(line, t.context.box);
  t.is(result.intersects, true);
  t.is(result.domain.min, 0);
  t.is(result.domain.max, 1);
});

// -----------------------
// RAY
// -----------------------
//  t.context.box = new BoundingBox(new Interval(-10, 10), new Interval(-10, 10));
//   t.context.boxShifted = new BoundingBox(
//     new Interval(-10, 10),
//     new Interval(5, 35)
//   );
test('rayBox: Above the box', t => {
  const ray = new Ray(new Point(-5, 20), new Vector(1, 0));
  const result = Intersection.rayBox(ray, t.context.box);
  t.is(result.intersects, false);
  t.is(result.domain.min, 0);
  t.is(result.domain.max, 0);
});
test('rayBox: Through left side', t => {
  const ray = new Ray(new Point(-20, 0), new Vector(1, 0));
  const result = Intersection.rayBox(ray, t.context.box);
  t.is(result.intersects, true);
  t.is(result.domain.min, 10);
  t.is(result.domain.max, 30);
});
test('rayBox: Through left side, only forward', t => {
  const ray = new Ray(new Point(-20, 0), new Vector(1, 0));
  const result = Intersection.rayBox(ray, t.context.box, true);
  t.is(result.intersects, true);
  t.is(result.domain.min, 10);
  t.is(result.domain.max, 30);
});
test('rayBox: Through left side, facing other way', t => {
  const ray = new Ray(new Point(-20, 0), new Vector(-1, 0));
  const result = Intersection.rayBox(ray, t.context.box);
  t.is(result.intersects, true);
  t.is(result.domain.min, -30);
  t.is(result.domain.max, -10);
});
test('rayBox: Through left side, facing other way, only forward', t => {
  const ray = new Ray(new Point(-20, 0), new Vector(-1, 0));
  const result = Intersection.rayBox(ray, t.context.box, true);
  t.is(result.intersects, false);
});
test('rayBox: Through bottom side', t => {
  const ray = new Ray(new Point(0, 0), new Vector(0, -1));
  const result = Intersection.rayBox(ray, t.context.box);
  t.is(result.intersects, true);
  t.is(result.domain.min, -10);
  t.is(result.domain.max, 10);
});
test('rayBox: Through bottom side, only forward', t => {
  const ray = new Ray(new Point(0, 0), new Vector(0, -1));
  const result = Intersection.rayBox(ray, t.context.box, true);
  t.is(result.intersects, true);
  t.is(result.domain.min, 0);
  t.is(result.domain.max, 10);
});
test('rayBox: Touching top right corner', t => {
  const ray = new Ray(new Point(0, 20), new Vector(1, -1));
  const result = Intersection.rayBox(ray, t.context.box);
  t.is(result.intersects, true);
  t.true(result.domain.min === result.domain.max);
});
test('rayBox: Just above top right corner', t => {
  const ray = new Ray(new Point(0, 21), new Vector(1, -1));
  const result = Intersection.rayBox(ray, t.context.box);
  t.is(result.intersects, false);
});
