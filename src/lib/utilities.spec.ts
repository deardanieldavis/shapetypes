/* tslint:disable:readonly-keyword no-object-mutation*/
import anyTest, { TestInterface } from 'ava';
import { approximatelyEqual, Plane, Polygon, Rectangle } from '../index';
import { isPolygonArray, isPolylineArray } from './utilities';

const test = anyTest as TestInterface<{}>;

test('approximatelyEqual: values are equal if exactly equal', t => {
  t.is(approximatelyEqual(1, 1, 0), true);
});
test('approximatelyEqual: values are not equal if slightly different', t => {
  t.is(approximatelyEqual(1, 1.01, 0), false);
});
test('approximatelyEqual: values are equal if within epsilon', t => {
  t.is(approximatelyEqual(1, 1.01, 0.01), false);
});

test('isPolylineArray: array of polylines returns true', t => {
  const r = new Rectangle(Plane.worldXY(), 3, 3).toPolyline();
  t.is(isPolylineArray([r, r]), true);
});
test('isPolylineArray: empty array is false', t => {
  t.is(isPolylineArray([]), false);
});
test('isPolylineArray: array random values returns false', t => {
  t.is(isPolylineArray([2, 'Hi']), false);
});

test('isPolygonArray: array of polygons returns true', t => {
  const r = new Rectangle(Plane.worldXY(), 3, 3).toPolyline();
  const p = new Polygon(r);
  t.is(isPolygonArray([p, p]), true);
});
test('isPolygonArray: empty array is false', t => {
  t.is(isPolygonArray([]), false);
});
test('isPolygonArray: array random values returns false', t => {
  t.is(isPolygonArray([2, 'Hi']), false);
});
