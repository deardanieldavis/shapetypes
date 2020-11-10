/* tslint:disable:readonly-keyword no-object-mutation*/
import anyTest, { TestInterface } from 'ava';
import { Interval } from '../index';

const test = anyTest as TestInterface<{
  interval: Interval;
  reverse: Interval;
}>;

test.beforeEach('Create test geometry', t => {
  t.context.interval = new Interval(5, 10);
  t.context.reverse = new Interval(10, 5);
});

// -----------------------
// CONSTRUCTOR
// -----------------------
test('Constructor: creates interval and sets correct T0 and T1 values', t => {
  const interval = new Interval(5, 10);
  t.is(interval.T0, 5);
  t.is(interval.T1, 10);
});

// -----------------------
// STATIC
// -----------------------
test('fromValues: creates correct min and max values from range of numbers', t => {
  const newInterval = Interval.fromValues([1, -2, 3, 4, 5]);
  t.is(newInterval.min, -2);
  t.is(newInterval.max, 5);
});

test('fromUnion: creates new interval that encompasses two existing ones', t => {
  const other = new Interval(-10, -20);
  const result = Interval.union(t.context.interval, other);
  t.is(result.min, -20);
  t.is(result.max, 10);
});

test("fromIntersection: if two intervals don't overlap, returns undefined", t => {
  const other = new Interval(-10, -20);
  t.is(Interval.intersection(t.context.interval, other), undefined);
  t.is(Interval.intersection(other, t.context.interval), undefined);
});

test('fromIntersection: two overlapping intervals returns new interval of overlapping part', t => {
  const other = new Interval(-2, 7);
  const result = Interval.intersection(t.context.interval, other);
  if (result === undefined) {
    t.fail();
    return;
  }
  t.is(result.T0, 5);
  t.is(result.T1, 7);
});

test('fromIntersection: swapping the inputs returns the same result', t => {
  const other = new Interval(-2, 7);
  const result1 = Interval.intersection(t.context.interval, other);
  const result2 = Interval.intersection(other, t.context.interval);
  if (result1 === undefined || result2 === undefined) {
    t.fail();
    return;
  }
  t.true(result1.equals(result2));
});

// -----------------------
// GET AND SET
// -----------------------

test('isIncreasing: correctly identifies that an interval is increasing', t => {
  t.is(t.context.interval.isIncreasing, true);
  t.is(t.context.interval.isDecreasing, false);
});

test('isDecreasing: correctly identifies that an interval is decreasing', t => {
  t.is(t.context.reverse.isIncreasing, false);
  t.is(t.context.reverse.isDecreasing, true);
});

test('isSingleton: correctly identifies singletons', t => {
  const interval = new Interval(10, 10);
  t.is(interval.isSingleton, true);
  t.is(t.context.interval.isSingleton, false);
});

test('min & max: correctly returns min and max value of an interval', t => {
  t.is(t.context.interval.min, 5);
  t.is(t.context.interval.max, 10);
});

test('min & max: correctly returns min and max value of an interval, even when T0 and T1 are reversed', t => {
  t.is(t.context.reverse.min, 5);
  t.is(t.context.reverse.max, 10);
});

test('mid: calculates mid value of interval', t => {
  t.is(t.context.interval.mid, 7.5);
});

test('length: calculates the correct signed length for an interval', t => {
  t.is(t.context.interval.length, 5);
});

test('length: calculates the correct signed length for an interval when decreasing', t => {
  t.is(t.context.reverse.length, -5);
});

test('lengthAbs: calculates the correct absolute length for an interval', t => {
  t.is(t.context.interval.lengthAbs, 5);
});

test('length: calculates the correct absolute length for an interval when decreasing', t => {
  t.is(t.context.reverse.lengthAbs, 5);
});

// -----------------------
// PUBLIC
// -----------------------

test('reverse: reverse correctly swaps and inverts T0 and T1', t => {
  const reversed = t.context.interval.reverse();
  t.is(reversed.T0, -10);
  t.is(reversed.T1, -5);
});

test('swap: correctly swaps T0 and T1', t => {
  const swapped = t.context.interval.swap();
  t.is(swapped.T0, 10);
  t.is(swapped.T1, 5);
});

test('grow: expands to include a value higher', t => {
  const grown = t.context.interval.grow(20);
  t.is(grown.T0, 5);
  t.is(grown.T1, 20);
});

test('grow: expands to include a value lower', t => {
  const grown = t.context.interval.grow(-10);
  t.is(grown.T0, -10);
  t.is(grown.T1, 10);
});

test('grow: expands to include a value higher when interval is decreasing', t => {
  const grown = t.context.reverse.grow(20);
  t.is(grown.T0, 20);
  t.is(grown.T1, 5);
});

test('grow: expands to include a value lower when interval is decreasing', t => {
  const grown = t.context.reverse.grow(-10);
  t.is(grown.T0, 10);
  t.is(grown.T1, -10);
});

test('grow: interval not changed when given value it already contains', t => {
  const grown = t.context.interval.grow(7);
  t.is(grown.T0, 5);
  t.is(grown.T1, 10);
});

test('contains: correctly identifies which values are within the interval', t => {
  t.is(t.context.interval.contains(0), false);
  t.is(t.context.interval.contains(5), true);
  t.is(t.context.interval.contains(7.5), true);
  t.is(t.context.interval.contains(10), true);
  t.is(t.context.interval.contains(10.1), false);
});

test('contains: correctly identifies which values are within the interval when containment is strict', t => {
  t.is(t.context.interval.contains(0, true), false);
  t.is(t.context.interval.contains(5, true), false);
  t.is(t.context.interval.contains(7.5, true), true);
  t.is(t.context.interval.contains(10, true), false);
  t.is(t.context.interval.contains(10.1, true), false);
});

test('valueAt: correctly turns a parameter on the interval into a value', t => {
  t.is(t.context.interval.valueAt(0), 5);
  t.is(t.context.interval.valueAt(0.2), 6);
  t.is(t.context.interval.valueAt(1), 10);
});

test('remap: correctly remaps a value to the parameter space of interval', t => {
  t.is(t.context.interval.remapToInterval(5), 0);
  t.is(t.context.interval.remapToInterval(6), 0.2);
  t.is(t.context.interval.remapToInterval(10), 1);
});

test('equals: correctly identifies intervals that are exact matches', t => {
  t.is(t.context.interval.equals(new Interval(5, 10)), true);
  t.is(t.context.interval.equals(new Interval(5.1, 10)), false);
  t.is(t.context.interval.equals(new Interval(5, 10.1)), false);
});

test('withT0: can set value', t => {
  const interval = t.context.interval.withT0(20);
  t.is(interval.T0, 20);
});

test('withT1: can set value', t => {
  const interval = t.context.interval.withT1(20);
  t.is(interval.T1, 20);
});
