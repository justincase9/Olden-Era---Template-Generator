// T017: ZoneContentManager — port of C# ZoneContentManager + BuildAllContentCountLimits

import type { MandatoryContentItem, ContentCountLimit, ContentSidLimit } from '../model.ts';
import type { GeneratorSettings, ContentItem } from '../types.ts';
import { ContentItemBuilder } from './contentItemBuilder.ts';
import { ContentPresets } from './contentPresets.ts';
import { ContentIds } from './sidMapping.ts';
import { DistancePresets } from './distancePresets.ts';
import { RulePresets } from './rulePresets.ts';

function toMandatory(item: ContentItem): MandatoryContentItem {
  return {
    name: item.name ?? undefined,
    sid: item.sid ?? undefined,
    variant: item.variant ?? undefined,
    isGuarded: item.isGuarded ?? undefined,
    isMine: item.isMine ?? undefined,
    soloEncounter: item.soloEncounter ?? undefined,
    includeLists: item.includeLists ?? undefined,
    rules: item.rules ?? undefined,
  };
}

export function buildPlayerZoneMandatoryContent(settings: GeneratorSettings): MandatoryContentItem[] {
  const content: MandatoryContentItem[] = [];

  if (settings.spawnRemoteFootholds)
    content.push(ContentPresets.remoteFoothold(settings.zoneCfg.playerZoneCastles));

  content.push(...settings.playerZoneMandatoryContent.map(toMandatory));

  content.push(
    { sid: 'watchtower' },
    ContentItemBuilder.create(ContentIds.Market.sid).guarded().roadDistance(DistancePresets.Near).build(),
    ContentItemBuilder.create(ContentIds.ManaWell.sid).roadDistance(DistancePresets.Near).build(),
    { includeLists: ['basic_content_list_building_hero_stats_and_skills_tier_2'] },
    { includeLists: ['content_list_building_uncommon_hero_banks'] },
    { includeLists: ['content_list_pickup_pandora_box_army_low_tier'], isGuarded: true },
  );

  return content;
}

export function buildLowNeutralMandatoryContent(castleCount: number, spawnFootholds: boolean): MandatoryContentItem[] {
  const content: MandatoryContentItem[] = [];

  if (spawnFootholds)
    content.push(ContentPresets.remoteFoothold(castleCount));

  content.push(
    { name: 'name_mine_by_biome_1', includeLists: ['basic_content_list_rare_mines_by_biome'], isMine: true },
    { includeLists: ['basic_content_list_rare_mines'], isMine: true },
    ContentItemBuilder.create(ContentIds.Market.sid).guarded().addRule(RulePresets.crossroadsDistance(DistancePresets.Near)).build(),
    { includeLists: ['basic_content_list_vision_buildings_tier_1'] },
    { includeLists: ['basic_content_list_building_hero_buff_tier_1'] },
    { includeLists: ['basic_content_list_building_hero_buff_tier_1'] },
    { includeLists: ['basic_content_list_building_hero_stats_and_skills_tier_1'] },
    { includeLists: ['content_list_building_random_hires_low_tier'] },
    { includeLists: ['content_list_building_random_hires_low_tier'] },
    ContentItemBuilder.create(ContentIds.PandoraBox.sid).soloEncounter().build(),
    { includeLists: ['content_list_pickup_pandora_box_army_low_tier'] },
    { includeLists: ['basic_content_list_pickup_random_items'] },
    { includeLists: ['basic_content_list_building_magic_tier_1'] },
  );

  return content;
}

export function buildMediumNeutralMandatoryContent(castleCount: number, spawnFootholds: boolean): MandatoryContentItem[] {
  const content: MandatoryContentItem[] = [];

  if (spawnFootholds)
    content.push(ContentPresets.remoteFoothold(castleCount));

  content.push(
    ContentPresets.mineCrystals_NextToRoad(),
    ContentPresets.mineMercury_NextToRoad(),
    ContentPresets.mineGemstones_NextToRoad(),
    ContentPresets.alchemyLab_NearRoad(),
    ContentItemBuilder.create(ContentIds.MineGold.sid).mine().roadDistance(DistancePresets.Near).build(),
    ContentItemBuilder.create(ContentIds.Watchtower.sid).guarded().build(),
    { includeLists: ['basic_content_list_vision_buildings_tier_1'] },
    { includeLists: ['basic_content_list_building_hero_buff_tier_1'] },
    { includeLists: ['basic_content_list_building_hero_stats_and_skills_tier_1'] },
    { includeLists: ['basic_content_list_building_hero_stats_and_skills_tier_2'] },
    { includeLists: ['basic_content_list_building_magic_tier_1'] },
    { includeLists: ['basic_content_list_building_magic_tier_2'] },
    { includeLists: ['content_list_building_random_hires_low_tier'] },
    { includeLists: ['content_list_building_random_hires_high_tier'] },
    { includeLists: ['basic_content_list_building_guarded_units_banks_only_biome_restriction'] },
    { includeLists: ['basic_content_list_building_guarded_resource_banks_tier_2'] },
    ContentItemBuilder.create(ContentIds.RandomItemEpic.sid).soloEncounter().build(),
    ContentItemBuilder.create(ContentIds.RandomItemEpic.sid).build(),
    ContentItemBuilder.create(ContentIds.PandoraBox.sid).soloEncounter().build(),
    ContentItemBuilder.create(ContentIds.PandoraBox.sid).build(),
    { includeLists: ['content_list_pickup_pandora_box_army_low_tier'] },
  );

  return content;
}

