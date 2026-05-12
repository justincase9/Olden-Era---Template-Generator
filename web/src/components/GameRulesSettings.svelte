<script lang="ts">
  import { settings } from '../state/settings.svelte.ts';
</script>

<section class="section-card">
  <h2 class="section-header">Game Rules</h2>

  <label>
    <span class="label-top-row"><span>Faction Laws XP</span><span class="slider-val">{settings.factionLawsExpPercent}%</span></span>
    <input type="range" min="0" max="500" bind:value={settings.factionLawsExpPercent} />
  </label>

  <label>
    <span class="label-top-row"><span>Astrology XP</span><span class="slider-val">{settings.astrologyExpPercent}%</span></span>
    <input type="range" min="0" max="500" bind:value={settings.astrologyExpPercent} />
  </label>

  <label class="checkbox-row">
    <input type="checkbox" bind:checked={settings.tournamentRules.enabled} />
    Tournament Mode
  </label>

  {#if settings.tournamentRules.enabled}
    <label>
      <span class="label-top-row"><span>First Tournament Day</span><span class="slider-val">Day {settings.tournamentRules.firstTournamentDay}</span></span>
      <input type="range" min="3" max="60" bind:value={settings.tournamentRules.firstTournamentDay} />
    </label>
    <label>
      <span class="label-top-row"><span>Interval (days)</span><span class="slider-val">{settings.tournamentRules.interval}d</span></span>
      <input type="range" min="3" max="30" bind:value={settings.tournamentRules.interval} />
    </label>
    <label>
      <span class="label-top-row"><span>Points to Win</span><span class="slider-val">{settings.tournamentRules.pointsToWin}</span></span>
      <input type="range" min="1" max="10" bind:value={settings.tournamentRules.pointsToWin} />
    </label>
    <label class="checkbox-row">
      <input type="checkbox" bind:checked={settings.tournamentRules.saveArmy} />
      Save Army Between Rounds
    </label>
  {/if}

  <label class="checkbox-row">
    <input type="checkbox" bind:checked={settings.gladiatorArenaRules.enabled} />
    Gladiator Arena
  </label>

  {#if settings.gladiatorArenaRules.enabled}
    <label>
      <span class="label-top-row"><span>Days Before Start</span><span class="slider-val">Day {settings.gladiatorArenaRules.daysDelayStart}</span></span>
      <input type="range" min="1" max="60" bind:value={settings.gladiatorArenaRules.daysDelayStart} />
    </label>
    <label>
      <span class="label-top-row"><span>Count Day</span><span class="slider-val">Day {settings.gladiatorArenaRules.countDay}</span></span>
      <input type="range" min="1" max="30" bind:value={settings.gladiatorArenaRules.countDay} />
    </label>
  {/if}

  <label>
    Banned Items (one SID per line)
    <textarea bind:value={settings.bannedItems} rows="4"></textarea>
  </label>

  <label>
    Banned Spells (one SID per line)
    <textarea bind:value={settings.bannedMagics} rows="4"></textarea>
  </label>

  <label>
    Value Overrides (sid=value per line)
    <textarea bind:value={settings.valueOverridesText} rows="4"></textarea>
  </label>
</section>
