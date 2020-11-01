import anyTest, { TestInterface } from 'ava';
import {Intersection, Line} from '../../index';

const test = anyTest as TestInterface<{}>;

test('lineLine: Meet in cross at 0,0', t => {
  const lineA = Line.fromCoords([
    [-10, 0],
    [10, 0]
  ]);
  const lineB = Line.fromCoords([
    [0, -10],
    [0, 10]
  ]);
  const result = Intersection.lineLine(lineA, lineB);
  t.true(result.intersects);
  t.is(result.lineAu, 0.5);
  t.is(result.lineBu, 0.5);
});
test('lineLine: Meet in cross at 0,0, reversed', t => {
  const lineA = Line.fromCoords([
    [-10, 0],
    [10, 0]
  ]);
  const lineB = Line.fromCoords([
    [0, 10],
    [0, -10]
  ]);
  const result = Intersection.lineLine(lineA, lineB);
  t.true(result.intersects);
  t.is(result.lineAu, 0.5);
  t.is(result.lineBu, 0.5);
});
test('lineLine: Meet in cross at -10,0', t => {
  const lineA = Line.fromCoords([
    [-10, 0],
    [10, 0]
  ]);
  const lineB = Line.fromCoords([
    [-10, -10],
    [-10, 10]
  ]);
  const result = Intersection.lineLine(lineA, lineB);
  t.true(result.intersects);
  t.is(result.lineAu, 0);
  t.is(result.lineBu, 0.5);
});
test('lineLine: Meet in cross at 0,10', t => {
  const lineA = Line.fromCoords([
    [-10, 10],
    [10, 10]
  ]);
  const lineB = Line.fromCoords([
    [0, -10],
    [0, 10]
  ]);
  const result = Intersection.lineLine(lineA, lineB);
  t.true(result.intersects);
  t.is(result.lineAu, 0.5);
  t.is(result.lineBu, 1);
});
test('lineLine: Meet at angle at 0,00', t => {
  const lineA = Line.fromCoords([
    [-10, 0],
    [10, 0]
  ]);
  const lineB = Line.fromCoords([
    [-10, -10],
    [10, 10]
  ]);
  const result = Intersection.lineLine(lineA, lineB);
  t.true(result.intersects);
  t.is(result.lineAu, 0.5);
  t.is(result.lineBu, 0.5);
});
test('lineLine: Do not meet', t => {
  const lineA = Line.fromCoords([
    [-10, 0],
    [10, 0]
  ]);
  const lineB = Line.fromCoords([
    [0, 10],
    [0, 20]
  ]);
  const result = Intersection.lineLine(lineA, lineB);
  t.is(result.intersects, false);
});
test('lineLine: Infinite, meet in cross at 0,0', t => {
  const lineA = Line.fromCoords([
    [-10, 0],
    [10, 0]
  ]);
  const lineB = Line.fromCoords([
    [0, -10],
    [0, 10]
  ]);
  const result = Intersection.lineLine(lineA, lineB, false);
  t.true(result.intersects);
  t.is(result.lineAu, 0.5);
  t.is(result.lineBu, 0.5);
});
test('lineLine: Infinite, meet below lineB', t => {
  const lineA = Line.fromCoords([
    [-10, 0],
    [10, 0]
  ]);
  const lineB = Line.fromCoords([
    [0, 10],
    [0, 20]
  ]);
  const result = Intersection.lineLine(lineA, lineB, false);
  t.true(result.intersects);
  t.is(result.lineAu, 0.5);
  t.is(result.lineBu, -1);
});
test('lineLine: Infinite, meet at an angle at 0,0', t => {
  const lineA = Line.fromCoords([
    [-10, -10],
    [-5, -5]
  ]);
  const lineB = Line.fromCoords([
    [5, -5],
    [10, -10]
  ]);
  const result = Intersection.lineLine(lineA, lineB, false);
  t.true(result.intersects);
  t.is(result.lineAu, 2);
  t.is(result.lineBu, -1);
});

test('lineLine: Has a denominator of 0, dont cross', t => {
  const lineA = Line.fromCoords([
    [0, 0],
    [10, 0]
  ]);
  const lineB = Line.fromCoords([
    [0, 1],
    [10, 1]
  ]);
  const result = Intersection.lineLine(lineA, lineB);
  t.is(result.intersects, false);
});
