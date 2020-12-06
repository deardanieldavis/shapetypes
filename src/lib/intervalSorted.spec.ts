/* tslint:disable:readonly-keyword no-object-mutation*/
import anyTest, { TestInterface } from 'ava';
import { IntervalSorted } from '../index';

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

// -----------------------
// GET AND SET
// -----------------------

test('isDecreasing: should never be decreasing', t => {
  const interval = new IntervalSorted(10, 0);
  t.is(interval.isDecreasing, false);
});

test('isIncreasing: should always be increasing', t => {
  const interval = new IntervalSorted(10, 0);
  t.is(interval.isIncreasing, true);
});

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
