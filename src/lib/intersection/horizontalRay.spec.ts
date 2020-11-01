import anyTest, { TestInterface } from 'ava';
import { Intersection, Line, Point, } from '../../index';

const test = anyTest as TestInterface<{}>;

test('horizontalRayLine: above ray', t => {
  const point = new Point(3, 4);
  const line = Line.fromCoords([
    [1, 10],
    [5, 5]
  ]);
  const result = Intersection.horizontalRayLine(point, line);
  t.is(result, false);
});

test('horizontalRayLine: below ray', t => {
  const point = new Point(3, 4);
  const line = Line.fromCoords([
    [1, 1],
    [5, 2]
  ]);
  const result = Intersection.horizontalRayLine(point, line);
  t.is(result, false);
});

test('horizontalRayLine: to left of ray', t => {
  const point = new Point(3, 4);
  const line = Line.fromCoords([
    [1, 1],
    [2, 5]
  ]);
  const result = Intersection.horizontalRayLine(point, line);
  t.is(result, false);
});

test('horizontalRayLine: through ray', t => {
  const point = new Point(3, 4);
  const line = Line.fromCoords([
    [4, 1],
    [3, 5]
  ]);
  const result = Intersection.horizontalRayLine(point, line);
  t.is(result, true);
});
