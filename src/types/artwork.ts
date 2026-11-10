export interface Artwork {
    _id: string;
    title: string;
    artist: string;
    description: string;
    url: string;
    /** Resized copy written by the admin upload pipeline. Absent on older docs. */
    thumbUrl?: string;
    coleccion: string;
    styles: string[];
    size: string;
    price: string;
    year: string;
    available: boolean;
}

/**
 * Grid tiles and the recent strip should never pull a full-resolution original —
 * they can be up to 5 MB each. Falls back to `url` for artworks uploaded before
 * the thumbnail pipeline existed.
 */
export const thumbFor = (artwork: Artwork): string =>
    artwork.thumbUrl || artwork.url;

export const titleOf = (artwork: Artwork): string =>
    (artwork.title || "").trim() || "Título desconocido";

export const statusLabel = (artwork: Artwork): string =>
    artwork.available ? "Disponible" : "Vendida";

/**
 * `size` is free text and inconsistent — 16 of the 62 records already carry the
 * unit, in formats like "50x70cm", "25 x29 cm" and "28 cm x 30". Strip any
 * existing unit and re-append exactly one, so nothing renders as "50x70 cm cm".
 */
export const sizeLabel = (size?: string): string => {
    const raw = (size || "").trim();
    if (!raw) return "";
    const bare = raw
        .replace(/cms?\.?/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
    return bare ? `${bare} cm` : "";
};

/** "2023 · 40x50 cm", skipping whichever half is missing. */
export const metaLine = (artwork: Artwork): string =>
    [artwork.year, sizeLabel(artwork.size)].filter(Boolean).join(" · ");
