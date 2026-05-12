<script lang="ts">
  import { settings } from '../state/settings.svelte.ts';

  import AdvancedZoneSettings from './AdvancedZoneSettings.svelte';
</script>

<section class="section-card">
  <h2 class="section-header">Zone Settings</h2>

  <label>
    <span class="label-top-row"><span>Castles per Player Zone</span><span class="slider-val">{settings.zoneCfg.playerZoneCastles}</span></span>
    <input type="range" min="0" max="4" bind:value={settings.zoneCfg.playerZoneCastles} />
  </label>

  {#if !settings.zoneCfg.advanced.enabled}
    <label>
      <span class="label-top-row"><span>Neutral Zone Count</span><span class="slider-val">{settings.zoneCfg.neutralZoneCount}</span></span>
      <input type="range" min="0" max="30" bind:value={settings.zoneCfg.neutralZoneCount} />
    </label>
    <label>
      <span class="label-top-row"><span>Castles per Neutral Zone</span><span class="slider-val">{settings.zoneCfg.neutralZoneCastles}</span></span>
      <input type="range" min="0" max="4" bind:value={settings.zoneCfg.neutralZoneCastles} />
    </label>
  {/if}

  <label>
    <span class="label-top-row"><span>Resource Density</span><span class="slider-val">{settings.zoneCfg.resourceDensityPercent}%</span></span>
    <input type="range" min="25" max="200" bind:value={settings.zoneCfg.resourceDensityPercent} />
  </label>

  <label>
    <span class="label-top-row"><span>Structure Density</span><span class="slider-val">{settings.zoneCfg.structureDensityPercent}%</span></span>
    <input type="range" min="25" max="200" bind:value={settings.zoneCfg.structureDensityPercent} />
  </label>

  <label>
    <span class="label-top-row"><span>Neutral Stack Strength</span><span class="slider-val">{settings.zoneCfg.neutralStackStrengthPercent}%</span></span>
    <input type="range" min="25" max="200" bind:value={settings.zoneCfg.neutralStackStrengthPercent} />
  </label>

  <label>
    <span class="label-top-row"><span>Border Guard Strength</span><span class="slider-val">{settings.zoneCfg.borderGuardStrengthPercent}%</span></span>
    <input type="range" min="25" max="200" bind:value={settings.zoneCfg.borderGuardStrengthPercent} />
  </label>

  <label class="checkbox-row">
    <input type="checkbox" bind:checked={settings.zoneCfg.advanced.enabled} />
    Advanced zone settings
  </label>

  {#if settings.zoneCfg.advanced.enabled}
    <AdvancedZoneSettings />
  {/if}
</section>
