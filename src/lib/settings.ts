export interface SettingsInterface {
  absoluteTolerance: number;
  angleTolerance: number;
  invertY: boolean;
}

export const shapetypesSettings: SettingsInterface = {
  absoluteTolerance: 0.000001,
  angleTolerance: Math.PI / 360, // 1 degree
  invertY: true
};
