<script lang="ts">
  import { settings } from '../state/settings.svelte.ts';
  import { generate } from '../generator/templateGenerator.ts';
  import { downloadJson } from '../utils/download.ts';

  let error = $state('');
  let jsonFallback = $state('');
  let canDownload = typeof Blob !== 'undefined' && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function';

  function sanitizeFilename(name: string): string {
    return name.replace(/[^a-zA-Z0-9_\- ]/g, '').trim() || 'template';
  }

  function handleGenerate(): void {
    error = '';
    jsonFallback = '';
    try {
      const result = generate(settings);
      const filename = `${sanitizeFilename(settings.templateName)}.rmg.json`;
      if (canDownload) {
        downloadJson(result, filename);
      } else {
        jsonFallback = JSON.stringify(result, null, 2);
      }
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : String(e);
    }
  }
</script>

<div class="generate-section">
  <button class="generate-btn" onclick={handleGenerate}>
    Generate &amp; Download
  </button>

  {#if error}
    <p class="error-msg">Error: {error}</p>
  {/if}

  {#if jsonFallback}
    <p>Download not available in this browser. Copy the JSON below:</p>
    <textarea readonly rows="20" value={jsonFallback}></textarea>
  {/if}
</div>
