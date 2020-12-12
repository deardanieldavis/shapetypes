![npm](https://img.shields.io/npm/v/shapetypes)

# Shapetypes

A 2d geometry library written in Typescript. 

# Features
- Essential geometry types – [point](https://deardanieldavis.github.io/shapetypes/classes/point.html), [line](https://deardanieldavis.github.io/shapetypes/classes/line.html), [vector](https://deardanieldavis.github.io/shapetypes/classes/vector.html), [polyline](https://deardanieldavis.github.io/shapetypes/classes/polyline.html), and [polygon](https://deardanieldavis.github.io/shapetypes/classes/polygon.html).
- Basic transformations – [rotate](https://deardanieldavis.github.io/shapetypes/classes/transform.html#rotate), [translate](https://deardanieldavis.github.io/shapetypes/classes/transform.html#translate), and [change basis](https://deardanieldavis.github.io/shapetypes/classes/transform.html#changebasis).
- Geometric relationships – [intersections](https://deardanieldavis.github.io/shapetypes/modules/intersection.html), [booleans](https://deardanieldavis.github.io/shapetypes/classes/polygon.html#union), and [containment](https://deardanieldavis.github.io/shapetypes/classes/polygon.html#contains).
- An API that loosely follows [Open NURBS](https://github.com/mcneel/opennurbs/) and [Rhino Common](https://developer.rhino3d.com/api/RhinoCommon/html/R_Project_RhinoCommon.htm).
- [Lots of documentation](https://deardanieldavis.github.io/shapetypes/).

## Installation
You can install shapetypes with npm:

```npm install shapetypes```

## A quick example
```ts
import { Point, Polyline, Polygon, Rectangle, Vector } from 'shapetypes';

// Create a triangle
const triangle = new Polyline([new Point(0, 0), new Point(1, 1), new Point(2, 0)], true);
console.log(triangle.area);
// => 1

// Test to see if a point is inside
const testPoint = new Point(1, 0.5);
console.log(triangle.contains(testPoint));
// => True

// Move the triangle and see if the point is inside
const shifted = triangle.translate(new Vector(3, 4));
console.log(shifted.contains(testPoint));
// => False

// Create a rectangular polygon
const rectangle = new Rectangle(Plane.worldXY(), 10, 20);
const polygon = new Polygon(rectangle.toPolyline());
console.log(polygon.area);
// => 200

// Cut the triangle from the polygon
const result = polygon.difference(triangle);
console.log(result[0].area);
// => 199
```
[Try on Runkit](https://runkit.com/deardanieldavis/shapetypes-main) (note: Runkit is in Javascript rather than Typescript).

## If you're coming from Rhino
If you've used Rhino, the Shapetypes syntax should feel familiar. There are a couple of important differences though:
1. There are no 3d functions – this library is just for 2d geometry.
2. All geometric objects are immutable, meaning they can't be changed after they're created.
  Rather than modifying an object, you can create a copy with different parameters.
   This can often be done through helper methods that have 'with' as a prefix, such as [Point.withX](https://deardanieldavis.github.io/shapetypes/classes/point.html#withx)
   (see example below).
   
```ts
import {Point} from 'shapetypes';

// Create a new point at 3,4
const p = new Point(3,4);

// Access the x parameter
console.log(p.x);
// => 3

// Try to change the x parameter 
p.x = 5;
// => This will throw an error since objects can't be modified after they're created.

// Instead, create a copy with a different x value.
const newPoint = p.withX(5);
console.log(newPoint.x);
// => 5
```


## Alternatives
- [Rhino3dm](https://www.npmjs.com/package/rhino3dm): A web assembly port of Rhino Common. This is a much
more extensive library that supports 3d geometry.
- [VerbNurbs](https://www.npmjs.com/package/verb-nurbs): A cross-platform Nurbs library that compiles to javascript.
- [Javascript Topology Suite](https://github.com/bjornharrtell/jsts): A javascript library of geometric operations primarily for GIS data.
- [Turf JS](https://turfjs.org): Another javascript library of geometric operations primarily for GIS data.

# Credits
Package based on [Typescript Starter](https://github.com/bitjson/typescript-starter).
Booleans via the [Polygon-clipping library](https://github.com/mfogel/polygon-clipping).
This project is not affiliated with Rhino3d or McNeel in any way.

# License
[MIT License](https://github.com/deardanieldavis/shapetypes/blob/master/LICENSE)
