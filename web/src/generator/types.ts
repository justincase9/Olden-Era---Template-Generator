// T009: Generator settings types — port of C# GeneratorSettings + related models

export enum MapTopology {
  Default = 'Default',
  HubAndSpoke = 'HubAndSpoke',
  Chain = 'Chain',
  SharedWeb = 'SharedWeb',
  Random = 'Random',
}

export enum NeutralZoneQuality {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export interface TournamentRules {
  enabled: boolean;
  firstTournamentDay: number;
  interval: number;
  pointsToWin: number;
  saveArmy: boolean;
}

export interface GladiatorArenaRules {
  enabled: boolean;
  daysDelayStart: number;
  countDay: number;
}

export interface GameEndConditions {
  victoryCondition: string;
  lostStartCity: boolean;
  lostStartCityDay: number;
  lostStartHero: boolean;
  cityHold: boolean;
  cityHoldDays: number;
}

export interface HeroSettings {
  heroCountMin: number;
  heroCountMax: number;
  heroCountIncrement: number;
}

export interface AdvancedSettings {
  enabled: boolean;
  neutralLowNoCastleCount: number;
  neutralLowCastleCount: number;
  neutralMediumNoCastleCount: number;
  neutralMediumCastleCount: number;
  neutralHighNoCastleCount: number;
  neutralHighCastleCount: number;
  playerZoneSize: number;
  neutralZoneSize: number;
  guardRandomization: number;
}

export interface ZoneConfiguration {
  neutralZoneCount: number;
  playerZoneCastles: number;
  neutralZoneCastles: number;
  resourceDensityPercent: number;
  structureDensityPercent: number;
  neutralStackStrengthPercent: number;
  borderGuardStrengthPercent: number;
  hubZoneSize: number;
  hubZoneCastles: number;
  advanced: AdvancedSettings;
}

export enum BonusPresetType {
  TownPortalFree = 0,
  Spell = 1,
  UnitMultiplier = 2,
  MovementBonus = 3,
  StartingItem = 4,
  StartingGold = 5,
  StartingGems = 6,
  StartingCrystals = 7,
  StartingMercury = 8,
}

export interface BonusEntry {
  presetType: BonusPresetType;
  receiverFilter: string;
  param: string;
  param2: string;
}

export interface ContentItem {
  name?: string | null;
  sid?: string | null;
  variant?: number | null;
  isGuarded?: boolean | null;
  isMine?: boolean | null;
  soloEncounter?: boolean | null;
  includeLists?: string[] | null;
  rules?: ContentPlacementRule[] | null;
}

export interface ContentPlacementRule {
  type?: string | null;
  args?: string[] | null;
  targetMin?: number | null;
  targetMax?: number | null;
  weight?: number | null;
}

export interface GeneratorSettings {
  templateName: string;
  gameMode: string;
  playerCount: number;
  mapSize: number;
  heroSettings: HeroSettings;
  noDirectPlayerConnections: boolean;
  randomPortals: boolean;
  maxPortalConnections: number;
  spawnRemoteFootholds: boolean;
  generateRoads: boolean;
  experimentalBalancedZonePlacement: boolean;
  matchPlayerCastleFactions: boolean;
  minNeutralZonesBetweenPlayers: number;
  topology: MapTopology;
  zoneCfg: ZoneConfiguration;
  factionLawsExpPercent: number;
  astrologyExpPercent: number;
  bannedItems: string;
  bannedMagics: string;
  valueOverridesText: string;
  bonuses: BonusEntry[];
  playerZoneMandatoryContent: ContentItem[];
  gameEndConditions: GameEndConditions;
  gladiatorArenaRules: GladiatorArenaRules;
  tournamentRules: TournamentRules;
}

export function defaultSettings(): GeneratorSettings {
  return {
    templateName: 'Custom Template',
    gameMode: 'Classic',
    playerCount: 2,
    mapSize: 160,
    heroSettings: { heroCountMin: 4, heroCountMax: 8, heroCountIncrement: 1 },
    noDirectPlayerConnections: false,
    randomPortals: false,
    maxPortalConnections: 32,
    spawnRemoteFootholds: true,
    generateRoads: true,
    experimentalBalancedZonePlacement: true,
    matchPlayerCastleFactions: false,
    minNeutralZonesBetweenPlayers: 0,
    topology: MapTopology.Random,
    zoneCfg: {
      neutralZoneCount: 0,
      playerZoneCastles: 1,
      neutralZoneCastles: 1,
      resourceDensityPercent: 100,
      structureDensityPercent: 100,
      neutralStackStrengthPercent: 100,
      borderGuardStrengthPercent: 100,
      hubZoneSize: 1.0,
      hubZoneCastles: 0,
      advanced: {
        enabled: false,
        neutralLowNoCastleCount: 0,
        neutralLowCastleCount: 0,
        neutralMediumNoCastleCount: 0,
        neutralMediumCastleCount: 0,
        neutralHighNoCastleCount: 0,
        neutralHighCastleCount: 0,
        playerZoneSize: 1.0,
        neutralZoneSize: 1.0,
        guardRandomization: 0.05,
      },
    },
    factionLawsExpPercent: 100,
    astrologyExpPercent: 100,
    bannedItems: '',
    bannedMagics: '',
    valueOverridesText: '',
    bonuses: [],
    playerZoneMandatoryContent: [],
    gameEndConditions: {
      victoryCondition: 'win_condition_1',
      lostStartCity: false,
      lostStartCityDay: 3,
      lostStartHero: false,
      cityHold: false,
      cityHoldDays: 6,
    },
    gladiatorArenaRules: { enabled: false, daysDelayStart: 30, countDay: 3 },
    tournamentRules: {
      enabled: false,
      firstTournamentDay: 14,
      interval: 7,
      pointsToWin: 2,
      saveArmy: true,
    },
  };
}
