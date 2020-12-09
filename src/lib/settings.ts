/* tslint:disable:readonly-keyword */
/**
 * @ignore
 */
interface SettingsInterface {
  absoluteTolerance: number;
  angleTolerance: number;
}

/**
 * Global parameters defining the acceptable tolerances for calculations involving
 * comparisons. This tolerance is needed since floating-point numbers aren't
 * totally accurate. In functions where these values are used, such as [[Vector.isParallelTo]] and [[Point.equals]],
 * there is typically a parameter allowing these values to be temporarily overridden if needed.
 */
export const shapetypesSettings: SettingsInterface = {
  absoluteTolerance: 0.000001,
  angleTolerance: Math.PI / 180, // 1 degree
};
