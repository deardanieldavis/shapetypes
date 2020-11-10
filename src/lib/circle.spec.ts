/* tslint:disable:readonly-keyword */
import anyTest, { TestInterface } from 'ava';

import {
  approximatelyEqual,
  Circle,
  IntervalSorted,
  Plane,
  Point,
  PointContainment,
  shapetypesSettings,
  Vector
} from '../index';

const test = anyTest as TestInterface<{ basic: Circle; moved: Circle }>;

test.beforeEach('Create test geometry', t => {
  t.context.basic = new Circle(10);
  t.context.moved = new Circle(
    10,
    new Plane(new Point(3, 4), new Vector(1, 1))
  );
});

// -----------------------
// CONSTRUCTOR
// -----------------------

test('Constructor: Sets correct radius and default location', t => {
  const c = new Circle(10);
  t.is(c.radius, 10);
  t.true(c.plane.origin.equals(new Point(0, 0)));
  t.true(c.plane.xAxis.equals(Vector.worldX()));
});

test('Constructor: Sets correct radius and location when specifying origin', t => {
  const c = new Circle(10, new Point(3, 4));
  t.is(c.radius, 10);
  t.true(c.plane.origin.equals(new Point(3, 4)));
  t.true(c.plane.xAxis.equals(Vector.worldX()));
});

test('Constructor: Sets correct radius and location when specifying plane', t => {
  const c = new Circle(10, new Plane(new Point(3, 4), new Vector(1, 1)));
  t.is(c.radius, 10);
  t.true(c.plane.origin.equals(new Point(3, 4)));
  t.true(c.plane.xAxis.isParallelTo(new Vector(1, 1)));
});

test('Constructor: Creating circle with 0 radius throws error', t => {
  t.throws(() => {
    // tslint:disable-next-line:no-unused-expression
    new Circle(0);
  });
  t.throws(() => {
    // tslint:disable-next-line:no-unused-expression
    new Circle(-1);
  });
});

// -----------------------
// STATIC
// -----------------------
test('fromThreePoints: creates the correct circle', t => {
  const p1 = new Point(10, 0);
  const p2 = new Point(-10, 0);
  const p3 = new Point(0, 10);
  const c = Circle.fromThreePoints(p1, p2, p3);
  t.true(t.context.basic.equals(c));
});

test('fromThreePoints: if points are in a row, throws an error', t => {
  const p1 = new Point(10, 0);
  const p2 = new Point(-10, 0);
  const p3 = new Point(0, 0);
  t.throws(() => {
    Circle.fromThreePoints(p1, p2, p3);
  });
});

test('fromCenterStart: creates the correct circle', t => {
  const center = new Point(0, 0);
  const start = new Point(10, 0);
  const c = Circle.fromCenterStart(center, start);
  t.is(c.radius, 10);
  t.true(c.plane.origin.equals(new Point(0, 0)));
  t.true(c.plane.xAxis.isParallelTo(new Vector(1, 0)));
});

test('fromCenterStart: if circle has a radius of 0, throws an error', t => {
  const center = new Point(0, 0);
  const start = new Point(0, 0);
  t.throws(() => {
    Circle.fromCenterStart(center, start);
  });
});

// -----------------------
// GET & SET
// -----------------------
test('boundingBox: creates bounding box with correct range', t => {
  t.true(
    t.context.moved.boundingBox.xRange.equals(
      new IntervalSorted(3 - 10, 3 + 10)
    )
  );
  t.true(
    t.context.moved.boundingBox.yRange.equals(
      new IntervalSorted(4 - 10, 4 + 10)
    )
  );
});

test('center: returns correct point', t => {
  t.true(t.context.moved.center.equals(new Point(3, 4)));
});

test('plane: returns correct values', t => {
  t.true(t.context.moved.plane.origin.equals(new Point(3, 4)));
  t.true(t.context.moved.plane.xAxis.isParallelTo(new Vector(1, 1)));
});

test('radius: returns correct length', t => {
  t.is(t.context.basic.radius, 10);
});

test('diameter: returns correct length', t => {
  t.is(t.context.basic.diameter, 20);
});

test('circumference: returns correct length', t => {
  t.true(approximatelyEqual(t.context.basic.circumference, 62.83, 0.01)); // 2 * pi * r
});

test('area: returns correct area', t => {
  t.true(approximatelyEqual(t.context.basic.area, 314.16, 0.01)); // pi * r^2
});

