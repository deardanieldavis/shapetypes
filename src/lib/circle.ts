import {
  approximatelyEqual,
  BoundingBox,
  Geometry,
  IntervalSorted,
  Plane,
  Point,
  PointContainment,
  shapetypesSettings,
  Transform,
  Vector
} from '../index';

/**
 * A circle has a [[center]] and a [[radius]].
 * It also has an orientation (how much it is rotated about the center point), which is
 * defined by [[plane]].
 */
export class Circle extends Geometry {
  // -----------------------
  // STATIC
  // -----------------------

  /**
   * Returns a new circle defined by its center and a point on the edge.
   * @category Create
   * @param center    The center of the circle.
   * @param start     A point on the edge of the circle. The circle will be orientated so
   *                  [[pointAt]] begins at this point.
   */
  public static fromCenterStart(center: Point, start: Point): Circle {
    const axis = Vector.fromPoints(center, start);
    const radius = axis.length;
    if (radius <= 0) {
      throw new Error('Radius must be greater than 0');
    }
    const plane = new Plane(center, axis);
    return new Circle(radius, plane);
  }

  /**
   * Returns a new circle that passes through the three points.
   *
   * @note  Throws an error if the three points are in a straight line.
   *
   * @category Create
   * @param p1  The first point to pass through. The circle will be orientated so
   *            [[pointAt]] begins at this point.
   * @param p2  The second point to pass through.
   * @param p3  The third point to pass through.
   */
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

