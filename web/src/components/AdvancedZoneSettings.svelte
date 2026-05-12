<script lang="ts">
  import { settings } from '../state/settings.svelte.ts';

  const maxNeutral = $derived(32 - settings.playerCount);

  const totalNeutral = $derived(
    settings.zoneCfg.advanced.neutralLowNoCastleCount +
    settings.zoneCfg.advanced.neutralLowCastleCount +
    settings.zoneCfg.advanced.neutralMediumNoCastleCount +
    settings.zoneCfg.advanced.neutralMediumCastleCount +
    settings.zoneCfg.advanced.neutralHighNoCastleCount +
    settings.zoneCfg.advanced.neutralHighCastleCount
  );

  const tooMany = $derived(totalNeutral > maxNeutral);
</script>

<div class="advanced-zones">
  {#if tooMany}
    <p class="error-msg">Total neutral zones ({totalNeutral}) exceeds limit ({maxNeutral})</p>
  {/if}

  <fieldset>
    <legend>Low Quality Zones</legend>
    <label>
      <span class="label-top-row"><span>No-Castle Count</span><span class="slider-val">{settings.zoneCfg.advanced.neutralLowNoCastleCount}</span></span>
      <input type="range" min="0" max={maxNeutral} bind:value={settings.zoneCfg.advanced.neutralLowNoCastleCount} />
    </label>
    <label>
      <span class="label-top-row"><span>Castle Count</span><span class="slider-val">{settings.zoneCfg.advanced.neutralLowCastleCount}</span></span>
      <input type="range" min="0" max={maxNeutral} bind:value={settings.zoneCfg.advanced.neutralLowCastleCount} />
    </label>
  </fieldset>

  <fieldset>
    <legend>Medium Quality Zones</legend>
    <label>
      <span class="label-top-row"><span>No-Castle Count</span><span class="slider-val">{settings.zoneCfg.advanced.neutralMediumNoCastleCount}</span></span>
      <input type="range" min="0" max={maxNeutral} bind:value={settings.zoneCfg.advanced.neutralMediumNoCastleCount} />
    </label>
    <label>
      <span class="label-top-row"><span>Castle Count</span><span class="slider-val">{settings.zoneCfg.advanced.neutralMediumCastleCount}</span></span>
      <input type="range" min="0" max={maxNeutral} bind:value={settings.zoneCfg.advanced.neutralMediumCastleCount} />
    </label>
  </fieldset>

  <fieldset>
    <legend>High Quality Zones</legend>
    <label>
      <span class="label-top-row"><span>No-Castle Count</span><span class="slider-val">{settings.zoneCfg.advanced.neutralHighNoCastleCount}</span></span>
      <input type="range" min="0" max={maxNeutral} bind:value={settings.zoneCfg.advanced.neutralHighNoCastleCount} />
    </label>
    <label>
      <span class="label-top-row"><span>Castle Count</span><span class="slider-val">{settings.zoneCfg.advanced.neutralHighCastleCount}</span></span>
      <input type="range" min="0" max={maxNeutral} bind:value={settings.zoneCfg.advanced.neutralHighCastleCount} />
    </label>
  </fieldset>

  <label>
    <span class="label-top-row"><span>Player Zone Size</span><span class="slider-val">{settings.zoneCfg.advanced.playerZoneSize.toFixed(2)}</span></span>
    <input type="range" min="10" max="200" bind:value={settings.zoneCfg.advanced.playerZoneSize}
      oninput={(e) => { settings.zoneCfg.advanced.playerZoneSize = +(+e.currentTarget.value / 100).toFixed(2); }} />
  </label>

  <label>
    <span class="label-top-row"><span>Neutral Zone Size</span><span class="slider-val">{settings.zoneCfg.advanced.neutralZoneSize.toFixed(2)}</span></span>
    <input type="range" min="10" max="200" bind:value={settings.zoneCfg.advanced.neutralZoneSize}
      oninput={(e) => { settings.zoneCfg.advanced.neutralZoneSize = +(+e.currentTarget.value / 100).toFixed(2); }} />
  </label>

  <label>
    <span class="label-top-row"><span>Guard Randomization</span><span class="slider-val">{(settings.zoneCfg.advanced.guardRandomization * 100).toFixed(0)}%</span></span>
    <input type="range" min="0" max="50" bind:value={settings.zoneCfg.advanced.guardRandomization}
      oninput={(e) => { settings.zoneCfg.advanced.guardRandomization = +(+e.currentTarget.value / 100).toFixed(2); }} />
  </label>
</div>
