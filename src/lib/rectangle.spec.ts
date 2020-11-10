/* tslint:disable:readonly-keyword no-object-mutation*/
import anyTest, { TestInterface } from 'ava';
import {
  approximatelyEqual,
  Interval,
  IntervalSorted,
  Plane,
  Point,
  Rectangle,
  shapetypesSettings,
  Vector
} from '../index';

const test = anyTest as TestInterface<{
  basicPlane: Plane;
  basic: Rectangle;
  basicX: IntervalSorted;
  basicY: IntervalSorted;
  angled: Rectangle;
}>;

test.beforeEach('Create test geometry', t => {
  t.context.basicPlane = new Plane(new Point(0, 5), Vector.worldX());
  t.context.basic = new Rectangle(t.context.basicPlane, 10, 20);
  t.context.basicX = new IntervalSorted(0, 10);
  t.context.basicY = new IntervalSorted(0, 20);

  const angledPlane = new Plane(new Point(1, 0), new Vector(1, 1));
  const angledUnit = Math.sqrt(2);
  t.context.angled = new Rectangle(angledPlane, 3 * angledUnit, angledUnit);
});

// -----------------------
// CONSTRUCTOR
// -----------------------

test('Constructor: Sets correct interval ranges with number input', t => {
  const r = new Rectangle(t.context.basicPlane, 10, 20);
  t.true(r.x.equals(t.context.basicX));
  t.true(r.y.equals(t.context.basicY));
});
test('Constructor: Sets correct interval ranges with SortedInterval', t => {
  const r = new Rectangle(
    t.context.basicPlane,
    new IntervalSorted(0, 10),
    new IntervalSorted(0, 20)
  );
  t.true(r.x.equals(t.context.basicX));
  t.true(r.y.equals(t.context.basicY));
});
test('Constructor: Sets correct interval ranges with Interval', t => {
  const r = new Rectangle(
    t.context.basicPlane,
    new Interval(0, 10),
    new Interval(0, 20)
  );
  t.true(r.x.equals(t.context.basicX));
  t.true(r.y.equals(t.context.basicY));
});

// -----------------------
// STATIC
// -----------------------
test('fromCorners: Sets correct interval ranges', t => {
  const r = Rectangle.fromCorners(
    new Point(0, 5),
    new Point(10, 25),
    t.context.basicPlane
  );
  t.true(r.x.equals(t.context.basicX));
  t.true(r.y.equals(t.context.basicY));
});

test('fromCenter: Sets correct interval ranges', t => {
  const r = Rectangle.fromCenter(Plane.worldXY(), 10, 20);
  t.true(r.x.equals(new IntervalSorted(-5, 5)));
  t.true(r.y.equals(new IntervalSorted(-10, 10)));
});

// -----------------------
// GET
// -----------------------

test('area: calculates', t => {
  t.is(t.context.basic.area, 200);
});

test('boundingBox: creates correct bounding box even on angle', t => {
  const bb = t.context.angled.boundingBox;
  t.true(bb.min.equals(new Point(0, 0)));
  t.true(bb.max.equals(new Point(4, 4)));
});

test('center: returns correct center', t => {
  t.true(t.context.angled.center.equals(new Point(2, 2)));
});

test('circumference: calculates', t => {
  t.is(t.context.basic.circumference, 20 + 20 + 10 + 10);
});

test('plane: returns correct plane', t => {
  t.true(
    t.context.angled.plane.equals(new Plane(new Point(1, 0), new Vector(1, 1)))
  );
});

test('widthX: calculates', t => {
  t.is(t.context.basic.widthX, 10);
});

test('widthY: calculates', t => {
  t.is(t.context.basic.widthY, 20);
});

test('x: calculates', t => {
  t.true(t.context.basic.x.equals(t.context.basicX));
});

test('y: calculates', t => {
  t.true(t.context.basic.y.equals(t.context.basicY));
});

// -----------------------
// PUBLIC
// -----------------------
test('closestPoint: works when point is outside the rectangle', t => {
  const point = new Point(5, 3);
  t.is(t.context.basic.closestPoint(point).x, 5);
  t.is(t.context.basic.closestPoint(point).y, 5);
});
test('closestPoint: works when point is inside the rectangle', t => {
  const point = new Point(5, 6);
  t.is(t.context.basic.closestPoint(point).x, 5);
  t.is(t.context.basic.closestPoint(point).y, 5);
});
test('closestPoint: works when point is inside the rectangle and interior is included', t => {
  const point = new Point(5, 6);
  t.is(t.context.basic.closestPoint(point, true).x, 5);
  t.is(t.context.basic.closestPoint(point, true).y, 6);
});

test('contains: works when point is inside the rectangle', t => {
  const insidePoint = new Point(5, 6);
  t.is(t.context.basic.contains(insidePoint), true);
  t.is(t.context.basic.contains(insidePoint, true), true);
});
test('contains: works when point is outside the rectangle', t => {
  const outsidePoint = new Point(5, 3);
  t.is(t.context.basic.contains(outsidePoint), false);
  t.is(t.context.basic.contains(outsidePoint, true), false);
});
test('contains: works when point is on edge of rectangle', t => {
  const edgePoint = new Point(5, 5);
  t.is(t.context.basic.contains(edgePoint), true);
  t.is(t.context.basic.contains(edgePoint, true), false);
});

