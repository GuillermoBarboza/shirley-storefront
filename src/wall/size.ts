/**
 * Real-world size of a painting for "Ver en tu pared".
 *
 * Sizes are free text typed in the admin ("50x40", "28 cm x 30", "25 x29cm"),
 * always centimetres, and never say which number is the width. The photo
 * decides orientation and proportions: the frame is fitted to the photo, never
 * the photo stretched to the listed size.
 */

/** Long side used when a work has no listed size; shown as "Tamaño aproximado". */
export const APPROX_LONG_SIDE_M = 0.6;

const SIZE_RE =
    /(\d+(?:[.,]\d+)?)\s*(?:cm)?\s*[x×]\s*(\d+(?:[.,]\d+)?)/i;

const toNumber = (s: string): number => parseFloat(s.replace(",", "."));

export const parseSize = (
    size: string | undefined
): { a: number; b: number } | null => {
    const m = (size || "").match(SIZE_RE);
    if (!m) return null;
    const a = toNumber(m[1]);
    const b = toNumber(m[2]);
    return a > 0 && b > 0 ? { a, b } : null;
};

/** Metres. Long side from the listed size (or the approximation), short side from the photo. */
export const paintingSize = (
    size: string | undefined,
    imageW: number,
    imageH: number
): { w: number; h: number; approximate: boolean } => {
    const parsed = parseSize(size);
    const long = parsed ? Math.max(parsed.a, parsed.b) / 100 : APPROX_LONG_SIDE_M;
    const landscape = imageW >= imageH;
    const short = long * (landscape ? imageH / imageW : imageW / imageH);
    return landscape
        ? { w: long, h: short, approximate: !parsed }
        : { w: short, h: long, approximate: !parsed };
};
