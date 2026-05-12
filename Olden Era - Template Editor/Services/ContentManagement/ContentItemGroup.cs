namespace OldenEraTemplateEditor.Services.ContentManagement
{
public static class ContentItemGroup
{
    /* ContentIds of mines */
    public static readonly List<SidMapping> Mines = new() { 
        ContentIds.MineWood, 
        ContentIds.MineOre, 
        ContentIds.MineGold,
        ContentIds.MineMercury,
        ContentIds.MineCrystals,
        ContentIds.MineGemstones,
        ContentIds.AlchemyLab,
        IncludeListIds.RareMinesByBiome,
        IncludeListIds.RareMinesAny,
    };
    /* ContentIds of treasures / loot */
    public static readonly List<SidMapping> Treasures = new() {
        ContentIds.MythicScrollBox,
        ContentIds.PandoraBox,
        ContentIds.RandomItemCommon,
        ContentIds.RandomItemEpic,
        ContentIds.RandomItemLegendary,
        IncludeListIds.PandoraArmyLow,
        IncludeListIds.PandoraArmyHigh,
        IncludeListIds.RandomItems,
        IncludeListIds.MythicScrollBox,
    };
    /* Random hire buildings matching the player faction */
    public static readonly List<SidMapping> HireBuildings = new()
    {
        ContentIds.RandomHire1,
        ContentIds.RandomHire2,
        ContentIds.RandomHire3,
        ContentIds.RandomHire4,
        ContentIds.RandomHire5,
        ContentIds.RandomHire6,
        ContentIds.RandomHire7,
        IncludeListIds.RandomHiresLowTier,
        IncludeListIds.RandomHiresHighTier,
        IncludeListIds.RandomHiresAllTier
    };
    /* Resource and unit banks */
    public static readonly List<SidMapping> ResourceBanks = new()
    {
        IncludeListIds.ResourceBanksTier1,
        IncludeListIds.ResourceBanksTier2,
        IncludeListIds.ResourceBanksTier3,
        IncludeListIds.UnitBanksBiomeRestricted,
        IncludeListIds.UnitBanksNoRestriction,
        IncludeListIds.EpicBanks,
        IncludeListIds.Utopias,
    };
    /* Utility / buff / stat / magic buildings */
    public static readonly List<SidMapping> Buildings = new()
    {
        ContentIds.Market,
        ContentIds.ManaWell,
        ContentIds.Watchtower,
        ContentIds.WindRose,
        ContentIds.Fountain,
        ContentIds.Fountain2,
        ContentIds.BeerFountain,
        ContentIds.Stables,
        ContentIds.Forge,
        ContentIds.Tavern,
        ContentIds.QuixsPath,
        ContentIds.CrystalTrail,
        ContentIds.MysteriousStone,
        IncludeListIds.VisionBuildingsTier1,
        IncludeListIds.HeroBuffBuildingsTier1,
        IncludeListIds.HeroStatsTier1,
        IncludeListIds.HeroStatsTier2,
        IncludeListIds.HeroStatsTier3,
        IncludeListIds.MagicBuildingsTier1,
        IncludeListIds.MagicBuildingsTier2,
    };
}

}