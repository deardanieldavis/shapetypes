// tslint:disable:no-let
import test from 'ava';
import { Interval } from './interval';
import { IntervalSorted } from './intervalSorted';

// -----------------------
// STATIC
// -----------------------
test('fromValues', t => {
  const a = Interval.fromValues([1,2,3,4,5]);
  t.is(a.min, 1);
  t.is(a.max, 5);

  const b = Interval.fromValues([5,-2,3,4,5]);
  t.is(b.min, -2);
  t.is(b.max, 5);
});

test('fromInterval', t => {
  const a = Interval.fromExisting(new Interval(5, 10));
  t.is(a.T0, 5);
  t.is(a.T1, 10);

  const b = Interval.fromExisting(new IntervalSorted(5, 10));
  t.is(b.T0, 5);
  t.is(b.T1, 10);
});

test('fromUnion', t => {
  const a = new Interval(5, 10);
  const b = new Interval(-10, -20);
  const result = Interval.union(a, b);

  t.is(result.min, -20);
  t.is(result.max, 10);
});

test('fromIntersection', t => {
  // No overlap
  const a = new Interval(5, 10);
  const b = new Interval(-10, -20);
  let result = Interval.intersection(a, b);
  t.assert(result === undefined);
  result = Interval.intersection(b, a);
  t.assert(result === undefined);

  // Overlap
  const c = new Interval(-2, 7);
  result = Interval.intersection(a, c);
  if (result === undefined) {
    t.fail();
    return;
  }
  t.is(result.T0, 5);
  t.is(result.T1, 7);

  result = Interval.intersection(c, a);
  if (result === undefined) {
    t.fail();
    return;
  }
  t.is(result.T0, 5);
  t.is(result.T1, 7);
});


// -----------------------
// CONSTRUCTOR
// -----------------------
test('Creating interval', t => {
  const interval = new Interval(5, 10);
  t.is(interval.T0, 5);
  t.is(interval.T1, 10);
});



// -----------------------
// GET AND SET
// -----------------------

test('T0', t => {
  const interval = new Interval(5, 10);
  t.is(interval.T0, 5);
  interval.T0 = 20;
  t.is(interval.T0, 20);
});

test('T1', t => {
  const interval = new Interval(5, 10);
  t.is(interval.T1, 10);
  interval.T1 = 20;
  t.is(interval.T1, 20);
});

test('Increasing', t => {
  const interval = new Interval(5, 10);
  t.is(interval.isIncreasing, true);
  t.is(interval.isDecreasing, false);
});

test('Decreasing', t => {
  const interval = new Interval(10, 5);
  t.is(interval.isIncreasing, false);
  t.is(interval.isDecreasing, true);
});

test('Singleton', t => {
  const interval = new Interval(10, 10);
  t.is(interval.isSingleton, true);

  const notSingle = new Interval(5, 10);
  t.is(notSingle.isSingleton, false);
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
  let interval = new Interval(5, 10);
  t.is(interval.length, 5);
  t.is(interval.lengthAbs, 5);

  interval = new Interval(10, 5);
  t.is(interval.length, -5);
  t.is(interval.lengthAbs, 5);
});

// -----------------------
// PUBLIC
// -----------------------

test('Reverse', t => {
  const interval = new Interval(5, 10);
  interval.reverse();
  t.is(interval.T0, -10);
  t.is(interval.T1, -5);
});

test('Swap', t => {
  const interval = new Interval(5, 10);
  interval.swap();
  t.is(interval.T0, 10);
  t.is(interval.T1, 5);
});

test('Grow', t => {
  let interval = new Interval(5, 10);
  interval.grow(20);
  t.is(interval.T0, 5);
  t.is(interval.T1, 20);

  interval = new Interval(5, 10);
  interval.grow(-10);
  t.is(interval.T0, -10);
  t.is(interval.T1, 10);

  interval = new Interval(10, 5);
  interval.grow(20);
  t.is(interval.T0, 20);
  t.is(interval.T1, 5);

  interval = new Interval(10, 5);
  interval.grow(-10);
  t.is(interval.T0, 10);
  t.is(interval.T1, -10);
});

test('Contains', t => {
  const interval = new Interval(10, 20);

  t.is(interval.contains(0), false);
  t.is(interval.contains(15), true);
  t.is(interval.contains(20), true);
  t.is(interval.contains(20.1), false);

  t.is(interval.contains(10, true), false);
  t.is(interval.contains(15, true), true);
  t.is(interval.contains(20, true), false);
});

test('valueAt', t => {
  const interval = new Interval(10, 20);

  t.is(interval.valueAt(0), 10);
  t.is(interval.valueAt(0.1), 11);
  t.is(interval.valueAt(0.9), 19);
});

test('remap', t => {
  const interval = new Interval(10, 20);

  t.is(interval.remapToInterval(10), 0);
  t.is(interval.remapToInterval(11), 0.1);
  t.is(interval.remapToInterval(19), 0.9);
});

