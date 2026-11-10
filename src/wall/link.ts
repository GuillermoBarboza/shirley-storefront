import { convertToUrl } from "../utils/utils";
import { Artwork } from "../types/artwork";

type Ref = Pick<Artwork, "_id" | "title">;

/**
 * Link that opens a painting's modal ready for "Ver en tu pared". Titles are
 * not unique (and some are empty), so `obra` carries the id; the slug hash is
 * kept so the link still reads well and old-style resolution still works.
 */
export const wallLink = (artwork: Ref, origin: string): string => {
    const slug = convertToUrl(artwork.title || "");
    return `${origin}/galeria?pared=1&obra=${encodeURIComponent(artwork._id)}${slug ? `#${slug}` : ""}`;
};

export const wantsWall = (search: string): boolean =>
    new URLSearchParams(search).get("pared") === "1";

/** `obra` (id) wins; otherwise the slug in the hash; -1 when neither matches. */
export const findDeepLinkIndex = (artworks: Ref[], search: string, hash: string): number => {
    const obra = new URLSearchParams(search).get("obra");
    if (obra) {
        const byId = artworks.findIndex((a) => a._id === obra);
        if (byId >= 0) return byId;
    }
    if (!hash) return -1;
    return artworks.findIndex((a) => convertToUrl(a.title || "") === hash);
};
