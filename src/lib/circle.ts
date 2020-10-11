import { BoundingBox } from './boundingBox';
import { IntervalSorted } from './intervalSorted';
import { Plane } from './plane';
import { Point } from './point';
import { shapetypesSettings } from './settings';
import { Transform } from './transform';
import { approximatelyEqual, PointContainment } from './utilities';
import { Vector } from './vector';

export class Circle {
  // -----------------------
  // STATIC
  // -----------------------

  public static fromCenterStart(center: Point, start: Point): Circle {
    const axis = Vector.fromPoints(center, start);
    const radius = axis.length;
    if (radius <= 0) {
      throw new Error('Radius must be greater than 0');
    }
    const plane = new Plane(center, axis);
    return new Circle(radius, plane);
  }

  public static fromThreePoints(p1: Point, p2: Point, p3: Point): Circle {
    // https://stackoverflow.com/questions/28910718/give-3-points-and-a-plot-circle
    const temp = p2.x * p2.x + p2.y * p2.y;
    const bc = (p1.x * p1.x + p1.y * p1.y - temp) / 2;
    const cd = (temp - p3.x * p3.x - p3.y * p3.y) / 2;
    const det = (p1.x - p2.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p2.y);

    // Make sure points aren't in a line
    if (approximatelyEqual(det, 0, shapetypesSettings.absoluteTolerance)) {
      throw new Error("Points can't be in a line");
    }

    // Find center of circle
    const cx = (bc * (p2.y - p3.y) - cd * (p1.y - p2.y)) / det;
    const cy = ((p1.x - p2.x) * cd - (p2.x - p3.x) * bc) / det;

    const center = new Point(cx, cy);
    const axis = Vector.fromPoints(center, p1);
    const plane = new Plane(center, axis);
    return new Circle(axis.length, plane);
  }

  // -----------------------
  // VARS
  // -----------------------
  private readonly _plane: Plane;
  private readonly _radius: number;

  // -----------------------
  // CONSTRUCTOR
  // -----------------------
  constructor(radius: number, position?: Plane | Point) {
    if (radius <= 0) {
      throw new Error('Radius must be greater than 0');
    }
    this._radius = radius;

    if (position === undefined) {
      this._plane = Plane.worldXY();
    } else if (position instanceof Plane) {
      this._plane = position;
    } else {
      this._plane = new Plane(position, Vector.worldX());
    }
  }

  // -----------------------
  // GET AND SET
  // -----------------------
  get boundingBox(): BoundingBox {
    const xRange = new IntervalSorted(
      this._plane.origin.x - this._radius,
      this._plane.origin.x + this._radius
    );
    const yRange = new IntervalSorted(
      this._plane.origin.y - this._radius,
      this._plane.origin.y + this._radius
    );
    return new BoundingBox(xRange, yRange);
  }

  get center(): Point {
    return this._plane.origin;
  }

  get plane(): Plane {
    return this._plane;
  }

  get radius(): number {
    return this._radius;
  }

  get diameter(): number {
    return this._radius * 2;
  }

  get circumference(): number {
    return 2 * this._radius * Math.PI;
  }

  get area(): number {
    return Math.PI * this._radius * this._radius;
  }

  // -----------------------
  // PUBLIC
  // -----------------------

  public contains(testPoint: Point): PointContainment {
    const difference = Vector.fromPoints(this._plane.origin, testPoint);
    const distance = difference.length;
    if (
      approximatelyEqual(
        distance,
        this._radius,
        shapetypesSettings.absoluteTolerance
      )
    ) {
      return PointContainment.coincident;
    }
    if (distance <= this._radius) {
      return PointContainment.inside;
    }
    return PointContainment.outside;
  }

  public closestParameter(testPoint: Point): number {
    const difference = Vector.fromPoints(this._plane.origin, testPoint);
    const angle = this._plane.xAxis.angleSigned(difference);
    if (angle < 0) {
      // Because returned angle goes from -PI to PI and we want it to go from 0 to 2PI
      return 2 * Math.PI + angle;
    }
    return angle;
  }

  public closestPoint(testPoint: Point): Point {
    // The closest point will always lie on a vector between the circle's center and the testPoint.
    // By scaling this vector to the circle's radius, we get the point on the circumference
    const difference = Vector.fromPoints(this._plane.origin, testPoint);
    const sized = difference.withLength(this._radius);
    return this._plane.origin.add(sized);
  }

  public equals(
    otherCircle: Circle,
    tolerance: number = shapetypesSettings.absoluteTolerance
  ): boolean {
    if (approximatelyEqual(this.radius, otherCircle.radius, tolerance)) {
      if (this.plane.equals(otherCircle.plane)) {
        return true;
      }
    }
    return false;
  }

  public pointAt(t: number): Point {
    const u = Math.cos(t) * this._radius;
    const v = Math.sin(t) * this._radius;
    if (shapetypesSettings.invertY) {
      return this._plane.pointAt(u, v);
    }
    return this._plane.pointAt(u, -v);
  }

  public pointAtLength(distance: number): Point {
    return this.pointAt(distance / this._radius);
  }

  public tangentAt(t: number): Vector {
    const r0 = this._radius * -Math.sin(t);
    const r1 = this._radius * Math.cos(t);

    const x = this._plane.xAxis.withLength(r0);
    const y = this._plane.yAxis.withLength(r1);

    return x.add(y);
  }

  public toString(): string {
    return 'circle: ' + this._plane.toString() + 'r: ' + this._radius;
  }

  // @ts-ignore - I don't know why returning 'this' throws an error
  public transform(change: Transform): Circle {
    if (change.M00 !== change.M11) {
      throw new Error(
        'Cant scale circle by uneven amounts in x and y direction'
      );
    }
    // const radius = this._radius * change.M00;
    // TODO: this._plane.transform(change);
  }

  public withArea(newArea: number): Circle {
    if (newArea <= 0) {
      throw new Error('Area must be greater than 0');
    }
    const radius = Math.sqrt(newArea / Math.PI);
    return this.withRadius(radius);
  }

  public withCircumference(newCircumference: number): Circle {
    const radius = newCircumference / (2 * Math.PI);
    return this.withRadius(radius);
  }
  public withDiameter(newDiameter: number): Circle {
    const radius = newDiameter / 2;
    return this.withRadius(radius);
  }
  public withRadius(newRadius: number): Circle {
    if (newRadius <= 0) {
      throw new Error('Radius must be greater than 0');
    }
    return new Circle(newRadius, this._plane);
  }
  public withPlane(newPlane: Plane): Circle {
    return new Circle(this._radius, newPlane);
  }

  public withCenter(newCenter: Point): Circle {
    return new Circle(this._radius, this._plane.withOrigin(newCenter));
  }
}
