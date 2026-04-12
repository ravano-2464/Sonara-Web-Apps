"use client";

import { Howl, Howler } from "howler";

import {
  EQ_BANDS,
  type EqualizerFrequency,
} from "@/features/audio/lib/equalizer-presets";
import type { EqualizerBandMap, Track } from "@/types/models";

interface AudioEngineCallbacks {
  onPlayStateChange?: (isPlaying: boolean) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onTrackStarted?: (track: Track) => void;
  onTrackEnded?: () => void;
  onError?: (message: string) => void;
}

interface HowlSoundNode {
  _node?: AudioNode;
}

interface HowlInternals {
  _soundById?: (id: number) => HowlSoundNode | null;
}

class AudioEngine {
  private howl: Howl | null = null;

  private activeTrack: Track | null = null;

  private callbacks: AudioEngineCallbacks = {};

  private animationFrame: number | null = null;

  private analyser: AnalyserNode | null = null;

  private filters: Map<EqualizerFrequency, BiquadFilterNode> = new Map();

  private currentVolume = 0.8;

  setCallbacks(callbacks: AudioEngineCallbacks) {
    this.callbacks = callbacks;
  }

  private getAudioContext(): AudioContext | null {
    const ctx = Howler.ctx as AudioContext | undefined;
    return ctx ?? null;
  }

  private getMasterGain(): GainNode | null {
    const master = Howler.masterGain as GainNode | undefined;
    return master ?? null;
  }

  private initializeGraph() {
    if (this.analyser && this.filters.size > 0) {
      return;
    }

    const ctx = this.getAudioContext();
    const masterGain = this.getMasterGain();

    if (!ctx || !masterGain) {
      return;
    }

    const createdFilters = EQ_BANDS.map((frequency) => {
      const filter = ctx.createBiquadFilter();
      filter.type = "peaking";
      filter.frequency.value = frequency;
      filter.Q.value = 1.25;
      filter.gain.value = 0;
      this.filters.set(frequency, filter);
      return filter;
    });

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.82;

    createdFilters.forEach((filter, index) => {
      const nextNode = createdFilters[index + 1] ?? analyser;
      filter.connect(nextNode);
    });

    analyser.connect(masterGain);

    this.analyser = analyser;
  }

  private attachCurrentHowlNode(soundId: number) {
    if (!this.howl) {
      return;
    }

    this.initializeGraph();

    const firstFilter = this.filters.get(EQ_BANDS[0]);
    const targetNode = firstFilter ?? this.analyser;

    if (!targetNode) {
      return;
    }

    const internals = this.howl as Howl & HowlInternals;
    const sound = internals._soundById?.(soundId);
    const sourceNode = sound?._node;

    if (!sourceNode) {
      return;
    }

    if (typeof (sourceNode as AudioNode).connect !== "function") {
      return;
    }

    try {
      sourceNode.disconnect();
    } catch {
      // Node may already be disconnected.
    }

    sourceNode.connect(targetNode);
  }

  private stopTicker() {
    if (this.animationFrame && typeof window !== "undefined") {
      window.cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  private emitTimeUpdate() {
    if (!this.howl) {
      this.callbacks.onTimeUpdate?.(0, 0);
      return;
    }

    const seekValue = this.howl.seek();
    const currentTime = typeof seekValue === "number" ? seekValue : 0;
    const duration = this.howl.duration() || 0;

    this.callbacks.onTimeUpdate?.(currentTime, duration);
  }

  private startTicker() {
    this.stopTicker();

    if (typeof window === "undefined") {
      return;
    }

    const tick = () => {
      this.emitTimeUpdate();

      if (this.howl?.playing()) {
        this.animationFrame = window.requestAnimationFrame(tick);
      } else {
        this.animationFrame = null;
      }
    };

    this.animationFrame = window.requestAnimationFrame(tick);
  }

  setEqualizerGains(gains: EqualizerBandMap) {
    this.initializeGraph();

    EQ_BANDS.forEach((frequency) => {
      const filter = this.filters.get(frequency);
      if (!filter) {
        return;
      }

      filter.gain.value = gains[frequency];
    });
  }

  setVolume(volume: number) {
    this.currentVolume = volume;

    if (this.howl) {
      this.howl.volume(volume);
    }
  }

  getAnalyser() {
    this.initializeGraph();
    return this.analyser;
  }

  getCurrentTrackId() {
    return this.activeTrack?.id ?? null;
  }

  playTrack(track: Track, seekTo = 0) {
    const isSameTrack = this.activeTrack?.id === track.id && this.howl;

    if (isSameTrack && this.howl) {
      if (seekTo > 0) {
        this.seek(seekTo);
      }

      if (!this.howl.playing()) {
        this.howl.play();
      }

      return;
    }

    this.stop();

    this.activeTrack = track;
    this.howl = new Howl({
      src: [track.audio_url],
      format: ["mp3", "wav", "ogg", "m4a", "mp4", "aac"],
      html5: false,
      preload: true,
      volume: this.currentVolume,
      onload: () => {
        this.emitTimeUpdate();
      },
      onplay: (soundId) => {
        this.attachCurrentHowlNode(soundId);
        this.callbacks.onPlayStateChange?.(true);
        this.callbacks.onTrackStarted?.(track);
        this.startTicker();
      },
      onpause: () => {
        this.callbacks.onPlayStateChange?.(false);
        this.stopTicker();
      },
      onstop: () => {
        this.callbacks.onPlayStateChange?.(false);
        this.stopTicker();
        this.callbacks.onTimeUpdate?.(0, this.howl?.duration() ?? 0);
      },
      onend: () => {
        this.callbacks.onPlayStateChange?.(false);
        this.stopTicker();
        this.callbacks.onTrackEnded?.();
      },
      onplayerror: (_id, error) => {
        this.callbacks.onError?.(`Playback error: ${error}`);
      },
      onloaderror: (_id, error) => {
        this.callbacks.onError?.(`Load error: ${error}`);
      },
    });

    this.howl.play();

    if (seekTo > 0) {
      this.howl.once("play", () => {
        this.seek(seekTo);
      });
    }
  }

  pause() {
    this.howl?.pause();
  }

  resume() {
    if (!this.howl) {
      return;
    }

    if (!this.howl.playing()) {
      this.howl.play();
    }
  }

  toggle() {
    if (!this.howl) {
      return;
    }

    if (this.howl.playing()) {
      this.pause();
      return;
    }

    this.resume();
  }

  stop() {
    this.stopTicker();

    if (this.howl) {
      this.howl.stop();
      this.howl.unload();
      this.howl = null;
    }

    this.activeTrack = null;
    this.callbacks.onPlayStateChange?.(false);
  }

  seek(seconds: number) {
    if (!this.howl) {
      return;
    }

    this.howl.seek(Math.max(seconds, 0));
    this.emitTimeUpdate();
  }

  isPlaying() {
    return this.howl?.playing() ?? false;
  }

  destroy() {
    this.stop();
    this.filters.forEach((filter) => {
      filter.disconnect();
    });
    this.filters.clear();

    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
  }
}

export const audioEngine = new AudioEngine();
