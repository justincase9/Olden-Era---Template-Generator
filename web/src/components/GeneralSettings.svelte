<script lang="ts">
  import { settings } from '../state/settings.svelte.ts';

  const MAP_SIZES = [72, 96, 120, 144, 160, 180, 192, 216, 240, 288, 300, 312];
  const EXPERIMENTAL_SIZES = [324, 360, 400, 432, 480];

  let showExperimental = $state(false);
  const allSizes = $derived(showExperimental ? [...MAP_SIZES, ...EXPERIMENTAL_SIZES] : MAP_SIZES);
</script>

<section class="section-card">
  <h2 class="section-header">General Settings</h2>

  <label>
    Template Name
    <input type="text" bind:value={settings.templateName} />
  </label>

  <label>
    Game Mode
    <select bind:value={settings.gameMode}>
      <option value="Classic">Classic</option>
      <option value="Tournament">Tournament</option>
    </select>
  </label>

  <label>
    Players
    <select bind:value={settings.playerCount}>
      {#each [2, 3, 4, 5, 6, 7, 8] as n (n)}
        <option value={n}>{n}</option>
      {/each}
    </select>
  </label>

  <label>
    Map Size
    <select bind:value={settings.mapSize}>
      {#each allSizes as size (size)}
        <option value={size}>{size}×{size}</option>
      {/each}
    </select>
  </label>

  <label class="checkbox-row">
    <input type="checkbox" bind:checked={showExperimental} />
    Show experimental sizes <span class="experimental-label">[EXPERIMENTAL]</span>
  </label>

  <label class="checkbox-row">
    <input type="checkbox" bind:checked={settings.matchPlayerCastleFactions} />
    Match player castle factions
  </label>
</section>
