// tslint:disable:no-let
import test from 'ava';
import { Interval } from './interval';

test('Getting T0 & T1', t => {
  const interval = new Interval(5, 10);

  t.is(interval.t0, 5);
  t.is(interval.t1, 10);
});

test('Setting T0 & T1', t => {
  const interval = new Interval(5, 10);
  interval.t0 = 20;
  interval.t1 = 22;

  t.is(interval.t0, 20);
  t.is(interval.t1, 22);
});

test('Increasing and decreasing', t => {
  let interval = new Interval(5, 10);
  t.is(interval.isIncreasing, true);
  t.is(interval.isDecreasing, false);

  interval = new Interval(15, 10);
  t.is(interval.isIncreasing, false);
  t.is(interval.isDecreasing, true);
});

test('Min & max', t => {
  let interval = new Interval(5, 10);
  t.is(interval.min, 5);
  t.is(interval.max, 10);

  interval = new Interval(10, 5);
  t.is(interval.min, 5);
  t.is(interval.max, 10);
});

test('Mid', t => {
  const interval = new Interval(5, 10);
  t.is(interval.mid, 7.5);
});

test('Length', t => {
  const interval = new Interval(5, 10);
  t.is(interval.length, 5);
});

test('Singleton', t => {
  const interval = new Interval(10, 10);
  t.is(interval.isSingleton, true);
});

test('Swap', t => {
  const interval = new Interval(5, 10);
  interval.swap();
  t.is(interval.t0, 10);
  t.is(interval.t1, 5);
});

test('Reverse', t => {
  const interval = new Interval(5, 10);
  interval.reverse();
  t.is(interval.t0, -10);
  t.is(interval.t1, -5);
});

test('Grow', t => {
  const interval = new Interval(5, 10);

  let growed = interval.grow(20);
  t.is(growed.t0, 5);
  t.is(growed.t1, 20);

  growed = interval.grow(-10);
  t.is(growed.t0, -10);
  t.is(growed.t1, 10);
});

test('Union', t => {
  const a = new Interval(5, 10);
  const b = new Interval(-10, -20);
  const result = a.union(b);

  t.is(result.min, -20);
  t.is(result.max, 10);
});

test('Intersection', t => {
  const a = new Interval(5, 10);
  const b = new Interval(-10, -20);
  let result = a.intersection(b);
  t.assert(result === undefined);

  const c = new Interval(-2, 7);
  result = a.intersection(c);
  if (result === undefined) {
    t.fail();
    return;
  }
  t.is(result.t0, -2);
  t.is(result.t1, 10);
});

test('valueAt', t => {
  const interval = new Interval(10, 20);

  t.is(interval.valueAt(0), 10);
  t.is(interval.valueAt(0.1), 11);
  t.is(interval.valueAt(0.9), 19);
});

test('includes', t => {
  const interval = new Interval(10, 20);

  t.is(interval.includes(0), false);
  t.is(interval.includes(15), true);
  t.is(interval.includes(20), true);
  t.is(interval.includes(20.1), false);
});
