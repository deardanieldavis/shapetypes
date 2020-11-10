import { Plane, Point, shapetypesSettings, Vector } from '../index';

/**
 * A Transform contains a 3x3 transformation matrix used to rotate, scale, and translate points and vectors.
 *
 * ### Example
 * ```js
 * import { Transform } from 'shapetypes'
 *
 * const tran = Transform.rotate(Math.PI / 2);
 * const v = new Vector(1,0);
 * const translated = v.transform(tran);
 * console.log(translated.toString());
 * // => (0,-1)
 * ```
 *
 */
export class Transform {
  // -----------------------
  // STATIC
  // -----------------------

  /**
   * Returns a new transform matrix where the diagonal elements ([[M00]], [[M11]], [[M22]]) are
   * set to `diagonal` and the other elements are set to `base`.
   *
   * @param base        Value for all elements except [[M00]], [[M11]], [[M22]]
   * @param diagonal    Value for elements [[M00]], [[M11]], [[M22]]
   */
  public static fromDiagonal(base: number = 0, diagonal = 1): Transform {
    return new Transform(
      diagonal,
      base,
      base,
      base,
      diagonal,
      base,
      base,
      base,
      diagonal
    );
  }

  /**
   * Returns a new transform matrix where the diagonal elements ([[M00]], [[M11]], [[M22]]) are
   * set to 1 and the other elements are set to 0.
   */
  public static identity(): Transform {
    return Transform._identity;
  }

  /**
   * Returns a new transform matrix that takes an object described in one coordinate system and describes it in another.
   * In other words, if the geometry is described relative to `planeFrom`, after
   * translation, it will be in the same position but described relative to `planeTo`.
   *
   * ### Example
   * ```js
   * const from = new Plane(new Point(3, 4), Vector.worldX());
   * const to = Plane.worldX();
   * const tran = Transform.changeBasis(from, to);
   * const p = new Point(1, 2);
   * const after = tran.transformPoint(p);
   * console.log(after.toString());
   * // => [4,6]
   * ```
   *
   * @param planeFrom   The coordinate system the geometry is described relative to.
   * @param planeTo     The coordinate system to describe the geometry relative to.
   */
  public static changeBasis(planeFrom: Plane, planeTo: Plane): Transform {
    if (
      planeFrom.origin.equals(Point.origin()) &&
      planeFrom.xAxis.equals(Vector.worldX())
    ) {
      // Plane from is the worldXY plane, can just use the more simple worldToPlane
      // Note: It would be easier to compare the plane directly to the world plane:
      // planeFrom.equals(Plane.worldXY());
      // but for some reason this throws an error. Possibly a circular reference?
      return Transform.worldToPlane(planeTo);
    }

    // If we get to here, it means planeFrom is different to worldXY.
    // planeTo will be described relative to worldXH, so before we can create
    // the transformation, we first need to describe planeTo relative to planeFrom
    const tranFrom = Transform.worldToPlane(planeFrom);
    const toRemapped = tranFrom.transformPoint(planeTo.origin);

    // This is how far planeTo is from planeFrom
    const delta = new Vector(-toRemapped.x, -toRemapped.y);
    const tran = Transform.translate(delta);

    const angle = planeTo.xAxis.angleSigned(planeFrom.xAxis);
    if (angle === 0) {
      return tran;
    }
    const rotate = Transform.rotate(angle);

    // Multiply to combine the translation and rotation
    return rotate.multiply(tran);
  }

  /**
   * Returns a new transform matrix that takes an object relative to one plane and moves it into the same position relative to another plane.
   *
   * ### Example
   * ```js
   * const from = new Plane(new Point(3, 4), Vector.worldX());
   * const to = Plane.worldX();
   * const tran = Transform.changeBasis(from, to);
   * const p = new Point(4, 6);
   * const after = tran.transformPoint(p);
   * console.log(after.toString());
   * // => [1,2]
   * ```
   *
   * @param planeFrom   The plane to move from
   * @param planeTo     The plane to move relative to
   */
  public static planeToPlane(planeFrom: Plane, planeTo: Plane): Transform {
    const translate = Transform.translate(
      Vector.fromPoints(planeFrom.origin, planeTo.origin)
    );
    const angle = planeFrom.xAxis.angleSigned(planeTo.xAxis);

    if (angle === 0) {
      // Planes have same orientation, object just needs to be moved
      return translate;
    }

    const rotate = Transform.rotate(angle, planeFrom.origin);
    return translate.multiply(rotate);
  }

