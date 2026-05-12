// T018: Template Generator — port of C# TemplateGenerator
// Uses d3-delaunay for Delaunay triangulation instead of C# Bowyer-Watson

import { Delaunay } from 'd3-delaunay';
import type {
  RmgTemplate, GameRules, Bonus, WinConditions, ValueOverride, GlobalBans,
  Variant, Orientation, Border, NoiseEntry, Zone, Connection, Road, RoadEndpoint,
  MainObject, BiomeSelector, TypedSelector, ZoneLayout, ElevationMode,
  GuardedEncounterResourceFractions, AmbientPickupDistribution,
  MandatoryContentGroup, ContentCountLimit,
} from './model.ts';
import {
  MapTopology, NeutralZoneQuality, BonusPresetType,
  type GeneratorSettings, type BonusEntry,
} from './types.ts';
import {
  buildPlayerZoneMandatoryContent,
  buildLowNeutralMandatoryContent,
  buildMediumNeutralMandatoryContent,
  buildHighNeutralMandatoryContent,
  buildAllContentCountLimits,
} from './contentManagement/zoneContentManager.ts';

// ── Constants ────────────────────────────────────────────────────────────────

const CONNECTIONS_PER_ZONE = 1;
const DEFAULT_GUARD_RANDOMIZATION = 0.05;
const SPAWN_LAYOUT   = 'zone_layout_spawns';
const SIDE_LAYOUT    = 'zone_layout_sides';
const TREASURE_LAYOUT = 'zone_layout_treasure_zone';
const CENTER_LAYOUT  = 'zone_layout_center';

export const ZONE_LETTERS: string[] = [
  'A','B','C','D','E','F','G','H',
  'I','J','K','L','M','N','O','P',
  'Q','R','S','T','U','V','W','X',
  'Y','Z','AA','AB','AC','AD','AE','AF',
];

// ── Internal types ────────────────────────────────────────────────────────────

interface NeutralZonePlan { letter: string; quality: NeutralZoneQuality; castleCount: number; }
interface NeutralZoneProfile {
  layout: string;
  guardMultiplier: number;
  guardedContentPool: string[];
  unguardedContentPool: string[];
  resourcesContentPool: string[];
  guardedContentValue: number;
  guardedContentValuePerArea: number;
  unguardedContentValue: number;
  unguardedContentValuePerArea: number;
  resourcesValue: number;
  resourcesValuePerArea: number;
  primaryCityGuardValue: number;
  extraCityGuardValue: number;
  primaryBuildingsConstructionSid: string;
  extraBuildingsConstructionSid: string;
}
interface GenerationTuning {
  contentScale: number;
  resourceDensityMultiplier: number;
  structureDensityMultiplier: number;
  neutralStackStrengthMultiplier: number;
  borderGuardStrengthMultiplier: number;
  guardRandomization: number;
}

// ── Pool constants ────────────────────────────────────────────────────────────

const T2_GUARDED   = ['classic_template_pool_random_t2_item','classic_template_pool_random_t2_pandora','classic_template_pool_random_t2_hire','classic_template_pool_random_t2_unit_bank','classic_template_pool_random_t2_res_bank','classic_template_pool_random_t2_stat','classic_template_pool_random_t2_magic'];
const T2_UNGUARDED = ['classic_template_pool_random_unguarded_t2_item','classic_template_pool_random_unguarded_t2_pandora','classic_template_pool_random_unguarded_t2_hire','classic_template_pool_random_unguarded_t2_unit_bank','classic_template_pool_random_unguarded_t2_res_bank','classic_template_pool_random_unguarded_t2_stat','classic_template_pool_random_unguarded_t2_magic'];
const T3_GUARDED   = ['classic_template_pool_random_t3_item','classic_template_pool_random_t3_pandora','classic_template_pool_random_t3_hire','classic_template_pool_random_t3_unit_bank','classic_template_pool_random_t3_res_bank','classic_template_pool_random_t3_stat','classic_template_pool_random_t3_magic'];
const T3_UNGUARDED = ['classic_template_pool_random_unguarded_t3_item','classic_template_pool_random_unguarded_t3_pandora','classic_template_pool_random_unguarded_t3_hire','classic_template_pool_random_unguarded_t3_unit_bank','classic_template_pool_random_unguarded_t3_res_bank','classic_template_pool_random_unguarded_t3_stat','classic_template_pool_random_unguarded_t3_magic'];
const T4_GUARDED   = ['classic_template_pool_random_t4_item','classic_template_pool_random_t4_pandora','classic_template_pool_random_t4_hire','classic_template_pool_random_t4_unit_bank','classic_template_pool_random_t4_res_bank','classic_template_pool_random_t4_stat','classic_template_pool_random_t4_magic'];
const T4_UNGUARDED = ['classic_template_pool_random_unguarded_t4_item','classic_template_pool_random_unguarded_t4_pandora','classic_template_pool_random_unguarded_t4_hire','classic_template_pool_random_unguarded_t4_unit_bank','classic_template_pool_random_unguarded_t4_res_bank','classic_template_pool_random_unguarded_t4_stat','classic_template_pool_random_unguarded_t4_magic'];
const T5_GUARDED   = ['classic_template_pool_random_t5_item','classic_template_pool_random_t5_pandora','classic_template_pool_random_t5_hire','classic_template_pool_random_t5_unit_bank','classic_template_pool_random_t5_res_bank','classic_template_pool_random_t5_stat','classic_template_pool_random_t5_magic'];
const T5_UNGUARDED = ['classic_template_pool_random_unguarded_t5_item','classic_template_pool_random_unguarded_t5_pandora','classic_template_pool_random_unguarded_t5_hire','classic_template_pool_random_unguarded_t5_unit_bank','classic_template_pool_random_unguarded_t5_res_bank','classic_template_pool_random_unguarded_t5_stat','classic_template_pool_random_unguarded_t5_magic'];
const RES_POOR   = ['content_pool_general_resources_start_zone_poor'];
const RES_MEDIUM = ['content_pool_general_resources_start_zone_medium'];
const RES_RICH   = ['content_pool_general_resources_start_zone_rich'];

// ── Scale helpers ─────────────────────────────────────────────────────────────

function scaleValue(value: number, multiplier: number): number {
  return Math.max(0, Math.floor(value * multiplier));
}
function scaleStructureValue(v: number, t: GenerationTuning): number { return scaleValue(v, t.structureDensityMultiplier); }
function scaleResourceValue(v: number, t: GenerationTuning): number  { return scaleValue(v, t.resourceDensityMultiplier); }
function scaleNeutralGuardValue(v: number, t: GenerationTuning): number { return scaleValue(v, t.neutralStackStrengthMultiplier); }
function scaleBorderGuardValue(v: number, t: GenerationTuning): number  { return scaleValue(v, t.borderGuardStrengthMultiplier); }
function scaleGuardMultiplier(v: number, t: GenerationTuning): number {
  return Math.round(v * t.neutralStackStrengthMultiplier * 1000) / 1000;
}

function computeContentScale(mapSize: number, totalZones: number): number {
  const referenceArea = 160 * 160 / 4;
  const zoneArea = (mapSize * mapSize) / Math.max(1, totalZones);
  return Math.max(0.5, Math.min(2.5, Math.sqrt(zoneArea / referenceArea)));
}

function percentToModifier(percent: number): number {
  return Math.round(Math.max(0.25, Math.min(2.0, percent / 100)) * 100) / 100;
}

function normalizeZoneSize(v: number): number {
  if (!isFinite(v)) return 1.0;
  return Math.round(Math.max(0.1, Math.min(2.0, v)) * 100) / 100;
}

function effectiveGuardRandomization(settings: GeneratorSettings): number {
  if (!settings.zoneCfg.advanced.enabled) return DEFAULT_GUARD_RANDOMIZATION;
  const v = settings.zoneCfg.advanced.guardRandomization;
  if (!isFinite(v)) return DEFAULT_GUARD_RANDOMIZATION;
  return Math.round(Math.max(0, Math.min(0.5, v)) * 1000) / 1000;
}

// ── Road endpoints ────────────────────────────────────────────────────────────

function mainObjectEndpoint(index: string): RoadEndpoint { return { type: 'MainObject', args: [index] }; }
function connectionEndpoint(name: string): RoadEndpoint  { return { type: 'Connection', args: [name] }; }
function mandatoryContentEndpoint(name: string): RoadEndpoint { return { type: 'MandatoryContent', args: [name] }; }
function plainRoad(from: RoadEndpoint, to: RoadEndpoint): Road { return { from, to }; }

function buildOuterZoneRoads(ringConns: string[], castleCount: number, includeFoothold: boolean, generateRoads: boolean): Road[] {
  if (!generateRoads || castleCount === 0) return [];
  const roads: Road[] = [];
  for (let i = 1; i < castleCount; i++)
    roads.push(plainRoad(mainObjectEndpoint('0'), mainObjectEndpoint(String(i))));
  if (includeFoothold)
    roads.push(plainRoad(mainObjectEndpoint('0'), mandatoryContentEndpoint('name_remote_foothold_1')));
  for (const rc of ringConns)
    roads.push(plainRoad(mainObjectEndpoint('0'), connectionEndpoint(rc)));
  return roads;
}

function buildConnectorZoneRoads(connectionNames: string[], generateRoads: boolean): Road[] {
  if (!generateRoads) return [];
  const distinct = [...new Set(connectionNames.filter(n => n))];
  if (distinct.length === 0) return [];
  if (distinct.length === 1) {
    return [plainRoad(connectionEndpoint(distinct[0]), connectionEndpoint(distinct[0]))];
  }
  const anchor = distinct[0];
  return distinct.slice(1).map(n => plainRoad(connectionEndpoint(anchor), connectionEndpoint(n)));
}

// ── Zone profiles ─────────────────────────────────────────────────────────────