export function buildHighNeutralMandatoryContent(castleCount: number, spawnFootholds: boolean): MandatoryContentItem[] {
  const content: MandatoryContentItem[] = [];

  if (spawnFootholds)
    content.push(ContentPresets.remoteFoothold(castleCount));

  content.push(
    // Epic encounters — exclusive to high zones.
    { includeLists: ['content_list_building_utopia'] },
    { includeLists: ['content_list_building_utopia'] },
    { includeLists: ['content_list_building_epic_guarded_resource_banks'] },
    { includeLists: ['content_list_building_epic_guarded_resource_banks'] },
    // Utility — vision + buff buildings.
    { includeLists: ['basic_content_list_vision_buildings_tier_1'] },
    { includeLists: ['basic_content_list_building_hero_buff_tier_1'] },
    // Hero stats — tier 2 + tier 3.
    { includeLists: ['basic_content_list_building_hero_stats_and_skills_tier_2'] },
    { includeLists: ['basic_content_list_building_hero_stats_and_skills_tier_3'] },
    { includeLists: ['basic_content_list_building_hero_stats_and_skills_tier_3'] },
    // Magic buildings — tier 2.
    { includeLists: ['basic_content_list_building_magic_tier_2'] },
    { includeLists: ['basic_content_list_building_magic_tier_2'] },
    // Hiring — high-tier + all hires pool.
    { includeLists: ['content_list_building_random_hires_high_tier'] },
    { includeLists: ['content_list_building_random_hires_high_tier'] },
    { includeLists: ['basic_content_list_building_random_hires'] },
    // Unit banks.
    { includeLists: ['basic_content_list_building_guarded_units_banks_only_biome_restriction'] },
    { includeLists: ['basic_content_list_building_guarded_units_banks_no_biome_restriction'] },
    { includeLists: ['basic_content_list_building_guarded_units_banks_no_biome_restriction'] },
    // Guarded resource banks — tier 2 + tier 3.
    { includeLists: ['basic_content_list_building_guarded_resource_banks_tier_2'] },
    { includeLists: ['basic_content_list_building_guarded_resource_banks_tier_3'] },
    // Loot.
    { includeLists: ['basic_content_list_pickup_mythic_scroll_box'] },
    { includeLists: ['basic_content_list_pickup_mythic_scroll_box'] },
    ContentItemBuilder.create(ContentIds.RandomItemLegendary.sid).soloEncounter().build(),
    ContentItemBuilder.create(ContentIds.RandomItemLegendary.sid).build(),
    ContentItemBuilder.create(ContentIds.RandomItemEpic.sid).build(),
    ContentItemBuilder.create(ContentIds.PandoraBox.sid).soloEncounter().build(),
    ContentItemBuilder.create(ContentIds.PandoraBox.sid).build(),
    ContentItemBuilder.create(ContentIds.PandoraBox.sid).build(),
    { includeLists: ['content_list_pickup_pandora_box_army_high_tier'] },
    { includeLists: ['content_list_pickup_pandora_box_army_high_tier'] },
    // Mines — gold-heavy with full rare set.
    ContentPresets.mineGold_NearCrossroads(),
    ContentItemBuilder.create(ContentIds.MineGold.sid).mine().build(),
    ContentItemBuilder.create(ContentIds.MineGold.sid).mine().build(),
    ContentItemBuilder.create(ContentIds.MineCrystals.sid).mine().build(),
    ContentItemBuilder.create(ContentIds.MineMercury.sid).mine().build(),
    ContentItemBuilder.create(ContentIds.MineGemstones.sid).mine().build(),
    ContentItemBuilder.create(ContentIds.AlchemyLab.sid).mine().build(),
    ContentItemBuilder.create(ContentIds.AlchemyLab.sid).mine().build(),
  );

  return content;
}