  /**
   * Returns a new Transform matrix that rotates an object about a point
   * @param angle   Angle of rotation, in radians. If positive, rotates clockwise. If negative, rotates counter clockwise.
   * @param pivot   Pivot point for rotation. If undefined, the object will be rotated about 0,0.
   */
  public static rotate(angle: number, pivot?: Point | undefined): Transform {
    // Based on: https://www.javatpoint.com/general-pivot-point-rotation-or-rotation-about-fixed-point
    const tran = Transform.identity();
    const actualAngle = shapetypesSettings.invertY ? angle * -1 : angle;

    const cos = Math.cos(actualAngle);
    const sin = Math.sin(actualAngle);

    const M00 = cos;
    const M10 = sin;
    const M01 = -1 * sin;
    const M11 = cos;

    const M20 =
      pivot !== undefined ? pivot.x * (1 - cos) - pivot.y * sin : undefined;
    const M21 =
      pivot !== undefined ? pivot.y * (1 - cos) + pivot.x * sin : undefined;

    return tran.withValues(
      M00,
      M10,
      M20,
      M01,
      M11,
      M21,
      undefined,
      undefined,
      undefined
    );
  }

  /**
   * Returns a new Transform matrix that scales the geometry by a specified amount along the x and y axis
   * @param x   The amount to scale the object along the x axis. If less than 1, the object will shrink. If greater than 1, it will grow. If 2, it will double.
   * @param y   The amount to scale the object along the y axis. If undefined, uses value from [[x]].
   * @param center    The center of scaling. All objects will shrink towards and grow away from this point. If undefined, will use 0,0.
   */
  public static scale(x: number, y?: number, center?: Point): Transform {
    //  https://www.javatpoint.com/computer-graphics-3d-scaling
    //  https://www.cs.rit.edu/~icss571/clipTrans/2DTransBack.html
    const tran = Transform.identity();

    const M00 = x;
    const M11 = y === undefined ? x : y;
    const M20 = center !== undefined ? center.x * (1 - M00) : undefined;
    const M21 = center !== undefined ? center.y * (1 - M11) : undefined;

    return tran.withValues(
      M00,
      undefined,
      M20,
      undefined,
      M11,
      M21,
      undefined,
      undefined,
      undefined
    );
  }

  /**
   * Returns a new Transform matrix that moves an object along a vector
   * @param move        The direction to move the object
   * @param distance    The distance to move the object. If set to undefined, will use length of `move` vector.
   */
  public static translate(
    move: Vector,
    distance?: number | undefined
  ): Transform {
    const tran = Transform.identity();
    const actualMove =
      distance === undefined ? move : move.withLength(distance);

    return tran.withValues(
      undefined,
      undefined,
      actualMove.x,
      undefined,
      undefined,
      actualMove.y,
      undefined,
      undefined,
      undefined
    );
  }

  // -----------------------
  // STATIC - PRIVATE
  // -----------------------

  private static readonly _identity: Transform = Transform.fromDiagonal(0, 1);

  /**
   * Returns a new Transform matrix that translates an object from the worldXY coordinate system to another system.
   * This is the same as Transfrom.changeBasis(Plane.worldXY(), planeTo);
   * @param planeTo   The plane to describe the object relative to
   */
  private static worldToPlane(planeTo: Plane): Transform {
    const delta = new Vector(-planeTo.origin.x, -planeTo.origin.y);
    const tran = Transform.translate(delta);

    const axis = planeTo.xAxis.unitize();
    const perpendicular = axis.perpendicular();

    const rotate = new Transform(
      axis.x,
      axis.y,
      0,
      perpendicular.x,
      perpendicular.y,
      0,
      0,
      0,
      1
    );

    return rotate.multiply(tran);
  }

  // -----------------------
  // VARS
  // -----------------------

  // The entries for the matrix are in a 9 item array.
  private readonly _matrix: readonly number[];