function getNeutralZoneProfile(quality: NeutralZoneQuality): NeutralZoneProfile {
  switch (quality) {
    case NeutralZoneQuality.Low:
      return { layout: SIDE_LAYOUT, guardMultiplier: 1.1, guardedContentPool: T2_GUARDED, unguardedContentPool: T2_UNGUARDED, resourcesContentPool: RES_POOR, guardedContentValue: 120000, guardedContentValuePerArea: 1000, unguardedContentValue: 25000, unguardedContentValuePerArea: 200, resourcesValue: 30000, resourcesValuePerArea: 240, primaryCityGuardValue: 4000, extraCityGuardValue: 2000, primaryBuildingsConstructionSid: 'poor_buildings_construction', extraBuildingsConstructionSid: 'poor_buildings_construction' };
    case NeutralZoneQuality.High:
      return { layout: TREASURE_LAYOUT, guardMultiplier: 1.8, guardedContentPool: [...T4_GUARDED, ...T5_GUARDED], unguardedContentPool: [...T4_UNGUARDED, ...T5_UNGUARDED], resourcesContentPool: RES_RICH, guardedContentValue: 480000, guardedContentValuePerArea: 3000, unguardedContentValue: 80000, unguardedContentValuePerArea: 620, resourcesValue: 90000, resourcesValuePerArea: 580, primaryCityGuardValue: 16000, extraCityGuardValue: 8000, primaryBuildingsConstructionSid: 'rich_buildings_construction', extraBuildingsConstructionSid: 'rich_buildings_construction' };
    default: // Medium
      return { layout: TREASURE_LAYOUT, guardMultiplier: 1.4, guardedContentPool: T3_GUARDED, unguardedContentPool: T3_UNGUARDED, resourcesContentPool: RES_MEDIUM, guardedContentValue: 240000, guardedContentValuePerArea: 2000, unguardedContentValue: 38000, unguardedContentValuePerArea: 300, resourcesValue: 55000, resourcesValuePerArea: 420, primaryCityGuardValue: 8000, extraCityGuardValue: 4000, primaryBuildingsConstructionSid: 'rich_buildings_construction', extraBuildingsConstructionSid: 'poor_buildings_construction' };
  }
}

// ── Content limit helpers ─────────────────────────────────────────────────────

function buildSideContentLimits(): string[] {
  const limits: string[] = [];
  for (let a = 1; a <= 5; a++)
    for (let b = a + 1; b <= 6; b++)
      limits.push(`content_limits_side_${a}_${b}`);
  return limits;
}

// ── Zone builders ─────────────────────────────────────────────────────────────

function buildSpawnZone(
  letter: string, player: string, ringConns: string[],
  castleCount: number, matchCastleFactions: boolean, zoneSize: number,
  spawnFootholds: boolean, generateRoads: boolean, tuning: GenerationTuning,
): Zone {
  const mainObjects: MainObject[] = [
    {
      type: 'Spawn',
      spawn: player,
      removeGuardIfHasOwner: true,
      guardChance: 1,
      guardValue: scaleNeutralGuardValue(5000, tuning),
      guardWeeklyIncrement: 0.10,
      buildingsConstructionSid: 'default_buildings_construction',
      placement: 'Uniform',
      placementArgs: ['true', '0.7', '0'],
    },
  ];
  for (let i = 1; i < castleCount; i++) {
    mainObjects.push({
      type: 'City',
      faction: matchCastleFactions
        ? { type: 'Match', args: ['0'] }
        : { type: 'Random', args: [] },
      guardChance: 1,
      guardValue: scaleNeutralGuardValue(2500, tuning),
      guardWeeklyIncrement: 0.10,
      buildingsConstructionSid: 'poor_buildings_construction',
      placement: 'Uniform',
      placementArgs: ['false', '-0.8', '3'],
    });
  }
  return {
    name: `Spawn-${letter}`,
    size: normalizeZoneSize(zoneSize),
    layout: SPAWN_LAYOUT,
    guardCutoffValue: 2000,
    guardRandomization: tuning.guardRandomization,
    guardMultiplier: scaleGuardMultiplier(1.0, tuning),
    guardWeeklyIncrement: 0.20,
    guardReactionDistribution: [60, 20, 10, 10, 2, 0],
    diplomacyModifier: -0.5,
    guardedContentPool: [...T2_GUARDED],
    unguardedContentPool: [...T2_UNGUARDED],
    resourcesContentPool: [...RES_POOR],
    mandatoryContent: [`mandatory_content_side_${letter}`],
    contentCountLimits: buildSideContentLimits(),
    guardedContentValue: scaleStructureValue(200000 * tuning.contentScale, tuning),
    guardedContentValuePerArea: scaleStructureValue(2000 * Math.sqrt(tuning.contentScale), tuning),
    unguardedContentValue: scaleStructureValue(50000 * tuning.contentScale, tuning),
    unguardedContentValuePerArea: scaleStructureValue(400 * Math.sqrt(tuning.contentScale), tuning),
    resourcesValue: scaleResourceValue(80000 * tuning.contentScale, tuning),
    resourcesValuePerArea: scaleResourceValue(600 * Math.sqrt(tuning.contentScale), tuning),
    mainObjects,
    zoneBiome: { type: 'MatchMainObject', args: ['0'] },
    contentBiome: { type: 'MatchMainObject', args: ['0'] },
    metaObjectsBiome: { type: 'MatchMainObject', args: ['0'] },
    crossroadsPosition: 0,
    roads: castleCount > 0
      ? buildOuterZoneRoads(ringConns, castleCount, spawnFootholds, generateRoads)
      : buildConnectorZoneRoads(ringConns, generateRoads),
  };
}

function buildNeutralZone(
  plan: NeutralZonePlan, ringConns: string[], zoneSize: number,
  spawnFootholds: boolean, generateRoads: boolean, tuning: GenerationTuning,
  isHoldCity = false,
): Zone {
  const { letter, quality } = plan;
  const castleCount = isHoldCity ? Math.max(1, plan.castleCount) : plan.castleCount;
  const profile = getNeutralZoneProfile(quality);
  const biomeMatchMainObject: BiomeSelector = { type: 'MatchMainObject', args: ['0'] };
  const biomeMatchZone: BiomeSelector = { type: 'MatchZone', args: [] };

  const mainObjects: MainObject[] = [];
  if (castleCount > 0) {
    mainObjects.push({
      type: 'City',
      guardChance: 1.0,
      guardValue: scaleNeutralGuardValue(isHoldCity ? Math.max(profile.primaryCityGuardValue, 20000) : profile.primaryCityGuardValue, tuning),
      guardWeeklyIncrement: 0.10,
      buildingsConstructionSid: isHoldCity ? 'ultra_rich_buildings_construction' : profile.primaryBuildingsConstructionSid,
      faction: { type: 'FromList', args: [] },
      placement: isHoldCity ? 'Center' : 'Uniform',
      placementArgs: isHoldCity ? [] : ['true', '0.8', '2'],
      holdCityWinCon: isHoldCity ? true : undefined,
    });
  }
  for (let i = 1; i < castleCount; i++) {
    mainObjects.push({
      type: 'City',
      guardChance: 1.0,
      guardValue: scaleNeutralGuardValue(profile.extraCityGuardValue, tuning),
      guardWeeklyIncrement: 0.10,
      buildingsConstructionSid: profile.extraBuildingsConstructionSid,
      faction: { type: 'FromList', args: [] },
      placement: 'Uniform',
      placementArgs: ['false', '-0.8', '3'],
    });
  }

  return {
    name: `Neutral-${letter}`,
    size: normalizeZoneSize(zoneSize),
    layout: profile.layout,
    guardCutoffValue: 2000,
    guardRandomization: tuning.guardRandomization,
    guardMultiplier: scaleGuardMultiplier(profile.guardMultiplier, tuning),
    guardWeeklyIncrement: 0.20,
    guardReactionDistribution: quality === NeutralZoneQuality.High ? [0, 10, 10, 20, 10, 0] : [0, 10, 10, 10, 10, 0],
    diplomacyModifier: -0.5,
    guardedContentPool: [...profile.guardedContentPool],
    unguardedContentPool: [...profile.unguardedContentPool],
    resourcesContentPool: [...profile.resourcesContentPool],
    mandatoryContent: [`mandatory_content_neutral_${letter}`],
    contentCountLimits: buildSideContentLimits(),
    guardedContentValue: scaleStructureValue(profile.guardedContentValue * tuning.contentScale, tuning),
    guardedContentValuePerArea: scaleStructureValue(profile.guardedContentValuePerArea * Math.sqrt(tuning.contentScale), tuning),
    unguardedContentValue: scaleStructureValue(profile.unguardedContentValue * tuning.contentScale, tuning),
    unguardedContentValuePerArea: scaleStructureValue(profile.unguardedContentValuePerArea * Math.sqrt(tuning.contentScale), tuning),
    resourcesValue: scaleResourceValue(profile.resourcesValue * tuning.contentScale, tuning),
    resourcesValuePerArea: scaleResourceValue(profile.resourcesValuePerArea * Math.sqrt(tuning.contentScale), tuning),
    mainObjects,
    zoneBiome: castleCount > 0 ? biomeMatchMainObject : biomeMatchZone,
    contentBiome: castleCount > 0 ? biomeMatchMainObject : biomeMatchZone,
    metaObjectsBiome: castleCount > 0 ? biomeMatchMainObject : biomeMatchZone,
    crossroadsPosition: 0,
    roads: castleCount > 0
      ? buildOuterZoneRoads(ringConns, castleCount, spawnFootholds, generateRoads)
      : buildConnectorZoneRoads(ringConns, generateRoads),
  };
}

