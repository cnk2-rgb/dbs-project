export function playPhoneOpenClick() {
  const AudioContextImpl = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextImpl) return;

  const context = new AudioContextImpl();
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(1240, now);
  oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.02);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.26, now + 0.001);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.048);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.052);
  oscillator.onended = () => {
    context.close().catch(() => {});
  };
}

export function playPhoneUnlockClick() {
  const AudioContextImpl =
    window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextImpl) return;

  const context = new AudioContextImpl();
  const now = context.currentTime;

  const oscillator = context.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(980, now);
  oscillator.frequency.exponentialRampToValueAtTime(1240, now + 0.04);

  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.11, now + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.07);
  oscillator.onended = () => {
    context.close().catch(() => {});
  };
}

export function playPhoneTapClick() {
  const AudioContextImpl =
    window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextImpl) return;

  const context = new AudioContextImpl();
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(860, now);
  oscillator.frequency.exponentialRampToValueAtTime(720, now + 0.018);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.034);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.038);
  oscillator.onended = () => {
    context.close().catch(() => {});
  };
}

export function playPhoneCloseClick() {
  const AudioContextImpl =
    window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextImpl) return;

  const context = new AudioContextImpl();
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(760, now);
  oscillator.frequency.exponentialRampToValueAtTime(520, now + 0.03);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.09, now + 0.0015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.042);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.048);
  oscillator.onended = () => {
    context.close().catch(() => {});
  };
}

export function playPhonePickupClick() {
  const AudioContextImpl =
    window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextImpl) return;

  const context = new AudioContextImpl();
  const now = context.currentTime;

  const oscA = context.createOscillator();
  const oscB = context.createOscillator();
  const gain = context.createGain();

  oscA.type = "sine";
  oscA.frequency.setValueAtTime(560, now);
  oscA.frequency.exponentialRampToValueAtTime(820, now + 0.06);

  oscB.type = "triangle";
  oscB.frequency.setValueAtTime(280, now);
  oscB.frequency.exponentialRampToValueAtTime(410, now + 0.06);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

  oscA.connect(gain);
  oscB.connect(gain);
  gain.connect(context.destination);
  oscA.start(now);
  oscB.start(now);
  oscA.stop(now + 0.09);
  oscB.stop(now + 0.09);
  oscA.onended = () => {
    context.close().catch(() => {});
  };
}

export function playSocialFlickerSuspense(durationMs: number) {
  const AudioContextImpl =
    window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextImpl) return () => {};

  const context = new AudioContextImpl();
  const now = context.currentTime;
  const duration = Math.max(durationMs / 1000, 0.2);

  const master = context.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.16, now + 0.04);
  master.gain.setValueAtTime(0.16, now + duration * 0.72);
  master.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  master.connect(context.destination);

  const oscA = context.createOscillator();
  oscA.type = "sawtooth";
  oscA.frequency.setValueAtTime(342, now);
  oscA.frequency.exponentialRampToValueAtTime(272, now + duration * 0.88);

  const oscB = context.createOscillator();
  oscB.type = "triangle";
  oscB.frequency.setValueAtTime(171, now);
  oscB.frequency.exponentialRampToValueAtTime(134, now + duration * 0.92);

  const tremolo = context.createOscillator();
  tremolo.type = "square";
  tremolo.frequency.setValueAtTime(13.5, now);

  const tremoloDepth = context.createGain();
  tremoloDepth.gain.setValueAtTime(0.058, now);

  const toneGain = context.createGain();
  toneGain.gain.setValueAtTime(0.062, now);

  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1480, now);
  filter.frequency.exponentialRampToValueAtTime(980, now + duration);

  tremolo.connect(tremoloDepth);
  tremoloDepth.connect(toneGain.gain);

  oscA.connect(toneGain);
  oscB.connect(toneGain);
  toneGain.connect(filter);
  filter.connect(master);

  oscA.start(now);
  oscB.start(now);
  tremolo.start(now);

  const stopAt = now + duration + 0.03;
  oscA.stop(stopAt);
  oscB.stop(stopAt);
  tremolo.stop(stopAt);

  let closed = false;
  const closeContext = () => {
    if (closed) return;
    closed = true;
    context.close().catch(() => {});
  };

  oscA.onended = closeContext;

  return () => {
    if (closed) return;
    const releaseNow = context.currentTime;
    master.gain.cancelScheduledValues(releaseNow);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), releaseNow);
    master.gain.exponentialRampToValueAtTime(0.0001, releaseNow + 0.03);
    window.setTimeout(closeContext, 40);
  };
}
