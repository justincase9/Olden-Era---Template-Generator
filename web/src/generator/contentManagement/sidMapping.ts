// T015: SID mapping — port of C# ContentIds and IncludeListIds

export interface SidMapping {
  sid: string;
  name: string;
}

export const ContentIds = {
  AlchemyLab:           { sid: 'alchemy_lab',            name: "Alchemy Lab" },
  Arena:                { sid: 'arena',                   name: "Arena" },
  BeerFountain:         { sid: 'beer_fountain',           name: "Beer Fountain" },
  BorealCall:           { sid: 'boreal_call',             name: "Boreal Call" },
  CelestialSphere:      { sid: 'celestial_sphere',        name: "Celestial Sphere" },
  Chimerologist:        { sid: 'chimerologist',           name: "Chimerologist" },
  Circus:               { sid: 'circus',                  name: "Circus" },
  CollegeOfWonder:      { sid: 'college_of_wonder',       name: "College Of Wonder" },
  CrystalTrail:         { sid: 'crystal_trail',           name: "Crystal Trail" },
  DragonUtopia:         { sid: 'dragon_utopia',           name: "Dragon Utopia" },
  EternalDragon:        { sid: 'eternal_dragon',          name: "Eternal Dragon" },
  FickleShrine:         { sid: 'fickle_shrine',           name: "Fickle Shrine" },
  FlatteringMirror:     { sid: 'flattering_mirror',       name: "Flattering Mirror" },
  Forge:                { sid: 'forge',                   name: "Forge" },
  Fort:                 { sid: 'fort',                    name: "Fort" },
  Fountain:             { sid: 'fountain',                name: "Fountain" },
  Fountain2:            { sid: 'fountain_2',              name: "Fountain 2" },
  HuntsmansCamp:        { sid: 'huntsmans_camp',          name: "Huntsman's Camp" },
  InfernalCirque:       { sid: 'infernal_cirque',         name: "Infernal Cirque" },
  InsarasEye:           { sid: 'insaras_eye',             name: "Insara's Eye" },
  JoustingRange:        { sid: 'jousting_range',          name: "Jousting Range" },
  ManaWell:             { sid: 'mana_well',               name: "Mana Well" },
  Market:               { sid: 'market',                  name: "Market" },
  MineCrystals:         { sid: 'mine_crystals',           name: "Mine Crystals" },
  MineGemstones:        { sid: 'mine_gemstones',          name: "Mine Gemstones" },
  MineGold:             { sid: 'mine_gold',               name: "Mine Gold" },
  MineMercury:          { sid: 'mine_mercury',            name: "Mine Mercury" },
  MineOre:              { sid: 'mine_ore',                name: "Mine Ore" },
  MineWood:             { sid: 'mine_wood',               name: "Mine Wood" },
  Mirage:               { sid: 'mirage',                  name: "Mirage" },
  MontyHall:            { sid: 'monty_hall',              name: "Monty Hall" },
  MysteriousStone:      { sid: 'mysterious_stone',        name: "Mysterious Stone" },
  MysticalTower:        { sid: 'mystical_tower',          name: "Mystical Tower" },
  MythicScrollBox:      { sid: 'mythic_scroll_box',       name: "Mythic Scroll Box" },
  OrbObservatory:       { sid: 'orb_observatory',         name: "Orb Observatory" },
  PandoraBox:           { sid: 'pandora_box',             name: "Pandora Box" },
  PetrifiedMemorial:    { sid: 'petrified_memorial',      name: "Petrified Memorial" },
  PileOfBooks:          { sid: 'pile_of_books',           name: "Pile Of Books" },
  PointOfBalance:       { sid: 'point_of_balance',        name: "Point Of Balance" },
  Prison:               { sid: 'prison',                  name: "Prison" },
  QuixsPath:            { sid: 'quixs_path',              name: "Quix's Path" },
  RandomHire1:          { sid: 'random_hire_1',           name: "Random Hire 1" },
  RandomHire2:          { sid: 'random_hire_2',           name: "Random Hire 2" },
  RandomHire3:          { sid: 'random_hire_3',           name: "Random Hire 3" },
  RandomHire4:          { sid: 'random_hire_4',           name: "Random Hire 4" },
  RandomHire5:          { sid: 'random_hire_5',           name: "Random Hire 5" },
  RandomHire6:          { sid: 'random_hire_6',           name: "Random Hire 6" },
  RandomHire7:          { sid: 'random_hire_7',           name: "Random Hire 7" },
  RandomItemCommon:     { sid: 'random_item_common',      name: "Random Item Common" },
  RandomItemEpic:       { sid: 'random_item_epic',        name: "Random Item Epic" },
  RandomItemLegendary:  { sid: 'random_item_legendary',   name: "Random Item Legendary" },
  RandomItemRare:       { sid: 'random_item_rare',        name: "Random Item Rare" },
  RemoteFoothold:       { sid: 'remote_foothold',         name: "Remote Foothold" },
  ResearchLaboratory:   { sid: 'research_laboratory',     name: "Research Laboratory" },
  RitualPyre:           { sid: 'ritual_pyre',             name: "Ritual Pyre" },
  SacrificialShrine:    { sid: 'sacrificial_shrine',      name: "Sacrificial Shrine" },
  ShadyDen:             { sid: 'shady_den',               name: "Shady Den" },
  Stables:              { sid: 'stables',                 name: "Stables" },
  Tavern:               { sid: 'tavern',                  name: "Tavern" },
  TearOfTruth:          { sid: 'tear_of_truth',           name: "Tear Of Truth" },
  TheGorge:             { sid: 'the_gorge',               name: "The Gorge" },
  TownGate:             { sid: 'town_gate',               name: "Town Gate" },
  TreeOfAbundance:      { sid: 'tree_of_abundance',       name: "Tree Of Abundance" },
  TroglodyteThrone:     { sid: 'troglodyte_throne',       name: "Troglodyte Throne" },
  UnforgottenGrave:     { sid: 'unforgotten_grave',       name: "Unforgotten Grave" },
  University:           { sid: 'university',              name: "University" },
  UnstableRuins:        { sid: 'unstable_ruins',          name: "Unstable Ruins" },
  Watchtower:           { sid: 'watchtower',              name: "Watchtower" },
  WindRose:             { sid: 'wind_rose',               name: "Wind Rose" },
  WiseOwl:              { sid: 'wise_owl',                name: "Wise Owl" },
} as const satisfies Record<string, SidMapping>;

export const IncludeListIds = {
  RandomHiresLowTier:  { sid: 'content_list_building_random_hires_low_tier',                    name: "Random Hires Low Tier" },
  RandomHiresHighTier: { sid: 'content_list_building_random_hires_high_tier',                   name: "Random Hires High Tier" },
  RandomHiresAllTier:  { sid: 'basic_content_list_building_random_hires',                       name: "Random Hires All Tier" },
  ResourceBanksTier1:  { sid: 'basic_content_list_building_guarded_resource_banks_tier_1',      name: "Resource Banks T1" },
  ResourceBanksTier2:  { sid: 'basic_content_list_building_guarded_resource_banks_tier_2',      name: "Resource Banks T2" },
} as const satisfies Record<string, SidMapping>;

/** All known content SIDs (union of ContentIds + IncludeListIds) */
export const GlobalContentList: SidMapping[] = [
  ...Object.values(ContentIds),
  ...Object.values(IncludeListIds),
];

export function getBySid(sid: string): SidMapping | undefined {
  return GlobalContentList.find(m => m.sid === sid);
}

export function getByName(name: string): SidMapping | undefined {
  return GlobalContentList.find(m => m.name.toLowerCase() === name.toLowerCase());
}
