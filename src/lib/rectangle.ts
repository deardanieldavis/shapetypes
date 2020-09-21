import { Interval } from './interval';
import { Plane } from './plane';
import { Polyline } from './polyline';

export class Rectangle {
  private _plane: Plane;
  private _xWidth: Interval; // x dimension of plane
  private _yWidth: Interval; // y dimension of plane

  constructor(
    plane: Plane,
    xWidth: Interval | number,
    yWidth: Interval | number
  ) {
    this._plane = plane;
    // tslint:disable-next-line:prefer-conditional-expression
    if (xWidth instanceof Interval) {
      this._xWidth = xWidth;
    } else {
      this._xWidth = new Interval(-xWidth / 2, xWidth / 2);
    }

    // tslint:disable-next-line:prefer-conditional-expression
    if (yWidth instanceof Interval) {
      this._yWidth = yWidth;
    } else {
      this._yWidth = new Interval(-yWidth / 2, yWidth / 2);
    }
  }

  public toPolyline(): Polyline {
    const p0 = this._plane.pointAt(this._xWidth.min, this._yWidth.min);
    const p1 = this._plane.pointAt(this._xWidth.max, this._yWidth.min);
    const p2 = this._plane.pointAt(this._xWidth.max, this._yWidth.max);
    const p3 = this._plane.pointAt(this._xWidth.min, this._yWidth.max);
    const p4 = p0;

    return new Polyline([p0, p1, p2, p3, p4]);
  }
}
