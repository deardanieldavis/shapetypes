// tslint:disable:no-let
// tslint:disable:readonly-array
import { Plane } from './plane';
import { Point } from './point';
import { shapetypesSettings } from './settings';
import { isPointArray } from './utilities';
import { Vector } from './vector';

export class Transform {
  // -----------------------
  // STATIC
  // -----------------------

  /**
   * Creates a new transformation matrix from a set of specified values
   * @param matrix: The 9 values that represent the transformation matrix
   */
  public static fromValues(matrix: number[]): Transform {
    if (matrix.length !== 9) {
      throw new Error(
        'Unable to create matrix: passed array must have 9 values to represent a 3x3 grid.'
      );
    }

    const tran = new Transform(0);
    tran.matrix = matrix;
    return tran;
  }

  /**
   * Creates a translation transformation that moves an object from one place to another
   * @param move: The direction to move the object
   * @param distance: The distance to move the object. If set to undefined, will use length of [move] vector.
   */
  public static translate(
    move: Vector,
    distance?: number | undefined
  ): Transform {
    const tran = new Transform(1);
    const actualMove = move.duplicate();

    if (distance !== undefined) {
      actualMove.length = distance;
    }

    tran.M20 = actualMove.x;
    tran.M21 = actualMove.y;
    return tran;
  }

  /**
   * Creates a rotational transformation that rotates an object about a point
   * Based on: https://www.javatpoint.com/general-pivot-point-rotation-or-rotation-about-fixed-point
   * @param angle: Angle of rotation, in radians
   * @param pivot: Pivot point for rotation. If undefined, will use 0,0
   */
  public static rotate(angle: number, pivot?: Point | undefined): Transform {
    const tran = new Transform(1);
    let actualAngle = angle;

    if (shapetypesSettings.invertY) {
      actualAngle = actualAngle * -1;
    }

    const cos = Math.cos(actualAngle);
    const sin = Math.sin(actualAngle);

    tran.M00 = cos;
    tran.M10 = sin;
    tran.M01 = -1 * sin;
    tran.M11 = cos;

    if (pivot !== undefined) {
      tran.M20 = pivot.x * (1 - cos) - pivot.y * sin;
      tran.M21 = pivot.y * (1 - cos) + pivot.x * sin;
    }

    return tran;
  }

  /**
   * Creates a transformation that moves an object from one planar coordinate system to another.
   * @param planeFrom: The plane the object is specified in.
   * @param planeTo: The plane you want to describe the object relative to
   */
  public static planeToPlane(planeFrom: Plane, planeTo: Plane): Transform {
    if (
      planeFrom.origin.x === 0 &&
      planeFrom.origin.y === 0 &&
      planeFrom.xAxis.x === 1 &&
      planeFrom.xAxis.y === 0
    ) {
      // Plane from is the worldXY plane, can just use the more simple worldToPlane
      return Transform.worldToPlane(planeTo);
    }

    // Otherwise, planeFrom is different to worldXY so we need to describe planeTo relative to planeFrom
    const tranFrom = Transform.worldToPlane(planeFrom);
    const toRemapped = tranFrom.transform(planeTo.origin);

    const delta = new Vector(-toRemapped.x, -toRemapped.y);

    const tran = Transform.translate(delta);

    const angle = Vector.vectorAngleSigned(planeTo.xAxis, planeFrom.xAxis);
    const rotate = Transform.rotate(angle);

    const combined = Transform.multiply(rotate, tran);
    return combined;
  }

  public static multiply(a: Transform, b: Transform): Transform {
    const tran = new Transform(0);
    tran.M00 = a.M00 * b.M00 + a.M10 * b.M01 + a.M20 * b.M02;
    tran.M10 = a.M00 * b.M10 + a.M10 * b.M11 + a.M20 * b.M12;
    tran.M20 = a.M00 * b.M20 + a.M10 * b.M21 + a.M20 * b.M22;

    tran.M01 = a.M01 * b.M00 + a.M11 * b.M01 + a.M21 * b.M02;
    tran.M11 = a.M01 * b.M10 + a.M11 * b.M11 + a.M21 * b.M12;
    tran.M21 = a.M01 * b.M20 + a.M11 * b.M21 + a.M21 * b.M22;

    tran.M02 = a.M02 * b.M00 + a.M12 * b.M01 + a.M22 * b.M02;
    tran.M12 = a.M02 * b.M10 + a.M12 * b.M11 + a.M22 * b.M12;
    tran.M22 = a.M02 * b.M20 + a.M12 * b.M21 + a.M22 * b.M22;

    return tran;
  }

