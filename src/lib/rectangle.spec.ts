import test from 'ava';
import { Plane } from './plane';
import { Point } from './point';
import { Rectangle } from './rectangle';
import { Vector } from './vector';

test('Make rectangle from center', t => {
  const center = new Plane(new Point(1, 1), Vector.worldX());
  const polyline = new Rectangle(center, 4, 2).toPolyline();
  t.is(polyline.points[0].x, -1);
  t.is(polyline.points[0].y, 0);
  t.is(polyline.points[1].x, 3);
  t.is(polyline.points[1].y, 0);
  t.is(polyline.points[2].x, 3);
  t.is(polyline.points[2].y, 2);
  t.is(polyline.points[3].x, -1);
  t.is(polyline.points[3].y, 2);
});
