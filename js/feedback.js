export class FeedbackEngine {
  constructor({ getSettings, getPack, hasUserActivation }) {
    this.getSettings = getSettings;
    this.getPack = getPack;
    this.hasUserActivation = hasUserActivation;
    this.context = null;
    this.master = null;
    this.wind = null;
    this.sampleBuffers = new Map();
    this.failedSamples = new Set();
  }

  settings() {
    return this.getSettings();
  }

  pack() {
    return this.getPack();
  }

  ensure() {
    if (!this.settings().audio || this.context || !this.hasUserActivation()) {
      return;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      return;
    }
    this.context = new AudioContext();
    this.master = this.context.createGain();
    this.master.gain.value = this.pack().master;
    this.master.connect(this.context.destination);
  }

  resume() {
    if (!this.hasUserActivation()) {
      return;
    }
    this.ensure();
    if (this.context?.state === "suspended") {
      this.context.resume();
    }
  }

  tone({ frequency = 220, duration = 0.12, type = "sine", gain = 0.22, bend = 1 }) {
    if (!this.settings().audio) {
      return;
    }
    this.ensure();
    if (!this.context || !this.master) {
      return;
    }
    const pack = this.pack();
    this.master.gain.value = pack.master;
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const amp = this.context.createGain();
    osc.type = type === "triangle" ? pack.toneWave : type;
    const packedFrequency = frequency * pack.pitch;
    const packedDuration = duration * pack.decay;
    osc.frequency.setValueAtTime(packedFrequency, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, packedFrequency * bend), now + packedDuration);
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), now + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + packedDuration);
    osc.connect(amp);
    amp.connect(this.master);
    osc.start(now);
    osc.stop(now + packedDuration + 0.02);
  }

  noise({ duration = 0.16, gain = 0.18, filter = 900 }) {
    if (!this.settings().audio) {
      return;
    }
    this.ensure();
    if (!this.context || !this.master) {
      return;
    }
    const pack = this.pack();
    this.master.gain.value = pack.master;
    const packedDuration = duration * pack.decay;
    const length = Math.max(1, Math.floor(this.context.sampleRate * duration));
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = this.context.createBufferSource();
    const filterNode = this.context.createBiquadFilter();
    const amp = this.context.createGain();
    const now = this.context.currentTime;
    source.buffer = buffer;
    filterNode.type = "lowpass";
    filterNode.frequency.value = filter * pack.noiseFilter;
    amp.gain.setValueAtTime(gain, now);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + packedDuration);
    source.connect(filterNode);
    filterNode.connect(amp);
    amp.connect(this.master);
    source.start(now);
  }

  startWind() {
    if (!this.settings().audio || this.wind) {
      return;
    }
    this.ensure();
    if (!this.context || !this.master) {
      return;
    }
    const pack = this.pack();
    this.master.gain.value = pack.master;
    const length = this.context.sampleRate;
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = this.context.createBufferSource();
    const filterNode = this.context.createBiquadFilter();
    const amp = this.context.createGain();
    source.buffer = buffer;
    source.loop = true;
    filterNode.type = "bandpass";
    filterNode.frequency.value = 520 * pack.noiseFilter;
    filterNode.Q.value = 0.7;
    amp.gain.value = 0.055;
    source.connect(filterNode);
    filterNode.connect(amp);
    amp.connect(this.master);
    source.start();
    this.wind = { source, amp };
  }

  stopWind() {
    if (!this.wind) {
      return;
    }
    const wind = this.wind;
    this.wind = null;
    try {
      wind.amp.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + 0.08);
      wind.source.stop(this.context.currentTime + 0.1);
    } catch {
      wind.source.stop();
    }
  }

  getSample(eventName) {
    const pack = this.pack();
    return pack.samples?.[eventName] || null;
  }

  loadSampleBuffer(src) {
    if (!src) {
      return Promise.resolve(null);
    }
    if (!this.sampleBuffers.has(src)) {
      this.sampleBuffers.set(
        src,
        fetch(src)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Audio sample returned ${response.status}`);
            }
            return response.arrayBuffer();
          })
          .then((buffer) => this.context.decodeAudioData(buffer))
          .catch(() => {
            this.failedSamples.add(src);
            return null;
          })
      );
    }
    return this.sampleBuffers.get(src);
  }

  playSample(eventName, intensity = 1) {
    if (!this.settings().audio) {
      return false;
    }
    const sample = this.getSample(eventName);
    if (!sample) {
      return false;
    }
    this.ensure();
    if (!this.context || !this.master) {
      return true;
    }
    const pack = this.pack();
    this.master.gain.value = pack.master;
    const src = typeof sample === "string" ? sample : sample.src;
    if (this.failedSamples.has(src)) {
      return false;
    }
    const sampleGain = typeof sample === "object" && Number.isFinite(sample.gain) ? sample.gain : 1;
    const sampleRate = typeof sample === "object" && Number.isFinite(sample.playbackRate) ? sample.playbackRate : 1;
    this.loadSampleBuffer(src).then((buffer) => {
      if (!buffer || !this.context || !this.master || !this.settings().audio) {
        return;
      }
      const source = this.context.createBufferSource();
      const amp = this.context.createGain();
      source.buffer = buffer;
      source.playbackRate.value = Math.max(0.1, sampleRate * (pack.pitch || 1));
      amp.gain.value = Math.max(0, sampleGain * Math.max(0.12, Math.min(1.8, intensity)));
      source.connect(amp);
      amp.connect(this.master);
      source.start();
    });
    return true;
  }

  play(eventName, intensity = 1) {
    const level = Math.max(0.12, Math.min(1.8, intensity));
    const pack = this.pack();
    if (this.playSample(eventName, level)) {
      return;
    }
    if (eventName === "impact") {
      this.noise({ duration: 0.07 + level * 0.04, gain: 0.05 + level * 0.09, filter: 240 + level * 220 });
      this.tone({ frequency: 94 + level * 28, duration: 0.09, type: pack.impactWave, gain: 0.035 + level * 0.03, bend: 0.72 });
    } else if (eventName === "explosion") {
      this.noise({ duration: 0.42, gain: 0.34, filter: 560 });
      this.tone({ frequency: 82, duration: 0.48, type: "sawtooth", gain: 0.16, bend: 0.34 });
    } else if (eventName === "shock") {
      this.tone({ frequency: 740, duration: 0.07, type: pack.zapWave, gain: 0.12, bend: 1.9 });
      this.tone({ frequency: 1180, duration: 0.05, type: pack.zapWave, gain: 0.07, bend: 0.62 });
    } else if (eventName === "tickle" || eventName === "gift") {
      this.tone({ frequency: 440, duration: 0.09, type: "sine", gain: 0.09, bend: 1.33 });
      setTimeout(() => this.tone({ frequency: 660, duration: 0.08, type: "sine", gain: 0.07, bend: 1.18 }), 70);
    } else if (eventName === "boombox") {
      this.tone({ frequency: 196, duration: 0.08, type: "triangle", gain: 0.1, bend: 1 });
      setTimeout(() => this.tone({ frequency: 294, duration: 0.07, type: "sine", gain: 0.07, bend: 1.5 }), 85);
    } else if (eventName === "paint") {
      this.tone({ frequency: 520, duration: 0.06, type: "triangle", gain: 0.08, bend: 0.82 });
    } else if (eventName === "unlock") {
      this.tone({ frequency: 392, duration: 0.1, type: "sine", gain: 0.08, bend: 1.26 });
      setTimeout(() => this.tone({ frequency: 587, duration: 0.12, type: "sine", gain: 0.08, bend: 1.22 }), 90);
    } else if (eventName === "select") {
      this.tone({ frequency: 340, duration: 0.045, type: "triangle", gain: 0.04, bend: 1.12 });
    }
  }
}
