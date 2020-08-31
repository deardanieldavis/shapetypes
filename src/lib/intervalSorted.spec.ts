// tslint:disable:no-let
import test from 'ava';
import { Interval } from './interval';
import { IntervalSorted } from './intervalSorted';

// -----------------------
// STATIC
// -----------------------
test('fromValues', t => {
  const a = IntervalSorted.fromValues([1,2,3,4,5]);
  t.is(a.min, 1);
  t.is(a.max, 5);

  const b = IntervalSorted.fromValues([5,-2,3,4,5]);
  t.is(b.min, -2);
  t.is(b.max, 5);
});

test('fromInterval', t => {
  const a = IntervalSorted.fromExisting(new Interval(5, 10));
  t.is(a.min, 5);
  t.is(a.max, 10);

  const b = IntervalSorted.fromExisting(new IntervalSorted(5, 10));
  t.is(b.min, 5);
  t.is(b.max, 10);
});

test('fromUnion', t => {
  const a = new IntervalSorted(5, 10);
  const b = new IntervalSorted(-10, -20);
  const result = IntervalSorted.union(a, b);

  t.is(result.min, -20);
  t.is(result.max, 10);
});

test('fromIntersection', t => {
  // No overlap
  const a = new IntervalSorted(5, 10);
  const b = new IntervalSorted(-10, -20);
  let result = IntervalSorted.intersection(a, b);
  t.assert(result === undefined);
  result = IntervalSorted.intersection(b, a);
  t.assert(result === undefined);

  // Overlap
  const c = new IntervalSorted(-2, 7);
  result = IntervalSorted.intersection(a, c);
  if (result === undefined) {
    t.fail();
    return;
  }
  t.is(result.min, 5);
  t.is(result.max, 7);

  result = IntervalSorted.intersection(c, a);
  if (result === undefined) {
    t.fail();
    return;
  }
  t.is(result.min, 5);
  t.is(result.max, 7);
});


// -----------------------
// CONSTRUCTOR
// -----------------------
test('Creating interval', t => {
  let interval = new IntervalSorted(5, 10);
  t.is(interval.min, 5);
  t.is(interval.max, 10);

  interval = new IntervalSorted(10, 5);
  t.is(interval.min, 5);
  t.is(interval.max, 10);
});




// -----------------------
// GET AND SET
// -----------------------

test('Singleton', t => {
  const interval = new IntervalSorted(10, 10);
  t.is(interval.isSingleton, true);

  const notSingle = new IntervalSorted(5, 10);
  t.is(notSingle.isSingleton, false);
});

test('Min & max', t => {
  const interval = new IntervalSorted(5, 10);

  // Get
  t.is(interval.min, 5);
  t.is(interval.max, 10);

  // Set
  interval.min = -2;
  t.is(interval.min, -2);

  interval.max = 20;
  t.is(interval.max, 20);

  // Throws
  t.throws(() => {interval.min = 22;});
  t.throws(() => {interval.max = -22;});
});


test('Mid', t => {
  const interval = new IntervalSorted(5, 10);
  t.is(interval.mid, 7.5);
});

test('Length', t => {
  const interval = new IntervalSorted(5, 10);
  t.is(interval.length, 5);
});

// -----------------------
// PUBLIC
// -----------------------

test('Reverse', t => {
  const interval = new IntervalSorted(5, 10);
  interval.reverse();
  t.is(interval.min, -10);
  t.is(interval.max, -5);
});

test('Grow', t => {
  let interval = new IntervalSorted(5, 10);
  interval.grow(20);
  t.is(interval.min, 5);
  t.is(interval.max, 20);

  interval = new IntervalSorted(5, 10);
  interval.grow(-10);
  t.is(interval.min, -10);
  t.is(interval.max, 10);
});

test('Inflate', t => {
  let interval = new IntervalSorted(5, 10);
  interval.inflate(2);
  t.is(interval.min, 3);
  t.is(interval.max, 12);

  interval = new IntervalSorted(5, 10);
  interval.inflate(-2);
  t.is(interval.min, 7);
  t.is(interval.max, 8);

  interval = new IntervalSorted(5, 10);
  interval.inflate(-20);
  t.is(interval.min, 7.5);
  t.is(interval.max, 7.5);
});

test('Contains', t => {
  const interval = new IntervalSorted(10, 20);

  t.is(interval.contains(0), false);
  t.is(interval.contains(15), true);
  t.is(interval.contains(20), true);
  t.is(interval.contains(20.1), false);

  t.is(interval.contains(10, true), false);
  t.is(interval.contains(15, true), true);
  t.is(interval.contains(20, true), false);
});

test('valueAt', t => {
  const interval = new IntervalSorted(10, 20);

  t.is(interval.valueAt(0), 10);
  t.is(interval.valueAt(0.1), 11);
  t.is(interval.valueAt(0.9), 19);
});

test('remap', t => {
  const interval = new IntervalSorted(10, 20);

  t.is(interval.remapToInterval(10), 0);
  t.is(interval.remapToInterval(11), 0.1);
  t.is(interval.remapToInterval(19), 0.9);
});
