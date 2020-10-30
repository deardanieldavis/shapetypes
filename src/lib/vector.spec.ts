import anyTest, { TestInterface } from 'ava';
import {
  approximatelyEqual,
  Point,
  shapetypesSettings,
  Transform,
  Vector
} from '../index';

const test = anyTest as TestInterface<{
  basic: Vector;
  diagonal: Vector;
}>;

test.beforeEach('Create test geometry', t => {
  t.context.basic = new Vector(3, 4);
  t.context.diagonal = new Vector(10, 10);
});

// -----------------------
// CONSTRUCTOR
// -----------------------

test('constructor: sets correct x and y values', t => {
  const vector = new Vector(3, 4);
  t.is(vector.x, 3);
  t.is(vector.y, 4);
});

// -----------------------
// STATIC
// -----------------------
test('fromPoints: creates correct vector', t => {
  const vector = Vector.fromPoints(new Point(1, 2), new Point(4, 6));
  t.true(vector.equals(t.context.basic));
});

test('worldX: creates vector with correct x and y values', t => {
  t.is(Vector.worldX().x, 1);
  t.is(Vector.worldX().y, 0);
});

test('worldY: creates vector with correct x and y values', t => {
  t.is(Vector.worldY().x, 0);
  t.is(Vector.worldY().y, 1);
});

// -----------------------
// GET
// -----------------------

test('isUnit: identifies vectors with a length of 1', t => {
  t.is(new Vector(1, 0).isUnit, true);
  t.is(new Vector(1, 1).isUnit, false);
});

test('isZero: identifies vectors with a length of 0', t => {
  t.is(new Vector(0, 0).isZero, true);
  t.is(new Vector(1, 1).isZero, false);
});

test('length: returns correct length of vector', t => {
  t.is(t.context.basic.length, 5);
});

test('x: returns correct x value', t => {
  t.is(t.context.basic.x, 3);
});

test('xAxis: returns correct x axis', t => {
  t.is(t.context.basic.xAxis.x, 3);
  t.is(t.context.basic.xAxis.y, 0);
});

test('y: returns correct y value', t => {
  t.is(t.context.basic.y, 4);
});

test('yAxis: returns correct y axis', t => {
  t.is(t.context.basic.yAxis.x, 0);
  t.is(t.context.basic.yAxis.y, 4);
});

// -----------------------
// PUBLIC
// -----------------------

test('add: correctly adds another vector', t => {
  const vector = t.context.basic.add(new Vector(1, 2));
  t.is(vector.x, 3 + 1);
  t.is(vector.y, 4 + 2);
});
test('add: correctly adds x and y values', t => {
  const vector = t.context.basic.add(1, 2);
  t.is(vector.x, 3 + 1);
  t.is(vector.y, 4 + 2);
});

interface Vectors {
  angle: number; // Angled relative to x axis
  signed: number; // Signed angle relative to x axis
  v: Vector; // The test vector
}
const VECTORS: readonly Vectors[] = [
  { angle: 0, signed: 0, v: new Vector(1, 0) }, // 0 degree
  { angle: Math.PI / 4, signed: Math.PI / 4, v: new Vector(1, -1) }, // 45 degree
  { angle: Math.PI / 2, signed: Math.PI / 2, v: new Vector(0, -1) }, // 90 degree
  {
    angle: (3 * Math.PI) / 4,
    signed: (3 * Math.PI) / 4,
    v: new Vector(-1, -1)
  }, // 135 degree
  { angle: Math.PI / 2, signed: (-1 * Math.PI) / 2, v: new Vector(0, 1) }, // 90 degree
  { angle: Math.PI / 4, signed: (-1 * Math.PI) / 4, v: new Vector(1, 1) } // 45 degree
];

