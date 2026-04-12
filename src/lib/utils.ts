import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDuration(value: number): string {
    if (!Number.isFinite(value) || value < 0) {
        return "0:00";
    }

    const totalSeconds = Math.floor(value);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

export function formatFrequencyLabel(freq: number): string {
    if (freq >= 1000) {
        const kilo = Math.round((freq / 1000) * 100) / 100;
        const value = kilo
            .toFixed(2)
            .replace(/\.00$/, "")
            .replace(/(\.\d)0$/, "$1");
        return `${value}kHz`;
    }

    return `${freq}Hz`;
}

export function formatRelativeDate(isoDate: string) {
    const date = new Date(isoDate);
    const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    const diff = date.getTime() - Date.now();
    const minutes = Math.round(diff / 60000);

    if (Math.abs(minutes) < 60) {
        return formatter.format(minutes, "minute");
    }

    const hours = Math.round(minutes / 60);
    if (Math.abs(hours) < 24) {
        return formatter.format(hours, "hour");
    }

    const days = Math.round(hours / 24);
    return formatter.format(days, "day");
}