  /**
   * Creates a new circle.
   *
   * @param radius    Radius of the circle.
   * @param position  The location of the circle.
   *                  If no position given, will be located at (0,0).
   *                  If the location is a point, the circle will be centered on the point and orientated to [[Vector.worldX]].
   *                  If the location is a plane, the circle will be centered on the plane's origin and orientated to the plane's x-axis.
   */
  constructor(radius: number, position?: Plane | Point) {
    super();
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
  /***
   * Gets the smallest boundingBox that contains the circle.
   */
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

  /**
   * Returns the center of the circle.
   */
  get center(): Point {
    return this._plane.origin;
  }

  /**
   * Returns the plane defining the circle's position.
   * The plane's origin is the center of the circle.
   * The plane's x-axis is the orientation of the circle.
   */
  get plane(): Plane {
    return this._plane;
  }

  /**
   * Returns the radius of the circle.
   */
  get radius(): number {
    return this._radius;
  }

  /**
   * Returns the diameter of the circle.
   */
  get diameter(): number {
    return this._radius * 2;
  }

  /**
   * Returns the circumference of the circle.
   */
  get circumference(): number {
    return 2 * this._radius * Math.PI;
  }

  /**
   * Returns the area of the circle.
   */
  get area(): number {
    return Math.PI * this._radius * this._radius;
  }

  // -----------------------
  // PUBLIC
  // -----------------------

  /**
   * Returns whether a point is inside, outside, or on the edge of the circle.
   *
   * @param testPoint   Point to test for containment.
   * @param tolerance   Distance the point can be from the edge of the circle and still considered coincident.
   */
  public contains(testPoint: Point, tolerance = shapetypesSettings.absoluteTolerance): PointContainment {
    const difference = Vector.fromPoints(this._plane.origin, testPoint);
    const distance = difference.length;
    if (
      approximatelyEqual(
        distance,
        this._radius,
        tolerance
      )
    ) {
      return PointContainment.coincident;
    }
    if (distance <= this._radius) {
      return PointContainment.inside;
    }
    return PointContainment.outside;
  }

  /***
   * Finds the closest point on the circle and returns the parameter for the point.
   * @param testPoint   The target to get closest to.
   * @returns           The parameter of the closest point. Entering the parameter into [[pointAt]] will return the closest point.
   */
  public closestParameter(testPoint: Point): number {
    const difference = Vector.fromPoints(this._plane.origin, testPoint);
    const angle = this._plane.xAxis.angleSigned(difference);
    if (angle < 0) {
      // Because returned angle goes from -PI to PI and we want it to go from 0 to 2PI
      return 2 * Math.PI + angle;
    }
    return angle;
  }

  /***
   * Finds the closest point on the circle and returns the point.
   * @param testPoint       Target to get closest to.
   * @param includeInterior If false, the closest point must lie on the outer edge of the circle.
   *                        If true, the closest point can also be a point on the interior of the circle.
   */
  public closestPoint(testPoint: Point, includeInterior: boolean = false): Point {
    if(includeInterior) {
      if(this.contains(testPoint)) {
        return testPoint;
      }
    }

    // The closest point will always lie on a vector between the circle's center and the testPoint.
    // By scaling this vector to the circle's radius, we get the point on the circumference
    const difference = Vector.fromPoints(this._plane.origin, testPoint);
    const sized = difference.withLength(this._radius);
    return this._plane.origin.add(sized);
  }

  /***
   * Checks whether another circle has the same [[plane]] and [[radius]]. Returns true if it does.
   * @param otherCircle   The circle to compare against.
   * @param tolerance     The amount the radius and plane can differ and still be considered equal.
   */
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

  /**
   * Returns a point on the circle.
   * @param t Position of the point, in radians. If the environment's y-axis points upwards, the position is measured counter-clockwise from the start of the circle. If the y-axis is pointing downwards, it is clockwise.
   */
  public pointAt(t: number): Point {
    const u = Math.cos(t) * this._radius;
    const v = Math.sin(t) * this._radius;
    return this._plane.pointAt(u, v);
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

  /***
   * Gets the circle as a string in the format: `[plane,radius]`.
   */
  public toString(): string {
    return '['+ this._plane.toString() + ',' + this._radius + ']';
  }

  /**
   * Returns a copy of the circle with a different [[area]].
   * @param newArea   The area of the new circle.
   */
  public withArea(newArea: number): Circle {
    if (newArea <= 0) {
      throw new Error('Area must be greater than 0');
    }
    const radius = Math.sqrt(newArea / Math.PI);
    return this.withRadius(radius);
  }

  /**
   * Returns a copy of the circle with a different [[circumference]].
   * @param newCircumference    The circumference of the new circle.
   */
  public withCircumference(newCircumference: number): Circle {
    const radius = newCircumference / (2 * Math.PI);
    return this.withRadius(radius);
  }

  /**
   * Returns a copy of the circle with a different [[diameter]].
   * @param newDiameter   The diameter of the new circle.
   */
  public withDiameter(newDiameter: number): Circle {
    const radius = newDiameter / 2;
    return this.withRadius(radius);
  }

  /**
   * Returns a copy of the circle with a different [[radius]].
   * @param newRadius   The radius of the new circle.
   */
  public withRadius(newRadius: number): Circle {
    if (newRadius <= 0) {
      throw new Error('Radius must be greater than 0');
    }
    return new Circle(newRadius, this._plane);
  }

  /**
   * Returns a copy of the circle with a different [[plane]].
   * @param newPlane  The plane of the new circle.
   */
  public withPlane(newPlane: Plane): Circle {
    return new Circle(this._radius, newPlane);
  }

  /**
   * Returns a copy of the circle with a different [[center]].
   * @param newCenter The center of the new circle.
   */
  public withCenter(newCenter: Point): Circle {
    return new Circle(this._radius, this._plane.withOrigin(newCenter));
  }

  // -----------------------
  // TRANSFORMABLE
  // -----------------------

  /***
   * Transforms the circle by a [[transform]] matrix and returns the result.
   *
   * ### Example
   * ```js
   * const circle = new Circle(10);
   * console.log(circle.radius);
   * // => 10
   *
   * // Using a transform matrix
   * const matrix = Transform.scale(2);
   * const scaled = scale.transform(matrix);
   * console.log(scaled.radius);
   * // => 20
   *
   * // Using a direct method
   * const otherScaled = circle.scale(2);
   * console.log(otherScaled.radius);
   * // => 20
   * ```
   *
   * @note If you're applying the same transformation a lot of geometry,
   * creating the [[Transform]] matrix once and calling this function is faster
   * than using the direct methods.
   *
   * @category Transform
   * @param change  The [[transform]] matrix to apply to the cirlce.
   */
  public transform(change: Transform): this {
    const scaleX = Math.sqrt(change.M00 * change.M00 + change.M01 * change.M01);
    const scaleY = Math.sqrt(change.M10 * change.M10 + change.M11 * change.M11);
    if (scaleX !== scaleY) {
      throw new Error(
        'Cant scale circle by uneven amounts in x and y direction'
      );
    }
    const radius = this._radius * scaleX;
    const plane = this._plane.transform(change);

    // @ts-ignore
    return new Circle(radius, plane);
  }
}
