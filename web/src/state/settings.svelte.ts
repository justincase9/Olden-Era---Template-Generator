// T019: Reactive settings state — Svelte 5 runes
import { defaultSettings, type GeneratorSettings } from '../generator/types.ts';

export const settings: GeneratorSettings = $state(defaultSettings());

export function resetSettings(): void {
  const defaults = defaultSettings();
  Object.assign(settings, defaults);
}