function buildHubZone(spokeConns: string[], tuning: GenerationTuning, isHoldCity = false, size = 1.0, castleCount = 0, generateRoads = true): Zone {
  const effectiveCastleCount = isHoldCity ? Math.max(1, castleCount) : castleCount;
  const mainObjects: MainObject[] = [];
  for (let i = 0; i < effectiveCastleCount; i++) {
    const isHoldCastleSlot = isHoldCity && i === 0;
    mainObjects.push({
      type: 'City',
      guardChance: isHoldCastleSlot ? 1.0 : 0.5,
      guardValue: scaleNeutralGuardValue(isHoldCastleSlot ? Math.max(25000, 20000) : 16000, tuning),
      guardWeeklyIncrement: 0.10,
      buildingsConstructionSid: isHoldCastleSlot ? 'ultra_rich_buildings_construction' : 'rich_buildings_construction',
      faction: { type: 'FromList', args: [] },
      placement: isHoldCastleSlot ? 'Center' : 'Uniform',
      placementArgs: isHoldCastleSlot ? [] : ['true', '0.8', '2'],
      holdCityWinCon: isHoldCastleSlot ? true : undefined,
    });
  }

  const biomeMatchMainObject: BiomeSelector = { type: 'MatchMainObject', args: ['0'] };
  const biomeMatchZone: BiomeSelector = { type: 'MatchZone', args: [] };

  return {
    name: 'Hub',
    size: normalizeZoneSize(size),
    layout: CENTER_LAYOUT,
    guardCutoffValue: 2000,
    guardRandomization: 0.05,
    guardMultiplier: scaleGuardMultiplier(1.5, tuning),
    guardWeeklyIncrement: 0.20,
    guardReactionDistribution: [0, 10, 10, 20, 10, 0],
    diplomacyModifier: -0.5,
    guardedContentPool: [...T3_GUARDED],
    unguardedContentPool: [...T3_UNGUARDED],
    resourcesContentPool: [...RES_MEDIUM],
    mandatoryContent: [],
    contentCountLimits: buildSideContentLimits(),
    guardedContentValue: scaleStructureValue(300000 * tuning.contentScale, tuning),
    guardedContentValuePerArea: scaleStructureValue(2400 * Math.sqrt(tuning.contentScale), tuning),
    unguardedContentValue: scaleStructureValue(50000 * tuning.contentScale, tuning),
    unguardedContentValuePerArea: scaleStructureValue(600 * Math.sqrt(tuning.contentScale), tuning),
    resourcesValue: scaleResourceValue(80000 * tuning.contentScale, tuning),
    resourcesValuePerArea: scaleResourceValue(600 * Math.sqrt(tuning.contentScale), tuning),
    mainObjects,
    zoneBiome: effectiveCastleCount > 0 ? biomeMatchMainObject : biomeMatchZone,
    contentBiome: effectiveCastleCount > 0 ? biomeMatchMainObject : biomeMatchZone,
    metaObjectsBiome: effectiveCastleCount > 0 ? biomeMatchMainObject : biomeMatchZone,
    crossroadsPosition: 0,
    roads: effectiveCastleCount > 0
      ? buildOuterZoneRoads(spokeConns, effectiveCastleCount, false, generateRoads)
      : buildConnectorZoneRoads(spokeConns, generateRoads),
  };
}

// ── Connection builders ───────────────────────────────────────────────────────

function buildRingConnections(playerLetters: string[], orderedLetters: string[], tuning: GenerationTuning, isolatePlayers = false): Connection[] {
  const count = orderedLetters.length;
  if (count < 2) return [];
  const conns: Connection[] = [];
  for (let i = 0; i < count; i++) {
    const next = (i + 1) % count;
    const fromLetter = orderedLetters[i];
    const toLetter = orderedLetters[next];
    if (isolatePlayers && playerLetters.includes(fromLetter) && playerLetters.includes(toLetter)) continue;
    const fromZone = playerLetters.includes(fromLetter) ? `Spawn-${fromLetter}` : `Neutral-${fromLetter}`;
    const toZone   = playerLetters.includes(toLetter)   ? `Spawn-${toLetter}`   : `Neutral-${toLetter}`;
    conns.push({
      name: `Ring-${fromLetter}-${toLetter}`,
      from: fromZone, to: toZone,
      connectionType: 'Direct',
      guardZone: fromZone, guardEscape: false, simTurnSquad: true,
      guardValue: scaleBorderGuardValue(30000, tuning),
      guardWeeklyIncrement: 0.15,
      guardMatchGroup: `ring_guard_${fromLetter}_${toLetter}`,
    });
  }
  return conns;
}

function buildNonAdjacentDerangement(count: number): number[] {
  if (count <= 1) return [0];
  // Try up to 100 times to find a valid derangement avoiding adjacent indices
  for (let attempt = 0; attempt < 100; attempt++) {
    const candidates = shuffleArray(Array.from({ length: count }, (_, i) => i));
    const dest = new Array<number>(count).fill(-1);
    let valid = true;
    for (let i = 0; i < count; i++) {
      let found = -1;
      for (let j = 0; j < candidates.length; j++) {
        const c = candidates[j];
        if (c !== i && c !== (i + 1) % count && c !== (i - 1 + count) % count) { found = j; break; }
      }
      if (found < 0) {
        for (let j = 0; j < candidates.length; j++) {
          if (candidates[j] !== i) { found = j; break; }
        }
      }
      if (found < 0) { valid = false; break; }
      dest[i] = candidates[found];
      candidates.splice(found, 1);
    }
    if (valid) return dest;
  }
  const shift = Math.max(1, Math.floor(count / 2));
  return Array.from({ length: count }, (_, i) => (i + shift) % count);
}

function buildRandomPortalConnections(playerLetters: string[], orderedLetters: string[], tuning: GenerationTuning, maxCount = 32): Connection[] {
  const count = orderedLetters.length;
  if (count < 2) return [];
  const dest = buildNonAdjacentDerangement(count);
  const indices = shuffleArray(Array.from({ length: count }, (_, i) => i));
  const limit = Math.min(count, maxCount);
  const conns: Connection[] = [];
  for (let i = 0; i < limit; i++) {
    const idx = indices[i];
    const fromLetter = orderedLetters[idx];
    const toLetter   = orderedLetters[dest[idx]];
    const fromZone = playerLetters.includes(fromLetter) ? `Spawn-${fromLetter}` : `Neutral-${fromLetter}`;
    const toZone   = playerLetters.includes(toLetter)   ? `Spawn-${toLetter}`   : `Neutral-${toLetter}`;
    conns.push({
      name: `Portal-${fromLetter}-${toLetter}`,
      from: fromZone, to: toZone,
      connectionType: 'Portal',
      portalPlacementRulesFrom: [{ type: 'Crossroads', args: [], targetMin: 0.10, targetMax: 0.25, weight: 2 }],
      portalPlacementRulesTo:   [{ type: 'Crossroads', args: [], targetMin: 0.10, targetMax: 0.25, weight: 2 }],
      road: true,
      guardEscape: false,
      guardValue: scaleBorderGuardValue(25000, tuning),
      guardWeeklyIncrement: 0.15,
    });
  }
  return conns;
}

// ── Variant factory ────────────────────────────────────────────────────────────

function makeVariant(playerLetters: string[], firstLetter: string, totalZones: number, zones: Zone[], connections: Connection[]): Variant {
  const zeroZone = playerLetters.includes(firstLetter) ? `Spawn-${firstLetter}` : `Neutral-${firstLetter}`;
  return {
    orientation: {
      zeroAngleZone: zeroZone,
      baseAngleMin: 45, baseAngleMax: 45,
      randomAngleAmplitude: 360,
      randomAngleStep: 360 / totalZones,
    },
    border: {
      cornerRadius: 0.0,
      obstaclesWidth: 3,
      obstaclesNoise: [{ amp: 1, freq: 12 }],
      waterWidth: 0,
      waterNoise: [{ amp: 1, freq: 12 }],
      waterType: 'water grass',
    },
    zones,
    connections,
  };
}

// ── Ordered-letters helpers ───────────────────────────────────────────────────

function canHonorNeutralSeparation(settings: GeneratorSettings, neutralZoneCount: number): boolean {
  const min = settings.minNeutralZonesBetweenPlayers;
  if (min <= 0) return true;
  if (settings.randomPortals) return false;
  switch (settings.topology) {
    case MapTopology.Default: return neutralZoneCount >= settings.playerCount * min;
    case MapTopology.Chain:   return neutralZoneCount >= (settings.playerCount - 1) * min;
    case MapTopology.HubAndSpoke: return min <= 1;
    case MapTopology.SharedWeb:   return min <= 1 && neutralZoneCount >= 1;
    default: return false;
  }
}

function buildEvenGapCapacities(gapCount: number, itemCount: number, minimumPerGap: number): number[] {
  const capacities = new Array<number>(Math.max(0, gapCount)).fill(0);
  if (gapCount <= 0 || itemCount <= 0) return capacities;
  const minimum = Math.max(0, minimumPerGap);
  let remaining = itemCount;
  if (minimum > 0 && itemCount >= minimum * gapCount) {
    for (let i = 0; i < gapCount; i++) capacities[i] = minimum;
    remaining -= minimum * gapCount;
  }
  // Distribute remainder evenly
  const base = Math.floor(remaining / gapCount);
  const extra = remaining % gapCount;
  for (let i = 0; i < gapCount; i++) capacities[i] += base + (i < extra ? 1 : 0);
  return capacities;
}

function orderNeutralsWithinGap(gap: NeutralZonePlan[]): NeutralZonePlan[] {
  // High quality in the middle, low quality at the edges
  const sorted = [...gap].sort((a, b) => b.quality.localeCompare(a.quality));
  if (sorted.length <= 1) return sorted;
  const result: NeutralZonePlan[] = new Array(sorted.length);
  let lo = 0, hi = sorted.length - 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i % 2 === 0) result[hi--] = sorted[i];
    else result[lo++] = sorted[i];
  }
  return result;
}

function assignNeutralZonesToGaps(neutralZones: NeutralZonePlan[], gapCapacities: number[], preferInteriorGaps: boolean): NeutralZonePlan[][] {
  const gaps: NeutralZonePlan[][] = gapCapacities.map(() => []);
  // Sort neutrals: High > Medium > Low, castles first
  const sorted = [...neutralZones].sort((a, b) => {
    const qOrd = { [NeutralZoneQuality.High]: 2, [NeutralZoneQuality.Medium]: 1, [NeutralZoneQuality.Low]: 0 };
    const qDiff = qOrd[b.quality] - qOrd[a.quality];
    if (qDiff !== 0) return qDiff;
    return b.castleCount - a.castleCount;
  });
  let idx = 0;
  // Fill gaps in order (prefer interior if flag set — fill middle first)
  const gapIndices = preferInteriorGaps
    ? [...Array(gapCapacities.length).keys()].sort((a, b) => {
        const mid = (gapCapacities.length - 1) / 2;
        return Math.abs(a - mid) - Math.abs(b - mid);
      })
    : [...Array(gapCapacities.length).keys()];
  for (const gi of gapIndices) {
    for (let j = 0; j < gapCapacities[gi] && idx < sorted.length; j++)
      gaps[gi].push(sorted[idx++]);
  }
  return gaps;
}

