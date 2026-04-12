"use client";

import { useEffect, useRef } from "react";

import type { OutputDeviceType } from "@/features/audio/lib/output-device";
import { useEqualizerStore } from "@/features/audio/stores/equalizer-store";

const HEADPHONE_KEYWORDS = [
  "headphone",
  "headphones",
  "headset",
  "earphone",
  "earphones",
  "earbud",
  "earbuds",
  "airpods",
  "in-ear",
  "iem",
];

const SPEAKER_KEYWORDS = [
  "speaker",
  "speakers",
  "loudspeaker",
  "soundbar",
  "monitor",
  "line out",
  "hdmi",
  "display audio",
  "tv",
];

function classifyOutputLabel(label: string): OutputDeviceType {
  const normalized = label.toLowerCase();

  if (HEADPHONE_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return "headphone";
  }

  if (SPEAKER_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return "speaker";
  }

  return "unknown";
}

function isDefaultOutputDevice(device: MediaDeviceInfo) {
  const normalizedLabel = device.label.toLowerCase();
  return device.deviceId === "default" || normalizedLabel.startsWith("default");
}

function isCommunicationsOutputDevice(device: MediaDeviceInfo) {
  const normalizedLabel = device.label.toLowerCase();
  return device.deviceId === "communications" || normalizedLabel.includes("communications");
}

function detectOutputDeviceType(devices: MediaDeviceInfo[]): OutputDeviceType {
  const outputDevices = devices.filter((device) => device.kind === "audiooutput");
  if (outputDevices.length === 0) {
    return "unknown";
  }

  const prioritized = [
    ...outputDevices.filter(isDefaultOutputDevice),
    ...outputDevices.filter(isCommunicationsOutputDevice),
    ...outputDevices.filter(
      (device) => !isDefaultOutputDevice(device) && !isCommunicationsOutputDevice(device),
    ),
  ];

  for (const device of prioritized) {
    if (!device.label) {
      continue;
    }

    const detected = classifyOutputLabel(device.label);
    if (detected !== "unknown") {
      return detected;
    }
  }

  return "unknown";
}

async function readOutputDeviceType(): Promise<OutputDeviceType> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
    return "unknown";
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return detectOutputDeviceType(devices);
  } catch {
    return "unknown";
  }
}

export function useOutputDeviceType() {
  const setOutputDeviceType = useEqualizerStore((state) => state.setOutputDeviceType);
  const applyOutputDevicePreset = useEqualizerStore((state) => state.applyOutputDevicePreset);
  const previousDetectedTypeRef = useRef<OutputDeviceType>("unknown");

  useEffect(() => {
    if (typeof window === "undefined") {
      return () => {};
    }

    let cancelled = false;

    const syncDetectedOutput = async () => {
      const nextType = await readOutputDeviceType();

      if (cancelled || nextType === previousDetectedTypeRef.current) {
        return;
      }

      previousDetectedTypeRef.current = nextType;

      if (nextType === "unknown") {
        setOutputDeviceType("unknown");
        return;
      }

      applyOutputDevicePreset(nextType);
    };

    const handleDeviceChange = () => {
      void syncDetectedOutput();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void syncDetectedOutput();
      }
    };

    void syncDetectedOutput();
    navigator.mediaDevices?.addEventListener?.("devicechange", handleDeviceChange);
    window.addEventListener("focus", handleDeviceChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      navigator.mediaDevices?.removeEventListener?.("devicechange", handleDeviceChange);
      window.removeEventListener("focus", handleDeviceChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [applyOutputDevicePreset, setOutputDeviceType]);
}