test('angle: calculates correct angle between x-axis and another vector', t => {
  shapetypesSettings.invertY = false;
  for (const v of VECTORS) {
    t.true(approximatelyEqual(Vector.worldX().angle(v.v), v.angle));
  }
  // reverse order shouldn't have any impact
  for (const v of VECTORS) {
    t.true(approximatelyEqual(v.v.angle(Vector.worldX()), v.angle));
  }
});

test('angle: inverting the y axis doesnt change the angles calculated', t => {
  shapetypesSettings.invertY = true;
  for (const v of VECTORS) {
    t.true(approximatelyEqual(Vector.worldX().angle(v.v), v.angle));
  }
  // reverse order should return same value
  for (const v of VECTORS) {
    t.true(approximatelyEqual(v.v.angle(Vector.worldX()), v.angle));
  }
});

test('angleSigned: calculates correct signed angle between x-axis and another vector', t => {
  shapetypesSettings.invertY = false;
  for (const v of VECTORS) {
    t.true(approximatelyEqual(Vector.worldX().angleSigned(v.v), v.signed));
  }
  // Reverse order, reverse angle direction
  for (const v of VECTORS) {
    t.true(approximatelyEqual(v.v.angleSigned(Vector.worldX()), -v.signed));
  }
});

test('angleSigned: inverting the y axis inverts the signedAngle', t => {
  shapetypesSettings.invertY = true;
  for (const v of VECTORS) {
    t.true(approximatelyEqual(Vector.worldX().angleSigned(v.v), -1 * v.signed));
  }
  // Reverse order, reverse angle direction
  for (const v of VECTORS) {
    t.true(approximatelyEqual(v.v.angleSigned(Vector.worldX()), v.signed));
  }
});

test('divide: correctly divides x and y components of vector', t => {
  t.is(t.context.diagonal.divide(2).x, 5);
  t.is(t.context.diagonal.divide(2).y, 5);
});
test('divide: can divide by different x and y values', t => {
  t.is(t.context.diagonal.divide(2, 5).x, 5);
  t.is(t.context.diagonal.divide(2, 5).y, 2);
});

test('dotProduct: calculates correct dot product', t => {
  // https://www.symbolab.com/solver/vector-dot-product-calculator/%5Cleft(3%2C%204%5Cright)%5Ccdot%5Cleft(-1%2C%202%5Cright)
  t.is(t.context.basic.dotProduct(new Vector(1, 2)), 11);
  t.is(t.context.basic.dotProduct(new Vector(-1, 2)), 5);
});

test('equals: returns true when vectors exact match', t => {
  t.true(t.context.basic.equals(new Vector(3, 4)));
});
test('equals: returns false when vectors are slightly off and there is no tolerance', t => {
  t.is(t.context.basic.equals(new Vector(3, 4.1), 0), false);
});
test('equals: returns true when vectors are slightly off but it is within tolerance', t => {
  t.is(t.context.basic.equals(new Vector(3, 4.1), 0.2), true);
});
test('equals: returns false when vectors are slightly off and it is not within tolerance', t => {
  t.is(t.context.basic.equals(new Vector(3, 4.1), 0.05), false);
});

test('isParallelTo: returns true when two vectors are identical', t => {
  t.true(t.context.diagonal.isParallelTo(new Vector(1, 1)));
});
test('isParallelTo: returns true when two vectors are parallel but going in opposite directions', t => {
  t.true(t.context.diagonal.isParallelTo(new Vector(-1, -1)));
});
test('isParallelTo: returns true even when vectors are slightly off', t => {
  t.true(t.context.diagonal.isParallelTo(new Vector(1.000001, 1)));
});
test('isParallelTo: returns false when vectors are slightly off and there is no tolerance', t => {
  t.is(t.context.diagonal.isParallelTo(new Vector(1.000001, 1), 0), false);
});
test('isParallelTo: returns false when vectors are slightly off and it is outside the tolerance', t => {
  t.is(t.context.diagonal.isParallelTo(new Vector(1.1, 1)), false);
});