function buildBalancedRingLetters(playerLetters: string[], neutralZones: NeutralZonePlan[], minNeutralBetween: number): string[] {
  if (playerLetters.length === 0) return buildBalancedNeutralRing(neutralZones, 1);
  if (neutralZones.length === 0) return [...playerLetters];
  const gapCapacities = buildEvenGapCapacities(playerLetters.length, neutralZones.length, minNeutralBetween);
  const gaps = assignNeutralZonesToGaps(neutralZones, gapCapacities, false);
  const ordered: string[] = [];
  for (let i = 0; i < playerLetters.length; i++) {
    ordered.push(playerLetters[i]);
    ordered.push(...orderNeutralsWithinGap(gaps[i]).map(z => z.letter));
  }
  return ordered;
}

function buildBalancedNeutralRing(neutralZones: NeutralZonePlan[], playerCount: number): string[] {
  if (neutralZones.length <= 1) return neutralZones.map(z => z.letter);
  const gapCount = Math.max(1, playerCount);
  const gapCapacities = buildEvenGapCapacities(gapCount, neutralZones.length, 0);
  const gaps = assignNeutralZonesToGaps(neutralZones, gapCapacities, false);
  return gaps.flatMap(gap => orderNeutralsWithinGap(gap)).map(z => z.letter);
}

function buildOrderedLetters(settings: GeneratorSettings, playerLetters: string[], neutralZones: NeutralZonePlan[], isRing: boolean): string[] {
  const neutralLetters = neutralZones.map(z => z.letter);
  if (settings.experimentalBalancedZonePlacement) {
    const honoredSeparation = settings.minNeutralZonesBetweenPlayers > 0
      && canHonorNeutralSeparation(settings, neutralLetters.length)
        ? settings.minNeutralZonesBetweenPlayers : 0;
    if (isRing) return buildBalancedRingLetters(playerLetters, neutralZones, honoredSeparation);
    // Chain: simple implementation
    return buildBalancedRingLetters(playerLetters, neutralZones, honoredSeparation);
  }

  const min = settings.minNeutralZonesBetweenPlayers;
  if (min <= 0 || settings.randomPortals || !canHonorNeutralSeparation(settings, neutralLetters.length))
    return [...playerLetters, ...neutralLetters];

  const ordered: string[] = [];
  const remainingNeutrals = [...neutralLetters];
  for (let i = 0; i < playerLetters.length; i++) {
    ordered.push(playerLetters[i]);
    const needsSeparator = isRing || i < playerLetters.length - 1;
    if (!needsSeparator) continue;
    for (let j = 0; j < min && remainingNeutrals.length > 0; j++)
      ordered.push(remainingNeutrals.shift()!);
  }
  ordered.push(...remainingNeutrals);
  return ordered.length > 0 ? ordered : [...playerLetters, ...neutralLetters];
}

// ── Delaunay edges (using d3-delaunay) ─────────────────────────────────────────

function delaunayEdges(pts: Array<{ x: number; y: number }>): Array<[number, number]> {
  const n = pts.length;
  if (n === 1) return [];
  if (n === 2) return [[0, 1]];

  const flat = new Float64Array(n * 2);
  for (let i = 0; i < n; i++) { flat[i * 2] = pts[i].x; flat[i * 2 + 1] = pts[i].y; }
  const del = Delaunay.from(pts, p => p.x, p => p.y);
  const edgeSet = new Set<string>();
  const edges: Array<[number, number]> = [];

  const triangles = del.triangles;
  for (let i = 0; i < triangles.length; i += 3) {
    const a = triangles[i], b = triangles[i + 1], c = triangles[i + 2];
    const pairs: [number, number][] = [
      [Math.min(a, b), Math.max(a, b)],
      [Math.min(b, c), Math.max(b, c)],
      [Math.min(a, c), Math.max(a, c)],
    ];
    for (const [lo, hi] of pairs) {
      const key = `${lo}-${hi}`;
      if (!edgeSet.has(key)) { edgeSet.add(key); edges.push([lo, hi]); }
    }
  }
  return edges;
}

// ── Utility ───────────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function neutralZoneBalanceScore(plan: NeutralZonePlan): number {
  const q = plan.quality === NeutralZoneQuality.High ? 2 : plan.quality === NeutralZoneQuality.Medium ? 1 : 0;
  return q / 2;
}

function buildBalancedRandomPositions(orderedLetters: string[], playerLetters: string[], neutralByLetter: Map<string, NeutralZonePlan>): Array<{ x: number; y: number }> {
  const count = orderedLetters.length;
  const playerSet = new Set(playerLetters);
  const positions: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < count; i++) {
    const letter = orderedLetters[i];
    const isPlayer = playerSet.has(letter);
    const angle = 2 * Math.PI * i / count;
    const jitter = isPlayer ? 0 : ((i % 3) - 1) * 0.018;
    let radius = 0.43;
    if (!isPlayer) {
      const plan = neutralByLetter.get(letter);
      if (plan) radius = 0.30 + neutralZoneBalanceScore(plan) * 0.035 + (i % 2) * 0.012;
    }
    positions.push({
      x: Math.max(0.05, Math.min(0.95, 0.5 + Math.cos(angle + jitter) * radius)),
      y: Math.max(0.05, Math.min(0.95, 0.5 + Math.sin(angle + jitter) * radius)),
    });
  }
  return positions;
}

// ── Isolation failsafe ────────────────────────────────────────────────────────

function ensurePlayerZonesConnected(playerLetters: string[], zones: Zone[], connections: Connection[], tuning: GenerationTuning): void {
  if (playerLetters.length < 2) return;
  const connNames = new Set(connections.map(c => c.name).filter(Boolean) as string[]);

  for (const letter of playerLetters) {
    const zoneName = `Spawn-${letter}`;
    const zone = zones.find(z => z.name === zoneName);
    if (!zone) continue;
    const hasConn = zone.roads?.some(r => r.to?.type === 'Connection' && connNames.has(r.to.args?.[0] ?? ''));
    if (hasConn) continue;

    const partnerLetter = playerLetters.find(pl => pl !== letter);
    if (!partnerLetter) continue;

    const pair = letter < partnerLetter ? `${letter}-${partnerLetter}` : `${partnerLetter}-${letter}`;
    const fallbackName = `Fallback-${pair}`;
    if (connNames.has(fallbackName)) continue;

    connections.push({
      name: fallbackName,
      from: `Spawn-${letter}`, to: `Spawn-${partnerLetter}`,
      connectionType: 'Direct',
      guardZone: `Spawn-${letter}`, guardEscape: false, simTurnSquad: true,
      guardValue: scaleBorderGuardValue(30000, tuning),
      guardWeeklyIncrement: 0.15,
      guardMatchGroup: `fallback_guard_${fallbackName}`,
    });
    connNames.add(fallbackName);

    for (const pl of [letter, partnerLetter]) {
      const pZone = zones.find(z => z.name === `Spawn-${pl}`);
      if (pZone) {
        pZone.roads ??= [];
        pZone.roads.push(plainRoad(mainObjectEndpoint('0'), connectionEndpoint(fallbackName)));
      }
    }
  }
}

function ensureFullConnectivity(
  playerLetters: string[], allLetters: string[],
  pos: Array<{ x: number; y: number }>,
  zones: Zone[], connections: Connection[], tuning: GenerationTuning,
): void {
  const n = allLetters.length;
  if (n <= 1) return;

  const zoneNameToIndex = new Map<string, number>();
  for (let i = 0; i < allLetters.length; i++) {
    const l = allLetters[i];
    const zoneName = playerLetters.includes(l) ? `Spawn-${l}` : `Neutral-${l}`;
    zoneNameToIndex.set(zoneName, i);
  }

  function buildAdj(): Map<number, Set<number>> {
    const adj = new Map<number, Set<number>>();
    for (let i = 0; i < n; i++) adj.set(i, new Set());
    for (const conn of connections) {
      if (conn.connectionType !== 'Direct' && conn.connectionType !== 'Portal') continue;
      const a = conn.from ? zoneNameToIndex.get(conn.from) : undefined;
      const b = conn.to   ? zoneNameToIndex.get(conn.to)   : undefined;
      if (a !== undefined && b !== undefined) { adj.get(a)!.add(b); adj.get(b)!.add(a); }
    }
    return adj;
  }

  function findComponents(adj: Map<number, Set<number>>): number[][] {
    const visited = new Array<boolean>(n).fill(false);
    const components: number[][] = [];
    for (let start = 0; start < n; start++) {
      if (visited[start]) continue;
      const comp: number[] = [];
      const queue = [start];
      visited[start] = true;
      while (queue.length > 0) {
        const cur = queue.shift()!;
        comp.push(cur);
        for (const nb of adj.get(cur)!) {
          if (!visited[nb]) { visited[nb] = true; queue.push(nb); }
        }
      }
      components.push(comp);
    }
    return components;
  }

  const connNameSet = new Set(connections.map(c => c.name).filter(Boolean) as string[]);

  while (true) {
    const adj = buildAdj();
    const comps = findComponents(adj);
    if (comps.length <= 1) break;

    let bestA = -1, bestB = -1, bestDist = Infinity;
    for (const a of comps[0]) {
      for (let ci = 1; ci < comps.length; ci++) {
        for (const b of comps[ci]) {
          const dx = pos[a].x - pos[b].x;
          const dy = pos[a].y - pos[b].y;
          const dist = dx * dx + dy * dy;
          if (dist < bestDist) { bestDist = dist; bestA = a; bestB = b; }
        }
      }
    }
    if (bestA < 0) break;

    const letterA = allLetters[bestA], letterB = allLetters[bestB];
    const aIsPlayer = playerLetters.includes(letterA);
    const bIsPlayer = playerLetters.includes(letterB);
    const zoneA = aIsPlayer ? `Spawn-${letterA}` : `Neutral-${letterA}`;
    const zoneB = bIsPlayer ? `Spawn-${letterB}` : `Neutral-${letterB}`;
    const pair = letterA < letterB ? `${letterA}-${letterB}` : `${letterB}-${letterA}`;
    const bridgeName = `Bridge-${pair}`;

    if (!connNameSet.has(bridgeName)) {
      connections.push({
        name: bridgeName,
        from: zoneA, to: zoneB,
        connectionType: 'Direct',
        guardZone: zoneA, guardEscape: false, simTurnSquad: true,
        guardValue: scaleBorderGuardValue(30000, tuning),
        guardWeeklyIncrement: 0.15,
        guardMatchGroup: `bridge_guard_${pair}`,
      });
      connNameSet.add(bridgeName);
      for (const [zoneName, isPlayer] of [[zoneA, aIsPlayer], [zoneB, bIsPlayer]] as [string, boolean][]) {
        const zone = zones.find(z => z.name === zoneName);
        if (!zone) continue;
        zone.roads ??= [];
        if (isPlayer || (zone.mainObjects && zone.mainObjects.length > 0))
          zone.roads.push(plainRoad(mainObjectEndpoint('0'), connectionEndpoint(bridgeName)));
        else {
          const existingConn = zone.roads.find(r => r.from?.type === 'Connection')?.from?.args?.[0]
            ?? zone.roads.find(r => r.to?.type === 'Connection')?.to?.args?.[0];
          if (existingConn)
            zone.roads.push(plainRoad(connectionEndpoint(existingConn), connectionEndpoint(bridgeName)));
          else
            zone.roads.push(plainRoad(connectionEndpoint(bridgeName), connectionEndpoint(bridgeName)));
        }
      }
    }
    // Update adj for BFS convergence — just break since we rebuild each loop
  }
}

