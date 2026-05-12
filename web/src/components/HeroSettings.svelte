<script lang="ts">
  import { settings } from '../state/settings.svelte.ts';
</script>

<section class="section-card">
  <h2 class="section-header">Hero Settings</h2>

  <label>
    <span class="label-top-row"><span>Initial hero cap</span><span class="slider-val">{settings.heroSettings.heroCountMin}</span></span>
    <input type="range" min="1" max="12" bind:value={settings.heroSettings.heroCountMin} />
  </label>

  <label>
    <span class="label-top-row"><span>Max hero cap</span><span class="slider-val">{settings.heroSettings.heroCountMax}</span></span>
    <input type="range" min="1" max="12" bind:value={settings.heroSettings.heroCountMax} />
  </label>

  <label>
    <span class="label-top-row"><span>Increase cap / castle</span><span class="slider-val">{settings.heroSettings.heroCountIncrement}</span></span>
    <input type="range" min="0" max="10" bind:value={settings.heroSettings.heroCountIncrement} />
  </label>
</section>
