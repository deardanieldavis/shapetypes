// tslint:disable:no-let
import test from 'ava';
import { Point } from './point';
import { Vector } from './vector';

test('Move', t => {
  let point = new Point(2, 3);
  point.translate(new Vector(5, 6));
  t.is(point.x, 7);
  t.is(point.y, 9);

  point = new Point(0, 0);
  point.translate(new Vector(1, 0), 10);
  t.is(point.x, 10);
  t.is(point.y, 0);
});

test('Add', t => {
  const point = new Point(2, 3);
  const vector = new Vector(5, 6);

  const result = Point.add(point, vector);
  t.is(result.x, 7);
  t.is(result.y, 9);
});

test('Comparison', t => {
  const point = new Point(3, -5);

  t.is(point.equals(new Point(3, -5)), true);
  t.is(point.equals(new Point(3.000000001, -5)), false);
  t.is(point.equals(new Point(3.000000001, -5), 0.000000002), true);
  t.is(point.equals(new Point(3.000000005, -5), 0.000000002), false);
});
