// T030: Vitest tests for templateGenerator.ts — derived from C# TemplateGeneratorTests.cs

import { describe, it, expect } from 'vitest';
import { generate } from '../../generator/templateGenerator.ts';
import {
  MapTopology, NeutralZoneQuality, defaultSettings,
  type GeneratorSettings,
} from '../../generator/types.ts';
import type { Zone, Connection, Variant, RmgTemplate } from '../../generator/model.ts';

// ── Helpers ──────────────────────────────────────────────────────────────────

function singleVariant(template: RmgTemplate): Variant {
  const variants = template.variants;
  if (!variants || variants.length === 0) throw new Error('No variants');
  return variants[0];
}

function zones(v: Variant): Zone[] {
  return v.zones ?? [];
}

function connections(v: Variant): Connection[] {
  return (v.connections ?? []).filter(c => c.connectionType === 'Direct' || c.connectionType === 'Portal');
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('generate — basic template fields', () => {
  it('uses requested settings for template and game rules', () => {
    const settings: GeneratorSettings = {
      ...defaultSettings(),
      templateName: 'Baseline Test Template',
      gameMode: 'Classic',
      mapSize: 200,
      gameEndConditions: {
        victoryCondition: 'win_condition_5',
        lostStartCity: false, lostStartCityDay: 7,
        lostStartHero: false,
        cityHold: false, cityHoldDays: 7,
      },
      heroSettings: { heroCountMin: 7, heroCountMax: 15, heroCountIncrement: 3 },
      topology: MapTopology.Default,
    };

    const template = generate(settings);

    expect(template.name).toBe('Baseline Test Template');
    expect(template.gameMode).toBe('Classic');
    expect(template.sizeX).toBe(200);
    expect(template.sizeZ).toBe(200);
    expect(template.displayWinCondition).toBe('win_condition_5');
    expect(template.description).toMatch(/Ring layout/);
    expect(template.gameRules).toBeTruthy();
    expect(template.gameRules!.heroCountMin).toBe(7 - 3); // heroCountMin - heroCountIncrement
    expect(template.gameRules!.heroCountMax).toBe(15);
    expect(template.gameRules!.heroCountIncrement).toBe(3);
    expect(template.zoneLayouts).toBeTruthy();
    expect(template.zoneLayouts!.length).toBeGreaterThan(0);
    expect(template.contentCountLimits).toBeTruthy();
    expect(template.contentCountLimits!.length).toBeGreaterThan(0);
  });
});

describe('generate — Default (Ring) topology', () => {
  it('creates expected zone and connection counts for 3 players + 2 neutrals', () => {
    const settings: GeneratorSettings = {
      ...defaultSettings(),
      playerCount: 3,
      zoneCfg: {
        ...defaultSettings().zoneCfg,
        neutralZoneCount: 2,
        playerZoneCastles: 2,
        neutralZoneCastles: 1,
      },
      topology: MapTopology.Default,
      randomPortals: false,
    };

    const v = singleVariant(generate(settings));
    const zs = zones(v);
    const cs = connections(v);

    expect(zs.length).toBe(5);
    expect(zs.filter(z => z.name.startsWith('Spawn-')).length).toBe(3);
    expect(zs.filter(z => z.name.startsWith('Neutral-')).length).toBe(2);
    expect(cs.filter(c => c.connectionType === 'Direct').length).toBe(5);
    expect(cs.every(c => c.name?.startsWith('Ring-'))).toBe(true);
    expect(cs.every(c => c.connectionType === 'Direct')).toBe(true);

    // Player zones with 2 castles → 2 main objects
    const spawnZones = zs.filter(z => z.name.startsWith('Spawn-'));
    expect(spawnZones.every(z => (z.mainObjects?.length ?? 0) === 2)).toBe(true);

    // Neutral zones with 1 castle → 1 main object
    const neutralZones = zs.filter(z => z.name.startsWith('Neutral-'));
    expect(neutralZones.every(z => (z.mainObjects?.length ?? 0) === 1)).toBe(true);
  });
});

describe('generate — roads disabled', () => {
  it('leaves zone road lists empty when generateRoads is false', () => {
    const settings: GeneratorSettings = {
      ...defaultSettings(),
      playerCount: 2,
      zoneCfg: {
        ...defaultSettings().zoneCfg,
        neutralZoneCount: 1,
        playerZoneCastles: 3,
        neutralZoneCastles: 2,
      },
      spawnRemoteFootholds: true,
      generateRoads: false,
      topology: MapTopology.Default,
    };

    const v = singleVariant(generate(settings));
    expect(zones(v).every(z => (z.roads?.length ?? 0) === 0)).toBe(true);
  });
});

describe('generate — isolated players', () => {
  it('does not create direct Spawn-to-Spawn connections when noDirectPlayerConnections is true', () => {
    const settings: GeneratorSettings = {
      ...defaultSettings(),
      playerCount: 2,
      zoneCfg: {
        ...defaultSettings().zoneCfg,
        neutralZoneCount: 2,
      },
      noDirectPlayerConnections: true,
      topology: MapTopology.Default,
    };

    const v = singleVariant(generate(settings));
    const playerToPlayer = connections(v).filter(
      c => c.from?.startsWith('Spawn-') && c.to?.startsWith('Spawn-'),
    );
    expect(playerToPlayer.length).toBe(0);
  });
});

describe('generate — random portals', () => {
  it('adds Portal-type connections when randomPortals is true', () => {
    const settings: GeneratorSettings = {
      ...defaultSettings(),
      playerCount: 2,
      zoneCfg: {
        ...defaultSettings().zoneCfg,
        neutralZoneCount: 2,
      },
      randomPortals: true,
      topology: MapTopology.Default,
    };

    const v = singleVariant(generate(settings));
    const portals = connections(v).filter(c => c.connectionType === 'Portal');

    expect(portals.length).toBeGreaterThan(0);
    expect(portals.every(p => p.road === true)).toBe(true);
    expect(portals.every(p => (p.portalPlacementRulesFrom?.length ?? 0) > 0)).toBe(true);
    expect(portals.every(p => (p.portalPlacementRulesTo?.length ?? 0) > 0)).toBe(true);
  });
});

describe('generate — advanced guard randomization', () => {
  it('applies guard randomization from advanced settings when enabled', () => {
    const settings: GeneratorSettings = {
      ...defaultSettings(),
      playerCount: 2,
      zoneCfg: {
        ...defaultSettings().zoneCfg,
        neutralZoneCount: 2,
        advanced: {
          ...defaultSettings().zoneCfg.advanced,
          enabled: true,
          guardRandomization: 0.23,
        },
      },
      topology: MapTopology.Default,
    };

    const v = singleVariant(generate(settings));
    const allZones = zones(v).filter(z => z.name.startsWith('Spawn-') || z.name.startsWith('Neutral-'));
    expect(allZones.length).toBeGreaterThan(0);
    expect(allZones.every(z => z.guardRandomization === 0.23)).toBe(true);
  });

  it('ignores guard randomization override when advanced mode is disabled', () => {
    const settings: GeneratorSettings = {
      ...defaultSettings(),
      playerCount: 2,
      zoneCfg: {
        ...defaultSettings().zoneCfg,
        neutralZoneCount: 2,
        advanced: {
          ...defaultSettings().zoneCfg.advanced,
          enabled: false,
          guardRandomization: 0.23,
        },
      },
      topology: MapTopology.Default,
    };

    const v = singleVariant(generate(settings));
    const allZones = zones(v).filter(z => z.name.startsWith('Spawn-') || z.name.startsWith('Neutral-'));
    expect(allZones.length).toBeGreaterThan(0);
    expect(allZones.every(z => z.guardRandomization === 0.05)).toBe(true);
  });
});

describe('generate — advanced neutral zone counts', () => {
  it('creates tiered zones with correct layouts and main objects', () => {
    const settings: GeneratorSettings = {
      ...defaultSettings(),
      playerCount: 2,
      zoneCfg: {
        ...defaultSettings().zoneCfg,
        neutralZoneCastles: 2,
        advanced: {
          enabled: true,
          neutralLowNoCastleCount: 1,
          neutralLowCastleCount: 1,
          neutralMediumNoCastleCount: 1,
          neutralMediumCastleCount: 1,
          neutralHighNoCastleCount: 1,
          neutralHighCastleCount: 1,
          playerZoneSize: 1.0,
          neutralZoneSize: 1.0,
          guardRandomization: 0.05,
        },
      },
      topology: MapTopology.Default,
    };

    const template = generate(settings);
    const v = singleVariant(template);
    const zsByName = new Map(zones(v).map(z => [z.name, z]));

    expect(zsByName.size).toBe(8);

    // Low no-castle zone (C) → no main objects
    expect((zsByName.get('Neutral-C')?.mainObjects?.length ?? 0)).toBe(0);
    // Low castle zone (D) → 2 main objects (castle × 2)
    expect((zsByName.get('Neutral-D')?.mainObjects?.length ?? 0)).toBe(2);
    // Medium no-castle (E) → no main objects
    expect((zsByName.get('Neutral-E')?.mainObjects?.length ?? 0)).toBe(0);
    // Medium castle (F) → 2 main objects
    expect((zsByName.get('Neutral-F')?.mainObjects?.length ?? 0)).toBe(2);
    // High no-castle (G) → no main objects
    expect((zsByName.get('Neutral-G')?.mainObjects?.length ?? 0)).toBe(0);
    // High castle (H) → 2 main objects
    expect((zsByName.get('Neutral-H')?.mainObjects?.length ?? 0)).toBe(2);

    // Layouts
    expect(zsByName.get('Neutral-C')?.layout).toBe('zone_layout_sides');
    expect(zsByName.get('Neutral-D')?.layout).toBe('zone_layout_sides');
    expect(zsByName.get('Neutral-E')?.layout).toBe('zone_layout_treasure_zone');
    expect(zsByName.get('Neutral-F')?.layout).toBe('zone_layout_treasure_zone');
    expect(zsByName.get('Neutral-G')?.layout).toBe('zone_layout_treasure_zone');
    expect(zsByName.get('Neutral-H')?.layout).toBe('zone_layout_treasure_zone');

    // Biome type: no-castle → MatchZone, with-castle → MatchMainObject
    expect(zsByName.get('Neutral-C')?.zoneBiome?.type).toBe('MatchZone');
    expect(zsByName.get('Neutral-D')?.zoneBiome?.type).toBe('MatchMainObject');

    // Guarded content value: Low < Medium < High
    const lowVal  = zsByName.get('Neutral-C')!.guardedContentValue ?? 0;
    const medVal  = zsByName.get('Neutral-E')!.guardedContentValue ?? 0;
    const highVal = zsByName.get('Neutral-G')!.guardedContentValue ?? 0;
    expect(lowVal).toBeLessThan(medVal);
    expect(medVal).toBeLessThan(highVal);

    // Zone layouts present
    const layoutNames = (template.zoneLayouts ?? []).map(l => l.name);
    expect(layoutNames).toContain('zone_layout_spawns');
    expect(layoutNames).toContain('zone_layout_sides');
    expect(layoutNames).toContain('zone_layout_treasure_zone');
    expect(layoutNames).toContain('zone_layout_center');
  });
});

describe('generate — density scaling', () => {
  it('applies resource and structure density separately', () => {
    const settings: GeneratorSettings = {
      ...defaultSettings(),
      playerCount: 2,
      mapSize: 160,
      zoneCfg: {
        ...defaultSettings().zoneCfg,
        neutralZoneCount: 2,
        resourceDensityPercent: 50,
        structureDensityPercent: 150,
      },
      topology: MapTopology.Default,
    };

    const v = singleVariant(generate(settings));
    const spawnZone = zones(v).find(z => z.name.startsWith('Spawn-'))!;

    // 2-player + 2 neutral = 4 zones, 160×160 map: content scale = sqrt((160²/4)/6400) = sqrt(1) = 1
    // structureDensityMultiplier = 150/100 = 1.5 → guardedContentValue = floor(200000 * 1.0 * 1.5) = 300000
    expect(spawnZone.guardedContentValue).toBe(300000);
    // guardedContentValuePerArea = floor(2000 * sqrt(1) * 1.5) = 3000
    expect(spawnZone.guardedContentValuePerArea).toBe(3000);
    // unguardedContentValue = floor(50000 * 1.0 * 1.5) = 75000
    expect(spawnZone.unguardedContentValue).toBe(75000);
    // unguardedContentValuePerArea = floor(400 * 1.0 * 1.5) = 600
    expect(spawnZone.unguardedContentValuePerArea).toBe(600);
    // resourcesValue: resourceDensityMultiplier = 50/200 = 0.25 → floor(80000*1.0*0.25) = 20000
    expect(spawnZone.resourcesValue).toBe(20000);
    // resourcesValuePerArea = floor(600 * 1.0 * 0.25) = 150
    expect(spawnZone.resourcesValuePerArea).toBe(150);
  });

  it('applies neutral stack strength to zone guard multiplier and main object guards', () => {
    const settings: GeneratorSettings = {
      ...defaultSettings(),
      playerCount: 2,
      mapSize: 160,
      zoneCfg: {
        ...defaultSettings().zoneCfg,
        neutralZoneCount: 2,
        playerZoneCastles: 2,
        neutralZoneCastles: 2,
        neutralStackStrengthPercent: 200,
        borderGuardStrengthPercent: 100,
      },
      topology: MapTopology.Default,
    };

    const v = singleVariant(generate(settings));
    const zs = zones(v);
    const spawnZone = zs.find(z => z.name.startsWith('Spawn-'))!;
    const neutralZone = zs.find(z => z.name.startsWith('Neutral-'))!;
    const cs = connections(v).filter(c => c.connectionType === 'Direct');

    // neutralStackStrengthMultiplier = 2.0
    // spawn guardMultiplier = round(1.0 * 2.0 * 1000)/1000 = 2.0
    expect(spawnZone.guardMultiplier).toBe(2.0);
    // spawn castle 0 guardValue = floor(5000 * 2.0) = 10000
    // spawn castle 1 guardValue = floor(2500 * 2.0) = 5000
    const spawnGuards = (spawnZone.mainObjects ?? []).map(m => m.guardValue ?? 0);
    expect(spawnGuards).toEqual([10000, 5000]);
    // neutral Medium guardMultiplier = round(1.4 * 2.0 * 1000)/1000 = 2.8
    expect(neutralZone.guardMultiplier).toBeCloseTo(2.8, 5);
    // neutral castle 0 guardValue = floor(8000 * 2.0) = 16000
    // neutral castle 1 guardValue = floor(4000 * 2.0) = 8000
    const neutralGuards = (neutralZone.mainObjects ?? []).map(m => m.guardValue ?? 0);
    expect(neutralGuards).toEqual([16000, 8000]);
    // borderGuardStrengthMultiplier = 1.0 → connection guard = 30000
    expect(cs.every(c => c.guardValue === 30000)).toBe(true);
  });
});

describe('generate — Chain topology', () => {
  it('creates chain connections between sequential zones', () => {
    const settings: GeneratorSettings = {
      ...defaultSettings(),
      playerCount: 2,
      zoneCfg: {
        ...defaultSettings().zoneCfg,
        neutralZoneCount: 2,
      },
      topology: MapTopology.Chain,
      randomPortals: false,
    };

    const v = singleVariant(generate(settings));
    const cs = connections(v).filter(c => c.connectionType === 'Direct');

    // Chain with 4 zones → 3 connections
    expect(cs.length).toBe(3);
    expect(cs.every(c => c.name?.startsWith('Chain-'))).toBe(true);
  });
});

describe('generate — Hub & Spoke topology', () => {
  it('creates hub zone and spoke connections', () => {
    const settings: GeneratorSettings = {
      ...defaultSettings(),
      playerCount: 3,
      zoneCfg: {
        ...defaultSettings().zoneCfg,
        neutralZoneCount: 0,
      },
      topology: MapTopology.HubAndSpoke,
      randomPortals: false,
    };

    const v = singleVariant(generate(settings));
    const zs = zones(v);
    const cs = connections(v);

    expect(zs.some(z => z.name === 'Hub')).toBe(true);
    // 3 players + 1 hub = 4 zones
    expect(zs.length).toBe(4);
    // Hub connections named Hub-{letter}
    const hubConns = cs.filter(c => c.name?.startsWith('Hub-'));
    expect(hubConns.length).toBeGreaterThanOrEqual(3);
  });
});

describe('generate — SharedWeb topology', () => {
  it('references spoke connection names from both endpoint zones', () => {
    const settings: GeneratorSettings = {
      ...defaultSettings(),
      playerCount: 4,
      zoneCfg: {
        ...defaultSettings().zoneCfg,
        neutralZoneCount: 3,
        neutralZoneCastles: 1,
      },
      topology: MapTopology.SharedWeb,
      randomPortals: false,
    };

    const v = singleVariant(generate(settings));
    const zsByName = new Map(zones(v).map(z => [z.name, z]));
    const webConns = connections(v).filter(c => c.name?.startsWith('Web-'));

    expect(webConns.length).toBeGreaterThan(0);
    for (const conn of webConns) {
      const fromZone = zsByName.get(conn.from ?? '');
      const toZone   = zsByName.get(conn.to ?? '');
      expect(fromZone).toBeTruthy();
      expect(toZone).toBeTruthy();
      const fromRoadConns = (fromZone!.roads ?? []).flatMap(r => [r.from?.args?.[0], r.to?.args?.[0]]).filter(Boolean) as string[];
      const toRoadConns   = (toZone!.roads   ?? []).flatMap(r => [r.from?.args?.[0], r.to?.args?.[0]]).filter(Boolean) as string[];
      expect(fromRoadConns.includes(conn.name!) || toRoadConns.includes(conn.name!)).toBe(true);
    }
  });

  it('castleless neutral zones use Connection endpoints for roads', () => {
    const settings: GeneratorSettings = {
      ...defaultSettings(),
      playerCount: 2,
      zoneCfg: {
        ...defaultSettings().zoneCfg,
        neutralZoneCount: 0,
        neutralZoneCastles: 0,
      },
      topology: MapTopology.SharedWeb,
      randomPortals: false,
    };

    const v = singleVariant(generate(settings));
    const neutralZone = zones(v).find(z => z.name.startsWith('Neutral-'))!;

    expect(neutralZone).toBeTruthy();
    expect((neutralZone.mainObjects?.length ?? 0)).toBe(0);
    expect((neutralZone.roads?.length ?? 0)).toBeGreaterThan(0);
    expect(neutralZone.roads!.every(r => r.from?.type === 'Connection' && r.to?.type === 'Connection')).toBe(true);
  });
});

describe('generate — zone layout names', () => {
  it('always produces all four zone layout names', () => {
    const template = generate({ ...defaultSettings(), topology: MapTopology.Default });
    const layoutNames = (template.zoneLayouts ?? []).map(l => l.name);
    expect(layoutNames).toContain('zone_layout_spawns');
    expect(layoutNames).toContain('zone_layout_sides');
    expect(layoutNames).toContain('zone_layout_treasure_zone');
    expect(layoutNames).toContain('zone_layout_center');
  });
});

describe('generate — mandatory content', () => {
  it('creates mandatory content group for each player and neutral zone', () => {
    const settings: GeneratorSettings = {
      ...defaultSettings(),
      playerCount: 2,
      zoneCfg: {
        ...defaultSettings().zoneCfg,
        neutralZoneCount: 3,
      },
      topology: MapTopology.Default,
    };

    const template = generate(settings);
    const mcNames = (template.mandatoryContent ?? []).map(m => m.name);

    expect(mcNames).toContain('mandatory_content_side_A');
    expect(mcNames).toContain('mandatory_content_side_B');
    expect(mcNames).toContain('mandatory_content_neutral_C');
    expect(mcNames).toContain('mandatory_content_neutral_D');
    expect(mcNames).toContain('mandatory_content_neutral_E');
  });
});
