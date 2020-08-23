// tslint:disable:no-let

/**
 * A number range between two values.
 */

export class Interval {
  private _t0: number;
  private _t1: number;

  /**
   * @param t0  The start of the interval (could be the interval's min or max)
   * @param t1  The end of the interval (could be the interval's min or max)
   */
  constructor(t0: number, t1: number) {
    this._t0 = t0;
    this._t1 = t1;
  }

  /**
   * Gets or sets the start value of the interval
   */
  get t0(): number {
    return this._t0;
  }
  set t0(value: number) {
    this._t0 = value;
  }

  /**
   * Gets or sets the end value of the interval
   */
  get t1(): number {
    return this._t1;
  }
  set t1(value: number) {
    this._t1 = value;
  }

  /**
   * True if [[t0]] is less than [[t1]]
   */
  get isIncreasing(): boolean {
    return this._t0 < this._t1;
  }

  /**
   * True if [[t0]] is greater than [[t1]]
   */
  get isDecreasing(): boolean {
    return this._t0 > this._t1;
  }

  /**
   * True if [[t0]] equals [[t1]]
   * In this case, [[length]] will be 0
   */
  get isSingleton(): boolean {
    return this._t0 === this._t1;
  }

  /**
   * The smaller of [[t0]] and [[t1]]
   */
  get min(): number {
    if (this._t0 <= this._t1) {
      return this._t0;
    }
    return this._t1;
  }

  /**
   * The value in the middle of [[t0]] and [[t1]]
   */
  get mid(): number {
    return (this._t0 + this._t1) / 2;
  }

  /**
   * The larger of [[t0]] and [[t1]]
   */
  get max(): number {
    if (this._t0 <= this._t1) {
      return this._t1;
    }
    return this._t0;
  }

  /**
   * The signed distance between [[t0]] and [[t1]].
   * If the interval is decreasing (if [[t1]] is less than [[t0]]), this will return a negative value
   */
  get length(): number {
    return this._t1 - this._t0;
  }

  /**
   * Switches [[t0]] and [[t1]]
   */
  public swap(): void {
    const temp = this._t0;
    this._t0 = this._t1;
    this._t1 = temp;
  }

  /**
   * Changes interval to [-[[t1]], -[[t0]]]
   */
  public reverse(): void {
    const temp = this._t0;
    this._t0 = -1 * this._t1;
    this._t1 = -1 * temp;
  }

  /**
   * Expands the interval to include the new value
   * @param toInclude
   * @returns   A new interval containing this interval and the new value
   */
  public grow(toInclude: number): Interval {
    let min = this.min;
    if (toInclude < min) {
      min = toInclude;
    }
    let max = this.max;
    if (toInclude > max) {
      max = toInclude;
    }
    return new Interval(min, max);
  }

  /**
   * Joins this and another interval to create one interval that encompasses them both.
   * @param joiner  The interval to join with
   */
  public union(joiner: Interval): Interval {
    let min = this.min;
    if (joiner.min < min) {
      min = joiner.min;
    }

    let max = this.max;
    if (joiner.max > max) {
      max = joiner.max;
    }
    return new Interval(min, max);
  }

  /**
   * Finds the overlap between this and another interval
   * @param intersector The interval to find the overlap with
   * @returns   An interval representing the overlap. If there is no overlap, returns undefined.
   */
  public intersection(intersector: Interval): Interval | undefined {
    if (this.max < intersector.min) {
      return;
    }
    if (intersector.max < this.min) {
      return;
    }

    let min = this.min;
    if (intersector.min < min) {
      min = intersector.min;
    }

    let max = this.max;
    if (intersector.max > max) {
      max = intersector.max;
    }

    return new Interval(min, max);
  }

  /**
   * True if the number is within the interval
   * @param t
   */
  public includes(t: number): boolean {
    if (this.min <= t && t <= this.max) {
      return true;
    }
    return false;
  }

  /**
   * The value at a normalized distance along the interval
   *
   * ```js
   * let interval = new Interval(10, 20)
   * console.log(interval.parameterAt(0.1))
   * // => 11
   * ```
   *
   * @param t   A number between 0 & 1
   */
  public valueAt(t: number): number {
    return this.min * (1 - t) + this.max * t;
  }
}