// ── Topology: Default (Ring) ──────────────────────────────────────────────────

function buildVariantDefault(settings: GeneratorSettings, playerLetters: string[], neutralZones: NeutralZonePlan[], tuning: GenerationTuning, holdCityNeutralLetter?: string): Variant {
  const neutralByLetter = new Map(neutralZones.map(z => [z.letter, z]));
  const orderedLetters = buildOrderedLetters(settings, playerLetters, neutralZones, true);
  const count = orderedLetters.length;
  const isolate = settings.noDirectPlayerConnections && playerLetters.length > 1;

  const ringConnRight: (string | null)[] = new Array(count).fill(null);
  const ringConnLeft:  (string | null)[] = new Array(count).fill(null);
  for (let i = 0; i < count; i++) {
    const next = (i + 1) % count;
    const bothPlayers = playerLetters.includes(orderedLetters[i]) && playerLetters.includes(orderedLetters[next]);
    if (isolate && bothPlayers) continue;
    const name = `Ring-${orderedLetters[i]}-${orderedLetters[next]}`;
    ringConnRight[i] = name;
    ringConnLeft[next] = name;
  }

  const zones: Zone[] = [];
  for (let i = 0; i < count; i++) {
    const letter = orderedLetters[i];
    const myConns = [ringConnLeft[i], ringConnRight[i]].filter(Boolean) as string[];
    const playerIdx = playerLetters.indexOf(letter);
    if (playerIdx >= 0)
      zones.push(buildSpawnZone(letter, `Player${playerIdx + 1}`, myConns, settings.zoneCfg.playerZoneCastles, settings.matchPlayerCastleFactions, settings.zoneCfg.advanced.playerZoneSize, settings.spawnRemoteFootholds, settings.generateRoads, tuning));
    else
      zones.push(buildNeutralZone(neutralByLetter.get(letter)!, myConns, settings.zoneCfg.advanced.neutralZoneSize, settings.spawnRemoteFootholds, settings.generateRoads, tuning, letter === holdCityNeutralLetter));
  }

  const connections: Connection[] = [...buildRingConnections(playerLetters, orderedLetters, tuning, isolate)];
  if (settings.randomPortals)
    connections.push(...buildRandomPortalConnections(playerLetters, orderedLetters, tuning, settings.maxPortalConnections));
  if (isolate) ensurePlayerZonesConnected(playerLetters, zones, connections, tuning);
  return makeVariant(playerLetters, orderedLetters[0], count, zones, connections);
}

// ── Topology: Random ──────────────────────────────────────────────────────────

function buildVariantRandom(settings: GeneratorSettings, playerLetters: string[], neutralZones: NeutralZonePlan[], tuning: GenerationTuning, holdCityNeutralLetter?: string): Variant {
  const neutralByLetter = new Map(neutralZones.map(z => [z.letter, z]));
  const neutralLetters = neutralZones.map(z => z.letter);
  const allLetters: string[] = settings.experimentalBalancedZonePlacement
    ? buildBalancedRingLetters(playerLetters, neutralZones, 0)
    : shuffleArray([...playerLetters, ...neutralLetters]);
  const count = allLetters.length;
  const isolate = settings.noDirectPlayerConnections && playerLetters.length > 1;

  let pos: Array<{ x: number; y: number }>;
  if (settings.experimentalBalancedZonePlacement) {
    pos = buildBalancedRandomPositions(allLetters, playerLetters, neutralByLetter);
  } else {
    pos = allLetters.map(() => ({
      x: Math.random() * 0.9 + 0.05,
      y: Math.random() * 0.9 + 0.05,
    }));
  }

  const pairs = delaunayEdges(pos);
  const connsByZone = new Map<number, string[]>();
  for (let i = 0; i < count; i++) connsByZone.set(i, []);
  const connections: Connection[] = [];

  for (const [a, b] of pairs) {
    const fromLetter = allLetters[a], toLetter = allLetters[b];
    if (isolate && playerLetters.includes(fromLetter) && playerLetters.includes(toLetter)) continue;
    const connName = `Rnd-${fromLetter}-${toLetter}`;
    connsByZone.get(a)!.push(connName);
    connsByZone.get(b)!.push(connName);
    const fromZone = playerLetters.includes(fromLetter) ? `Spawn-${fromLetter}` : `Neutral-${fromLetter}`;
    const toZone   = playerLetters.includes(toLetter)   ? `Spawn-${toLetter}`   : `Neutral-${toLetter}`;
    connections.push({ name: connName, from: fromZone, to: toZone, connectionType: 'Direct', guardZone: fromZone, guardEscape: false, simTurnSquad: true, guardValue: scaleBorderGuardValue(30000, tuning), guardWeeklyIncrement: 0.15, guardMatchGroup: `rnd_guard_${fromLetter}_${toLetter}` });
  }

  const zones: Zone[] = [];
  for (let i = 0; i < count; i++) {
    const letter = allLetters[i];
    const myConns = connsByZone.get(i)!;
    const playerIdx = playerLetters.indexOf(letter);
    let zone: Zone;
    if (playerIdx >= 0)
      zone = buildSpawnZone(letter, `Player${playerIdx + 1}`, myConns, settings.zoneCfg.playerZoneCastles, settings.matchPlayerCastleFactions, settings.zoneCfg.advanced.playerZoneSize, settings.spawnRemoteFootholds, settings.generateRoads, tuning);
    else
      zone = buildNeutralZone(neutralByLetter.get(letter)!, myConns, settings.zoneCfg.advanced.neutralZoneSize, settings.spawnRemoteFootholds, settings.generateRoads, tuning, letter === holdCityNeutralLetter);
    zone.generatorPosition = pos[i];
    zones.push(zone);
  }

  if (settings.randomPortals)
    connections.push(...buildRandomPortalConnections(playerLetters, allLetters, tuning, settings.maxPortalConnections));
  if (isolate) ensurePlayerZonesConnected(playerLetters, zones, connections, tuning);
  ensureFullConnectivity(playerLetters, allLetters, pos, zones, connections, tuning);
  return makeVariant(playerLetters, allLetters[0], count, zones, connections);
}

// ── Topology: Hub & Spoke ─────────────────────────────────────────────────────

function buildVariantHubAndSpoke(settings: GeneratorSettings, playerLetters: string[], neutralZones: NeutralZonePlan[], tuning: GenerationTuning, hubIsHoldCity = false): Variant {
  const neutralByLetter = new Map(neutralZones.map(z => [z.letter, z]));
  const outerLetters: string[] = settings.experimentalBalancedZonePlacement
    ? buildBalancedRingLetters(playerLetters, neutralZones, canHonorNeutralSeparation(settings, neutralZones.length) ? settings.minNeutralZonesBetweenPlayers : 0)
    : [...playerLetters, ...neutralZones.map(z => z.letter)];

  const zones: Zone[] = [];
  const connections: Connection[] = [];

  const hubConns = outerLetters.map(l => `Hub-${l}`);
  zones.push(buildHubZone(hubConns, tuning, hubIsHoldCity, settings.zoneCfg.hubZoneSize, settings.zoneCfg.hubZoneCastles, settings.generateRoads));

  for (let i = 0; i < outerLetters.length; i++) {
    const letter = outerLetters[i];
    const spokeConns = [`Hub-${letter}`];
    const playerIdx = playerLetters.indexOf(letter);
    if (playerIdx >= 0)
      zones.push(buildSpawnZone(letter, `Player${playerIdx + 1}`, spokeConns, settings.zoneCfg.playerZoneCastles, settings.matchPlayerCastleFactions, settings.zoneCfg.advanced.playerZoneSize, settings.spawnRemoteFootholds, settings.generateRoads, tuning));
    else
      zones.push(buildNeutralZone(neutralByLetter.get(letter)!, spokeConns, settings.zoneCfg.advanced.neutralZoneSize, settings.spawnRemoteFootholds, settings.generateRoads, tuning));
  }

  for (const letter of outerLetters) {
    const outerZone = playerLetters.includes(letter) ? `Spawn-${letter}` : `Neutral-${letter}`;
    connections.push({ name: `Hub-${letter}`, from: 'Hub', to: outerZone, connectionType: 'Direct', guardZone: 'Hub', guardEscape: false, simTurnSquad: true, guardValue: scaleBorderGuardValue(30000, tuning), guardWeeklyIncrement: 0.15, guardMatchGroup: `hub_guard_${letter}` });
    for (let e = 1; e < CONNECTIONS_PER_ZONE; e++)
      connections.push({ from: 'Hub', to: outerZone, connectionType: 'Direct', guardZone: 'Hub', guardEscape: false, simTurnSquad: true, guardValue: scaleBorderGuardValue(30000, tuning), guardWeeklyIncrement: 0.15, guardMatchGroup: `hub_guard_${letter}_${e}` });
  }

  // Proximity ring connections
  for (let i = 0; i < outerLetters.length; i++) {
    const next = (i + 1) % outerLetters.length;
    const fromLetter = outerLetters[i], toLetter = outerLetters[next];
    const fromIsPlayer = playerLetters.includes(fromLetter);
    const toIsPlayer   = playerLetters.includes(toLetter);
    if (settings.noDirectPlayerConnections && fromIsPlayer && toIsPlayer) continue;
    connections.push({ name: `Pseudo-${fromLetter}-${toLetter}`, from: fromIsPlayer ? `Spawn-${fromLetter}` : `Neutral-${fromLetter}`, to: toIsPlayer ? `Spawn-${toLetter}` : `Neutral-${toLetter}`, connectionType: 'Proximity' });
  }

  if (settings.randomPortals)
    connections.push(...buildRandomPortalConnections(playerLetters, outerLetters, tuning, settings.maxPortalConnections));

  return makeVariant(playerLetters, outerLetters[0], outerLetters.length + 1, zones, connections);
}

