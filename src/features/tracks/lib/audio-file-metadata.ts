import { parseBlob, type IPicture } from "music-metadata-browser";

interface ParsedFileNameMetadata {
  title: string | null;
  artist: string | null;
}

export interface AudioFileMetadataResult {
  title: string | null;
  artist: string | null;
  coverFile: File | null;
}

function normalizeText(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseMetadataFromFileName(fileName: string): ParsedFileNameMetadata {
  const normalizedName = fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalizedName) {
    return { title: null, artist: null };
  }

  const [artistPart, ...titleParts] = normalizedName.split(" - ");

  if (titleParts.length > 0) {
    return {
      artist: normalizeText(artistPart),
      title: normalizeText(titleParts.join(" - ")),
    };
  }

  return {
    artist: null,
    title: normalizeText(normalizedName),
  };
}

function inferImageExtension(mimeType: string) {
  const normalized = mimeType.toLowerCase();

  if (normalized.includes("png")) return "png";
  if (normalized.includes("webp")) return "webp";
  if (normalized.includes("gif")) return "gif";
  return "jpg";
}

function buildCoverFileFromPicture(picture: IPicture | undefined): File | null {
  if (!picture || !picture.data || picture.data.length === 0) {
    return null;
  }

  const type = normalizeText(picture.format) ?? "image/jpeg";
  const extension = inferImageExtension(type);
  const fileName = `embedded-cover.${extension}`;
  const binary = Uint8Array.from(picture.data);
  const blob = new Blob([binary], { type });

  return new File([blob], fileName, { type });
}

export async function extractAudioFileMetadata(file: File): Promise<AudioFileMetadataResult> {
  const metadataFromName = parseMetadataFromFileName(file.name);

  try {
    const parsed = await parseBlob(file, {
      duration: false,
      skipPostHeaders: true,
    });

    const common = parsed.common;
    const metadataArtist = normalizeText(common.artist) ??
      normalizeText(common.artists?.join(", "));
    const metadataTitle = normalizeText(common.title);
    const coverFile = buildCoverFileFromPicture(common.picture?.[0]);

    return {
      title: metadataTitle ?? metadataFromName.title,
      artist: metadataArtist ?? metadataFromName.artist,
      coverFile,
    };
  } catch {
    return {
      title: metadataFromName.title,
      artist: metadataFromName.artist,
      coverFile: null,
    };
  }
}
