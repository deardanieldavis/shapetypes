import anyTest, { TestInterface } from 'ava';
import { Interval } from './interval';
import { IntervalSorted } from './intervalSorted';

const test = anyTest as TestInterface<{
  interval: IntervalSorted;
  reverse: IntervalSorted;
}>;

test.beforeEach('Create test geometry', t => {
  t.context.interval = new IntervalSorted(5, 10);
  t.context.reverse = new IntervalSorted(10, 5);
});

// -----------------------
// CONSTRUCTOR
// -----------------------
test('constructor: creating an interval generates correct min and max values', t => {
  const interval = new IntervalSorted(5, 10);
  t.is(interval.min, 5);
  t.is(interval.max, 10);
});

test('constructor: creating an interval with values in reverse generates correct min and max values', t => {
  const interval = new IntervalSorted(10, 5);
  t.is(interval.min, 5);
  t.is(interval.max, 10);
});

// -----------------------
// STATIC
// -----------------------
test('fromCenter: creates correct min and max values', t => {
  const newInterval = IntervalSorted.fromCenter(10, 6);
  t.is(newInterval.min, 7);
  t.is(newInterval.max, 13);
});
test('fromCenter: throws error when width is less than zero', t => {
  t.throws(() => {
    // tslint:disable-next-line:no-unused-expression
    IntervalSorted.fromCenter(10, -1);
  });
});

test('fromValues: creates correct min and max values from range of numbers', t => {
  const newInterval = IntervalSorted.fromValues([5, -2, 3, 4, 5]);
  t.is(newInterval.min, -2);
  t.is(newInterval.max, 5);
});

test('fromUnion: creates new interval that encompasses two existing ones', t => {
  const other = new Interval(-10, -20);
  const result = IntervalSorted.union(t.context.interval, other);
  t.is(result.min, -20);
  t.is(result.max, 10);
});

test("fromIntersection: if two intervals don't overlap, returns undefined", t => {
  const other = new IntervalSorted(-10, -20);
  t.is(IntervalSorted.intersection(t.context.interval, other), undefined);
  t.is(IntervalSorted.intersection(other, t.context.interval), undefined);
});

test('fromIntersection: two overlapping intervals returns new interval of overlapping part', t => {
  const other = new IntervalSorted(-2, 7);
  const result = IntervalSorted.intersection(t.context.interval, other);
  if (result === undefined) {
    t.fail();
    return;
  }
  t.is(result.min, 5);
  t.is(result.max, 7);
});

test('fromIntersection: swapping the inputs returns the same result', t => {
  const other = new Interval(-2, 7);
  const result1 = IntervalSorted.intersection(t.context.interval, other);
  const result2 = IntervalSorted.intersection(other, t.context.interval);
  if (result1 === undefined || result2 === undefined) {
    t.fail();
    return;
  }
  t.true(result1.equals(result2));
});

// -----------------------
// GET AND SET
// -----------------------

test('isSingleton: correctly identifies singletons', t => {
  const interval = new IntervalSorted(10, 10);
  t.is(interval.isSingleton, true);

  const notSingle = new IntervalSorted(10, 11);
  t.is(notSingle.isSingleton, false);
});

test('mid: calculates mid value of interval', t => {
  t.is(t.context.interval.mid, 7.5);
});

test('length: calculates the correct length for an interval', t => {
  t.is(t.context.interval.length, 5);
});

// -----------------------
// PUBLIC
// -----------------------

test('reverse: correctly swaps and inverts min and max values', t => {
  const reversed = t.context.interval.reverse();
  t.is(reversed.min, -10);
  t.is(reversed.max, -5);
});

test('grow: interval can grow to accommodate a larger value', t => {
  const grown = t.context.interval.grow(20);
  t.is(grown.min, 5);
  t.is(grown.max, 20);
});

test('grow: interval can grow to accommodate a smaller value', t => {
  const grown = t.context.interval.grow(-10);
  t.is(grown.min, -10);
  t.is(grown.max, 10);
});

test('grow: interval not changed when given value it already contains', t => {
  const grown = t.context.interval.grow(7);
  t.is(grown.min, 5);
  t.is(grown.max, 10);
});

test('inflate: can increase length of interval', t => {
  const inflated = t.context.interval.inflate(2);
  t.is(inflated.min, 3);
  t.is(inflated.max, 12);
});

test('inflate: can decrease length of interval', t => {
  const inflated = t.context.interval.inflate(-2);
  t.is(inflated.min, 7);
  t.is(inflated.max, 8);
});

test('inflate: if interval decreased too much, interval meets in middle', t => {
  const inflated = t.context.interval.inflate(-20);
  t.is(inflated.min, 7.5);
  t.is(inflated.max, 7.5);
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
  t.is(t.context.interval.equals(new IntervalSorted(5, 10)), true);
  t.is(t.context.interval.equals(new IntervalSorted(5.1, 10)), false);
  t.is(t.context.interval.equals(new IntervalSorted(5, 10.1)), false);
});

test('withMin: can set new value', t => {
  const newMin = t.context.interval.withMin(-2);
  t.is(newMin.min, -2);
  t.is(newMin.max, 10);
});

test('withMin: if min value is set to be larger than max value, throws error', t => {
  t.throws(() => {
    t.context.interval.withMin(22);
  });
});

test('withMax: can set new value', t => {
  const newMax = t.context.interval.withMax(20);
  t.is(newMax.min, 5);
  t.is(newMax.max, 20);
});

test('withMax: if max value is set to be smaller than min value, throws error', t => {
  t.throws(() => {
    t.context.interval.withMax(-22);
  });
});
