import { Point } from './point';
import { Transform } from './transform';
import { Vector } from './vector';

export class Plane {
  // -----------------------
  // STATIC
  // -----------------------

  public static worldXY(): Plane {
    return new Plane(new Point(0, 0), Vector.worldX());
  }

  // -----------------------
  // VARS
  // -----------------------

  private _center: Point;
  private _xAxis: Vector;
  private _yAxis: Vector;

  private _cacheRemap: Transform | undefined;
  private _cacheInvert: Transform | undefined;

  // -----------------------
  // CONSTRUCTOR
  // -----------------------

  constructor(center: Point, xAxis?: Vector) {
    this._center = center;
    this._xAxis = xAxis === undefined ? Vector.worldX() : xAxis.unitize();
    this._yAxis = this._xAxis.perpendicular();
  }

  // -----------------------
  // GET & SET
  // -----------------------

  get origin(): Point {
    return this._center;
  }
  set origin(newOrigin: Point) {
    this._center = newOrigin;
  }

  get xAxis(): Vector {
    return this._xAxis;
  }

  get yAxis(): Vector {
    return this._yAxis;
  }

  // -----------------------
  // PUBLIC
  // -----------------------

  public equals(plane: Plane, tolerance: number = 0): boolean {
    if (this.origin.equals(plane.origin, tolerance)) {
      if (this.xAxis.equals(plane.xAxis, tolerance)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Converts a point in the plane space (u, v) to the world space
   *
   * @param u: Distance along the X-axis of this plane
   * @param v: Distance along the Y-axis of this plane
   */
  public pointAt(u: number, v: number): Point {
    if (this._cacheInvert === undefined) {
      this.refreshTransforms();
    }
    if (this._cacheInvert === undefined) {
      throw new Error('Cache not defined');
    }

    const result = this._cacheInvert.transform(new Point(u, v));

    return result;
  }

  /**
   * Converts a point in the world coordinates to the u,v coordinates of the plane
   *
   * Based on https://en.ppt-online.org/30481
   * @param point
   */
  public remapToPlaneSpace(point: Point): { u: number; v: number } {
    if (this._cacheRemap === undefined) {
      this.refreshTransforms();
    }
    if (this._cacheRemap === undefined) {
      throw new Error('Cache not defined');
    }

    const result = this._cacheRemap.transform(point);

    return { u: result.x, v: result.y };
  }

  public withOrigin(newOrigin: Point): Plane {
    return new Plane(newOrigin, this._xAxis);
  }

  public toString(): string {
    return this._center.toString() + this._xAxis.toString();
  }

  // -----------------------
  // PRIVATE
  // -----------------------

  /**
   * Creates the transformation matrices for moving a point in and out of the plane space.
   */
  private refreshTransforms(): void {
    this._cacheRemap = Transform.planeToPlane(Plane.worldXY(), this);
    const outcome = this._cacheRemap.inverse();
    this._cacheInvert = outcome.result;
  }
}
