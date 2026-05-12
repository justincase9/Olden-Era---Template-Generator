<script lang="ts">
  import { settings } from '../state/settings.svelte.ts';
</script>

<section class="section-card">
  <h2 class="section-header">Win Conditions</h2>

  <label>
    Victory Condition
    <select bind:value={settings.gameEndConditions.victoryCondition}>
      <option value="win_condition_1">Defeat All Enemies (Classic)</option>
      <option value="win_condition_3">Lost Starting City</option>
      <option value="win_condition_4">Gladiator Arena</option>
      <option value="win_condition_5">City Hold</option>
      <option value="win_condition_6">Tournament</option>
    </select>
  </label>

  <label class="checkbox-row">
    <input type="checkbox" bind:checked={settings.gameEndConditions.lostStartCity} />
    Lose on Starting City Lost
  </label>

  {#if settings.gameEndConditions.lostStartCity}
    <label>
      <span class="label-top-row"><span>Day</span><span class="slider-val">Day {settings.gameEndConditions.lostStartCityDay}</span></span>
      <input type="range" min="1" max="30" bind:value={settings.gameEndConditions.lostStartCityDay} />
    </label>
  {/if}

  <label class="checkbox-row">
    <input type="checkbox" bind:checked={settings.gameEndConditions.lostStartHero} />
    Lose on Starting Hero Lost
  </label>

  <label class="checkbox-row">
    <input type="checkbox" bind:checked={settings.gameEndConditions.cityHold} />
    City Hold Win Condition
  </label>

  {#if settings.gameEndConditions.cityHold}
    <label>
      <span class="label-top-row"><span>Hold Duration</span><span class="slider-val">{settings.gameEndConditions.cityHoldDays}d</span></span>
      <input type="range" min="1" max="30" bind:value={settings.gameEndConditions.cityHoldDays} />
    </label>
  {/if}
</section>
