import { Plane, Point, Transform, Vector } from '../index';

export abstract class Geometry {
  // -----------------------
  // TRANSFORMABLE
  // -----------------------

  /**
   * Returns a copy of the geometry transformed by a [[transform]] matrix.
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
   * Note: If you're applying the same transformation a lot of geometry,
   * creating the matrix and calling this function is faster than using the direct methods.
   *
   * @param change  A [[transform]] matrix to apply to the BoundingBox
   */
  public abstract transform(change: Transform): this;

  /**
   * Returns a copy of the geometry described in another coordinate system.
   * In other words, if the geometry is described relative to `planeFrom`, after
   * changeBasis, it will be in the same position but described relative to `planeTo`.
   *
   * See: [[Transform.changeBasis]].
   *
   * @param planeFrom   The coordinate system the geometry is currently described relative to.
   * @param planeTo     The coordinate system to describe the geometry relative to.
   *
   * @category Transform
   */
  public changeBasis(planeFrom: Plane, planeTo: Plane): this {
    const tran = Transform.changeBasis(planeFrom, planeTo);
    return this.transform(tran);
  }

  /**
   * Returns a copy of the geometry moved to the same position relative to `planeTo` as it as relative to `planeFrom`.
   *
   * See: [[Transform.planeToPlane]].
   *
   * @param planeFrom   The plane to move from
   * @param planeTo     The plane to move relative to
   *
   *  @category Transform
   */
  public planeToPlane(planeFrom: Plane, planeTo: Plane): this {
    const tran = Transform.planeToPlane(planeFrom, planeTo);
    return this.transform(tran);
  }

  /**
   * Returns a rotated copy of the geometry.
   *
   * See: [[Transform.rotate]].
   *
   * @param angle   Angle to rotate the geometry in radians.
   * @param pivot   Point to pivot the geometry about.
   *
   * @category Transform
   */
  public rotate(angle: number, pivot?: Point | undefined): this {
    const tran = Transform.rotate(angle, pivot);
    return this.transform(tran);
  }

  /**
   * Returns a scaled copy of the geometry.
   *
   * See: [[Transform.scale]].
   *
   * @param x       Magnitude to scale in x direction
   * @param y       Magnitude to scale in y direction. If not specified, will use x.
   * @param center  Center of scaling. Everything will shrink or expand away from this point.
   *
   * @category Transform
   */
  public scale(x: number, y?: number, center?: Point): this {
    const tran = Transform.scale(x, y, center);
    return this.transform(tran);
  }

  /**
   * Returns a translated copy of this geometry.
   *
   * See: [[Transform.translate]].
   *
   * @param move      Direction to move the geometry.
   * @param distance  Distance to move the geometry. If not specified, will use length of `move` vector.
   *
   * @category Transform
   */
  public translate(move: Vector, distance?: number | undefined): this {
    const tran = Transform.translate(move, distance);
    return this.transform(tran);
  }
}
