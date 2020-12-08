import { approximatelyEqual, IntervalSorted, PointContainment } from '../index';

/**
 * A number range between two values ([[T0]] & [[T1]]).
 * This range is increasing when [[T0]] < [[T1]] and decreasing when [[T0]] > [[T1]].
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

  /***
   * Creates an interval that encompasses a set of values.
   *
   * ### Example
   * ```js
   * const interval = Interval.fromValues([5, 3, 4]);
   * console.log(interval.min);
   * // => 3
   * console.log(interval.max);
   * // => 5
   * ```
   *
   * @category Create
   * @param values  Values to contain within the interval.
   */
  public static fromValues(values: readonly number[]): Interval {
    const min = Math.min(...values);
    const max = Math.max(...values);
    return new Interval(min, max);
  }

  /***
   * Creates an interval that encompasses two intervals.
   *
   * @category Create
   * @param a   First interval to encompass.
   * @param b   Second interval to encompass.
   */
  public static union(a: Interval, b: Interval): Interval {
    return Interval.fromValues([a.min, a.max, b.min, b.max]);
  }

  /***
   * Finds the overlapping portion of two intervals and returns the resulting interval.
   *
   * @category Create
   * @param a     First interval to intersect
   * @param b   Second interval to intersect
   * @returns   An interval representing the overlap between these two intervals. If there is no overlap, returns undefined.
   */
  public static intersection(a: Interval, b: Interval): Interval | undefined {
    if (a.max < b.min) {
      // No overlap
      return;
    }
    if (b.max < a.min) {
      // No overlap
      return;
    }

    const min = a.min >= b.min ? a.min : b.min; // want largest min value
    const max = a.max <= b.max ? a.max : b.max; // want smallest max value

    return new Interval(min, max);
  }

  // -----------------------
  // VARS
  // -----------------------
  private readonly _T0: number;
  private readonly _T1: number;

  // -----------------------
  // CONSTRUCTOR
  // -----------------------

  /***
   * Creates an interval from two values.
   * @param T0  The start of the interval. Can either be the interval's min or max. If interval is increasing, this should be the min.
   * @param T1  The end of the interval. Can either be the interval's min or max value. If interval is increasing, this should be the max.
   */
  constructor(T0: number, T1: number) {
    this._T0 = T0;
    this._T1 = T1;
  }

  // -----------------------
  // GET & SET
  // -----------------------

  /**
   * Gets the start of the interval.
   */
  get T0(): number {
    return this._T0;
  }

  /**
   * Gets the end of the interval.
   */
  get T1(): number {
    return this._T1;
  }

  /**
   * Checks whether [[T0]] > [[T1]]. Returns true if it is.
   */
  get isDecreasing(): boolean {
    return this._T0 > this._T1;
  }

  /**
   * Checks whether [[T0]] < [[T1]]. Returns true if it is.
   */
  get isIncreasing(): boolean {
    return this._T0 < this._T1;
  }

  /**
   * Checks whether [[T0]] and [[T1]] are the same value. Returns true if they are.
   */
  get isSingleton(): boolean {
    return this._T0 === this._T1;
  }

  /**
   * Gets the smaller of [[T0]] and [[T1]].
   */
  get min(): number {
    if (this._T0 <= this._T1) {
      return this._T0;
    }
    return this._T1;
  }

  /**
   * Gets the value in the middle of [[T0]] and [[T1]].
   */
  get mid(): number {
    return (this._T0 + this._T1) / 2;
  }

  /**
   * Gets the larger of [[T0]] and [[T1]].
   */
  get max(): number {
    if (this._T0 <= this._T1) {
      return this._T1;
    }
    return this._T0;
  }

  /**
   * Gets the signed distance between [[T0]] and [[T1]].
   * Will be positive if the interval is increasing, and negative if it is decreasing.
   */
  get length(): number {
    return this._T1 - this._T0;
  }

  /**
   * Gets the absolute distance between [[T0]] and [[T1]].
   * Will be positive regardless of whether the interval is increasing or decreasing.
   */
  get lengthAbs(): number {
    if (this._T0 <= this._T1) {
      return this._T1 - this._T0;
    }
    return this._T0 - this._T1;
  }

  // -----------------------
  // PUBLIC
  // -----------------------

  /**
   * Converts the interval into an [[IntervalSorted]] and returns the result.
   */
  public asSorted(): IntervalSorted {
    return new IntervalSorted(this.T0, this.T1);
  }

  /**
   * Checks whether a value is within the interval.
   * @param value     The value to check for containment.
   * @param strict    If true, the value has to be fully inside the interval and can't equal [[min]] or [[max]].
   *                  If false, the value can equal [[min]] or [[max]].
   * @param tolerance The amount the value can be outside the interval and still be considered inside.
   */
  public contains(value: number, strict: boolean = false, tolerance: number = 0): boolean {
    if (strict) {
      // Must be fully inside
      if (this.min < value && value < this.max) {
        return true;
      }
    } else {
      // Can equal the extremes
      if (this.min - tolerance <= value && value <= this.max + tolerance) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks whether the value is within the interval and returns the result using
   * the [[PointContainment]] enum.
   * The value will be considered coincident if it equals the interval's min or max.
   * @param value       The value to check for containment.
   * @param tolerance   The distance the value can be from the interval's min or max and still considered coincident.
   */
  public containsPoint(
    value: number,
    tolerance: number = 0
  ): PointContainment {
    if(approximatelyEqual(this.min, value, tolerance)) {
      return PointContainment.coincident;
    }
    if(approximatelyEqual(this.max, value, tolerance)) {
      return PointContainment.coincident;
    }
    if (this.min <= value && value <= this.max) {
      return PointContainment.inside;
    }
    return PointContainment.outside;
  }


  /***
   * Checks whether another interval has the same [[T0]] and [[T1]] values. Returns true if it does.
   * @param otherInterval  The interval to compare against.
   */
  public equals(otherInterval: Interval): boolean {
    return this._T0 === otherInterval._T0 && this._T1 === otherInterval._T1;
  }

  /**
   * Creates a copy of this interval expanded to contain a given value.
   * The direction of the interval, whether it is increasing or decreasing, will
   * be preserved. Depending on where the value falls in relation to the interval,
   * either T0 or T1 will change to accommodate the value.
   *
   * @param toInclude   Value to contain within the new interval.
   */
  public grow(toInclude: number): Interval {
    if (this.isIncreasing) {
      if (toInclude < this._T0) {
        return new Interval(toInclude, this._T1);
      } else if (toInclude > this._T1) {
        return new Interval(this._T0, toInclude);
      }
    } else {
      if (toInclude < this._T1) {
        return new Interval(this._T0, toInclude);
      } else if (toInclude > this._T0) {
        return new Interval(toInclude, this._T1);
      }
    }
    return this;
  }

  /**
   * Remaps a value from the global number system into the normalized parameters of this interval.
   * See [[valueAt]] to understand how the parameters are calculated.
   *
   * @param value Value to remap to the parameter of the interval.
   * @returns   The value as a normalize parameter for the interval.
   */
  public remapToInterval(value: number): number {
    return (value - this._T0) / (this._T1 - this._T0);
  }

  /**
   * Creates a new interval equal to [-[[T1]], -[[T0]]].
   */
  public reverse(): Interval {
    return new Interval(-1 * this._T1, -1 * this._T0);
  }

  /**
   * Swaps [[T0]] and [[T1]] to create a new interval. The new interval is equal to [[[T1]], [[T0]]].
   */
  public swap(): Interval {
    return new Interval(this._T1, this._T0);
  }

  /***
   * Gets the interval as a string in the format: `[T0,T1]`.
   */
  public toString(): string {
    return '[' + this._T0 + ',' + this._T1 + ']';
  }


  /**
   * Remaps a value from normalized parameters of this interval into the global number system.
   * The interval's parameters range from 0 to 1.
   *
   * A parameter of 0 is equal to the the start of the interval ([[T0]]). A parameter of
   * 0.5 is the mid point of the interval. And a parameter of 1 is the end of the interval ([[T1]]).
   *
   * @param t   The parameter to remap.
   * @returns   The parameter remapped to the global number system.
   */
  public valueAt(t: number): number {
    return this._T0 * (1 - t) + this._T1 * t;
  }

  /**
   * Creates a copy of the interval with a different T0 value.
   * @param newT0
   */
  public withT0(newT0: number): Interval {
    return new Interval(newT0, this._T1);
  }

  /**
   * Creates a copy of the interval with a different T1 value.
   * @param newT1
   */
  public withT1(newT1: number): Interval {
    return new Interval(this._T0, newT1);
  }
}
