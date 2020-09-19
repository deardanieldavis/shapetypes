import { BoundingBox } from './boundingBox';
import { Interval } from './interval';
import { Plane } from './plane';
import { Point } from './point';
import { PointContainment } from './polyline';
import { shapetypesSettings } from './settings';
import { Transform } from './transform';
import { approximatelyEqual } from './utilities';
import { Vector } from './vector';


export class Circle {
  // -----------------------
  // STATIC
  // -----------------------

  public static fromCenterStart(center: Point, start: Point): Circle {
    const axis = Vector.fromPoints(center, start);
    const radius = axis.length;
    if(radius <= 0) {
      throw new Error("Radius must be greater than 0");
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
    if(approximatelyEqual(det, 0, shapetypesSettings.absoluteTolerance)) {
      throw new Error("Points can't be in a line");
    }

    // Find center of circle
    const cx = (bc*(p2.y - p3.y) - cd*(p1.y - p2.y)) / det;
    const cy = ((p1.x - p2.x) * cd - (p2.x - p3.x) * bc) / det;

    const center = new Point(cx, cy);
    const axis = Vector.fromPoints(center, p1);
    const plane = new Plane(center, axis);
    return new Circle(axis.length, plane);
  }

  // -----------------------
  // VARS
  // -----------------------
  private _plane: Plane;
  private _radius: number;

  // -----------------------
  // CONSTRUCTOR
  // -----------------------
  constructor(radius: number, position?: Plane | Point) {
    if(radius <= 0) {
      throw new Error("Radius must be greater than 0");
    }
    this._radius = radius;

    if(position === undefined) {
      this._plane = Plane.worldXY();
    }else if(position instanceof Plane) {
      this._plane = position;
    }else {
      this._plane = new Plane(position, Vector.worldX());
    }
  }


  // -----------------------
  // GET AND SET
  // -----------------------
  get boundingBox(): BoundingBox {
    const xRange = new Interval(this._plane.origin.x - this._radius, this._plane.origin.x + this._radius);
    const yRange = new Interval(this._plane.origin.y - this._radius, this._plane.origin.y + this._radius);
    return new BoundingBox(xRange, yRange);
  }

  get center(): Point {
    return this._plane.origin;
  }
  set center(newPoint: Point) {
    this._plane.origin = newPoint;
  }

  get plane(): Plane {
    return this._plane;
  }
  set plane(newPlane: Plane) {
    this._plane = newPlane;
  }

  get radius(): number {
    return this._radius;
  }
  set radius(value: number) {
    if (value <= 0) {
      throw new Error("Radius must be greater than 0");
    }
    this._radius = value;
  }

  get diameter(): number {
    return this._radius * 2;
  }
  set diameter(value: number) {
    this.radius = value / 2;
  }

  get circumference(): number {
    return 2 * this._radius * Math.PI;
  }
  set circumference(value: number) {
    this.radius = value / (2 * Math.PI);
  }

  get area(): number {
    return Math.PI * this._radius * this._radius;
  }
  set area(newArea: number) {
    if (newArea <= 0) {
      throw new Error("Area must be greater than 0");
    }
    this.radius = Math.sqrt(newArea / Math.PI);
  }


  // -----------------------
  // PUBLIC
  // -----------------------

  public contains(testPoint: Point): PointContainment {
    const difference = Vector.fromPoints(this._plane.origin, testPoint);
    const distance = difference.length;
    if(approximatelyEqual(distance, this._radius, shapetypesSettings.absoluteTolerance)) {
      return PointContainment.coincident;
    }
    if(distance <= this._radius) {
      return PointContainment.inside;
    }
    return PointContainment.outside;
  }

  public closestParameter(testPoint: Point): number {
    const difference = Vector.fromPoints(this._plane.origin, testPoint);
    const angle = Vector.vectorAngleSigned(this._plane.xAxis, difference);
    if(angle < 0) {
      // Because returned angle goes from -PI to PI and we want it to go from 0 to 2PI
      return 2 * Math.PI + angle;
    }
    return angle;
  }

  public closestPoint(testPoint: Point): Point {
    // The closest point will always lie on a vector between the circle's center and the testPoint.
    // By scaling this vector to the circle's radius, we get the point on the circumference
    const difference = Vector.fromPoints(this._plane.origin, testPoint);
    difference.length = this._radius;
    return Point.add(this._plane.origin, difference);
  }

  public equals(otherCircle: Circle, tolerance: number = shapetypesSettings.absoluteTolerance): boolean {
    if(approximatelyEqual(this.radius, otherCircle.radius, tolerance)) {
      if(this.plane.equals(otherCircle.plane)) {
        return true;
      }
    }
    return false;
  }

  public pointAt(t: number): Point {
    return this._plane.pointAt(Math.cos(t) * this._radius, Math.sin(t) * this._radius);
  }

  public pointAtLength(distance: number): Point {
    return this.pointAt(distance / this._radius);
  }

  public tangentAt(t: number): Vector {
    const r0 = this._radius * -Math.sin(t);
    const r1 = this._radius * Math.cos(t);
    const x = this._plane.xAxis.duplicate();
    x.length = r0;

    const y = this._plane.yAxis.duplicate();
    y.length = r1;

    return Vector.add(x, y);
  }

  public toString(): string {
    return "circle: " + this._plane.toString() + "r: " + this._radius;
  }

  public transform(change: Transform): void {
    if(change.M00 !== change.M11) {
      throw new Error("Cant scale circle by uneven amounts in x and y direction");
    }
    this._radius = this._radius * change.M00;
    // TODO: this._plane.transform(change);
  }
}
