<script lang="ts">
  import GeneralSettings from './components/GeneralSettings.svelte';
  import HeroSettings from './components/HeroSettings.svelte';
  import TopologySettings from './components/TopologySettings.svelte';
  import ZoneSettings from './components/ZoneSettings.svelte';
  import GameRulesSettings from './components/GameRulesSettings.svelte';
  import WinConditionsSettings from './components/WinConditionsSettings.svelte';
  import GenerateButton from './components/GenerateButton.svelte';
  import { resetSettings } from './state/settings.svelte.ts';
</script>

<main>
  <header>
    <h1>Olden Era — Template Generator</h1>
    <button class="reset-btn" onclick={resetSettings}>Reset to Defaults</button>
  </header>

  <div class="settings-grid">
    <GeneralSettings />
    <TopologySettings />
    <ZoneSettings />
    <HeroSettings />
    <GameRulesSettings />
    <WinConditionsSettings />
  </div>

  <GenerateButton />
</main>

<style>
  main {
    max-width: 1140px;
    margin: 0 auto;
    padding: 1.5rem 1.25rem 3rem;
    font-family: Georgia, 'Times New Roman', serif;
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.75rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #5A4A28;
  }

  h1 {
    font-size: 1.6rem;
    color: #C9A84C;
    margin: 0;
    letter-spacing: 0.02em;
    text-shadow: 0 1px 6px rgba(201,168,76,0.25);
  }

  .settings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  /* ── Section cards ─────────────────────────────────────── */
  :global(.section-card) {
    background: #221E15;
    border: 1px solid #5A4A28;
    border-radius: 5px;
    padding: 1rem 1.1rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.45);
  }

  :global(.section-header) {
    color: #C9A84C;
    font-size: 0.75rem;
    font-weight: 700;
    font-family: 'Segoe UI', Arial, sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin: 0 0 0.9rem;
    padding-bottom: 0.45rem;
    border-bottom: 1px solid #3A3020;
  }

  /* ── Labels ────────────────────────────────────────────── */
  :global(label) {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    margin-bottom: 0.6rem;
    font-size: 0.82rem;
    color: #E8D5A3;
    font-family: 'Segoe UI', Arial, sans-serif;
  }
  :global(.checkbox-row) {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  /* ── Inputs, selects, textareas ────────────────────────── */
  :global(input[type="text"]),
  :global(input[type="number"]),
  :global(select),
  :global(textarea) {
    background: #2C2619;
    border: 1px solid #5A4A28;
    color: #E8D5A3;
    padding: 0.35rem 0.55rem;
    border-radius: 3px;
    font-size: 0.85rem;
    font-family: 'Segoe UI', Arial, sans-serif;
    width: 100%;
    box-sizing: border-box;
    transition: border-color 0.15s;
    height: 30px;
  }
  :global(textarea) { height: auto; resize: vertical; }
  :global(input[type="text"]:hover),
  :global(input[type="number"]:hover),
  :global(select:hover) {
    border-color: #8A6E30;
  }
  :global(input[type="text"]:focus),
  :global(input[type="number"]:focus),
  :global(select:focus),
  :global(textarea:focus) {
    border-color: #C9A84C;
    outline: none;
    box-shadow: 0 0 0 2px rgba(201,168,76,0.15);
  }
  :global(select) {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238A6E30'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.6rem center;
    padding-right: 1.8rem;
  }
  :global(select option) {
    background: #2C2619;
    color: #E8D5A3;
  }
  :global(input[type="checkbox"]) {
    width: 15px;
    height: 15px;
    accent-color: #C9A84C;
    cursor: pointer;
    flex-shrink: 0;
  }

  /* ── Range sliders ──────────────────────────────────────── */
  :global(input[type="range"]) {
    width: 100%;
    height: 4px;
    accent-color: #C9A84C;
    cursor: pointer;
    background: #3A3020;
    border-radius: 2px;
    outline: none;
    appearance: none;
  }
  :global(input[type="range"]::-webkit-slider-thumb) {
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #C9A84C;
    border: 2px solid #221E15;
    cursor: pointer;
    box-shadow: 0 0 4px rgba(201,168,76,0.5);
  }
  :global(input[type="range"]::-moz-range-thumb) {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #C9A84C;
    border: 2px solid #221E15;
    cursor: pointer;
  }

  /* ── Fieldset ───────────────────────────────────────────── */
  :global(fieldset) {
    border: 1px solid #3A3020;
    border-radius: 4px;
    padding: 0.6rem 0.75rem;
    margin-bottom: 0.6rem;
  }
  :global(legend) {
    color: #8A6E30;
    font-size: 0.75rem;
    font-family: 'Segoe UI', Arial, sans-serif;
    padding: 0 0.35rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  /* ── Buttons ────────────────────────────────────────────── */
  :global(.generate-btn) {
    background: linear-gradient(180deg, #9A7A28 0%, #7A5A18 100%);
    border: 1px solid #C9A84C;
    color: #F0DFB0;
    padding: 0.55rem 2rem;
    font-size: 1rem;
    font-family: Georgia, serif;
    font-weight: bold;
    letter-spacing: 0.04em;
    cursor: pointer;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,220,100,0.1);
    transition: background 0.15s, box-shadow 0.15s;
    margin-top: 0.5rem;
  }
  :global(.generate-btn:hover) {
    background: linear-gradient(180deg, #B08A30 0%, #8A6A20 100%);
    box-shadow: 0 3px 12px rgba(201,168,76,0.3), inset 0 1px 0 rgba(255,220,100,0.15);
  }
  :global(.generate-btn:active) {
    background: linear-gradient(180deg, #7A5A18 0%, #5A3E10 100%);
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.4);
  }

  :global(.reset-btn) {
    background: transparent;
    border: 1px solid #5A4A28;
    color: #9A8A6A;
    padding: 0.35rem 0.9rem;
    cursor: pointer;
    border-radius: 3px;
    font-size: 0.82rem;
    font-family: 'Segoe UI', Arial, sans-serif;
    transition: border-color 0.15s, color 0.15s;
  }
  :global(.reset-btn:hover) {
    border-color: #8A6E30;
    color: #C9A84C;
  }

  /* ── Misc ───────────────────────────────────────────────── */
  :global(.experimental-label) {
    color: #8A6E30;
    font-style: italic;
    font-size: 0.72rem;
    font-family: 'Segoe UI', Arial, sans-serif;
  }
  :global(.error-msg) {
    color: #FF7070;
    font-size: 0.82rem;
    margin-top: 0.5rem;
    font-family: 'Segoe UI', Arial, sans-serif;
  }
  :global(.section-divider) {
    border: none;
    border-top: 1px solid #3A3020;
    margin: 0.75rem 0;
  }

  :global(.generate-section) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  /* ── Slider label with inline value ──────────────────────────── */
  :global(.label-top-row) {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    width: 100%;
  }
  :global(.slider-val) {
    color: #C9A84C;
    font-size: 0.82rem;
    font-weight: 600;
    font-family: 'Segoe UI', Arial, sans-serif;
    min-width: 2.8rem;
    text-align: right;
    flex-shrink: 0;
  }
</style>
