// Web Audio API Synthesizer for high-fidelity space SFX without external dependencies

class SoundEffectsController {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Futuristic click sound
  public playClick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    } catch (e) {
      // Audio might be blocked by autoplay policies
    }
  }

  // Warp / Dive swoosh sound
  public playWarp() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.4);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.8);

      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.8);
    } catch (e) {}
  }

  // Dust wipe brushing sound
  public playDustBrush() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const bufferSize = this.ctx.sampleRate * 0.08;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800 + Math.random() * 400, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
    } catch (e) {}
  }

  // Triumphant awakening chime when rover dust is 100% cleared
  public playAwakeningChime() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + index * 0.12);

        gain.gain.setValueAtTime(0.001, this.ctx!.currentTime + index * 0.12);
        gain.gain.linearRampToValueAtTime(0.2, this.ctx!.currentTime + index * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + index * 0.12 + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + index * 0.12);
        osc.stop(this.ctx!.currentTime + index * 0.12 + 0.65);
      });
    } catch (e) {}
  }

  // Telemetry radio beep
  public playTelemetryPing() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {}
  }

  // Synthesize Martian wind noise
  public playSimulatedMartianWind(durationSeconds = 6) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const bufferSize = this.ctx.sampleRate * durationSeconds;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02; // Brown/pink filter
        lastOut = data[i];
        data[i] *= 3.5;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(280, this.ctx.currentTime + durationSeconds * 0.5);
      filter.frequency.linearRampToValueAtTime(120, this.ctx.currentTime + durationSeconds);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 1);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + durationSeconds);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
    } catch (e) {}
  }

  // Sweet melodic music-box bell chimes for Little Nova (gentle celestial female chime)
  public playNovaCuteVoice(syllables = 6) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      // Soft fairy music-box chime notes (F5, A5, C6, E6, G6)
      const celestialScale = [698.46, 880.0, 1046.5, 1318.51, 1567.98];
      const count = Math.min(8, Math.max(3, syllables));

      for (let i = 0; i < count; i++) {
        const startTime = this.ctx.currentTime + i * 0.09;
        const duration = 0.16;
        const freq = celestialScale[Math.floor(Math.random() * celestialScale.length)];

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.08, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      }
    } catch (e) {}
  }

  // Web Speech API Voice synthesis: Sweet, gentle female storytelling voice
  public speakText(
    text: string,
    lang: 'en' | 'bn' = 'en',
    pitch = 1.42, // Sweet, natural female voice pitch
    rate = 0.98,  // Relaxed, story-friendly cadence
    onEnd?: () => void
  ) {
    if (this.isMuted) return;

    // Sweet celestial music box chimes to accompany Nova speaking
    const wordsCount = text.split(/\s+/).filter(Boolean).length;
    this.playNovaCuteVoice(Math.min(8, Math.max(3, Math.floor(wordsCount * 0.5))));

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      if (onEnd) setTimeout(onEnd, 2000);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      // Sweet feminine storytelling pitch
      utterance.pitch = pitch;
      // Bengali pronunciation is clearest around 0.94 - 0.98
      utterance.rate = lang === 'bn' ? 0.94 : (rate || 0.98);

      if (onEnd) {
        utterance.onend = onEnd;
        utterance.onerror = onEnd;
      }

      const voices = window.speechSynthesis.getVoices();

      if (lang === 'bn') {
        utterance.lang = 'bn-BD';
        // Prefer sweet female Bengali voices
        const femaleBnVoice = voices.find(
          (v) =>
            (v.lang.toLowerCase().startsWith('bn') ||
              v.name.toLowerCase().includes('bangla') ||
              v.name.toLowerCase().includes('bengali')) &&
            (v.name.toLowerCase().includes('female') ||
              v.name.toLowerCase().includes('tanisha') ||
              v.name.toLowerCase().includes('nabaneeta') ||
              v.name.toLowerCase().includes('google বাংলা') ||
              v.name.toLowerCase().includes('bashona'))
        ) || voices.find(
          (v) =>
            v.lang.toLowerCase().startsWith('bn') ||
            v.lang.toLowerCase().includes('bn-') ||
            v.lang.toLowerCase().includes('ben') ||
            v.name.toLowerCase().includes('bangla') ||
            v.name.toLowerCase().includes('bengali')
        );

        if (femaleBnVoice) {
          utterance.voice = femaleBnVoice;
          utterance.lang = femaleBnVoice.lang;
        }
      } else {
        utterance.lang = 'en-US';
        // Prefer sweet, gentle female English storytelling voice
        const femaleVoice = voices.find(
          (v) =>
            v.name.includes('Samantha') ||
            v.name.includes('Victoria') ||
            v.name.includes('Karen') ||
            v.name.includes('Google UK English Female') ||
            v.name.includes('Google US English') ||
            v.name.includes('Zira') ||
            v.name.includes('Moira') ||
            v.name.toLowerCase().includes('female')
        );
        if (femaleVoice) utterance.voice = femaleVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      if (onEnd) onEnd();
    }
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}

export const soundEffects = new SoundEffectsController();