// -----------------------
// PUBLIC
// -----------------------

test('contains: identifies points inside the circle', t => {
  t.is(t.context.basic.contains(new Point(0, 0)), PointContainment.inside);
  t.is(t.context.moved.contains(new Point(3, 4)), PointContainment.inside);
});
test('contains: identifies points outside the circle', t => {
  t.is(t.context.basic.contains(new Point(100, 0)), PointContainment.outside);
  t.is(t.context.moved.contains(new Point(100, 0)), PointContainment.outside);
});
test('contains: identifies points on edges of circle', t => {
  t.is(t.context.basic.contains(new Point(0, 10)), PointContainment.coincident);
  t.is(t.context.moved.contains(new Point(13, 4)), PointContainment.coincident);
});

test('closestParameter: identifies points on edge of circle', t => {
  shapetypesSettings.invertY = false;
  t.is(t.context.basic.closestParameter(new Point(10, 0)), 0);
  t.is(t.context.basic.closestParameter(new Point(0, -10)), Math.PI / 2);
  t.is(t.context.basic.closestParameter(new Point(-10, 0)), Math.PI);
  t.is(t.context.basic.closestParameter(new Point(0, 10)), (3 * Math.PI) / 2);
});
test('closestParameter: identifies points on edge of circle with inverted axis', t => {
  shapetypesSettings.invertY = true;
  t.true(
    approximatelyEqual(t.context.basic.closestParameter(new Point(10, 0)), 0)
  );
  t.true(
    approximatelyEqual(
      t.context.basic.closestParameter(new Point(0, -10)),
      (3 * Math.PI) / 2
    )
  );
  t.true(
    approximatelyEqual(
      t.context.basic.closestParameter(new Point(-10, 0)),
      Math.PI
    )
  );
  t.true(
    approximatelyEqual(
      t.context.basic.closestParameter(new Point(0, 10)),
      Math.PI / 2
    )
  );
});
test('closestParameter: if point is off edge, still finds closest parameter', t => {
  shapetypesSettings.invertY = false;
  t.is(t.context.basic.closestParameter(new Point(-9, 0)), Math.PI);
  t.is(t.context.basic.closestParameter(new Point(-900, 0)), Math.PI);
});
test('closestParameter: identifies points on edges of moved circle', t => {
  shapetypesSettings.invertY = false;
  t.is(t.context.moved.closestParameter(new Point(13, 4)), Math.PI / 4);
});

test('closestPoint: if point is off edge, still finds closest parameter', t => {
  t.true(
    t.context.basic.closestPoint(new Point(10, 0)).equals(new Point(10, 0))
  );
  t.true(
    t.context.basic.closestPoint(new Point(-9, 0)).equals(new Point(-10, 0))
  );
  t.true(
    t.context.basic.closestPoint(new Point(-900, 0)).equals(new Point(-10, 0))
  );
});

test('equals: can identify circles that are identical', t => {
  t.is(t.context.basic.equals(new Circle(10)), true);
  t.is(t.context.basic.equals(new Circle(9)), false);
  t.is(
    t.context.moved.equals(
      new Circle(10, new Plane(new Point(3, 4), new Vector(1, 1)))
    ),
    true
  );
  t.is(
    t.context.moved.equals(
      new Circle(10, new Plane(new Point(2, 4), new Vector(1, 1)))
    ),
    false
  );
});

test('pointAt: generates points in clockwise order', t => {
  shapetypesSettings.invertY = false;
  t.true(t.context.basic.pointAt(0).equals(new Point(10, 0)));
  t.true(t.context.basic.pointAt(Math.PI / 2).equals(new Point(0, -10), 0.01));
  t.true(t.context.basic.pointAt(Math.PI).equals(new Point(-10, 0), 0.01));
  t.true(
    t.context.basic.pointAt((3 * Math.PI) / 2).equals(new Point(0, 10), 0.01)
  );
});
test('pointAt: generates points in clockwise order when axis inverted', t => {
  shapetypesSettings.invertY = true;
  t.true(t.context.basic.pointAt(0).equals(new Point(10, 0)));
  t.true(t.context.basic.pointAt(Math.PI / 2).equals(new Point(0, 10), 0.01));
  t.true(t.context.basic.pointAt(Math.PI).equals(new Point(-10, 0), 0.01));
  t.true(
    t.context.basic.pointAt((3 * Math.PI) / 2).equals(new Point(0, -10), 0.01)
  );
});
test('pointAt: generates points in correct position when plane off center', t => {
  shapetypesSettings.invertY = false;
  t.true(
    t.context.moved
      .pointAt(0)
      .equals(new Point(3 + Math.sqrt(50), 4 + Math.sqrt(50)))
  );
});

