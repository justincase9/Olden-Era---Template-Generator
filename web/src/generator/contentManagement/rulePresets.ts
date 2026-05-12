// T014: Rule presets — port of C# RulePresets

import type { DistanceVariation } from './distancePresets.ts';
import type { ContentPlacementRuleModel } from '../model.ts';

export const RulePresets = {
  roadDistance(distance: DistanceVariation, weight = 1): ContentPlacementRuleModel {
    return { type: 'Road', args: [], targetMin: distance.min, targetMax: distance.max, weight };
  },

  crossroadsDistance(distance: DistanceVariation, weight = 1): ContentPlacementRuleModel {
    return { type: 'Crossroads', args: [], targetMin: distance.min, targetMax: distance.max, weight };
  },

  nearCastle(weight = 1): ContentPlacementRuleModel {
    return { type: 'MainObject', args: ['0'], targetMin: 0.1, targetMax: 0.3, weight };
  },
};
