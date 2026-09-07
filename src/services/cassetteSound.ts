import { CASSETTE_START_SOUND_URL } from "../config";

// Called synchronously from the Play gesture, before any await or timeout.
export function startCassetteSound(): { ready: Promise<void>; stop: () => void } {
  if (CASSETTE_START_SOUND_URL) {
    const audio = new Audio(new URL(CASSETTE_START_SOUND_URL, document.baseURI).href);
    audio.volume = 0.45;
    return { ready: audio.play(), stop: () => { audio.pause(); audio.currentTime = 0; } };
  }
  const context = new AudioContext();
  const ready = context.resume();
  // Original mechanical click: short filtered noise with two switch impulses.
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.28), context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) {
    const t = i / context.sampleRate;
    const envelope = Math.exp(-t * 100) + (t > 0.09 ? 0.6 * Math.exp(-(t - 0.09) * 65) : 0);
    samples[i] = (Math.random() * 2 - 1) * envelope * 0.24;
  }
  const source = context.createBufferSource();
  source.buffer = buffer;
  const filter = context.createBiquadFilter();
  filter.type = "lowpass"; filter.frequency.value = 2300;
  source.connect(filter).connect(context.destination);
  source.start();
  source.onended = () => { void context.close().catch(() => {}); };
  return { ready, stop: () => { if (context.state !== "closed") void context.close().catch(() => {}); } };
}
