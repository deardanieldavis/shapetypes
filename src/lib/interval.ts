// tslint:disable:no-let
// tslint:disable:readonly-array

import { IntervalSorted } from './intervalSorted';

/**
 * An interval represents a number range between two values ([[T0]] & [[T1]]). This range can be increasing (when [[T0]] < [[T1]]) or decreasing (when [[T0]] > [[T1]]).
 *
 * ### Example
 * ```js
 * import { Interval } from 'shapetypes'
 *
 * const interval = new Interval(5, 10);
 * console.log(interval.length);
 * // => 5
 * console.log(interval.mid);
 * // => 7.5
 * console.log(interval.contains(8));
 * // => True
 * console.log(interval.isIncreasing);
 * // => True
 *
 * const interval = new Interval(10, 5);
 * console.log(interval.length);
 * // => -5
 * console.log(interval.contains(8));
 * // => True
 * console.log(interval.isIncreasing);
 * // => False
 * ```
 *
 */

export class Interval {
  // -----------------------
  // STATIC
  // -----------------------

  /**
   * Creates a new interval that encompasses all the values in the array.
   *
   * ### Example
   * ```js
   * const interval = Interval.fromValues([5, 3, 4]);
   * console.log(interval.min);
   * // => 3
   * console.log(interval.max);
   * // => 5
   * ```
   * @param values  Numbers to contain within the interval.
   */
  public static fromValues(values: number[]): Interval {
    const min = Math.min(...values);
    const max = Math.max(...values);
    return new Interval(min, max);
  }

  /**
   * Creates a new interval by duplicating an existing interval
   * @param interval
   */
  public static fromExisting(interval: Interval | IntervalSorted): Interval {
    if(interval instanceof Interval) {
      return new Interval(interval.T0, interval.T1);
    } else {
      return new Interval(interval.min, interval.max);
    }
  }

  /**
   * Creates a new interval that encompasses these two intervals.
   * @param a First interval to encompass.
   * @param b Second interval to encompass.
   */
  public static union(a: Interval, b: Interval): Interval {
    return Interval.fromValues([a.min, a.max, b.min, b.max]);
  }

  /**
   * Creates a new interval that is the overlapping portion of two intervals.
   *
   * ### Example
   * ```js
   * const a = new Interval(5, 10);
   * const b = new Interval(-2, 7);
   * const result = Interval.fromIntersection(a, b);
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
    a: Interval,
    b: Interval
  ): Interval | undefined {
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

    return new Interval(min, max);
  }

  // -----------------------
  // VARS
  // -----------------------
  private _T0: number;
  private _T1: number;

  // -----------------------
  // CONSTRUCTOR
  // -----------------------

  /**
   * The interval is defined two values, which are the min and max of the number range.
   * @param T0  The start of the interval (either starts at the min or max value. If range is increasing, will be min).
   * @param T1  The end of the interval (either ends at the min or max value. If range is increasing, will be max).
   */
  constructor(T0: number, T1: number) {
    this._T0 = T0;
    this._T1 = T1;
  }

  // -----------------------
  // GET & SET
  // -----------------------

  /**
   * The start of the interval (either starts at the min or max value).
   * @constructor
   */
  get T0(): number {
    return this._T0;
  }
  set T0(value: number) {
    this._T0 = value;
  }

  /**
   * The end of the interval (either ends at the min or max value).
   * @constructor
   */
  get T1(): number {
    return this._T1;
  }
  set T1(value: number) {
    this._T1 = value;
  }

  /**
   * True if [[T0]] > [[T1]].
   */
  get isDecreasing(): boolean {
    return this._T0 > this._T1;
  }

  /**
   * True if [[T0]] < [[T1]].
   */
  get isIncreasing(): boolean {
    return this._T0 < this._T1;
  }

  /**
   * True if [[T0]] and [[T1]] are the same value.
   */
  get isSingleton(): boolean {
    return this._T0 === this._T1;
  }

  /**
   * The smaller of [[T0]] and [[T1]].
   */
  get min(): number {
    if(this._T0 <= this._T1) {
      return this._T0;
    }
    return this._T1;
  }

  /**
   * The value at the middle of [[T0]] and [[T1]].
   */
  get mid(): number {
    return (this._T0 + this._T1) / 2;
  }

  /**
   * The larger of [[T0]] and [[T1]].
   */
  get max(): number {
    if(this._T0 <= this._T1) {
      return this._T1;
    }
    return this._T0;
  }

  /**
   * The signed distance between [[T0]] and [[T1]]. If the interval is increasing, this will be positive. If the interval is decreasing, it will be negative.
   */
  get length(): number {
    return this._T1 - this._T0;
  }

  /**
   * The absolute distance between [[T0]] and [[T1]]. Will be positive regardless of whether the interval is increasing or decreasing.
   */
  get lengthAbs(): number {
    if(this._T0 <= this._T1) {
      return this._T1 - this._T0;
    }
    return this._T0 - this._T1;
  }

  // -----------------------
  // PUBLIC
  // -----------------------

  /**
   * Changes interval to [-[[T1]], -[[T0]]]
   */
  public reverse(): void {
    const temp = this._T0;
    this._T0 = -1 * this._T1;
    this._T1 = -1 * temp;
  }

  /**
   * Changes interval to [[[T1]], [[T0]]]
   */
  public swap(): void {
    const temp = this._T0;
    this._T0 = this._T1;
    this._T1 = temp;
  }

  /**
   * Expands the interval to include the new value.
   *
   * ### Example
   * ```js
   * const interval = new Interval(5, 10);
   * interval.grow(20);
   * console.log(interval.min);
   * // => 5
   * console.log(interval.max);
   * // => 20
   * ```
   * @param toInclude
   */
  public grow(toInclude: number): void {
    if(this.isIncreasing) {
      if (toInclude < this._T0) {
        this._T0 = toInclude;
      } else if (toInclude > this._T1) {
        this._T1 = toInclude;
      }
    } else {
      if (toInclude < this._T1) {
        this._T1 = toInclude;
      } else if (toInclude > this._T0) {
        this._T0 = toInclude;
      }
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
   * let interval = new Interval(10, 20)
   * console.log(interval.parameterAt(0.1))
   * // => 11
   * ```
   *
   * @param t   A number between 0 & 1
   */
  public valueAt(t: number): number {
    return this._T0 * (1 - t) + this._T1 * t;
  }

  /**
   * Remaps a value into the normalized distance of the interval.
   *
   * ### Example
   * ```js
   * let interval = new Interval(10, 20)
   * console.log(interval.remapToInterval(11))
   * // => 0.1
   * ```
   * @param value
   */
  public remapToInterval(value: number): number {
    const t = (value - this._T0) / (this._T1 - this._T0);
    return t;
  }
}
