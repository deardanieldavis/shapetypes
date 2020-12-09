![npm](https://img.shields.io/npm/v/shapetypes)

# Shapetypes

A 2d geometry library based loosely on the [Open NURBS API](https://github.com/mcneel/opennurbs/). 

# Features
- Essential geometry types – point, line, vector, rectangle, polyline, and polygon
- Basic transformations – rotate, translate, and plane to plane
- Intersections, booleans, and containment
- Lightweight and written in Typescript
- [Lots of documentation](https://deardanieldavis.github.io/shapetypes/)

# Getting started
```npm install shapetypes```

```ts
import {Point, Plane, Rectangle} from 'shapetypes';
let rectangle = new Rectangle(Plane.worldXY, 10, 20);
console.log(rectangle.area);
//>200
console.log(rectangle.contains(new Point(5, 5)));
//>true

```


# Alternatives
- [Rhino3dm](https://www.npmjs.com/package/rhino3dm): A web assembly port of Rhino Common. This is a much 
more extensive library that supports 3d geometry.
- [VerbNurbs](https://www.npmjs.com/package/verb-nurbs): A cross-platform Nurbs library.
- [Javascript Topology Suite](https://github.com/bjornharrtell/jsts): A library of geometric operations primarily for GIS data.
- [Turf JS](https://turfjs.org): Another library of geometric operations primarily for GIS data.

# Credits
Package based on [Typescript Starter](https://github.com/bitjson/typescript-starter).
This project is not affiliated with Rhino3d or McNeel in any way.
