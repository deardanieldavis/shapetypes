import { Plane, Point, Transform, Vector } from '../index';

export abstract class Geometry {
  // -----------------------
  // TRANSFORMABLE
  // -----------------------

  /**
   * Transforms the geometry by a [[transform]] matrix and returns the result.
   *
   * ### Example
   * ```js
   * const bb = new BoundingBox(new IntervalSorted(0, 10), new IntervalSorted(5, 25));
   * console.log(bb.area);
   * // => 200
   *
   * const scaled = bb.transform(Transform.scale(2));
   * console.log(scaled.area);
   * // => 800
   *
   * // Direct method
   * const otherScaled = bb.scale(2);
   * console.log(otherScaled.area);
   * // => 800
   * ```
   *
   * @note If you're applying the same transformation a lot of geometry,
   * creating the [[Transform]] matrix once and calling this function is faster
   * than using the direct methods.
   *
   * @param change  A [[transform]] matrix to apply to the geometry.
   */
  public abstract transform(change: Transform): this;

  /**
   * Translates the geometry from one coordinate system to another while keeping
   * the geometry in the same position. In other words, if the geometry is currently
   * described relative to `planeFrom`, after changeBasis,
   * it will be in the same position but described relative to `planeTo`.
   *
   * @see [[Transform.changeBasis]].
   *
   * @param planeFrom   The coordinate system the geometry is currently described relative to.
   * @param planeTo     The coordinate system to describe the geometry relative to.
   * @returns           The geometry in the new coordinate system.
   *
   * @category Transform
   */
  public changeBasis(planeFrom: Plane, planeTo: Plane): this {
    const tran = Transform.changeBasis(planeFrom, planeTo);
    return this.transform(tran);
  }

  /***
   * Moves the geometry from one plane to another. The resulting geometry will be
   * in the same place relative to `planeTo` as it was relative to `planeFrom`.
   *
   * @see [[Transform.planeToPlane]].
   *
   * @param planeFrom   The plane to move from.
   * @param planeTo     The plane to move to.
   *
   *  @category Transform
   */
  public planeToPlane(planeFrom: Plane, planeTo: Plane): this {
    const tran = Transform.planeToPlane(planeFrom, planeTo);
    return this.transform(tran);
  }

  /**
   * Rotates the geometry about (0,0).
   *
   * @see [[Transform.rotate]].
   *
   * @param angle   Angle to rotate the geometry (in radians). The direction is counter-clockwise.
   *
   * @category Transform
   */
  public rotate(angle: number): this;

  /**
   * Rotates the geometry about a point.
   *
   * @see [[Transform.rotate]].
   *
   * @param angle   Angle to rotate the geometry (in radians).
   *                If the environment's y-axis points upwards, the direction is counter-clockwise.
   * @param pivot   Point to pivot the geometry about.
   *
   * @category Transform
   */
  // tslint:disable-next-line:unified-signatures
  public rotate(angle: number, pivot: Point): this;
  public rotate(angle: number, pivot?: Point | undefined): this {
    const tran = Transform.rotate(angle, pivot);
    return this.transform(tran);
  }

  /***
   * Scales the geometry and returns the resized geometry. The geometry will be scaled about
   * (0,0), meaning everything will shrink or expand away from this point.
   *
   * @see [[Transform.scale]].
   *
   * @param amount  Magnitude to scale in x- and y-direction. If less than 1, the object will shrink. If greater than 1, it will grow.
   *
   * @category Transform
   */
  public scale(amount: number): this;
  // tslint:disable-next-line:unified-signatures
  /**
   * Scales the geometry and returns the resized geometry. The geometry will be scaled about
   * (0,0), meaning everything will shrink or expand away from this point.
   *
   * @see [[Transform.scale]].
   *
   * @param x       Magnitude to scale in x-direction. If less than 1, the object will shrink. If greater than 1, it will grow.
   * @param y       Magnitude to scale in y-direction. If less than 1, the object will shrink. If greater than 1, it will grow.
   *
   * @category Transform
   */
  public scale(x: number, y: number): this;
  // tslint:disable-next-line:unified-signatures
  /**
   * Scales the geometry about a point and returns the resized geometry.
   *
   * @see [[Transform.scale]].
   *
   * @param x       Magnitude to scale in x-direction. If less than 1, the object will shrink. If greater than 1, it will grow.
   * @param y       Magnitude to scale in y-direction. If less than 1, the object will shrink. If greater than 1, it will grow.
   * @param center  Center of scaling. Everything will shrink or expand away from this point.
   *
   * @category Transform
   */
  // tslint:disable-next-line:unified-signatures
  public scale(x: number, y: number, center: Point): this;
  public scale(x: number, y?: number, center?: Point): this {
    const tran = Transform.scale(x, y, center);
    return this.transform(tran);
  }

  /***
   * Moves the geometry along a vector and returns the moved geometry.
   * The translation is always linear.
   *
   * @see [[Transform.translate]].
   *
   * @param move      The direction and distance to move the geometry.
   *
   * @category Transform
   */
  public translate(move: Vector): this;
  /**
   * Moves the geometry along a vector and returns the moved geometry.
   * The translation is always linear.
   *
   * @see [[Transform.translate]].
   *
   * @param move      The direction to move the geometry.
   * @param distance  The distance to move the geometry.
   *
   * @category Transform
   */
  // tslint:disable-next-line:unified-signatures
  public translate(move: Vector, distance: number | undefined): this;
  public translate(move: Vector, distance?: number | undefined): this {
    const tran = Transform.translate(move, distance);
    return this.transform(tran);
  }
}
