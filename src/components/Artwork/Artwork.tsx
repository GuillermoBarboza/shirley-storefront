import React, { MouseEvent, KeyboardEvent, useEffect, useRef } from "react";
import styles from "./Artwork.module.css";

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

const ArtworkElem: React.FC<ArtworkElemProps> = ({
  artwork,
  activeItem,
  index,
  onClick,
}) => {
  const artworkRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: [0, 0.5, 1], // Adjust the threshold values as per your requirement
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
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

    const observer = new IntersectionObserver(handleIntersection, options);

    if (artworkRef.current) {
      observer.observe(artworkRef.current);
    }

    return () => {
      if (artworkRef.current) {
        observer.unobserve(artworkRef.current);
      }
    };
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLLIElement>): void => {
    if (event.key === "Enter") {
      onClick(artwork, index);
    }
  };

  return (
    <li
      ref={artworkRef}
      className={`${styles.artworkItem}`}
      onClick={() => onClick(artwork, index)}
      data-artwork={"artwork-" + index.toString()}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <img src={artwork.url} alt={artwork.title} />
    </li>
  );
};

export default ArtworkElem;