  // -----------------------
  // CONSTRUCTOR
  // -----------------------

  /**
   * A Transform contains a 3x3 transformation matrix used to rotate, scale, and translate points and vectors.
   * The constructor specifies the 9 entries of the matrix. Conceptually, the matrix looks like:
   * M00 M10 M20
   * M01 M11 M21
   * M02 M12 M22
   *
   * @param M00
   * @param M10
   * @param M20
   * @param M01
   * @param M11
   * @param M21
   * @param M02
   * @param M12
   * @param M22
   */
  constructor(
    M00: number,
    M10: number,
    M20: number,
    M01: number,
    M11: number,
    M21: number,
    M02: number,
    M12: number,
    M22: number
  ) {
    this._matrix = [M00, M10, M20, M01, M11, M21, M02, M12, M22];
  }

  // -----------------------
  // GET
  // -----------------------

  /**
   * Returns the determinant for the matrix
   */
  get determinant(): number {
    return (
      this.M00 * (this.M11 * this.M22 - this.M21 * this.M12) -
      this.M01 * (this.M10 * this.M22 - this.M12 * this.M20) +
      this.M02 * (this.M10 * this.M21 - this.M11 * this.M20)
    );
  }

  get M00(): number {
    return this._matrix[0];
  }
  get M10(): number {
    return this._matrix[1];
  }
  get M20(): number {
    return this._matrix[2];
  }
  get M01(): number {
    return this._matrix[3];
  }
  get M11(): number {
    return this._matrix[4];
  }
  get M21(): number {
    return this._matrix[5];
  }
  get M02(): number {
    return this._matrix[6];
  }
  get M12(): number {
    return this._matrix[7];
  }
  get M22(): number {
    return this._matrix[8];
  }

  // -----------------------
  // PUBLIC
  // -----------------------

  /**
   * Returns true if every value in this matrix matches the equivalent entry in the other matrix.
   * @param otherMatrix
   */
  public equals(otherMatrix: Transform): boolean {
    return (
      this.M00 === otherMatrix.M00 &&
      this.M10 === otherMatrix.M10 &&
      this.M20 === otherMatrix.M20 &&
      this.M01 === otherMatrix.M01 &&
      this.M11 === otherMatrix.M11 &&
      this.M21 === otherMatrix.M21 &&
      this.M02 === otherMatrix.M02 &&
      this.M12 === otherMatrix.M12 &&
      this.M22 === otherMatrix.M22
    );
  }

  /**
   * Returns the inverse of this matrix. Generally, applying the inverse matrix to an object will undo the impact of the original matrix.
   * @returns   Returns an object containing two values –
   *            success: will be `true` if the matrix was successfully inverted (in some cases it can't be);
   *            result: if successful, will return the inverted matrix. Otherwise returns the original matrix.
   */
  public inverse(): { readonly success: boolean; readonly result: Transform } {
    // Based on: https://stackoverflow.com/questions/983999/simple-3x3-matrix-inverse-code-c
    const determinant = this.determinant;

    if (determinant === 0) {
      return { result: this, success: false };
    }

    const invdet = 1 / determinant;

    const M00 = (this.M11 * this.M22 - this.M21 * this.M12) * invdet;
    const M10 = (this.M20 * this.M12 - this.M10 * this.M22) * invdet;
    const M20 = (this.M10 * this.M21 - this.M20 * this.M11) * invdet;

    const M01 = (this.M21 * this.M02 - this.M01 * this.M22) * invdet;
    const M11 = (this.M00 * this.M22 - this.M20 * this.M02) * invdet;
    const M21 = (this.M20 * this.M01 - this.M00 * this.M21) * invdet;

    const M02 = (this.M01 * this.M12 - this.M11 * this.M02) * invdet;
    const M12 = (this.M10 * this.M02 - this.M00 * this.M12) * invdet;
    const M22 = (this.M00 * this.M11 - this.M10 * this.M01) * invdet;

    return {
      result: new Transform(M00, M10, M20, M01, M11, M21, M02, M12, M22),
      success: true
    };
  }

