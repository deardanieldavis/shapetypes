/**
 * @ignore
 */
interface SettingsInterface {
  absoluteTolerance: number;
  angleTolerance: number;
  invertY: boolean;
}

export const shapetypesSettings: SettingsInterface = {
  absoluteTolerance: 0.000001,
  angleTolerance: Math.PI / 180, // 1 degree
  invertY: false
};
