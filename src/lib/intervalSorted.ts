import {
  Interval
} from '../index';

/**
 * A special [[Interval]] where T0 is always the smallest value and T1 is always the largest.
 * As a result [[isIncreasing]] will always return `true`.
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
 * console.log(interval.isIncreasing());
 * // => True
 *
 * ```
 *
 */

export class IntervalSorted extends Interval {
  // -----------------------
  // STATIC
  // -----------------------
  /**
   * Creates an interval of a given length, centered on a value.
   *
   * @category Create
   * @param center    The middle value of the interval.
   * @param width     The length of the interval.
   */
  public static fromCenter(center: number, width: number): IntervalSorted {
    if (width < 0) {
      throw new RangeError('Width must be greater than 0');
    }
    return new IntervalSorted(center - width / 2, center + width / 2);
  }

  // -----------------------
  // CONSTRUCTOR
  // -----------------------
  /***
   * Creates a sorted interval from two values.
   * The values don't need to be provided in order as they are sorted when the interval is constructed.
   * This means that the T0 value may be reassigned to T1 if it's the largest value, and vice versa
   * @param T0  One end of the interval. This value may be assigned to T1 if it is the largest parameter.
   * @param T1  The other end of the interval. This value may be assigned to T0 if it is the smallest parameter.
   */
  constructor(T0: number, T1: number) {
    if (T0 < T1) {
      super(T0, T1);
    } else {
      super(T1, T0);
    }
  }

  // -----------------------
  // GET & SET
  // -----------------------

  /**
   * A sorted interval is always increasing so this will return false.
   */
  get isDecreasing(): boolean {
    return false;
  }

  /**
   * A sorted interval is always increasing so this will return true.
   */
  get isIncreasing(): boolean {
    return true;
  }

  /**
   * Gets [[T0]], which is always the min value in a sorted interval.
   */
  get min(): number {
    return this._T0;
  }

  /**
   * Gets [[T1]], which is always the min value in a sorted interval.
   */
  get max(): number {
    return this._T1;
  }

  // -----------------------
  // PUBLIC
  // -----------------------

  /**
   * Moves the min and max apart by a set amount. Returns the result.
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
      return new IntervalSorted(this.min - amount, this.max + amount);
    }
  }

  /**
   * Creates a copy of this interval with a different min value.
   *
   * @param newMin    New min value for the new interval
   * @note            Throws an error if the new minimum is greater than the current maximum.
   */
  public withMin(newMin: number): IntervalSorted {
    if (newMin > this.max) {
      throw new RangeError('Min must be smaller than max');
    }
    return new IntervalSorted(newMin, this.max);
  }

  /**
   * Creates a copy of this interval with a different max value.
   *
   * @param newMax    New max value for the new interval
   * @note            Throws an error if the new maximum is less than the current minimum.
   */
  public withMax(newMax: number): IntervalSorted {
    if (newMax < this.min) {
      throw new RangeError('Max must be larger than min');
    }
    return new IntervalSorted(this.min, newMax);
  }
}