export function buildAllContentCountLimits(settings: GeneratorSettings): ContentCountLimit[] {
  const sidLimits: ContentSidLimit[] = [
    { sid: 'black_tower',                       maxCount: 0 },
    { sid: ContentIds.Fountain.sid,              maxCount: 2 },
    { sid: ContentIds.Fountain2.sid,             maxCount: 2 },
    { sid: ContentIds.ManaWell.sid,              maxCount: 2 },
    { sid: ContentIds.BeerFountain.sid,          maxCount: 2 },
    { sid: ContentIds.Market.sid,                maxCount: 1 },
    { sid: ContentIds.Forge.sid,                 maxCount: 2 },
    { sid: ContentIds.Stables.sid,               maxCount: 1 },
    { sid: ContentIds.Watchtower.sid,            maxCount: 2 },
    { sid: ContentIds.WindRose.sid,              maxCount: 1 },
    { sid: ContentIds.QuixsPath.sid,             maxCount: 2 },
    { sid: ContentIds.CrystalTrail.sid,          maxCount: 3 },
    { sid: ContentIds.MysteriousStone.sid,       maxCount: 2 },
    { sid: ContentIds.University.sid,            maxCount: 2 },
    { sid: ContentIds.WiseOwl.sid,               maxCount: 4 },
    { sid: ContentIds.CelestialSphere.sid,       maxCount: 2 },
    { sid: ContentIds.PileOfBooks.sid,           maxCount: 2 },
    { sid: ContentIds.InsarasEye.sid,            maxCount: 2 },
    { sid: ContentIds.TearOfTruth.sid,           maxCount: 3 },
    { sid: ContentIds.TreeOfAbundance.sid,       maxCount: 2 },
    { sid: ContentIds.HuntsmansCamp.sid,         maxCount: 2 },
    { sid: ContentIds.ShadyDen.sid,              maxCount: 2 },
    { sid: ContentIds.RandomHire1.sid,           maxCount: 6 },
    { sid: ContentIds.RandomHire2.sid,           maxCount: 6 },
    { sid: ContentIds.RandomHire3.sid,           maxCount: 6 },
    { sid: ContentIds.RandomHire4.sid,           maxCount: 6 },
    { sid: ContentIds.RandomHire5.sid,           maxCount: 6 },
    { sid: ContentIds.RandomHire6.sid,           maxCount: 6 },
    { sid: ContentIds.RandomHire7.sid,           maxCount: 6 },
    { sid: ContentIds.Arena.sid,                 maxCount: 2 },
    { sid: ContentIds.SacrificialShrine.sid,     maxCount: 2 },
    { sid: ContentIds.Chimerologist.sid,         maxCount: 2 },
    { sid: ContentIds.Circus.sid,                maxCount: 2 },
    { sid: ContentIds.InfernalCirque.sid,        maxCount: 2 },
    { sid: ContentIds.FlatteringMirror.sid,      maxCount: 2 },
    { sid: ContentIds.FickleShrine.sid,          maxCount: 1 },
    { sid: ContentIds.PointOfBalance.sid,        maxCount: 3 },
    { sid: ContentIds.PandoraBox.sid,            maxCount: 4 },
    { sid: ContentIds.RitualPyre.sid,            maxCount: 3 },
    { sid: ContentIds.BorealCall.sid,            maxCount: 3 },
    { sid: ContentIds.JoustingRange.sid,         maxCount: 1 },
    { sid: ContentIds.UnforgottenGrave.sid,      maxCount: 1 },
    { sid: ContentIds.PetrifiedMemorial.sid,     maxCount: 1 },
    { sid: ContentIds.TheGorge.sid,              maxCount: 1 },
  ];

  // Lift limits if player mandatory content requires more.
  const mandatorySidCounts = new Map<string, number>();
  for (const item of settings.playerZoneMandatoryContent) {
    if (item.sid) {
      const lower = item.sid.toLowerCase();
      mandatorySidCounts.set(lower, (mandatorySidCounts.get(lower) ?? 0) + 1);
    }
  }
  for (const limit of sidLimits) {
    const configuredCount = mandatorySidCounts.get(limit.sid.toLowerCase()) ?? 0;
    if (configuredCount > limit.maxCount) limit.maxCount = configuredCount;
  }

  const limits: ContentCountLimit[] = [];
  limits.push({ name: 'content_limits_side',       limits: sidLimits });
  limits.push({ name: 'content_limits_side_0_0',   playerMin: 0, playerMax: 0, limits: sidLimits });

  for (let a = 1; a <= 5; a++)
    for (let b = a + 1; b <= 6; b++)
      limits.push({ name: `content_limits_side_${a}_${b}`, playerMin: a, playerMax: b, limits: sidLimits });

  return limits;
}
