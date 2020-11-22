/* tslint:disable:readonly-keyword */
/**
 * @ignore
 */
interface SettingsInterface {
  absoluteTolerance: number;
  angleTolerance: number;
}

export const shapetypesSettings: SettingsInterface = {
  absoluteTolerance: 0.000001,
  angleTolerance: Math.PI / 180, // 1 degree
};
