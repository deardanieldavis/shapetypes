// tslint:disable:no-let
// tslint:disable:readonly-array

import { Interval } from './interval';

/**
 * An IntervalSorted represents a number range between two values ([[min]] & [[max]]). Unlike Interval, it doesn't have a direction -- it is always increasing.
 *
 * ### Example
 * ```js
 * import { IntervalSorted } from 'shapetypes'
 *
 * const interval = new IntervalSorted(5, 10);
 * console.log(interval.length);
 * // => 5
 * console.log(interval.mid);
 * // => 7.5
 * console.log(interval.contains(8));
 * // => True
 *
 * ```
 *
 */

export class IntervalSorted {
  // -----------------------
  // STATIC
  // -----------------------

  /**
   * Creates a new interval that encompasses all the values in the array.
   *
   * ### Example
   * ```js
   * const interval = IntervalSorted.fromValues([5, 3, 4]);
   * console.log(interval.min);
   * // => 3
   * console.log(interval.max);
   * // => 5
   * ```
   * @param values  Numbers to contain within the interval.
   */
  public static fromValues(values: number[]): IntervalSorted {
    const min = Math.min(...values);
    const max = Math.max(...values);
    return new IntervalSorted(min, max);
  }

  /**
   * Creates a new IntervalSorted by duplicating an existing interval
   * @param interval
   */
  public static fromExisting(interval: Interval | IntervalSorted): IntervalSorted {
    if(interval instanceof Interval) {
      return new IntervalSorted(interval.T0, interval.T1);
    } else {
      return new IntervalSorted(interval.min, interval.max);
    }
  }

  /**
   * Creates a new interval that encompasses these two intervals.
   * @param a First interval to encompass.
   * @param b Second interval to encompass.
   */
  public static union(a: Interval | IntervalSorted, b: Interval | IntervalSorted): IntervalSorted {
    return IntervalSorted.fromValues([a.min, a.max, b.min, b.max]);
  }

  /**
   * Creates a new interval that is the overlapping portion of two intervals.
   *
   * ### Example
   * ```js
   * const a = new IntervalSorted(5, 10);
   * const b = new IntervalSorted(-2, 7);
   * const result = IntervalSorted.fromIntersection(a, b);
   * console.log(result.min);
   * // => 5
   * console.log(result.max);
   * // => 7
   * ```
   * @param a First interval to intersect
   * @param b Second interval to intersect
   * @returns   An interval representing the overlap between intervals. If there is no overlap, returns undefined.
   */
  public static intersection(
    a: Interval | IntervalSorted,
    b: Interval | IntervalSorted
  ): IntervalSorted | undefined {
    if (a.max < b.min) {
      // No overlap
      return;
    }
    if (b.max < a.min) {
      return;
    }

    let min = a.min;
    if (b.min > a.min) {
      min = b.min;
    }

    let max = a.max;
    if (b.max < a.max) {
      max = b.max;
    }

    return new IntervalSorted(min, max);
  }

  // -----------------------
  // VARS
  // -----------------------
  private _min: number;
  private _max: number;

  // -----------------------
  // CONSTRUCTOR
  // -----------------------

  /**
   * The interval is defined two values, which are the min and max of the number range.
   * @param T0  One end of the interval (could be the min or max value).
   * @param T1  Another end of the interval (could be the min or max value).
   */
  constructor(T0: number, T1: number) {
    if(T0 < T1) {
      this._min = T0;
      this._max = T1;
    } else {
      this._min = T1;
      this._max = T0;
    }
  }

  // -----------------------
  // GET & SET
  // -----------------------

  /**
   * True if [[min]] and [[max]] are the same value.
   */
  get isSingleton(): boolean {
    return this._min === this._max;
  }

  /**
   * The minimum value of the interval.
   */
  get min(): number {
    return this._min;
  }
  set min(value: number) {
    if (value > this._max) {
      throw new Error("Min must be smaller than max");
    }
    this._min = value;
  }

  /**
   * The value at the middle of [[T0]] and [[T1]].
   */
  get mid(): number {
    return (this._min + this._max) / 2;
  }

  /**
   * The maximum value of the interval.
   */
  get max(): number {
    return this._max;
  }
  set max(value: number) {
    if (value < this._min) {
      throw new Error("Max must be larger than min");
    }
    this._max = value;
  }

  /**
   * The distance between [[min]] and [[max]].
   */
  get length(): number {
    return this._max - this._min;
  }


  // -----------------------
  // PUBLIC
  // -----------------------

  /**
   * Changes interval to [-[[max]], -[[min]]]
   */
  public reverse(): void {
    const temp = this._min;
    this._min = -1 * this._max;
    this._max = -1 * temp;
  }

  /**
   * Expands the interval to include the new value.
   *
   * ### Example
   * ```js
   * const interval = new IntervalSorted(5, 10);
   * interval.grow(20);
   * console.log(interval.min);
   * // => 5
   * console.log(interval.max);
   * // => 20
   * ```
   * @param toInclude
   */
  public grow(toInclude: number): void {
    if (toInclude < this._min) {
      this._min = toInclude;
    } else if (toInclude > this._max) {
      this._max = toInclude;
    }
  }

  /**
   * Expands the min and max values of the interval by set amount.
   *
   * ### Example
   * ```js
   * const interval = new IntervalSorted(5, 10);
   * interval.inflate(2);
   * console.log(interval.min);
   * // => 3
   * console.log(interval.max);
   * // => 12
   * ```
   * @param amount
   */
  public inflate(amount: number): void {
    if(amount * -2 > this.length) {
      // Will deflate in on itself.
      const mid = this.mid;
      this._min = mid;
      this._max = mid;
    } else {
      this._min = this._min - amount;
      this._max = this._max + amount;
    }
  }

  /**
   * True if the value is within the interval.
   * @param value   Number to check for containment
   * @param strict  If true, the value has to be fully inside the interval and can't equal [[min]] or [[max]]. If false, the value has to be inside interval but can equal [[min]] or [[max]].
   */
  public contains(value: number, strict: boolean = false): boolean {
    if (strict) {
      // Must be fully inside
      if (this.min < value && value < this.max) {
        return true;
      }
    } else {
      // Can equal the extremes
      if (this.min <= value && value <= this.max) {
        return true;
      }
    }

    return false;
  }

  /**
   * The value at a normalized distance along the interval
   *
   * ### Example
   * ```js
   * let interval = new IntervalSorted(10, 20)
   * console.log(interval.parameterAt(0.1))
   * // => 11
   * ```
   *
   * @param t   A number between 0 & 1
   */
  public valueAt(t: number): number {
    return this._min * (1 - t) + this._max * t;
  }

  /**
   * Remaps a value into the normalized distance of the interval.
   *
   * ### Example
   * ```js
   * let interval = new IntervalSorted(10, 20)
   * console.log(interval.remapToInterval(11))
   * // => 0.1
   * ```
   * @param value
   */
  public remapToInterval(value: number): number {
    const t = (value - this._min) / (this._max - this._min);
    return t;
  }
}
