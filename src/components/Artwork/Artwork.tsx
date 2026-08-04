import React, { forwardRef } from "react";
import styles from "./Artwork.module.css";
import { convertToUrl } from "../../utils/utils";
import {
    Artwork,
    thumbFor,
    titleOf,
    statusLabel,
} from "../../types/artwork";

interface ArtworkElemProps {
    artwork: Artwork;
    onClick: (artwork: Artwork, index: number) => void;
    index: number;
}

/**
 * A single grid tile. Images are native-lazy and use the resized `thumbUrl`
 * where one exists — the originals run up to 5 MB and this frame is 250px tall.
 *
 * The previous version faded tiles in with an IntersectionObserver; that is gone.
 * The list now windows its own rendering, so a tile only exists once it should be
 * visible, and an opacity animation on top of that just delayed first paint.
 */
const ArtworkElem = forwardRef<HTMLLIElement, ArtworkElemProps>(
    ({ artwork, onClick, index }, ref) => {
        const handleKeyDown = (
            event: React.KeyboardEvent<HTMLLIElement>
        ): void => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick(artwork, index);
            }
        };

        return (
            <li
                ref={ref}
                className={styles.artworkItem}
                onClick={() => onClick(artwork, index)}
                data-artwork={"artwork-" + index.toString()}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                id={convertToUrl(artwork.title || "")}
            >
                <div className={styles.frame}>
                    <img
                        src={thumbFor(artwork)}
                        alt={titleOf(artwork)}
                        loading="lazy"
                        decoding="async"
                    />
                </div>
                <div className={styles.title}>{titleOf(artwork)}</div>
                <div className={styles.status}>{statusLabel(artwork)}</div>
            </li>
        );
    }
);

ArtworkElem.displayName = "ArtworkElem";

export default ArtworkElem;
