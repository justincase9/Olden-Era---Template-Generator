<script lang="ts">
  import { settings } from '../state/settings.svelte.ts';
</script>

<section class="section-card">
  <h2 class="section-header">Connections &amp; Objects</h2>

  <label class="checkbox-row">
    <input type="checkbox" bind:checked={settings.randomPortals} />
    Random Portals
  </label>

  {#if settings.randomPortals}
    <label>
      Max Portal Connections
      <input type="number" min="1" max="64" bind:value={settings.maxPortalConnections} />
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
