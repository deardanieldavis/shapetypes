// tslint:disable:no-let
import test from 'ava';
import { BoundingBox } from './boundingBox';

test('Union', t => {
  const boxA = new BoundingBox(0, 10, 0, 10);

  // No intersection
  let boxB = new BoundingBox(20, 30, 0, 10);
  let result = BoundingBox.union(boxA, boxB);
  t.is(result, undefined);

  // Corner intersection
  boxB = new BoundingBox(5, 15, 5, 15);
  result = BoundingBox.union(boxA, boxB);
  if (result === undefined) {
    throw new Error('No result from union');
  }
  t.is(result.min.x, 5);
  t.is(result.min.y, 5);
  t.is(result.max.x, 10);
  t.is(result.max.y, 10);

  // Full side intersection
  boxB = new BoundingBox(5, 15, -15, 15);
  result = BoundingBox.union(boxA, boxB);
  if (result === undefined) {
    throw new Error('No result from union');
  }
  t.is(result.min.x, 5);
  t.is(result.min.y, 0);
  t.is(result.max.x, 10);
  t.is(result.max.y, 10);

  // Fully inside
  boxB = new BoundingBox(2, 7, 2, 7);
  result = BoundingBox.union(boxA, boxB);
  if (result === undefined) {
    throw new Error('No result from union');
  }
  t.is(result.min.x, 2);
  t.is(result.min.y, 2);
  t.is(result.max.x, 7);
  t.is(result.max.y, 7);
});
