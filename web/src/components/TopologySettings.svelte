<script lang="ts">
  import { settings } from '../state/settings.svelte.ts';
  import { MapTopology } from '../generator/types.ts';

  const isHubAndSpoke = $derived(settings.topology === MapTopology.HubAndSpoke);
  const isRandom      = $derived(settings.topology === MapTopology.Random);
</script>

<section class="section-card">
  <h2 class="section-header">Topology</h2>

  <label>
    Layout
    <select bind:value={settings.topology}>
      <option value={MapTopology.Default}>Ring</option>
      <option value={MapTopology.Random}>Random</option>
      <option value={MapTopology.Chain}>Chain</option>
      <option value={MapTopology.HubAndSpoke}>Hub & Spoke</option>
      <option value={MapTopology.SharedWeb}>Shared Web</option>
    </select>
  </label>

  {#if isHubAndSpoke}
    <label>
      <span class="label-top-row"><span>Hub Zone Size</span><span class="slider-val">{settings.zoneCfg.hubZoneSize.toFixed(1)}</span></span>
      <input type="range" min="1" max="20" bind:value={settings.zoneCfg.hubZoneSize}
        oninput={(e) => { settings.zoneCfg.hubZoneSize = +(+e.currentTarget.value / 10).toFixed(1); }} />
    </label>
    <label>
      <span class="label-top-row"><span>Hub Zone Castles</span><span class="slider-val">{settings.zoneCfg.hubZoneCastles}</span></span>
      <input type="range" min="0" max="4" bind:value={settings.zoneCfg.hubZoneCastles} />
    </label>
  {/if}

  <label class="checkbox-row">
    <input type="checkbox" bind:checked={settings.noDirectPlayerConnections} />
    Connect via neutral zones only, if possible
  </label>

  <label>
    <span class="label-top-row"><span>Min Neutrals Between Players</span><span class="slider-val">{settings.minNeutralZonesBetweenPlayers}</span></span>
    <input type="range" min="0" max="8" bind:value={settings.minNeutralZonesBetweenPlayers} />
  </label>

  <label class="checkbox-row">
    <input type="checkbox" bind:checked={settings.experimentalBalancedZonePlacement} />
    Balanced zone placement <span class="experimental-label">[EXPERIMENTAL]</span>
  </label>

  <hr class="section-divider" />

  <label class="checkbox-row">
    <input type="checkbox" bind:checked={settings.randomPortals} />
    Random Portals
  </label>

  {#if settings.randomPortals}
    <label>
      <span class="label-top-row"><span>Max Portal Connections</span><span class="slider-val">{settings.maxPortalConnections}</span></span>
      <input type="range" min="1" max="64" bind:value={settings.maxPortalConnections} />
    </label>
  {/if}

  <label class="checkbox-row">
    <input type="checkbox" bind:checked={settings.spawnRemoteFootholds} />
    Spawn Remote Footholds
  </label>

  <label class="checkbox-row">
    <input type="checkbox" bind:checked={settings.generateRoads} />
    Generate Roads
  </label>
</section>