  /**
   * Changes an object from the worldXY plane to this plane
   * @param planeTo: The plane to orientate the object to
   */
  private static worldToPlane(planeTo: Plane): Transform {
    const delta = new Vector(-planeTo.origin.x, -planeTo.origin.y);
    const tran = Transform.translate(delta);

    const axis = planeTo.xAxis.duplicate();
    axis.unitize();
    const perpendicular = axis.perpendicular();

    const rotate = Transform.fromValues([
      axis.x,
      axis.y,
      0,
      perpendicular.x,
      perpendicular.y,
      0,
      0,
      0,
      1
    ]);
    // Note: there is an alternative way to do to this, which is shorter but slower:
    // let angle = Vector.vectorAngleSigned(planeTo.xAxis, planeFrom.xAxis);
    // let rotate = Transform.rotate(angle);

    return Transform.multiply(rotate, tran);
  }

  // -----------------------
  // GET AND SET
  // -----------------------

  private _matrix = new Array<number>(9);

  // -----------------------
  // CONSTRUCTOR
  // -----------------------

  /**
   * Creates a new matrix set to 0, except for the diagonal squares.
   * M00 & M11 are set to [diagonalValue]. M22 is set to 1.
   * @param diagonalValue
   */
  constructor(diagonalValue: number) {
    this._matrix = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.M00 = diagonalValue;
    this.M11 = diagonalValue;
    this.M22 = 1;
  }

  // -----------------------
  // GET AND SET
  // -----------------------

  set matrix(value: number[]) {
    this._matrix = value;
  }

  get M00(): number {
    return this._matrix[0];
  }
  set M00(value: number) {
    this._matrix[0] = value;
  }

  get M10(): number {
    return this._matrix[1];
  }
  set M10(value: number) {
    this._matrix[1] = value;
  }

  get M20(): number {
    return this._matrix[2];
  }
  set M20(value: number) {
    this._matrix[2] = value;
  }

  get M01(): number {
    return this._matrix[3];
  }
  set M01(value: number) {
    this._matrix[3] = value;
  }

  get M11(): number {
    return this._matrix[4];
  }
  set M11(value: number) {
    this._matrix[4] = value;
  }

  get M21(): number {
    return this._matrix[5];
  }
  set M21(value: number) {
    this._matrix[5] = value;
  }

  get M02(): number {
    return this._matrix[6];
  }
  set M02(value: number) {
    this._matrix[6] = value;
  }

  get M12(): number {
    return this._matrix[7];
  }
  set M12(value: number) {
    this._matrix[7] = value;
  }

  get M22(): number {
    return this._matrix[8];
  }
  set M22(value: number) {
    this._matrix[8] = value;
  }

  // -----------------------
  // PUBLIC
  // -----------------------

  /**
   * Based on: https://stackoverflow.com/questions/983999/simple-3x3-matrix-inverse-code-c
   */
  public inverse(): { success: boolean; result: Transform } {
    const determinant =
      this.M00 * (this.M11 * this.M22 - this.M21 * this.M12) -
      this.M01 * (this.M10 * this.M22 - this.M12 * this.M20) +
      this.M02 * (this.M10 * this.M21 - this.M11 * this.M20);

    if (determinant === 0) {
      return { success: false, result: this };
    }

    const invdet = 1 / determinant;

    const result: number[] = [
      (this.M11 * this.M22 - this.M21 * this.M12) * invdet,
      (this.M20 * this.M12 - this.M10 * this.M22) * invdet,
      (this.M10 * this.M21 - this.M20 * this.M11) * invdet,
      (this.M21 * this.M02 - this.M01 * this.M22) * invdet,
      (this.M00 * this.M22 - this.M20 * this.M02) * invdet,
      (this.M20 * this.M01 - this.M00 * this.M21) * invdet,
      (this.M01 * this.M12 - this.M11 * this.M02) * invdet,
      (this.M10 * this.M02 - this.M00 * this.M12) * invdet,
      (this.M00 * this.M11 - this.M10 * this.M01) * invdet
    ];

    return { success: true, result: Transform.fromValues(result) };
  }

  /**
   * Transforms either a single point or a list of points
   * @param point: A single point or a list of points
   * @return: A copy of the point or points transformed
   */
  public transform(point: Point): Point;
  public transform(point: Point[]): Point[];
  public transform(point: Point | Point[]): Point | Point[] {
    if (isPointArray(point)) {
      const newPoints = new Array<Point>(point.length);
      for (let i = 0; i < point.length; i++) {
        newPoints[i] = this.transformPoint(point[i]);
      }
      return newPoints;
    } else {
      return this.transformPoint(point);
    }
  }

  // -----------------------
  // PRIVATE
  // -----------------------

  /**
   * Transforms a single point
   * @param point
   */
  private transformPoint(point: Point): Point {
    const x = this.M00 * point.x + this.M10 * point.y + this.M20;
    const y = this.M01 * point.x + this.M11 * point.y + this.M21;
    return new Point(x, y);
  }
}