test('isPerpendicularTo: returns true when two vectors are perpendicular', t => {
  t.true(t.context.diagonal.isPerpendicularTo(new Vector(-1, 1)));
  t.true(t.context.diagonal.isPerpendicularTo(new Vector(1, -1)));
});
test('isPerpendicularTo: returns true even when vectors are slightly off', t => {
  t.true(t.context.diagonal.isPerpendicularTo(new Vector(-1.000001, 1)));
});
test('isPerpendicularTo: returns false when vectors are slightly off and there is no tolerance', t => {
  t.is(
    t.context.diagonal.isPerpendicularTo(new Vector(-1.000001, 1), 0),
    false
  );
});
test('isPerpendicularTo: returns false when vectors are slightly off and it is outside the tolerance', t => {
  t.is(t.context.diagonal.isPerpendicularTo(new Vector(-1.1, 1)), false);
});

test('isXAxis: returns true vector is horizontal', t => {
  t.is(new Vector(10, 0).isXAxis(), true);
  t.is(new Vector(10, 0.00001).isXAxis(), true);
  t.is(new Vector(10, 0.2).isXAxis(), false);
});

test('isYAxis: returns true vector is vertical', t => {
  t.is(new Vector(0, 10).isYAxis(), true);
  t.is(new Vector(0.00001, 10).isYAxis(), true);
  t.is(new Vector(0.2, 10).isYAxis(), false);
});

test('multiply: correctly multiplies the x and y components of vector', t => {
  t.is(t.context.diagonal.multiply(2).x, 20);
  t.is(t.context.diagonal.multiply(2).y, 20);
});
test('multiply: can multiply by different x and y values', t => {
  t.is(t.context.diagonal.multiply(2, 5).x, 20);
  t.is(t.context.diagonal.multiply(2, 5).y, 50);
});

test('perpendicular: returns perpendicular vector in correct direction', t => {
  shapetypesSettings.invertY = false;
  const perp = t.context.diagonal.perpendicular();
  t.true(perp.isPerpendicularTo(t.context.diagonal));

  // Has to be on the left side of the vector 10,10
  t.is(perp.x, -10);
  t.is(perp.y, 10);
});
test('perpendicular: returns perpendicular vector in correct direction when y axis inverted', t => {
  shapetypesSettings.invertY = true;
  const perp = t.context.diagonal.perpendicular();
  t.true(perp.isPerpendicularTo(t.context.diagonal));

  // Has to be on the right side of the vector 10,10
  t.is(perp.x, -10);
  t.is(perp.y, 10);
});

test('reverse: correctly inverts x and y values', t => {
  const vector = t.context.basic.reverse();
  t.is(vector.x, -3);
  t.is(vector.y, -4);
});

test('subtract: correctly subtracts another vector', t => {
  const vector = t.context.basic.subtract(new Vector(1, 2));
  t.is(vector.x, 3 - 1);
  t.is(vector.y, 4 - 2);
});
test('subtract: correctly subtracts x and y values', t => {
  const vector = t.context.basic.subtract(1, 2);
  t.is(vector.x, 3 - 1);
  t.is(vector.y, 4 - 2);
});

test('toString: creates string in correct format', t => {
  t.is(t.context.basic.toString(), '⟨3,4⟩');
});

test('unitize: shortens vector length to 1', t => {
  const unit = t.context.basic.unitize();
  t.is(unit.length, 1);
  t.true(unit.isParallelTo(t.context.basic));
});

test('withLength: correctly changes length of vector', t => {
  const vector = t.context.basic.withLength(20);
  t.is(vector.length, 20);
  t.true(vector.isParallelTo(t.context.basic));
});

test('withX: creates new vector with correct x value', t => {
  t.is(t.context.basic.withX(20).x, 20);
  t.is(t.context.basic.withX(20).y, 4);
});

test('withY: creates new vector with correct y value', t => {
  t.is(t.context.basic.withY(20).x, 3);
  t.is(t.context.basic.withY(20).y, 20);
});

// -----------------------
// TRANSFORMABLE
// -----------------------

