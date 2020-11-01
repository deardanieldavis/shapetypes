/**
 * And THIS, my friends, is module 2.  Hard to believe, but this module might
 * be even more useless than module 1.  I'll leave that judgement to you.
 *
 * @moduledefinition Module 2
 */
export * from './box';
export * from './circle';
export * from './horizontalRay';
export * from './line';
export * from './meta';
export * from './polyline';
export * from './ray';

// TODO

/*
function rayPolyline(theRay: Ray, polyline: Polyline): readonly number[] {
  const intersections = new Array<number>();
  for (const edge of polyline.segments) {
    const result = Intersection.rayLine(theRay, edge);
    if (result.intersects) {
      intersections.push(result.rayU);
    }
  }
  return intersections;
}*/