  /**
   * Returns a copy of this matrix multiplied by another matrix.
   * @param factor    Transform matrix to multiply by.
   */
  public multiply(factor: Transform): Transform {
    const M00 =
      this.M00 * factor.M00 + this.M10 * factor.M01 + this.M20 * factor.M02;
    const M10 =
      this.M00 * factor.M10 + this.M10 * factor.M11 + this.M20 * factor.M12;
    const M20 =
      this.M00 * factor.M20 + this.M10 * factor.M21 + this.M20 * factor.M22;

    const M01 =
      this.M01 * factor.M00 + this.M11 * factor.M01 + this.M21 * factor.M02;
    const M11 =
      this.M01 * factor.M10 + this.M11 * factor.M11 + this.M21 * factor.M12;
    const M21 =
      this.M01 * factor.M20 + this.M11 * factor.M21 + this.M21 * factor.M22;

    const M02 =
      this.M02 * factor.M00 + this.M12 * factor.M01 + this.M22 * factor.M02;
    const M12 =
      this.M02 * factor.M10 + this.M12 * factor.M11 + this.M22 * factor.M12;
    const M22 =
      this.M02 * factor.M20 + this.M12 * factor.M21 + this.M22 * factor.M22;

    return new Transform(M00, M10, M20, M01, M11, M21, M02, M12, M22);
  }

  /**
   * Returns a string representing the values of the matrix, in this format:
   * '[M00,M10,M20,M01,M11,M21,M02,M12,M22]'
   */
  public toString(): string {
    return (
      '[' +
      this.M00 +
      ',' +
      this.M10 +
      ',' +
      this.M20 +
      ',' +
      this.M01 +
      ',' +
      this.M11 +
      ',' +
      this.M21 +
      ',' +
      this.M02 +
      ',' +
      this.M12 +
      ',' +
      this.M22 +
      ']'
    );
  }

  /**
   * Returns a copy of the Transform matrix with certain values replaced.
   * @param M00   The new value for M00. If undefined, will use the existing value in the matrix.
   * @param M10
   * @param M20
   * @param M01
   * @param M11
   * @param M21
   * @param M02
   * @param M12
   * @param M22
   */
  public withValues(
    M00: number | undefined,
    M10: number | undefined,
    M20: number | undefined,
    M01: number | undefined,
    M11: number | undefined,
    M21: number | undefined,
    M02: number | undefined,
    M12: number | undefined,
    M22: number | undefined
  ): Transform {
    const m00 = M00 === undefined ? this.M00 : M00;
    const m10 = M10 === undefined ? this.M10 : M10;
    const m20 = M20 === undefined ? this.M20 : M20;

    const m01 = M01 === undefined ? this.M01 : M01;
    const m11 = M11 === undefined ? this.M11 : M11;
    const m21 = M21 === undefined ? this.M21 : M21;

    const m02 = M02 === undefined ? this.M02 : M02;
    const m12 = M12 === undefined ? this.M12 : M12;
    const m22 = M22 === undefined ? this.M22 : M22;

    return new Transform(m00, m10, m20, m01, m11, m21, m02, m12, m22);
  }

  // -----------------------
  // PRIVATE
  // -----------------------

  /**
   * @hidden
   * Returns a copy of the point transformed by this Transform matrix
   * @param point
   */
  public transformPoint(point: Point): Point {
    const x = this.M00 * point.x + this.M10 * point.y + this.M20;
    const y = this.M01 * point.x + this.M11 * point.y + this.M21;
    return new Point(x, y);
  }

  /**
   * @hidden
   * Returns a copy of the list of points with each being transformed by this Transform matrix
   * @param points
   */
  public transformPoints(points: readonly Point[]): readonly Point[] {
    const newPoints = new Array<Point>(points.length);
    // tslint:disable-next-line:no-let
    for (let i = 0; i < points.length; i++) {
      newPoints[i] = this.transformPoint(points[i]);
    }
    return newPoints;
  }

  /**
   * @hidden
   * Returns a copy of the vector transformed by this Transform matrix. Note that vectors aren't impacted by translation transformations.
   * @param vector
   */
  public transformVector(vector: Vector): Vector {
    const x = this.M00 * vector.x + this.M10 * vector.y;
    const y = this.M01 * vector.x + this.M11 * vector.y;
    return new Vector(x, y);
  }
}