// ── Topology: Chain ───────────────────────────────────────────────────────────

function buildVariantChain(settings: GeneratorSettings, playerLetters: string[], neutralZones: NeutralZonePlan[], tuning: GenerationTuning, holdCityNeutralLetter?: string): Variant {
  const neutralByLetter = new Map(neutralZones.map(z => [z.letter, z]));
  const orderedLetters = buildOrderedLetters(settings, playerLetters, neutralZones, false);
  const count = orderedLetters.length;
  const isolate = settings.noDirectPlayerConnections && playerLetters.length > 1;

  const connNames: (string | null)[] = new Array(count - 1).fill(null);
  for (let i = 0; i < count - 1; i++) {
    const bothPlayers = playerLetters.includes(orderedLetters[i]) && playerLetters.includes(orderedLetters[i + 1]);
    if (isolate && bothPlayers) continue;
    connNames[i] = `Chain-${orderedLetters[i]}-${orderedLetters[i + 1]}`;
  }

  const zones: Zone[] = [];
  for (let i = 0; i < count; i++) {
    const letter = orderedLetters[i];
    const myConns: string[] = [];
    if (i > 0         && connNames[i - 1]) myConns.push(connNames[i - 1]!);
    if (i < count - 1 && connNames[i])     myConns.push(connNames[i]!);
    const playerIdx = playerLetters.indexOf(letter);
    if (playerIdx >= 0)
      zones.push(buildSpawnZone(letter, `Player${playerIdx + 1}`, myConns, settings.zoneCfg.playerZoneCastles, settings.matchPlayerCastleFactions, settings.zoneCfg.advanced.playerZoneSize, settings.spawnRemoteFootholds, settings.generateRoads, tuning));
    else
      zones.push(buildNeutralZone(neutralByLetter.get(letter)!, myConns, settings.zoneCfg.advanced.neutralZoneSize, settings.spawnRemoteFootholds, settings.generateRoads, tuning, letter === holdCityNeutralLetter));
  }

  const connections: Connection[] = [];
  for (let i = 0; i < count - 1; i++) {
    if (!connNames[i]) continue;
    const fromLetter = orderedLetters[i], toLetter = orderedLetters[i + 1];
    const fromZone = playerLetters.includes(fromLetter) ? `Spawn-${fromLetter}` : `Neutral-${fromLetter}`;
    const toZone   = playerLetters.includes(toLetter)   ? `Spawn-${toLetter}`   : `Neutral-${toLetter}`;
    connections.push({ name: connNames[i]!, from: fromZone, to: toZone, connectionType: 'Direct', guardZone: fromZone, guardEscape: false, simTurnSquad: true, guardValue: scaleBorderGuardValue(30000, tuning), guardWeeklyIncrement: 0.15, guardMatchGroup: `chain_guard_${fromLetter}_${toLetter}` });
  }

  if (settings.randomPortals)
    connections.push(...buildRandomPortalConnections(playerLetters, orderedLetters, tuning, settings.maxPortalConnections));
  if (isolate) ensurePlayerZonesConnected(playerLetters, zones, connections, tuning);
  return makeVariant(playerLetters, orderedLetters[0], count, zones, connections);
}

// ── Topology: Shared Web ──────────────────────────────────────────────────────

function buildVariantSharedWeb(settings: GeneratorSettings, playerLetters: string[], neutralZones: NeutralZonePlan[], tuning: GenerationTuning, holdCityNeutralLetter?: string): Variant {
  const neutralByLetter = new Map(neutralZones.map(z => [z.letter, z]));
  const neutrals: string[] = settings.experimentalBalancedZonePlacement
    ? buildBalancedNeutralRing(neutralZones, playerLetters.length)
    : neutralZones.map(z => z.letter);
  const p = playerLetters.length;
  const n = neutrals.length;

  const neutralRingConns: string[] = [];
  for (let i = 0; i < n; i++) neutralRingConns.push(`NRing-${neutrals[i]}-${neutrals[(i + 1) % n]}`);

  const spokeConnsByPlayer = new Map<string, string[]>(playerLetters.map(l => [l, []]));
  const spokeConnsByNeutral = new Map<string, string[]>(neutrals.map(l => [l, []]));

  function addSpoke(playerLetter: string, neutralLetter: string): void {
    const connName = `Web-${playerLetter}-${neutralLetter}`;
    spokeConnsByPlayer.get(playerLetter)!.push(connName);
    spokeConnsByNeutral.get(neutralLetter)!.push(connName);
  }
  for (let i = 0; i < p; i++) {
    const n1 = Math.floor(i * n / p) % n;
    const n2 = (Math.floor(i * n / p) + 1) % n;
    addSpoke(playerLetters[i], neutrals[n1]);
    if (n1 !== n2) addSpoke(playerLetters[i], neutrals[n2]);
  }

  const zones: Zone[] = [];
  const connections: Connection[] = [];

  for (let i = 0; i < n; i++) {
    const prev = (i - 1 + n) % n;
    const neutralConns: string[] = [];
    if (n > 1) { neutralConns.push(neutralRingConns[prev]); neutralConns.push(neutralRingConns[i]); }
    neutralConns.push(...(spokeConnsByNeutral.get(neutrals[i]) ?? []));
    const nConns = [...new Set(neutralConns)];
    const neutralZone = buildNeutralZone(neutralByLetter.get(neutrals[i])!, nConns, settings.zoneCfg.advanced.neutralZoneSize, settings.spawnRemoteFootholds, settings.generateRoads, tuning, neutrals[i] === holdCityNeutralLetter);
    if (neutralByLetter.get(neutrals[i])!.castleCount === 0)
      neutralZone.roads = buildConnectorZoneRoads(nConns, settings.generateRoads);
    zones.push(neutralZone);
  }

  for (let i = 0; i < p; i++) {
    const spokeConns = spokeConnsByPlayer.get(playerLetters[i])!;
    zones.push(buildSpawnZone(playerLetters[i], `Player${i + 1}`, spokeConns, settings.zoneCfg.playerZoneCastles, settings.matchPlayerCastleFactions, settings.zoneCfg.advanced.playerZoneSize, settings.spawnRemoteFootholds, settings.generateRoads, tuning));
    for (const connName of spokeConns) {
      const neutralLetter = connName.split('-')[2];
      const neutralZoneName = `Neutral-${neutralLetter}`;
      connections.push({ name: connName, from: `Spawn-${playerLetters[i]}`, to: neutralZoneName, connectionType: 'Direct', guardZone: neutralZoneName, guardEscape: false, simTurnSquad: true, guardValue: scaleBorderGuardValue(30000, tuning), guardWeeklyIncrement: 0.15, guardMatchGroup: `web_guard_${playerLetters[i]}_${neutralLetter}` });
    }
  }

  if (n > 1) {
    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n;
      connections.push({ name: neutralRingConns[i], from: `Neutral-${neutrals[i]}`, to: `Neutral-${neutrals[next]}`, connectionType: 'Direct', guardZone: `Neutral-${neutrals[i]}`, guardEscape: false, simTurnSquad: true, guardValue: scaleBorderGuardValue(20000, tuning), guardWeeklyIncrement: 0.15, guardMatchGroup: `nring_guard_${neutrals[i]}_${neutrals[next]}` });
    }
  }

  if (settings.randomPortals) {
    const allLetters = [...playerLetters, ...neutrals];
    connections.push(...buildRandomPortalConnections(playerLetters, allLetters, tuning, settings.maxPortalConnections));
  }

  const isolateWeb = settings.noDirectPlayerConnections && playerLetters.length > 1;
  if (isolateWeb) ensurePlayerZonesConnected(playerLetters, zones, connections, tuning);
  return makeVariant(playerLetters, playerLetters[0], zones.length, zones, connections);
}

// ── Neutral zone plan ─────────────────────────────────────────────────────────

