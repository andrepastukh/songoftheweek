let audioContext: AudioContext | null = null;

function context(): AudioContext {
  audioContext ??= new AudioContext();
  return audioContext;
}

export function playMechanicalSound(kind: "start" | "stop" = "start") {
  try {
    const ctx = context();
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(kind === "start" ? 0.085 : 0.06, now + 0.008);
    master.gain.exponentialRampToValueAtTime(0.0001, now + (kind === "start" ? 0.82 : 0.2));
    master.connect(ctx.destination);

    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.type = "triangle";
    click.frequency.setValueAtTime(kind === "start" ? 145 : 118, now);
    click.frequency.exponentialRampToValueAtTime(62, now + 0.055);
    clickGain.gain.setValueAtTime(0.7, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    click.connect(clickGain).connect(master);
    click.start(now);
    click.stop(now + 0.08);

    if (kind === "start") {
      const frameCount = Math.floor(ctx.sampleRate * 0.75);
      const buffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
      const channel = buffer.getChannelData(0);
      for (let index = 0; index < frameCount; index += 1) {
        const envelope = Math.sin((index / frameCount) * Math.PI);
        channel[index] = (Math.random() * 2 - 1) * envelope * 0.12;
      }
      const noise = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      noise.buffer = buffer;
      filter.type = "bandpass";
      filter.frequency.value = 1100;
      filter.Q.value = 0.45;
      noise.connect(filter).connect(master);
      noise.start(now + 0.05);
    }
  } catch {
    // Audio feedback is a progressive enhancement.
  }
}
