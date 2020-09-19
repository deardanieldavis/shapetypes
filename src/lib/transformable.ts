import { Plane } from './plane';
import { Point } from './point';
import { Transform } from './transform';
import { Vector } from './vector';

export abstract class Transformable {
  // TODO: Mirror
  public abstract transform(change: Transform): this;

  public rotate(angle: number, pivot?: Point | undefined): this {
    const tran = Transform.rotate(angle, pivot);
    return this.transform(tran);
  }

  public scale(x: number, y?: number, center?: Point): this {
    const tran = Transform.scale(x, y, center);
    return this.transform(tran);
  }

  public planeToPlane(planeFrom: Plane, planeTo: Plane): this {
    const tran = Transform.planeToPlane(planeFrom, planeTo);
    return this.transform(tran);
  }

  public translate(move: Vector, distance?: number | undefined): this {
    const tran = Transform.translate(move, distance);
    return this.transform(tran);
  }
}