test('corner: Generates points in right position', t => {
  t.is(t.context.basic.corner(true, true).x, 0);
  t.is(t.context.basic.corner(true, true).y, 5);

  t.is(t.context.basic.corner(true, false).x, 0);
  t.is(t.context.basic.corner(true, false).y, 25);

  t.is(t.context.basic.corner(false, true).x, 10);
  t.is(t.context.basic.corner(false, true).y, 5);

  t.is(t.context.basic.corner(false, false).x, 10);
  t.is(t.context.basic.corner(false, false).y, 25);
});

test('equals: can identify when rectangles are exactly identical and slightly different', t => {
  t.context.basicPlane = new Plane(new Point(5, 15), Vector.worldX());
  t.context.basic = new Rectangle(t.context.basicPlane, 10, 20);
  t.is(
    t.context.basic.equals(
      new Rectangle(new Plane(new Point(5, 15), Vector.worldX()), 10, 20)
    ),
    true
  ); // Totally the same
  t.is(
    t.context.basic.equals(
      new Rectangle(new Plane(new Point(5, 15), Vector.worldX()), 10.1, 20)
    ),
    false
  ); // Slightly different
});

test('getCorners: Generates points in correct order', t => {
  const corners = t.context.basic.getCorners();
  t.is(corners.length, 4);
  t.is(corners[0].x, 0);
  t.is(corners[0].y, 5);
  t.is(corners[1].x, 10);
  t.is(corners[1].y, 5);
  t.is(corners[2].x, 10);
  t.is(corners[2].y, 25);
  t.is(corners[3].x, 0);
  t.is(corners[3].y, 25);
});

test('getEdges: Generates correct number of edges', t => {
  const edges = t.context.basic.getEdges();
  t.is(edges.length, 4);
});

// An array containing pairs of points. The first point global coordinates for the point. The second point is the local coordinates for the same point.
const MAPPEDPOINTS: ReadonlyArray<any> = [
  [new Point(0, 5), new Point(0, 0)],
  [new Point(10, 25), new Point(1, 1)],
  [new Point(1, 15), new Point(0.1, 0.5)]
];

test('pointAt: Converts a local point to global coordinates', t => {
  for (const p of MAPPEDPOINTS) {
    const global = p[0];
    const local = p[1];
    t.true(t.context.basic.pointAt(local).equals(global));
  }
});
test('pointAt: Can use UV numbers instead of point', t => {
  for (const p of MAPPEDPOINTS) {
    const global = p[0];
    const local = p[1];
    t.true(t.context.basic.pointAt(local.x, local.y).equals(global));
  }
});

test('toString: Returns string in correct format', t => {
  t.is(t.context.basic.toString(), '[[(0,5),⟨1,0⟩],10,20]');
});

test('withPlane: Correctly replaces plane', t => {
  const rect = t.context.basic.withPlane(Plane.worldXY());
  t.true(rect.plane.equals(Plane.worldXY()));
});
test('withX: Correctly replaces x interval', t => {
  const rect = t.context.basic.withX(new IntervalSorted(-10, 10));
  t.true(rect.x.equals(new IntervalSorted(-10, 10)));
});
test('withY: Correctly replaces y interval', t => {
  const rect = t.context.basic.withY(new IntervalSorted(-10, 10));
  t.true(rect.y.equals(new IntervalSorted(-10, 10)));
});

// -----------------------
// TRANSFORMABLE
// -----------------------

test('translate: Translates the rectangle. Updates the plane and corners.', t => {
  const rect = t.context.basic.translate(new Vector(1, 2));
  t.true(rect.plane.origin.equals(new Point(0 + 1, 5 + 2)));
  t.true(rect.corner(true, true).equals(new Point(0 + 1, 5 + 2)));
  t.true(rect.corner(false, false).equals(new Point(10 + 1, 25 + 2)));
});
test('translate: Translates the angled rectangle. Updates the plane and corners.', t => {
  const rect = t.context.angled.translate(new Vector(1, 2));
  t.true(rect.plane.origin.equals(new Point(1 + 1, 0 + 2)));
  t.true(rect.corner(true, true).equals(new Point(1 + 1, 0 + 2)));
  t.true(rect.corner(false, false).equals(new Point(3 + 1, 4 + 2)));
});

test('rotate: Rotates the rectangle 90 degrees', t => {
  shapetypesSettings.invertY = false;
  const rect = t.context.basic.rotate(Math.PI / 2);

  t.true(approximatelyEqual(rect.area, 200));
  t.true(rect.corner(true, true).equals(new Point(5, 0)));
  t.true(rect.corner(false, false).equals(new Point(25, -10)));
});

test('scale: Scales the rectangle', t => {
  const rect = t.context.basic.scale(2, 3, new Point(0, 5));
  t.true(rect.corner(true, true).equals(new Point(0, 5)));
  t.true(rect.corner(false, false).equals(new Point(20, 65)));
});
