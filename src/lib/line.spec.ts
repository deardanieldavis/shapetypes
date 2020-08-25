// tslint:disable:no-let
import test from 'ava';
import { Line } from './line';
import { Point } from './point';

test('Vector', t => {
  const start = new Point(0, 0);
  const end = new Point(0, 10);
  const line = new Line(start, end);

  t.is(line.direction.x, 0);
});

test('Length', t => {
  const start = new Point(0, 0);
  const end = new Point(0, 10);
  const line = new Line(start, end);

  t.is(line.length, 10);
});

test('Closest Point', t => {
  let line = new Line(new Point(0, 0), new Point(10, 0));
  t.is(line.closestParameter(new Point(-10, 0)), 0);
  t.is(line.closestParameter(new Point(-10, 2)), 0);
  t.is(line.closestParameter(new Point(20, 0)), 1);
  t.is(line.closestParameter(new Point(20, 20)), 1);
  t.is(line.closestParameter(new Point(5, 0)), 0.5);
  t.is(line.closestParameter(new Point(5, -100)), 0.5);

  line = new Line(new Point(-10, -10), new Point(10, 10));
  t.is(line.closestParameter(new Point(-11, -11)), 0);
  t.is(line.closestParameter(new Point(-11, -12)), 0);
  t.is(line.closestParameter(new Point(11, 11)), 1);
  t.is(line.closestParameter(new Point(11, 10)), 1);
  t.is(line.closestParameter(new Point(0, 0)), 0.5);
  t.is(line.closestParameter(new Point(-5, 5)), 0.5);
});

test('PointAt', t => {
  const start = new Point(-1, 0);
  const end = new Point(4, 0);
  const line = new Line(start, end);

  t.is(line.pointAtLength(0).x, -1);
  t.is(line.pointAtLength(1).x, 0);
  t.is(line.pointAtLength(2).x, 1);
  t.is(line.pointAtLength(200).x, 4);
});
