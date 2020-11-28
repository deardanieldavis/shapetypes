import { Interval } from '../index';

/**
 * An IntervalSorted represents a number range between two values ([[min]] & [[max]]). Unlike [[Interval]], it doesn't have a direction.
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
   * Returns an IntervalSorted that encompasses all the values in the array.
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
  public static fromValues(values: readonly number[]): IntervalSorted {
    const min = Math.min(...values);
    const max = Math.max(...values);
    return new IntervalSorted(min, max);
  }

  /**
   * Returns a new IntervalSorted of a given `width` and centered on `center`.
   * @param center    The mid point of the IntervalSorted
   * @param width     The width of the IntervalSorted
   */
  public static fromCenter(center: number, width: number): IntervalSorted {
    if (width < 0) {
      throw new RangeError('Width must be greater than 0');
    }
    return new IntervalSorted(center - width / 2, center + width / 2);
  }

  /**
   * Returns an IntervalSorted that encompasses two intervals.
   * @param a First interval to encompass.
   * @param b Second interval to encompass.
   */
  public static union(
    a: Interval | IntervalSorted,
    b: Interval | IntervalSorted
  ): IntervalSorted {
    return IntervalSorted.fromValues([a.min, a.max, b.min, b.max]);
  }

  /**
   * Returns an IntervalSorted that represents the overlapping portion of two intervals.
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
      // No overlap
      return;
    }

    const min = a.min >= b.min ? a.min : b.min; // want largest min value
    const max = a.max <= b.max ? a.max : b.max; // want smallest max value

    return new IntervalSorted(min, max);
  }

  // -----------------------
  // VARS
  // -----------------------
  private readonly _min: number;
  private readonly _max: number;

  // -----------------------
  // CONSTRUCTOR
  // -----------------------

  /***
   * Creates a IntervalSorted between two values.
   * @param T0  One end of the interval (the constructor works out whether T0 is the min or the max).
   * @param T1  The other end of the interval (the constructor works out whether T1 is the min or the max).
   */
  constructor(T0: number, T1: number) {
    if (T0 < T1) {
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
   * Returns true if [[min]] and [[max]] are the same value.
   */
  get isSingleton(): boolean {
    return this._min === this._max;
  }

  /**
   * Returns the distance between [[min]] and [[max]].
   */
  get length(): number {
    return this._max - this._min;
  }

  /**
   * Returns the maximum value of the interval.
   */
  get max(): number {
    return this._max;
  }

  /**
   * Returns the value at the middle of [[min]] and [[max]].
   */
  get mid(): number {
    return (this._min + this._max) / 2;
  }

  /**
   * Returns the minimum value of the interval.
   */
  get min(): number {
    return this._min;
  }

  // -----------------------
  // PUBLIC
  // -----------------------

  /**
   * Returns true if a given value is within the interval.
   * @param value   Number to check for containment
   * @param strict  If true, the value has to be fully inside the interval and can't equal [[min]] or [[max]]. If false, the value has to be inside interval but can equal [[min]] or [[max]].
   */
  public contains(
    value: number,
    strict: boolean = false,
    tolerance: number = 0
  ): boolean {
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

  /***
   * Returns true if the other interval has the same [[min]] and [[max]] values.
   * @param otherInterval  The interval to compare against.
   */
  public equals(otherInterval: IntervalSorted): boolean {
    return this._min === otherInterval._min && this._max === otherInterval._max;
  }

  /**
   * Returns a copy of this interval expanded to contain a given value.
   *
   * ### Example
   * ```js
   * const interval = new IntervalSorted(5, 10);
   * const grown = interval.grow(20);
   * console.log(grown.min);
   * // => 5
   * console.log(grown.max);
   * // => 20
   * ```
   * @param toInclude The number to contain within the new interval
   */
  public grow(toInclude: number): IntervalSorted {
    if (toInclude < this._min) {
      return new IntervalSorted(toInclude, this._max);
    } else if (toInclude > this._max) {
      return new IntervalSorted(this._min, toInclude);
    }
    return this;
  }

  /**
   * Returns a copy of this interval where the min and max have been moved apart by a set amount.
   *
   * ### Example
   * ```js
   * const interval = new IntervalSorted(5, 10);
   * const expanded = interval.inflate(2);
   * console.log(expanded.min);
   * // => 3
   * console.log(expanded.max);
   * // => 12
   * ```
   * @param amount  The distance to move the min and max values. If positive, the overall length of the interval will grow. If negative, the overall length will shrink.
   */
  public inflate(amount: number): IntervalSorted {
    if (amount * -2 > this.length) {
      // Will deflate in on itself.
      const mid = this.mid;
      return new IntervalSorted(mid, mid);
    } else {
      return new IntervalSorted(this._min - amount, this._max + amount);
    }
  }

  /**
   * Remaps a value from the global number system into the normalized parameters of this interval.
   * See [[valueAt]] to understand how the parameters are calculated.
   *
   * ### Example
   * ```js
   * let interval = new IntervalSorted(10, 20)
   * console.log(interval.remapToInterval(11))
   * // => 0.1
   * ```
   * @param value   The number to remap
   * @returns       The number remapped to the normalized parameters of this interval
   */
  public remapToInterval(value: number): number {
    return (value - this._min) / (this._max - this._min);
  }

  /**
   * Returns a new IntervalSorted equal to [-[[max]], -[[min]]]
   */
  public reverse(): IntervalSorted {
    return new IntervalSorted(-1 * this._max, -1 * this._min);
  }

  /**
   * Remaps a value from normalized parameters of this interval into the global number system.
   * The interval's parameter range from 0 to 1.
   * t=0 is the min value of the interval
   * t=0.5 is the mid point of the interval
   * t=1 os the max value of the interval
   *
   * ### Example
   * ```js
   * let interval = new IntervalSorted(10, 20)
   * console.log(interval.parameterAt(0.1))
   * // => 11
   * ```
   *
   * @param t   The parameter to remap
   * @returns   The parameter remapped to the global number system
   */
  public valueAt(t: number): number {
    return this._min * (1 - t) + this._max * t;
  }

  /**
   * Returns a copy of this interval with a different min value.
   *
   * @param newMin    New min value for the new interval
   * @note            Throws an error if the new minimum is greater than the current maximum.
   */
  public withMin(newMin: number): IntervalSorted {
    if (newMin > this._max) {
      throw new RangeError('Min must be smaller than max');
    }
    return new IntervalSorted(newMin, this._max);
  }

  /**
   * Returns a copy of this interval with a different max value.
   *
   * @param newMax    New max value for the new interval
   * @note            Throws an error if the new maximum is less than the current minimum.
   */
  public withMax(newMax: number): IntervalSorted {
    if (newMax < this._min) {
      throw new RangeError('Max must be larger than min');
    }
    return new IntervalSorted(this._min, newMax);
  }
}
