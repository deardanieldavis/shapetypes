/**
 * Test
 */


export default class Interval {
  private _t0: number;
  private _t1: number;

  /**
   * Represents an interval from a min to a max
   * @param t0: one end of the interval (can be min or max)
   * @param t1: the other end of the interval (can be min or max)
   */
  constructor(t0: number, t1: number) {
    this._t0 = t0;
    this._t1 = t1;
  }

  get T0(): number {
    return this._t0;
  }

  get T1(): number {
    return this._t1;
  }

  get isIncreasing(): boolean {
    return this._t0 < this._t1;
  }

  get isDecreasing(): boolean {
    return this._t0 > this._t1;
  }

  get isSingleton(): boolean {
    return this._t0 === this._t1;
  }

  get min(): number {
    if (this._t0 <= this._t1) {
      return this._t0;
    }
    return this._t1;
  }

  get mid(): number {
    return (this._t0 + this._t1) / 2;
  }

  /**
   * Testing 123
   * @returns: The larger of T0 & T1
   */
  get max(): number {
    if (this._t0 <= this._t1) {
      return this._t1;
    }
    return this._t0;
  }

  get length(): number {
    return this._t1 - this._t0;
  }

  public swap(): void {
    const temp = this._t0;
    this._t0 = this._t1;
    this._t1 = temp;
  }
}
