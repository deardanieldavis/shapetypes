// tslint:disable:no-let
import test from 'ava';
import { Line } from './line';
import { Point } from './point';
import { shapetypesSettings } from './settings';
import { approximatelyEqual } from './utilities';
import { Vector } from './vector';

// -----------------------
// STATIC
// -----------------------
test('fromVector', t => {
  const line = Line.fromVector(new Point(3, 5), new Vector(3, 4));
  t.is(line.length, 5);
  t.is(line.from.x, 3);
  t.is(line.from.y, 5);
  t.is(line.to.x, 6);
  t.is(line.to.y, 9);

  const lineLength = Line.fromVector(new Point(3, 5), new Vector(3, 4), 10);
  t.is(lineLength.length, 10);
  t.is(lineLength.to.x, 9);
  t.is(lineLength.to.y, 13);
});

// -----------------------
// CONSTRUCTOR
// -----------------------
test('construct', t => {
  const line = new Line(new Point(3, 5), new Point(6, 9));
  t.is(line.length, 5);
  t.is(line.from.x, 3);
  t.is(line.from.y, 5);
  t.is(line.to.x, 6);
  t.is(line.to.y, 9);
});


// -----------------------
// GET AND SET
// -----------------------
test('boundingBox', t => {
  const line = new Line(new Point(3, 5), new Point(6, 9));
  const bb = line.boundingBox;
  t.is(bb.min.x, 3);
  t.is(bb.min.y, 5);
  t.is(bb.max.x, 6);
  t.is(bb.max.y, 9);
});

test('Direction', t => {
  const line = new Line(new Point(3, 5), new Point(6, 9));
  t.is(line.direction.length, 5);
  t.is(line.direction.x, 3);
  t.is(line.direction.y, 4);

  const lineBack = new Line(new Point(6, 9), new Point(3, 5));
  t.is(lineBack.direction.length, 5);
  t.is(lineBack.direction.x, -3);
  t.is(lineBack.direction.y, -4);
});

test('From', t => {
  const line = new Line(new Point(3, 5), new Point(6, 9));
  t.is(line.from.x, 3);
  t.is(line.from.y, 5);

  line.from = new Point(2,3);
  t.is(line.from.x, 2);
  t.is(line.from.y, 3);
});

test('To', t => {
  const line = new Line(new Point(3, 5), new Point(6, 9));
  t.is(line.to.x, 6);
  t.is(line.to.y, 9);

  line.to = new Point(2,3);
  t.is(line.to.x, 2);
  t.is(line.to.y, 3);
});

test('Length', t => {
  const line = new Line(new Point(3, 5), new Point(6, 9));
  t.is(line.length, 5);

  line.length = 10;
  t.is(line.to.x, 9);
  t.is(line.to.y, 13);

  line.length = -5;
  t.is(line.to.x, 0);
  t.is(line.to.y, 1);
});

test('Unit', t => {
  shapetypesSettings.invertY = false;
  const line = new Line(new Point(0, 0), new Point(10, 0));
  let u = line.unitTangent;
  t.is(u.length, 1);
  t.is(approximatelyEqual(u.x, 0), true);
  t.is(approximatelyEqual(u.y, -1), true);

  shapetypesSettings.invertY = true;
  u = line.unitTangent;
  t.is(u.length, 1);
  t.is(approximatelyEqual(u.x, 0), true);
  t.is(approximatelyEqual(u.y, 1), true);
});







test('Vector', t => {
  const start = new Point(0, 0);
  const end = new Point(0, 10);
  const line = new Line(start, end);

  t.is(line.direction.x, 0);
});

test('Closest Point', t => {
  let line = new Line(new Point(0, 0), new Point(10, 0));
  t.is(line.closestParameter(new Point(-10, 0), true), 0);
  t.is(line.closestParameter(new Point(-10, 2), true), 0);
  t.is(line.closestParameter(new Point(20, 0), true), 1);
  t.is(line.closestParameter(new Point(20, 20), true), 1);
  t.is(line.closestParameter(new Point(5, 0), true), 0.5);
  t.is(line.closestParameter(new Point(5, -100), true), 0.5);

  line = new Line(new Point(-10, -10), new Point(10, 10));
  t.is(line.closestParameter(new Point(-11, -11), true), 0);
  t.is(line.closestParameter(new Point(-11, -12), true), 0);
  t.is(line.closestParameter(new Point(11, 11), true), 1);
  t.is(line.closestParameter(new Point(11, 10), true), 1);
  t.is(line.closestParameter(new Point(0, 0), true), 0.5);
  t.is(line.closestParameter(new Point(-5, 5), true), 0.5);
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
