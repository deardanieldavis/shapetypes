/**
 * The intersection module contains a set of helper functions to calculate where
 * various geometry intersect.
 *
 * For the most part, if you want to get the point of
 * intersection between a line and any other type of geometry, you can call this
 * directly ([[Line.intersection]]) without using any of the functions in this module.
 * The same is true for rays ([[Ray.intersection]]) and polylines ([[Polyline.intersection]]).
 *
 * This module is helpful if you need more detailed information about particular
 * intersections. For example, the [[Intersection.lineLine]] function calculates
 * where two lines intersect and returns where the intersection occurs relative to
 * each line.
 *
 * @moduledefinition Intersection
 */
export * from './box';
export * from './circle';
export * from './horizontalRay';
export * from './line';
export * from './meta';
export * from './ray';