function buildNeutralZonePlan(settings: GeneratorSettings): NeutralZonePlan[] {
  const plans: NeutralZonePlan[] = [];
  const maxNeutralZones = Math.max(0, ZONE_LETTERS.length - settings.playerCount);
  const castleZoneCastleCount = Math.max(1, Math.min(4, settings.zoneCfg.neutralZoneCastles));

  function add(requestedCount: number, quality: NeutralZoneQuality, castleCount: number): void {
    const count = Math.max(0, Math.min(30, requestedCount));
    for (let i = 0; i < count && plans.length < maxNeutralZones; i++) {
      const letter = ZONE_LETTERS[settings.playerCount + plans.length];
      plans.push({ letter, quality, castleCount });
    }
  }

  if (settings.zoneCfg.advanced.enabled) {
    add(settings.zoneCfg.advanced.neutralLowNoCastleCount,    NeutralZoneQuality.Low,    0);
    add(settings.zoneCfg.advanced.neutralLowCastleCount,      NeutralZoneQuality.Low,    castleZoneCastleCount);
    add(settings.zoneCfg.advanced.neutralMediumNoCastleCount, NeutralZoneQuality.Medium, 0);
    add(settings.zoneCfg.advanced.neutralMediumCastleCount,   NeutralZoneQuality.Medium, castleZoneCastleCount);
    add(settings.zoneCfg.advanced.neutralHighNoCastleCount,   NeutralZoneQuality.High,   0);
    add(settings.zoneCfg.advanced.neutralHighCastleCount,     NeutralZoneQuality.High,   castleZoneCastleCount);
  } else {
    const castleCount = Math.max(0, Math.min(4, settings.zoneCfg.neutralZoneCastles));
    add(settings.zoneCfg.neutralZoneCount, NeutralZoneQuality.Medium, castleCount);
  }

  if (settings.topology === MapTopology.SharedWeb && plans.length === 0 && maxNeutralZones > 0) {
    const letter = ZONE_LETTERS[settings.playerCount];
    const castleCount = Math.max(0, Math.min(4, settings.zoneCfg.neutralZoneCastles));
    plans.push({ letter, quality: NeutralZoneQuality.Medium, castleCount });
  }

  return plans;
}

// ── Game rules ────────────────────────────────────────────────────────────────

function buildBonuses(entries: BonusEntry[]): Bonus[] | null {
  if (entries.length === 0) return null;
  const result: Bonus[] = [];
  for (const entry of entries) {
    switch (entry.presetType) {
      case BonusPresetType.TownPortalFree:
        result.push({ sid: 'add_bonus_hero_spell', receiverSide: -1, receiverFilter: entry.receiverFilter, parameters: ['neutral_magic_town_portal'] });
        result.push({ sid: 'add_bonus_hero_stat',  receiverSide: -1, receiverFilter: entry.receiverFilter, parameters: ['magicCostSidSet', 'neutral_magic_town_portal', '-999', '0'] });
        break;
      case BonusPresetType.Spell:
        result.push({ sid: 'add_bonus_hero_spell', receiverSide: -1, receiverFilter: entry.receiverFilter, parameters: [entry.param] });
        if (entry.param2 === '1')
          result.push({ sid: 'add_bonus_hero_stat', receiverSide: -1, receiverFilter: entry.receiverFilter, parameters: ['magicCostSidSet', entry.param, '-999', '0'] });
        break;
      case BonusPresetType.UnitMultiplier:
        result.push({ sid: 'add_bonus_hero_unit_multipler', receiverSide: -1, receiverFilter: entry.receiverFilter, parameters: [entry.param] });
        break;
      case BonusPresetType.MovementBonus:
        result.push({ sid: 'add_bonus_hero_stat', receiverSide: -1, receiverFilter: entry.receiverFilter, parameters: ['movementBonus', entry.param] });
        break;
      case BonusPresetType.StartingItem:
        result.push({ sid: 'add_bonus_hero_item', receiverSide: -1, receiverFilter: entry.receiverFilter, parameters: [entry.param] });
        break;
      case BonusPresetType.StartingGold:
        result.push({ sid: 'add_bonus_res', receiverSide: -1, receiverFilter: entry.receiverFilter, parameters: ['gold', entry.param] });
        break;
      case BonusPresetType.StartingGems:
        result.push({ sid: 'add_bonus_res', receiverSide: -1, receiverFilter: entry.receiverFilter, parameters: ['gemstones', entry.param] });
        break;
      case BonusPresetType.StartingCrystals:
        result.push({ sid: 'add_bonus_res', receiverSide: -1, receiverFilter: entry.receiverFilter, parameters: ['crystals', entry.param] });
        break;
      case BonusPresetType.StartingMercury:
        result.push({ sid: 'add_bonus_res', receiverSide: -1, receiverFilter: entry.receiverFilter, parameters: ['mercury', entry.param] });
        break;
    }
  }
  return result.length > 0 ? result : null;
}

function buildAdvancedWinConditions(settings: GeneratorSettings, effectiveVictoryCondition: string): WinConditions {
  const useLostStartCity = settings.gameEndConditions.lostStartCity || effectiveVictoryCondition === 'win_condition_3';
  const useCityHold = settings.gameEndConditions.cityHold || effectiveVictoryCondition === 'win_condition_5';
  const useGladiator = settings.gladiatorArenaRules.enabled || effectiveVictoryCondition === 'win_condition_4';
  const useTournament = settings.tournamentRules.enabled || effectiveVictoryCondition === 'win_condition_6';

  const wc: WinConditions = {
    classic: true,
    desertion: true,
    desertionDay: 3,
    desertionValue: 3000,
    heroLighting: true,
    heroLightingDay: 1,
    lostStartCity: useLostStartCity || undefined,
    lostStartCityDay: Math.max(1, Math.min(30, settings.gameEndConditions.lostStartCityDay)),
    lostStartHero: (settings.gameEndConditions.lostStartHero || useGladiator) || undefined,
    cityHold: useCityHold || undefined,
    cityHoldDays: Math.max(1, Math.min(30, settings.gameEndConditions.cityHoldDays)),
  };

  if (useGladiator) {
    wc.gladiatorArena = true;
    wc.gladiatorArenaRegistrationStartWork = false;
    wc.gladiatorArenaRegistrationStartFight = true;
    wc.gladiatorArenaDaysDelayStart = Math.max(1, Math.min(60, settings.gladiatorArenaRules.daysDelayStart));
    wc.gladiatorArenaCountDay = Math.max(1, Math.min(30, settings.gladiatorArenaRules.countDay));
    wc.championSelectRule = 'StartHero';
  }

  if (useTournament) {
    const firstDay  = Math.max(3, Math.min(60, settings.tournamentRules.firstTournamentDay));
    const interval  = Math.max(3, Math.min(30, settings.tournamentRules.interval));
    const pointsToWin = Math.max(1, Math.min(10, settings.tournamentRules.pointsToWin));
    const roundCount = pointsToWin * 2 - 1;
    const announceDays: number[] = [];
    const battleOffsets: number[] = [];
    let prevBattle = 0;
    for (let i = 0; i < roundCount; i++) {
      const announceTurn = i === 0 ? 1 : prevBattle + 1;
      const offset = i === 0 ? firstDay - 1 : interval - 1;
      announceDays.push(announceTurn);
      battleOffsets.push(offset);
      prevBattle = announceTurn + offset;
    }
    wc.championSelectRule = 'StartHero';
    wc.tournament = true;
    wc.tournamentSaveArmy = true;
    wc.tournamentAnnounceDays = announceDays;
    wc.tournamentDays = battleOffsets;
    wc.tournamentPointsToWin = pointsToWin;
  }

  return wc;
}

function buildGameRules(settings: GeneratorSettings, effectiveVictoryCondition: string): GameRules {
  return {
    heroCountMin: settings.heroSettings.heroCountMin - settings.heroSettings.heroCountIncrement,
    heroCountMax: settings.heroSettings.heroCountMax,
    heroCountIncrement: settings.heroSettings.heroCountIncrement,
    heroHireBan: false,
    encounterHoles: false,
    factionLawsExpModifier: percentToModifier(settings.factionLawsExpPercent),
    astrologyExpModifier: percentToModifier(settings.astrologyExpPercent),
    bonuses: buildBonuses(settings.bonuses),
    winConditions: buildAdvancedWinConditions(settings, effectiveVictoryCondition),
  };
}

function buildValueOverrides(raw: string): ValueOverride[] | null {
  if (!raw.trim()) return null;
  const list: ValueOverride[] = [];
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const sid = trimmed.slice(0, eq).trim();
    if (!sid) continue;
    const gv = parseInt(trimmed.slice(eq + 1).trim(), 10);
    if (isNaN(gv)) continue;
    list.push({ sid, variant: -1, guardValue: gv });
  }
  return list.length > 0 ? list : null;
}

function buildGlobalBans(rawItems: string, rawMagics: string): GlobalBans | null {
  function parseLines(raw: string): string[] | null {
    if (!raw.trim()) return null;
    const list = raw.split('\n').map(l => l.trim()).filter(Boolean);
    return list.length > 0 ? list : null;
  }
  const items  = parseLines(rawItems);
  const magics = parseLines(rawMagics);
  if (!items && !magics) return null;
  return { items: items ?? undefined, magics: magics ?? undefined };
}

// ── Zone layouts ─────────────────────────────────────────────────────────────

function buildZoneLayout(name: string, obstaclesFill: number, obstaclesFillVoid: number, lakesFill: number, minLakeArea: number, elevationClusterScale: number, roadClusterArea: number, roadAttraction: number, ambientNoise: number, groupSizeWeights: number[]): ZoneLayout {
  return {
    name,
    obstaclesFill, obstaclesFillVoid, lakesFill, minLakeArea, elevationClusterScale,
    elevationModes: [
      { weight: 2, minElevatedFraction: 0.2, maxElevatedFraction: 0.4 },
      { weight: 1, minElevatedFraction: 0.6, maxElevatedFraction: 0.8 },
    ],
    roadClusterArea,
    guardedEncounterResourceFractions: { countBounds: [], fractions: [0.66] },
    ambientPickupDistribution: {
      repulsion: 1.0,
      noise: ambientNoise,
      roadAttraction,
      obstacleAttraction: 0.0,
      groupSizeWeights,
    },
  };
}

