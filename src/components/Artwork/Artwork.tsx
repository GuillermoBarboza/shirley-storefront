import React, { MouseEvent, useEffect, useRef } from "react";
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
  onClick: (event: MouseEvent<HTMLLIElement>, artwork: Artwork) => void;
}

const ArtworkElem: React.FC<ArtworkElemProps> = ({
  artwork,
  activeItem,
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

  return (
    <li
      ref={artworkRef}
      className={`${styles.artworkItem} ${
        artwork === activeItem ? styles.active : ""
      }`}
      onClick={(event) => onClick(event, artwork)}
    >
      <img src={artwork.url} alt={artwork.title} />
    </li>
  );
};

export default ArtworkElem;
