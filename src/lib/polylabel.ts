// tslint:disable:readonly-array
// tslint:disable:no-let
// FROM: https://github.com/mapbox/polylabel

import { Polygon as ClipPolygon } from 'polygon-clipping';
import Queue from 'tinyqueue';

// if (Queue.default) { Queue = Queue.default; } // temporary webpack fix
// module.exports = polylabel;
// module.exports.default = polylabel;

export function polylabel(
  polygon: ClipPolygon,
  precision: number = 1.0
): { x: number; y: number; distance: number } {
  // find the bounding box of the outer ring
  let minX: number | undefined;
  let minY: number | undefined;
  let maxX: number | undefined;
  let maxY: number | undefined;
  for (const p of polygon[0]) {
    if (minX === undefined || p[0] < minX) {
      minX = p[0];
    }
    if (minY === undefined || p[1] < minY) {
      minY = p[1];
    }
    if (maxX === undefined || p[0] > maxX) {
      maxX = p[0];
    }
    if (maxY === undefined || p[1] > maxY) {
      maxY = p[1];
    }
  }

  if (
    minX === undefined ||
    minY === undefined ||
    maxX === undefined ||
    maxY === undefined
  ) {
    throw new Error("Couldn't define min/max");
  }

  const width = maxX - minX;
  const height = maxY - minY;
  const cellSize = Math.min(width, height);
  let h = cellSize / 2;

  if (cellSize === 0) {
    return { x: minX, y: minY, distance: 0 };
  }

  // a priority queue of cells in order of their "potential" (max distance to polygon)
  const cellQueue = new Queue(undefined, compareMax);

  // cover polygon with initial cells
  for (let x = minX; x < maxX; x += cellSize) {
    for (let y = minY; y < maxY; y += cellSize) {
      cellQueue.push(new Cell(x + h, y + h, h, polygon));
    }
  }

  // take centroid as the first best guess
  let bestCell = getCentroidCell(polygon);

  // special case for rectangular polygons
  const bboxCell = new Cell(minX + width / 2, minY + height / 2, 0, polygon);
  if (bboxCell.d > bestCell.d) {
    bestCell = bboxCell;
  }

  while (cellQueue.length) {
    // pick the most promising cell from the queue
    const cell = cellQueue.pop();

    if (cell === undefined) {
      break;
    }

    // update the best cell if we found a better one
    if (cell.d > bestCell.d) {
      bestCell = cell;
    }

    // do not drill down further if there's no chance of a better solution
    if (cell.max - bestCell.d <= precision) {
      continue;
    }

    // split the cell into four cells
    h = cell.h / 2;
    cellQueue.push(new Cell(cell.x - h, cell.y - h, h, polygon));
    cellQueue.push(new Cell(cell.x + h, cell.y - h, h, polygon));
    cellQueue.push(new Cell(cell.x - h, cell.y + h, h, polygon));
    cellQueue.push(new Cell(cell.x + h, cell.y + h, h, polygon));
  }

  return { x: bestCell.x, y: bestCell.y, distance: bestCell.d };
}

class Cell {
  public readonly x: number;
  public readonly y: number;
  public readonly h: number;
  public readonly d: number;
  public readonly max: number;

  constructor(x: number, y: number, h: number, polygon: ClipPolygon) {
    this.x = x; // cell center x
    this.y = y; // cell center y
    this.h = h; // half the cell size
    this.d = pointToPolygonDist(x, y, polygon); // distance from cell center to polygon
    this.max = this.d + this.h * Math.SQRT2; // max distance to polygon within a cell
  }
}

function compareMax(a: Cell, b: Cell): number {
  return b.max - a.max;
}

// signed distance from point to polygon outline (negative if point is outside)
function pointToPolygonDist(
  x: number,
  y: number,
  polygon: ClipPolygon
): number {
  let inside = false;
  let minDistSq = Infinity;

  for (const ring of polygon) {
    for (let i = 0, len = ring.length, j = len - 1; i < len; j = i++) {
      const a = ring[i];
      const b = ring[j];

      if (
        a[1] > y !== b[1] > y &&
        x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]
      ) {
        inside = !inside;
      }

      minDistSq = Math.min(minDistSq, getSegDistSq(x, y, a, b));
    }
  }

  return minDistSq === 0 ? 0 : (inside ? 1 : -1) * Math.sqrt(minDistSq);
}

// get polygon centroid
function getCentroidCell(polygon: ClipPolygon): Cell {
  let area = 0;
  let x = 0;
  let y = 0;
  const points = polygon[0];

  for (let i = 0, len = points.length, j = len - 1; i < len; j = i++) {
    const a = points[i];
    const b = points[j];
    const f = a[0] * b[1] - b[0] * a[1];
    x += (a[0] + b[0]) * f;
    y += (a[1] + b[1]) * f;
    area += f * 3;
  }
  if (area === 0) {
    return new Cell(points[0][0], points[0][1], 0, polygon);
  }
  return new Cell(x / area, y / area, 0, polygon);
}

// get squared distance from a point to a segment
function getSegDistSq(
  px: number,
  py: number,
  a: number[],
  b: number[]
): number {
  let x = a[0];
  let y = a[1];
  let dx = b[0] - x;
  let dy = b[1] - y;

  if (dx !== 0 || dy !== 0) {
    const t = ((px - x) * dx + (py - y) * dy) / (dx * dx + dy * dy);

    if (t > 1) {
      x = b[0];
      y = b[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }

  dx = px - x;
  dy = py - y;

  return dx * dx + dy * dy;
}