test('transform: correctly applies transformation and changes x and y components', t => {
  const tran = Transform.scale(2);
  const vector = t.context.basic.transform(tran);
  t.is(vector.x, 3 * 2);
  t.is(vector.y, 4 * 2);
});
test("transform: translate doesn't change the vector (because a vector can't be moved)", t => {
  const tran = Transform.translate(new Vector(20, 30));
  const vector = t.context.basic.transform(tran);
  t.is(vector.x, 3);
  t.is(vector.y, 4);
});
test('transform: rotate not impacted by pivot point', t => {
  shapetypesSettings.invertY = false;
  const tran = Transform.rotate(Math.PI / 2, new Point(20, 30));
  const vector = t.context.basic.transform(tran);
  t.true(approximatelyEqual(vector.x, 4));
  t.true(approximatelyEqual(vector.y, -3));
});
test('transform: scale isnt affected by point location', t => {
  const tran = Transform.scale(2, 3, new Point(20, 20));
  const vector = t.context.basic.transform(tran);
  t.is(vector.x, 3 * 2);
  t.is(vector.y, 4 * 3);
});

test('rotate: rotating 90 degrees changes x and y values correctly', t => {
  shapetypesSettings.invertY = false;
  const vector = t.context.basic.rotate(Math.PI / 2);
  t.true(approximatelyEqual(vector.x, 4));
  t.true(approximatelyEqual(vector.y, -3));
});
test('rotate: inverting y-axis rotates in other direction', t => {
  shapetypesSettings.invertY = true;
  const vector = t.context.basic.rotate(Math.PI / 2);
  t.true(approximatelyEqual(vector.x, -4));
  t.true(approximatelyEqual(vector.y, 3));
});

test('scale: applies uniform scale to x and y components', t => {
  const vector = t.context.basic.scale(2);
  t.is(vector.x, 3 * 2);
  t.is(vector.y, 4 * 2);
});
test('scale: unevenly scales x and y components', t => {
  const vector = t.context.basic.scale(2, 3);
  t.is(vector.x, 3 * 2);
  t.is(vector.y, 4 * 3);
});

/*
test('planeToPlane: unevenly scales x and y components', t => {
  shapetypesSettings.invertY = false;
  const before = new Plane(new Point(0,0), Vector.worldX());
  const after = new Plane(new Point(0, 0), Vector.worldY());
  const vector = t.context.basic.planeToPlane(before, after);
  t.is(vector.x, -4);
  t.is(vector.y, 3);
});*/

/*
test('Rotate', t => {
  // rotate 180
  let vector = new Vector(1, 0);
  vector.rotate(Math.PI);
  t.is(approximatelyEqual(vector.x, -1), true);
  t.is(approximatelyEqual(vector.y, 0), true);

  // rotate 90 - normal y
  shapetypesSettings.invertY = false;
  vector = new Vector(1, 0);
  vector.rotate(Math.PI / 2);
  t.is(approximatelyEqual(vector.x, 0), true);
  t.is(approximatelyEqual(vector.y, -1), true);

  // rotate 90 - inverted y
  shapetypesSettings.invertY = true;
  vector = new Vector(1, 0);
  vector.rotate(Math.PI / 2);
  t.is(approximatelyEqual(vector.x, 0), true);
  t.is(approximatelyEqual(vector.y, 1), true);

  // rotate 270 - normal y
  shapetypesSettings.invertY = false;
  vector = new Vector(1, 0);
  vector.rotate((Math.PI * 3) / 2);
  t.is(approximatelyEqual(vector.x, 0), true);
  t.is(approximatelyEqual(vector.y, 1), true);

  // rotate 270 - inverted y
  shapetypesSettings.invertY = true;
  vector = new Vector(1, 0);
  vector.rotate((Math.PI * 3) / 2);
  t.is(approximatelyEqual(vector.x, 0), true);
  t.is(approximatelyEqual(vector.y, -1), true);
});



*/
