// tslint:disable:no-let
import test from 'ava';
import { Point } from './point';
import { shapetypesSettings } from './settings';
import { Transform } from './transform';
import { approximatelyEqual } from './utilities';
import { Vector } from './vector';

test('Translate', t => {
  let tran = Transform.translate(new Vector(1, 0));
  let p = tran.transform(new Point(0, 0));
  t.is(p.x, 1);
  t.is(p.y, 0);

  tran = Transform.translate(new Vector(-4, 40));
  p = tran.transform(new Point(-10, -10));
  t.is(p.x, -14);
  t.is(p.y, 30);
});

test('Scale', t => {
  const tran = Transform.scale(2);
  let p = tran.transform(new Point(0, 0));
  t.is(p.x, 0);
  t.is(p.y, 0);

  p = tran.transform(new Point(3, 8));
  t.is(p.x, 6);
  t.is(p.y, 16);
});

test('ScaleAboutPoint', t => {
  let tran = Transform.scale(2, 2, new Point(0,0));
  let p = tran.transform(new Point(0, 0));
  t.is(p.x, 0);
  t.is(p.y, 0);

  p = tran.transform(new Point(3, 8));
  t.is(p.x, 6);
  t.is(p.y, 16);

  tran = Transform.scale(2, 2, new Point(3,8));
  p = tran.transform(new Point(0, 0));
  t.is(p.x, -3);
  t.is(p.y, -8);

  p = tran.transform(new Point(3, 8));
  t.is(p.x, 3);
  t.is(p.y, 8);

});

test('Rotation', t => {
  // No rotation
  let tran = Transform.rotate(0);
  let p = tran.transform(new Point(1, 0));
  t.is(p.x, 1);
  t.is(p.y, 0);

  // Rotate 0,0 should give same point
  tran = Transform.rotate(Math.PI / 2);
  p = tran.transform(new Point(0, 0));
  t.is(p.x, 0);
  t.is(p.y, 0);

  // Rotate 90 degree - normal y-axis
  shapetypesSettings.invertY = false;
  tran = Transform.rotate(Math.PI / 2);
  p = tran.transform(new Point(1, 0));
  t.is(approximatelyEqual(p.x, 0), true);
  t.is(p.y, -1);

  // Rotate 90 degree - inverted y-axis
  shapetypesSettings.invertY = true;
  tran = Transform.rotate(Math.PI / 2);
  p = tran.transform(new Point(1, 0));
  t.is(approximatelyEqual(p.x, 0), true);
  t.is(p.y, 1);

  // 180 degree
  tran = Transform.rotate(Math.PI);
  p = tran.transform(new Point(1, 0));
  t.is(approximatelyEqual(p.x, -1), true);
  t.is(approximatelyEqual(p.y, 0), true);

  // 270 degree - normal y-axis
  shapetypesSettings.invertY = false;
  tran = Transform.rotate((3 * Math.PI) / 2);
  p = tran.transform(new Point(1, 0));
  t.is(approximatelyEqual(p.x, 0), true);
  t.is(approximatelyEqual(p.y, 1), true);

  // 270 degree - inverted y-axis
  shapetypesSettings.invertY = true;
  tran = Transform.rotate((3 * Math.PI) / 2);
  p = tran.transform(new Point(1, 0));
  t.is(approximatelyEqual(p.x, 0), true);
  t.is(approximatelyEqual(p.y, -1), true);
});

test('Rotation around point', t => {
  // Rotate 90 degrees - normal y
  shapetypesSettings.invertY = false;
  let tran = Transform.rotate(Math.PI / 2, new Point(3, 1));
  let p = tran.transform(new Point(4, 1));
  t.is(p.x, 3);
  t.is(p.y, 0);

  // Rotate 90 degrees - inverted y
  shapetypesSettings.invertY = true;
  tran = Transform.rotate(Math.PI / 2, new Point(3, 1));
  p = tran.transform(new Point(4, 1));
  t.is(p.x, 3);
  t.is(p.y, 2);

  // Rotate 270 degrees - normal y
  shapetypesSettings.invertY = false;
  tran = Transform.rotate((Math.PI * 3) / 2, new Point(3, 1));
  p = tran.transform(new Point(4, 1));
  t.is(p.x, 3);
  t.is(p.y, 2);

  // Rotate 180 degrees - normal y
  shapetypesSettings.invertY = false;
  tran = Transform.rotate(Math.PI, new Point(3, 1));
  p = tran.transform(new Point(4, 1));
  t.is(p.x, 2);
  t.is(p.y, 1);
});

