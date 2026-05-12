// T010: Output model types — port of C# Models/Unfrozen/*.cs

export interface RmgTemplate {
  name: string;
  gameMode?: string | null;
  description?: string | null;
  displayWinCondition?: string | null;
  sizeX: number;
  sizeZ: number;
  gameRules?: GameRules | null;
  valueOverrides?: ValueOverride[] | null;
  globalBans?: GlobalBans | null;
  variants?: Variant[] | null;
  zoneLayouts?: ZoneLayout[] | null;
  mandatoryContent?: MandatoryContentGroup[] | null;
  contentCountLimits?: ContentCountLimit[] | null;
  contentPools?: unknown[];
  contentLists?: unknown[];
}

export interface GameRules {
  heroCountMin?: number | null;
  heroCountMax?: number | null;
  heroCountIncrement?: number | null;
  heroHireBan?: boolean | null;
  encounterHoles?: boolean | null;
  factionLawsExpModifier?: number | null;
  astrologyExpModifier?: number | null;
  bonuses?: Bonus[] | null;
  winConditions?: WinConditions | null;
}

export interface Bonus {
  sid: string;
  receiverSide?: number | null;
  receiverFilter?: string | null;
  parameters?: string[] | null;
}

export interface WinConditions {
  classic?: boolean | null;
  desertion?: boolean | null;
  desertionDay?: number | null;
  desertionValue?: number | null;
  heroLighting?: boolean | null;
  heroLightingDay?: number | null;
  lostStartCity?: boolean | null;
  lostStartCityDay?: number | null;
  lostStartHero?: boolean | null;
  cityHold?: boolean | null;
  cityHoldDays?: number | null;
  gladiatorArena?: boolean | null;
  gladiatorArenaRegistrationStartWork?: boolean | null;
  gladiatorArenaRegistrationStartFight?: boolean | null;
  gladiatorArenaDaysDelayStart?: number | null;
  gladiatorArenaCountDay?: number | null;
  championSelectRule?: string | null;
  tournament?: boolean | null;
  tournamentDays?: number[] | null;
  tournamentAnnounceDays?: number[] | null;
  tournamentPointsToWin?: number | null;
  tournamentSaveArmy?: boolean | null;
}

export interface ValueOverride {
  sid?: string | null;
  variant?: number | null;
  guardValue?: number | null;
}

export interface GlobalBans {
  items?: string[] | null;
  magics?: string[] | null;
}

export interface Variant {
  orientation?: Orientation | null;
  border?: Border | null;
  zones?: Zone[] | null;
  connections?: Connection[] | null;
}

export interface Orientation {
  zeroAngleZone?: string | null;
  baseAngleMin?: number | null;
  baseAngleMax?: number | null;
  randomAngleAmplitude?: number | null;
  randomAngleStep?: number | null;
}

export interface Border {
  cornerRadius?: number | null;
  obstaclesWidth?: number | null;
  obstaclesNoise?: NoiseEntry[] | null;
  waterWidth?: number | null;
  waterNoise?: NoiseEntry[] | null;
  waterType?: string | null;
}

export interface NoiseEntry {
  amp?: number | null;
  freq?: number | null;
}

export interface Zone {
  name: string;
  /** Not serialised — preview hint only */
  generatorPosition?: { x: number; y: number } | null;
  size?: number | null;
  layout?: string | null;
  guardCutoffValue?: number | null;
  guardRandomization?: number | null;
  guardMultiplier?: number | null;
  guardWeeklyIncrement?: number | null;
  guardReactionDistribution?: number[] | null;
  diplomacyModifier?: number | null;
  encounterHolesSettings?: EncounterHolesSettings | null;
  guardedContentPool?: string[] | null;
  unguardedContentPool?: string[] | null;
  resourcesContentPool?: string[] | null;
  mandatoryContent?: string[] | null;
  contentCountLimits?: string[] | null;
  guardedContentValue?: number | null;
  guardedContentValuePerArea?: number | null;
  unguardedContentValue?: number | null;
  unguardedContentValuePerArea?: number | null;
  resourcesValue?: number | null;
  resourcesValuePerArea?: number | null;
  mainObjects?: MainObject[] | null;
  zoneBiome?: BiomeSelector | null;
  contentBiome?: BiomeSelector | null;
  metaObjectsBiome?: BiomeSelector | null;
  crossroadsPosition?: number | null;
  roads?: Road[] | null;
}

export interface EncounterHolesSettings {
  affectedEncounters?: number | null;
  twoHoleEncounters?: number | null;
}

export interface BiomeSelector {
  type?: string | null;
  args?: string[] | null;
}

export interface MainObject {
  type: string;
  spawn?: string | null;
  guardChance?: number | null;
  guardValue?: number | null;
  guardWeeklyIncrement?: number | null;
  removeGuardIfHasOwner?: boolean | null;
  buildingsConstructionSid?: string | null;
  faction?: TypedSelector | null;
  placement?: string | null;
  placementArgs?: string[] | null;
  holdCityWinCon?: boolean | null;
}

export interface TypedSelector {
  type?: string | null;
  args?: string[] | null;
}

export interface Road {
  from?: RoadEndpoint | null;
  to?: RoadEndpoint | null;
}

export interface RoadEndpoint {
  type?: string | null;
  args?: string[] | null;
}

export interface Connection {
  name?: string | null;
  from?: string | null;
  to?: string | null;
  connectionType?: string | null;
  guardZone?: string | null;
  guardEscape?: boolean | null;
  simTurnSquad?: boolean | null;
  guardValue?: number | null;
  guardWeeklyIncrement?: number | null;
  guardMatchGroup?: string | null;
  portalPlacementRulesFrom?: ContentPlacementRuleModel[] | null;
  portalPlacementRulesTo?: ContentPlacementRuleModel[] | null;
  road?: boolean | null;
}

export interface ContentPlacementRuleModel {
  type?: string | null;
  args?: string[] | null;
  targetMin?: number | null;
  targetMax?: number | null;
  weight?: number | null;
}

export interface ZoneLayout {
  name: string;
  obstaclesFill?: number | null;
  obstaclesFillVoid?: number | null;
  lakesFill?: number | null;
  minLakeArea?: number | null;
  elevationClusterScale?: number | null;
  elevationModes?: ElevationMode[] | null;
  roadClusterArea?: number | null;
  guardedEncounterResourceFractions?: GuardedEncounterResourceFractions | null;
  ambientPickupDistribution?: AmbientPickupDistribution | null;
}

export interface ElevationMode {
  weight?: number | null;
  minElevatedFraction?: number | null;
  maxElevatedFraction?: number | null;
}

export interface GuardedEncounterResourceFractions {
  countBounds?: number[] | null;
  fractions?: number[] | null;
}

export interface AmbientPickupDistribution {
  repulsion?: number | null;
  noise?: number | null;
  roadAttraction?: number | null;
  obstacleAttraction?: number | null;
  groupSizeWeights?: number[] | null;
}

export interface MandatoryContentGroup {
  name: string;
  content?: MandatoryContentItem[] | null;
}

export interface MandatoryContentItem {
  name?: string | null;
  sid?: string | null;
  variant?: number | null;
  isGuarded?: boolean | null;
  isMine?: boolean | null;
  soloEncounter?: boolean | null;
  includeLists?: string[] | null;
  rules?: ContentPlacementRuleModel[] | null;
}

export interface ContentCountLimit {
  name: string;
  playerMin?: number | null;
  playerMax?: number | null;
  limits?: ContentSidLimit[] | null;
}

export interface ContentSidLimit {
  sid: string;
  maxCount: number;
}