test('pointAtLength: generates points in correct position', t => {
  shapetypesSettings.invertY = false;
  t.true(t.context.basic.pointAtLength(0).equals(new Point(10, 0), 0.01));
  t.true(
    t.context.basic.pointAtLength(62.83 / 4).equals(new Point(0, -10), 0.01)
  );
});

test('tangentAt: generates correct tangent', t => {
  t.true(t.context.basic.tangentAt(0).isParallelTo(Vector.worldY()));
  t.true(t.context.basic.tangentAt(Math.PI / 2).isParallelTo(Vector.worldX()));
});

test('toString: returns a string', t => {
  t.true(t.context.basic.toString().length > 0);
});

test('withRadius: creates new circle with correct radius', t => {
  const c = t.context.basic.withRadius(5);
  t.is(c.radius, 5);
});
test('withRadius: if radius is set to a value less than 0, throws error', t => {
  t.throws(() => {
    t.context.basic.withRadius(-1);
  });
});

test('withCircumference: creates a new circle with correct circumference', t => {
  const c = t.context.basic.withCircumference(125.66);
  t.true(approximatelyEqual(c.circumference, 125.66, 0.01));
  t.true(approximatelyEqual(c.radius, 20, 0.01));
});
test('withCircumference: if circumference is set to a value less than 0, throws error', t => {
  t.throws(() => {
    t.context.basic.withCircumference(-1);
  });
});

test('withDiameter: creates a new circle with the correct diameter', t => {
  const c = t.context.basic.withDiameter(200);
  t.is(c.radius, 100);
  t.is(c.diameter, 200);
});
test('withDiameter: if diameter is set to a value less than 0, throws error', t => {
  t.throws(() => {
    t.context.basic.withDiameter(-1);
  });
});

test('withArea: creates a new circle with the correct area', t => {
  const c = t.context.basic.withArea(1256.64);
  t.true(approximatelyEqual(c.area, 1256.64, 0.01));
  t.true(approximatelyEqual(c.radius, 20, 0.01));
});
test('withArea: if area is set to a value less than 0, throws error', t => {
  t.throws(() => {
    t.context.basic.withArea(-1);
  });
});

test('withCenter: creates a new circle with the correct center', t => {
  const c = t.context.moved.withCenter(new Point(20, 30));
  t.true(c.center.equals(new Point(20, 30)));
});

test('withPlane: creates a new circle with the correct plane', t => {
  const c = t.context.moved.withPlane(
    new Plane(new Point(20, 30), new Vector(2, 3))
  );
  t.true(c.plane.origin.equals(new Point(20, 30)));
  t.true(c.plane.xAxis.isParallelTo(new Vector(2, 3)));
});

/*test.beforeEach('Create test geometry', t => {
  t.context.basic = new Circle(10);
  t.context.moved = new Circle(
    10,
    new Plane(new Point(3, 4), new Vector(1, 1))
  );
});*/

// -----------------------
// TRANSFORMABLE
// -----------------------
test('rotate: correctly rotates circle', t => {
  shapetypesSettings.invertY = false;
  const c = t.context.basic.rotate(Math.PI / 2);
  t.is(c.radius, 10);
  t.true(c.center.equals(new Point(0,0)));
  t.true(c.pointAt(0).equals(new Point(0, -10)));
});

test('scale: correctly scales radius of basic circle', t => {
  const c = t.context.basic.scale(2, 2);
  t.is(c.radius, 20);
  t.true(c.center.equals(new Point(0,0)));
});
test('scale: correctly scales radius of shifted circle', t => {
  const c = t.context.moved.scale(2, 2, new Point(3,4));
  t.is(c.radius, 20);
  t.true(c.center.equals(new Point(3,4)));
});
test('scale: doesnt work with uneven scales', t => {
  t.throws(() => {
    // @ts-ignore
    const c = t.context.basic.scale(3, 2);
  });
});

test('translate: correctly moves circle', t => {
  const c = t.context.basic.translate(new Vector(3,4));
  t.is(c.radius, 10);
  t.true(c.center.equals(new Point(3,4)));
});

