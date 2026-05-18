import albumsEn from "@/i18n/albums/en/translation.json";
import albumsId from "@/i18n/albums/id/translation.json";
import authEn from "@/i18n/auth/en/translation.json";
import authId from "@/i18n/auth/id/translation.json";
import brandEn from "@/i18n/brand/en/translation.json";
import brandId from "@/i18n/brand/id/translation.json";
import commonEn from "@/i18n/common/en/translation.json";
import commonId from "@/i18n/common/id/translation.json";
import equalizerEn from "@/i18n/equalizer/en/translation.json";
import equalizerId from "@/i18n/equalizer/id/translation.json";
import favoritesEn from "@/i18n/favorites/en/translation.json";
import favoritesId from "@/i18n/favorites/id/translation.json";
import findAccountEn from "@/i18n/findAccount/en/translation.json";
import findAccountId from "@/i18n/findAccount/id/translation.json";
import forgotEn from "@/i18n/forgot/en/translation.json";
import forgotId from "@/i18n/forgot/id/translation.json";
import homeEn from "@/i18n/home/en/translation.json";
import homeId from "@/i18n/home/id/translation.json";
import languageEn from "@/i18n/language/en/translation.json";
import languageId from "@/i18n/language/id/translation.json";
import libraryEn from "@/i18n/library/en/translation.json";
import libraryId from "@/i18n/library/id/translation.json";
import logoutEn from "@/i18n/logout/en/translation.json";
import logoutId from "@/i18n/logout/id/translation.json";
import lyricsEn from "@/i18n/lyrics/en/translation.json";
import lyricsId from "@/i18n/lyrics/id/translation.json";
import navEn from "@/i18n/nav/en/translation.json";
import navId from "@/i18n/nav/id/translation.json";
import playerEn from "@/i18n/player/en/translation.json";
import playerId from "@/i18n/player/id/translation.json";
import playlistEn from "@/i18n/playlist/en/translation.json";
import playlistId from "@/i18n/playlist/id/translation.json";
import playlistDetailEn from "@/i18n/playlistDetail/en/translation.json";
import playlistDetailId from "@/i18n/playlistDetail/id/translation.json";
import playlistListEn from "@/i18n/playlistList/en/translation.json";
import playlistListId from "@/i18n/playlistList/id/translation.json";
import playlistsEn from "@/i18n/playlists/en/translation.json";
import playlistsId from "@/i18n/playlists/id/translation.json";
import queueEn from "@/i18n/queue/en/translation.json";
import queueId from "@/i18n/queue/id/translation.json";
import recentlyPlayedEn from "@/i18n/recentlyPlayed/en/translation.json";
import recentlyPlayedId from "@/i18n/recentlyPlayed/id/translation.json";
import recentlyPlayedListEn from "@/i18n/recentlyPlayedList/en/translation.json";
import recentlyPlayedListId from "@/i18n/recentlyPlayedList/id/translation.json";
import resetEn from "@/i18n/reset/en/translation.json";
import resetId from "@/i18n/reset/id/translation.json";
import sessionEn from "@/i18n/session/en/translation.json";
import sessionId from "@/i18n/session/id/translation.json";
import themeEn from "@/i18n/theme/en/translation.json";
import themeId from "@/i18n/theme/id/translation.json";
import trackListEn from "@/i18n/trackList/en/translation.json";
import trackListId from "@/i18n/trackList/id/translation.json";
import uploadEn from "@/i18n/upload/en/translation.json";
import uploadId from "@/i18n/upload/id/translation.json";
import waveformEn from "@/i18n/waveform/en/translation.json";
import waveformId from "@/i18n/waveform/id/translation.json";

export const LOCALES = ["en", "id"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export type TranslationParams = Record<string, string | number>;

const EN_TRANSLATIONS = {
    ...albumsEn,
    ...authEn,
    ...brandEn,
    ...commonEn,
    ...equalizerEn,
    ...favoritesEn,
    ...findAccountEn,
    ...forgotEn,
    ...homeEn,
    ...languageEn,
    ...libraryEn,
    ...logoutEn,
    ...lyricsEn,
    ...navEn,
    ...playerEn,
    ...playlistEn,
    ...playlistDetailEn,
    ...playlistListEn,
    ...playlistsEn,
    ...queueEn,
    ...recentlyPlayedEn,
    ...recentlyPlayedListEn,
    ...resetEn,
    ...sessionEn,
    ...themeEn,
    ...trackListEn,
    ...uploadEn,
    ...waveformEn,
} as const;

export type TranslationKey = keyof typeof EN_TRANSLATIONS;

type TranslationDictionary = Record<TranslationKey, string>;

const ID_TRANSLATIONS: TranslationDictionary = {
    ...albumsId,
    ...authId,
    ...brandId,
    ...commonId,
    ...equalizerId,
    ...favoritesId,
    ...findAccountId,
    ...forgotId,
    ...homeId,
    ...languageId,
    ...libraryId,
    ...logoutId,
    ...lyricsId,
    ...navId,
    ...playerId,
    ...playlistId,
    ...playlistDetailId,
    ...playlistListId,
    ...playlistsId,
    ...queueId,
    ...recentlyPlayedId,
    ...recentlyPlayedListId,
    ...resetId,
    ...sessionId,
    ...themeId,
    ...trackListId,
    ...uploadId,
    ...waveformId,
};

const TRANSLATIONS: Record<Locale, TranslationDictionary> = {
    en: EN_TRANSLATIONS,
    id: ID_TRANSLATIONS,
};

export function isSupportedLocale(value: string): value is Locale {
    return LOCALES.includes(value as Locale);
}

export function translate(locale: Locale, key: TranslationKey, params?: TranslationParams) {
    const template = TRANSLATIONS[locale][key] ?? EN_TRANSLATIONS[key];

    if (!params) {
        return template;
    }

    return template.replace(/\{(\w+)\}/g, (_match, token: string) => {
        const replacement = params[token];
        return replacement === undefined ? "{" + token + "}" : String(replacement);
    });
}