/*
test('plane to plane', t => {
  let planeFrom = new Plane(new Point(0, 0), Vector.worldX());

  // Translation, no rotation
  let planeTo = new Plane(new Point(5, 5), Vector.worldX());
  let tran = Transform.planeToPlane(planeFrom, planeTo);
  let p = tran.transform(new Point(7, 6));
  t.is(p.x, 2);
  t.is(p.y, 1);

  // Rotation, no translation
  shapetypesSettings.invertY = false;
  planeTo = new Plane(new Point(0, 0), new Vector(0, 1));
  tran = Transform.planeToPlane(planeFrom, planeTo);
  p = tran.transform(new Point(1, 0));
  t.is(approximatelyEqual(p.x, 0), true);
  t.is(p.y, -1);

  // Rotation, no translation - inverted y
  shapetypesSettings.invertY = true;
  planeTo = new Plane(new Point(0, 0), new Vector(0, 1));
  tran = Transform.planeToPlane(planeFrom, planeTo);
  p = tran.transform(new Point(1, 0));
  t.is(approximatelyEqual(p.x, 0), true);
  t.is(p.y, -1);

  // Translation + rotation
  shapetypesSettings.invertY = false;
  planeTo = new Plane(new Point(5, 5), new Vector(0, 1));
  tran = Transform.planeToPlane(planeFrom, planeTo);
  p = tran.transform(new Point(6, 5));
  t.is(approximatelyEqual(p.x, 0), true);
  t.is(p.y, -1);

  // Translation = both off 0,0
  shapetypesSettings.invertY = false;
  planeFrom = new Plane(new Point(-1, 0), Vector.worldX());
  planeTo = new Plane(new Point(5, 5), Vector.worldX());
  tran = Transform.planeToPlane(planeFrom, planeTo);
  p = tran.transform(new Point(7, 6));
  t.is(approximatelyEqual(p.x, 1), true);
  t.is(p.y, 1);

  // Translation = both rotated
  shapetypesSettings.invertY = false;
  planeFrom = new Plane(new Point(0, 0), new Vector(0, 1));
  planeTo = new Plane(new Point(0, 0), new Vector(0, -1));
  tran = Transform.planeToPlane(planeFrom, planeTo);
  p = tran.transform(new Point(1, 2));
  t.is(approximatelyEqual(p.x, -1), true);
  t.is(approximatelyEqual(p.y, -2), true);

  // Translation = both rotated and moved
  shapetypesSettings.invertY = false;
  planeFrom = new Plane(new Point(-1, 0), Vector.worldX());
  planeTo = new Plane(new Point(5, 5), new Vector(0, -1));
  tran = Transform.planeToPlane(planeFrom, planeTo);
  p = tran.transform(new Point(7, 6));
  t.is(approximatelyEqual(p.x, -1), true);
  t.is(approximatelyEqual(p.y, 1), true);

  // Translation = both rotated and moved
  shapetypesSettings.invertY = false;
  planeFrom = new Plane(new Point(-1, 0), new Vector(-1, 0));
  planeTo = new Plane(new Point(5, 5), new Vector(0, -1));
  tran = Transform.planeToPlane(planeFrom, planeTo);
  p = tran.transform(new Point(-7, -6));
  t.is(approximatelyEqual(p.x, -1), true);
  t.is(approximatelyEqual(p.y, 1), true);
});*/

/*
test('Change basis', t => {
    //Translation, no rotation
    let tran = Transform.changeBasis(new Plane(new Point(5,5), Vector.worldX()));
    let p = tran.transform(new Point(7, 6));
    t.is(p.x, 2);
    t.is(p.y, 1);


    //Rotation, no translation
    shapetypesSettings.invertY = false;
    tran = Transform.changeBasis(new Plane(new Point(0,0), new Vector(0, 1)));
    p = tran.transform(new Point(1, 0));
    t.is(p.x).toBeCloseTo(0);
    t.is(p.y, -1);


    //Rotation, no translation - inverted y
    shapetypesSettings.invertY = true;
    tran = Transform.changeBasis(new Plane(new Point(0,0), new Vector(0, 1)));
    p = tran.transform(new Point(1, 0));
    t.is(p.x).toBeCloseTo(0);
    t.is(p.y, -1);


    //Translation + rotation
    shapetypesSettings.invertY = false;
    tran = Transform.changeBasis(new Plane(new Point(5,5), new Vector(0, 1)));
    p = tran.transform(new Point(6, 5));
    t.is(p.x).toBeCloseTo(0);
    t.is(p.y, -1);

    //Revsering
    shapetypesSettings.invertY = false;
    tran = Transform.changeBasis(new Plane(new Point(5,5), new Vector(0, 1)));
    p = tran.transform(new Point(6, 5));
    let outcome = tran.inverse();
    let p2 = outcome.result.transform(p);
    t.is(p2.x).toBeCloseTo(6);
    t.is(p2.y, 5);
});*/

test('multiply', t => {
  const a = Transform.fromValues([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const b = Transform.fromValues([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const result = Transform.multiply(a, b);

  t.is(result.M00, 30);
  t.is(result.M10, 36);
  t.is(result.M20, 42);

  t.is(result.M01, 66);
  t.is(result.M11, 81);
  t.is(result.M21, 96);

  t.is(result.M02, 102);
  t.is(result.M12, 126);
  t.is(result.M22, 150);
});

test('inverse', t => {
  const a = Transform.fromValues([3, 0, 2, 2, 0, -2, 0, 1, 1]);
  const outcome = a.inverse();
  if (outcome.success === false) {
    throw new Error('Did not get result for matrix inverse');
  }

  t.is(approximatelyEqual(outcome.result.M00, 0.2), true);
  t.is(approximatelyEqual(outcome.result.M10, 0.2), true);
  t.is(approximatelyEqual(outcome.result.M20, 0), true);

  t.is(approximatelyEqual(outcome.result.M01, -0.2), true);
  t.is(approximatelyEqual(outcome.result.M11, 0.3), true);
  t.is(approximatelyEqual(outcome.result.M21, 1), true);

  t.is(approximatelyEqual(outcome.result.M02, 0.2), true);
  t.is(approximatelyEqual(outcome.result.M12, -0.3), true);
  t.is(approximatelyEqual(outcome.result.M22, 0), true);
});
