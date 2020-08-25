// tslint:disable:no-let
import test from 'ava';
import { Plane } from './plane';
import { Point } from './point';
import { approximatelyEqual } from './utilities';
import { Vector } from './vector';

test('PointAt', t => {
  // No translation, no rotation
  let center = new Point(0, 0);
  let xAxis = new Vector(10, 0);
  let plane = new Plane(center, xAxis);
  t.is(plane.pointAt(0, 0).x, 0);
  t.is(plane.pointAt(0, 0).y, 0);
  t.is(plane.pointAt(2, 0).x, 2);
  t.is(plane.pointAt(2, 0).y, 0);

  // xAxis up yAxis
  center = new Point(0, 0);
  xAxis = new Vector(0, 10);
  plane = new Plane(center, xAxis);
  t.is(approximatelyEqual(plane.pointAt(2, 0).x, 0), true);
  t.is(approximatelyEqual(plane.pointAt(2, 0).y, 2), true);

  // xAxis down yAxis
  center = new Point(0, 0);
  xAxis = new Vector(0, -10);
  plane = new Plane(center, xAxis);
  t.is(approximatelyEqual(plane.pointAt(2, 0).x, 0), true);
  t.is(approximatelyEqual(plane.pointAt(2, 0).y, -2), true);

  // Shift upwards, same axis
  center = new Point(2, 3);
  xAxis = new Vector(10, 0);
  plane = new Plane(center, xAxis);
  t.is(approximatelyEqual(plane.pointAt(0, 0).x, 2), true);
  t.is(approximatelyEqual(plane.pointAt(0, 0).y, 3), true);
  t.is(approximatelyEqual(plane.pointAt(1, 1).x, 3), true);
  t.is(approximatelyEqual(plane.pointAt(1, 1).y, 4), true);

  // Shift and rotate
  center = new Point(2, 3);
  xAxis = new Vector(0, 10);
  plane = new Plane(center, xAxis);
  t.is(approximatelyEqual(plane.pointAt(0, 0).x, 2), true);
  t.is(approximatelyEqual(plane.pointAt(0, 0).y, 3), true);
  t.is(approximatelyEqual(plane.pointAt(0, 1).x, 1), true);
  t.is(approximatelyEqual(plane.pointAt(0, 1).y, 3), true);
});

test('Remap', t => {
  let center = new Point(0, 0);
  let xAxis = new Vector(10, 0);
  let plane = new Plane(center, xAxis);

  // No rotation, no movement
  t.is(
    approximatelyEqual(plane.remapToPlaneSpace(new Point(10, 10)).u, 10),
    true
  );
  t.is(
    approximatelyEqual(plane.remapToPlaneSpace(new Point(10, 10)).v, 10),
    true
  );
  t.is(
    approximatelyEqual(plane.remapToPlaneSpace(new Point(-10, -10)).u, -10),
    true
  );
  t.is(
    approximatelyEqual(plane.remapToPlaneSpace(new Point(-10, -10)).v, -10),
    true
  );
  t.is(
    approximatelyEqual(plane.remapToPlaneSpace(new Point(-10, 10)).u, -10),
    true
  );
  t.is(
    approximatelyEqual(plane.remapToPlaneSpace(new Point(-10, 10)).v, 10),
    true
  );

  // Shift plane upwards
  center = new Point(2, 3);
  xAxis = new Vector(10, 0);
  plane = new Plane(center, xAxis);
  t.is(approximatelyEqual(plane.remapToPlaneSpace(new Point(2, 3)).u, 0), true);
  t.is(approximatelyEqual(plane.remapToPlaneSpace(new Point(2, 3)).v, 0), true);
  t.is(approximatelyEqual(plane.remapToPlaneSpace(new Point(3, 4)).u, 1), true);
  t.is(approximatelyEqual(plane.remapToPlaneSpace(new Point(3, 4)).v, 1), true);
  t.is(
    approximatelyEqual(plane.remapToPlaneSpace(new Point(0, 0)).u, -2),
    true
  );
  t.is(
    approximatelyEqual(plane.remapToPlaneSpace(new Point(0, 0)).v, -3),
    true
  );

  // Rotate plane
  center = new Point(0, 0);
  xAxis = new Vector(0, 10);
  plane = new Plane(center, xAxis);
  t.is(approximatelyEqual(plane.remapToPlaneSpace(new Point(0, 0)).u, 0), true);
  t.is(approximatelyEqual(plane.remapToPlaneSpace(new Point(0, 0)).v, 0), true);
  t.is(
    approximatelyEqual(plane.remapToPlaneSpace(new Point(1, -5)).u, -5),
    true
  );
  t.is(
    approximatelyEqual(plane.remapToPlaneSpace(new Point(1, -5)).v, -1),
    true
  );

  // Rotate and shift
  center = new Point(2, 3);
  xAxis = new Vector(0, 10);
  plane = new Plane(center, xAxis);
  t.is(approximatelyEqual(plane.remapToPlaneSpace(new Point(2, 3)).u, 0), true);
  t.is(approximatelyEqual(plane.remapToPlaneSpace(new Point(2, 3)).v, 0), true);
  t.is(approximatelyEqual(plane.remapToPlaneSpace(new Point(1, 3)).u, 0), true);
  t.is(approximatelyEqual(plane.remapToPlaneSpace(new Point(1, 3)).v, 1), true);
});

test('BackAndForth', t => {
  let center = new Point(2, 3);
  let xAxis = new Vector(0, 10);
  let plane = new Plane(center, xAxis);

  let point = plane.pointAt(0, 1);
  t.is(approximatelyEqual(plane.remapToPlaneSpace(point).u, 0), true);
  t.is(approximatelyEqual(plane.remapToPlaneSpace(point).v, 1), true);

  point = plane.pointAt(-20, 100);
  t.is(approximatelyEqual(plane.remapToPlaneSpace(point).u, -20), true);
  t.is(approximatelyEqual(plane.remapToPlaneSpace(point).v, 100), true);

  center = new Point(-20, 32);
  xAxis = new Vector(-2, -10);
  plane = new Plane(center, xAxis);

  point = plane.pointAt(0, 1);
  t.is(approximatelyEqual(plane.remapToPlaneSpace(point).u, 0), true);
  t.is(approximatelyEqual(plane.remapToPlaneSpace(point).v, 1), true);

  point = plane.pointAt(-20, 100);
  t.is(approximatelyEqual(plane.remapToPlaneSpace(point).u, -20), true);
  t.is(approximatelyEqual(plane.remapToPlaneSpace(point).v, 100), true);
});
