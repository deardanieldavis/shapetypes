// tslint:disable:no-let
import test from 'ava';
import {Interval} from './interval';

test('Setting T0 & T1', t => {
  const interval = new Interval(5, 10);

  t.is(interval.T0, 5);
  t.is(interval.T1, 10);
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
  t.is(interval.T0, 10);
  t.is(interval.T1, 5);
});
