// T012: ContentPresets — port of C# ContentPresets

import type { MandatoryContentItem, ContentPlacementRuleModel } from '../model.ts';
import { ContentItemBuilder } from './contentItemBuilder.ts';
import { ContentIds } from './sidMapping.ts';
import { DistancePresets } from './distancePresets.ts';
import { RulePresets } from './rulePresets.ts';

function footholdRules(castleCount: number): ContentPlacementRuleModel[] {
  const rules: ContentPlacementRuleModel[] = [
    { type: 'Crossroads', args: [], targetMin: 0.2, targetMax: 0.3, weight: 0 },
  ];
  if (castleCount > 0)
    rules.push({ type: 'MainObject', args: ['0'], targetMin: 0.2, targetMax: 0.4, weight: 0 });
  if (castleCount > 1)
    rules.push({ type: 'MainObject', args: ['1'], targetMin: 0.5, targetMax: 0.5, weight: 2 });
  return rules;
}

export const ContentPresets = {
  remoteFoothold(castleCount: number): MandatoryContentItem {
    return ContentItemBuilder.create(ContentIds.RemoteFoothold.sid)
      .withName('name_remote_foothold_1')
      .soloEncounter()
      .guarded(false)
      .addRules(footholdRules(castleCount))
      .build();
  },

  mineWood_Anchored(): MandatoryContentItem {
    return ContentItemBuilder.create(ContentIds.MineWood.sid)
      .withName('name_mine_wood')
      .mine()
      .guarded()
      .addRules([RulePresets.nearCastle(), RulePresets.crossroadsDistance(DistancePresets.Near)])
      .build();
  },

  mineOre_Anchored(): MandatoryContentItem {
    return ContentItemBuilder.create(ContentIds.MineOre.sid)
      .withName('name_mine_ore')
      .mine()
      .guarded()
      .addRules([RulePresets.nearCastle(), RulePresets.crossroadsDistance(DistancePresets.Near)])
      .build();
  },

  mineGold_NearCrossroads(): MandatoryContentItem {
    return ContentItemBuilder.create(ContentIds.MineGold.sid)
      .mine()
      .addRules([RulePresets.crossroadsDistance(DistancePresets.Near)])
      .build();
  },

  mineCrystals_NextToRoad(): MandatoryContentItem {
    return ContentItemBuilder.create(ContentIds.MineCrystals.sid)
      .withName('name_mine_crystals')
      .mine()
      .roadDistance(DistancePresets.NextTo)
      .build();
  },

  mineMercury_NextToRoad(): MandatoryContentItem {
    return ContentItemBuilder.create(ContentIds.MineMercury.sid)
      .withName('name_mine_mercury')
      .mine()
      .roadDistance(DistancePresets.NextTo)
      .build();
  },

  mineGemstones_NextToRoad(): MandatoryContentItem {
    return ContentItemBuilder.create(ContentIds.MineGemstones.sid)
      .withName('name_mine_gemstones')
      .mine()
      .roadDistance(DistancePresets.NextTo)
      .build();
  },

  alchemyLab_NearRoad(): MandatoryContentItem {
    return ContentItemBuilder.create(ContentIds.AlchemyLab.sid)
      .withName('name_alchemy_lab')
      .mine()
      .roadDistance(DistancePresets.Near)
      .build();
  },
};