function buildZoneLayouts(): ZoneLayout[] {
  return [
    buildZoneLayout(SPAWN_LAYOUT,    0.24, 0.48, 0.30, 16, 0.16,  160, -0.30, 0.4, [20, 2, 1]),
    buildZoneLayout(SIDE_LAYOUT,     0.36, 0.50, 0.25, 16, 0.128, 128, -0.30, 0.3, [20, 2, 1]),
    buildZoneLayout(TREASURE_LAYOUT, 0.50, 0.50, 0.45, 12, 0.12,   96, -0.30, 0.3, [12, 3, 1]),
    buildZoneLayout(CENTER_LAYOUT,   0.56, 0.60, 0.30, 10, 0.128,  96, -0.25, 0.3, [12, 4, 1]),
  ];
}

// ── Mandatory content ─────────────────────────────────────────────────────────

function buildAllMandatoryContent(playerLetters: string[], neutralZones: NeutralZonePlan[], settings: GeneratorSettings): MandatoryContentGroup[] {
  const groups: MandatoryContentGroup[] = [];
  for (const letter of playerLetters)
    groups.push({ name: `mandatory_content_side_${letter}`, content: buildPlayerZoneMandatoryContent(settings) });
  for (const plan of neutralZones) {
    let content;
    switch (plan.quality) {
      case NeutralZoneQuality.Low:  content = buildLowNeutralMandatoryContent(plan.castleCount, settings.spawnRemoteFootholds); break;
      case NeutralZoneQuality.High: content = buildHighNeutralMandatoryContent(plan.castleCount, settings.spawnRemoteFootholds); break;
      default:                      content = buildMediumNeutralMandatoryContent(plan.castleCount, settings.spawnRemoteFootholds); break;
    }
    groups.push({ name: `mandatory_content_neutral_${plan.letter}`, content });
  }
  return groups;
}

// ── Description ───────────────────────────────────────────────────────────────

function topologyLabel(topology: MapTopology): string {
  switch (topology) {
    case MapTopology.Default:     return 'Ring';
    case MapTopology.HubAndSpoke: return 'Hub';
    case MapTopology.Chain:       return 'Chain';
    case MapTopology.SharedWeb:   return 'Shared Web';
    case MapTopology.Random:      return 'Random';
    default:                      return topology;
  }
}

function countPhrase(count: number, singular: string, plural: string): string {
  if (count === 0) return `no ${plural}`;
  return `${count} ${count === 1 ? singular : plural}`;
}

function buildTemplateDescription(settings: GeneratorSettings, neutralZoneCount: number): string {
  const parts: string[] = [
    `${topologyLabel(settings.topology)} layout`,
    countPhrase(neutralZoneCount, 'neutral zone', 'neutral zones'),
    `${countPhrase(settings.zoneCfg.playerZoneCastles, 'castle', 'castles')} per player zone`,
  ];
  if (neutralZoneCount > 0) {
    parts.push(settings.zoneCfg.advanced.enabled
      ? 'mixed neutral zone tiers'
      : `${countPhrase(settings.zoneCfg.neutralZoneCastles, 'castle', 'castles')} per neutral zone`);
  }
  const options: string[] = [];
  if (settings.noDirectPlayerConnections) options.push('isolated player starts');
  if (settings.experimentalBalancedZonePlacement) options.push('balanced zone placement');
  if (settings.randomPortals) options.push('random portals');
  if (!settings.spawnRemoteFootholds) options.push('no remote footholds');
  if (!settings.generateRoads) options.push('roads disabled');
  if (options.length > 0) parts.push(`options: ${options.join(', ')}`);
  return `Generated with Olden Era Template Generator (Web): ${parts.join(', ')}.`;
}

// ── Topology adjacency for hold city ─────────────────────────────────────────

function buildTopologyAdjacency(settings: GeneratorSettings, playerLetters: string[], neutralZones: NeutralZonePlan[]): Map<string, Set<string>> {
  const adj = new Map<string, Set<string>>();
  function link(a: string, b: string): void {
    if (!adj.has(a)) adj.set(a, new Set());
    if (!adj.has(b)) adj.set(b, new Set());
    adj.get(a)!.add(b);
    adj.get(b)!.add(a);
  }
  const ordered = buildOrderedLetters(settings, playerLetters, neutralZones, settings.topology !== MapTopology.Chain);
  if (settings.topology === MapTopology.Chain) {
    const isolate = settings.noDirectPlayerConnections && playerLetters.length > 1;
    const playerSet = new Set(playerLetters);
    for (let i = 0; i < ordered.length - 1; i++) {
      if (isolate && playerSet.has(ordered[i]) && playerSet.has(ordered[i + 1])) continue;
      link(ordered[i], ordered[i + 1]);
    }
  } else {
    const n = ordered.length;
    for (let i = 0; i < n; i++) link(ordered[i], ordered[(i + 1) % n]);
  }
  return adj;
}

function pickHoldCityNeutralLetter(neutralZones: NeutralZonePlan[], playerLetters: string[], adjacency: Map<string, Set<string>>): string | null {
  if (neutralZones.length === 0) return null;
  function bfs(start: string): Map<string, number> {
    const dist = new Map<string, number>([[start, 0]]);
    const queue = [start];
    while (queue.length > 0) {
      const cur = queue.shift()!;
      for (const nb of adjacency.get(cur) ?? []) {
        if (!dist.has(nb)) { dist.set(nb, (dist.get(cur) ?? 0) + 1); queue.push(nb); }
      }
    }
    return dist;
  }
  const distsByPlayer = playerLetters.map(p => bfs(p));
  const qOrd = { [NeutralZoneQuality.High]: 2, [NeutralZoneQuality.Medium]: 1, [NeutralZoneQuality.Low]: 0 };
  let best: NeutralZonePlan | null = null;
  let bestMinDist = -1, bestVariance = Infinity, bestQuality = -1, bestHasCastle = -1;
  for (const plan of neutralZones) {
    const dists = distsByPlayer.map(d => d.get(plan.letter) ?? 999);
    const minDist = Math.min(...dists);
    const mean = dists.reduce((a, b) => a + b, 0) / dists.length;
    const variance = dists.reduce((a, b) => a + (b - mean) ** 2, 0) / dists.length;
    const quality = qOrd[plan.quality];
    const hasCastle = plan.castleCount > 0 ? 1 : 0;
    if (minDist > bestMinDist || (minDist === bestMinDist && variance < bestVariance) || (minDist === bestMinDist && variance === bestVariance && quality > bestQuality) || (minDist === bestMinDist && variance === bestVariance && quality === bestQuality && hasCastle > bestHasCastle)) {
      best = plan; bestMinDist = minDist; bestVariance = variance; bestQuality = quality; bestHasCastle = hasCastle;
    }
  }
  return best?.letter ?? null;
}

// ── Main variant dispatch ─────────────────────────────────────────────────────

function buildVariant(settings: GeneratorSettings, playerLetters: string[], neutralZones: NeutralZonePlan[], tuning: GenerationTuning, holdCityNeutralLetter: string | null, hubIsHoldCity: boolean): Variant {
  switch (settings.topology) {
    case MapTopology.HubAndSpoke: return buildVariantHubAndSpoke(settings, playerLetters, neutralZones, tuning, hubIsHoldCity);
    case MapTopology.Chain:       return buildVariantChain(settings, playerLetters, neutralZones, tuning, holdCityNeutralLetter ?? undefined);
    case MapTopology.SharedWeb:   return buildVariantSharedWeb(settings, playerLetters, neutralZones, tuning, holdCityNeutralLetter ?? undefined);
    case MapTopology.Default:     return buildVariantDefault(settings, playerLetters, neutralZones, tuning, holdCityNeutralLetter ?? undefined);
    case MapTopology.Random:
    default:                      return buildVariantRandom(settings, playerLetters, neutralZones, tuning, holdCityNeutralLetter ?? undefined);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Generates a complete RmgTemplate from the given settings. */
export function generate(settings: GeneratorSettings): RmgTemplate {
  const playerLetters = ZONE_LETTERS.slice(0, settings.playerCount);
  const neutralZones = buildNeutralZonePlan(settings);

  const useCityHold = settings.gameEndConditions.cityHold || settings.gameEndConditions.victoryCondition === 'win_condition_5';
  let holdCityNeutralLetter: string | null = null;
  if (useCityHold && settings.topology !== MapTopology.HubAndSpoke) {
    const adjacency = buildTopologyAdjacency(settings, playerLetters, neutralZones);
    holdCityNeutralLetter = pickHoldCityNeutralLetter(neutralZones, playerLetters, adjacency);
  }

  const totalZones = settings.playerCount + neutralZones.length;
  const tuning: GenerationTuning = {
    contentScale: computeContentScale(settings.mapSize, totalZones),
    resourceDensityMultiplier: settings.zoneCfg.resourceDensityPercent / 200.0,
    structureDensityMultiplier: settings.zoneCfg.structureDensityPercent / 100.0,
    neutralStackStrengthMultiplier: settings.zoneCfg.neutralStackStrengthPercent / 100.0,
    borderGuardStrengthMultiplier: settings.zoneCfg.borderGuardStrengthPercent / 100.0,
    guardRandomization: effectiveGuardRandomization(settings),
  };

  const effectiveVictoryCondition = settings.gameEndConditions.victoryCondition;
  const hubIsHoldCity = useCityHold && settings.topology === MapTopology.HubAndSpoke;

  return {
    name: settings.templateName,
    gameMode: settings.gameMode,
    description: buildTemplateDescription(settings, neutralZones.length),
    displayWinCondition: effectiveVictoryCondition,
    sizeX: settings.mapSize,
    sizeZ: settings.mapSize,
    gameRules: buildGameRules(settings, effectiveVictoryCondition),
    valueOverrides: buildValueOverrides(settings.valueOverridesText),
    globalBans: buildGlobalBans(settings.bannedItems, settings.bannedMagics),
    variants: [buildVariant(settings, playerLetters, neutralZones, tuning, holdCityNeutralLetter, hubIsHoldCity)],
    zoneLayouts: buildZoneLayouts(),
    mandatoryContent: buildAllMandatoryContent(playerLetters, neutralZones, settings),
    contentCountLimits: buildAllContentCountLimits(settings),
    contentPools: [],
    contentLists: [],
  };
}
