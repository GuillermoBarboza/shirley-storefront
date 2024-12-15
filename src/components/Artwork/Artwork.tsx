import React, { forwardRef, useEffect, useRef } from "react";
import styles from "./Artwork.module.css";
import { convertToUrl } from "../../utils/utils";

interface Artwork {
    _id: string;
    title: string;
    artist: string;
    description: string;
    url: string;
    coleccion: string;
    styles: string[];
    size: string;
    price: string;
    year: string;
    available: boolean;
}

interface ArtworkElemProps {
    artwork: Artwork;
    activeItem: Artwork | null;
    onClick: (artwork: Artwork, index: number) => void;
    index: number;
}

const ArtworkElem = forwardRef<HTMLLIElement, ArtworkElemProps>(
    ({ artwork, activeItem, onClick, index }, ref) => {
        useEffect(() => {
            const element = ref && "current" in ref ? ref.current : null;
            if (!element) {
                console.error("Element not found");
                return;
            }

            const options = {
                root: null,
                rootMargin: "0px",
                threshold: [0, 0.5, 1],
            };

            const handleIntersection = (
                entries: IntersectionObserverEntry[]
            ) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add(styles.fadeIn);
                        entry.target.classList.remove(styles.fadeOut);
                    } else if (entry.intersectionRatio < 1) {
                        entry.target.classList.remove(styles.fadeIn);
                        entry.target.classList.add(styles.fadeOut);
                    }
                });
            };

            const observer = new IntersectionObserver(
                handleIntersection,
                options
            );
            observer.observe(element);

            // Clean up the observer on unmount
            return () => {
                observer.unobserve(element);
                observer.disconnect();
            };
        }, [ref]);

        const handleKeyDown = (
            event: React.KeyboardEvent<HTMLLIElement>
        ): void => {
            if (event.key === "Enter") {
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
                id={convertToUrl(artwork.title)}
            >
                <img src={artwork.url} alt={artwork.title} />
            </li>
        );
    }
);

export default ArtworkElem;
