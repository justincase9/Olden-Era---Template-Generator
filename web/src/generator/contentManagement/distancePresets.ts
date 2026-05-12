// T013: Distance presets — port of C# DistancePresets

export interface DistanceVariation {
  min: number;
  max: number;
}

export const DistancePresets = {
  NextTo: { min: 0.05, max: 0.10 } satisfies DistanceVariation,
  Near:   { min: 0.10, max: 0.25 } satisfies DistanceVariation,
  Medium: { min: 0.25, max: 0.50 } satisfies DistanceVariation,
  Far:    { min: 0.50, max: 0.75 } satisfies DistanceVariation,
  VeryFar:{ min: 0.75, max: 0.90 } satisfies DistanceVariation,
} as const;
