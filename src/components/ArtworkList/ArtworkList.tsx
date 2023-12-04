import React, { useEffect, useState, MouseEvent } from "react";
import axios from "axios";
import styles from "./Artwork.module.css";
import Modal from "../Modal/Modal";
import ArtworkElem from "../Artwork/Artwork";
import RiveComponent from "@rive-app/react-canvas";

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

const ArtworkList: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [activeItem, setActiveItem] = useState<Artwork | null>(null);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log(process.env.REACT_APP_API_ENDPOINT);
    // Fetch artworks from the backend API
    if (
      process.env.REACT_APP_API_ENDPOINT &&
      process.env.REACT_APP_API_ENDPOINT.length > 1
    ) {
      axios
        .get<Artwork[]>(process.env.REACT_APP_API_ENDPOINT)
        .then((response) => {
          setArtworks(response.data);
        })
        .catch((error) => {
          console.error("Error fetching artworks:", error);
        });
    }
  }, []);

  useEffect(() => {
    const imagePromises = artworks.map((artwork) => {
      return new Promise<void>((resolve) => {
        const image = new Image();
        image.src = artwork.url;
        image.onload = () => resolve();
      });
    });

    Promise.all(imagePromises).then(() => {
      // Set loading to false when all images have loaded
      setTimeout(() => {
        console.log("All images loaded");
        setLoading(false);
      }, 4500);
    });
  }, [artworks]);

  const handleItemClick = (artwork: Artwork, index: number): void => {
    setActiveItem(artwork);
    setActiveItemIndex(index);
  };

  const handleCloseInfo = (
    event: React.MouseEvent<HTMLButtonElement>
  ): void => {
    event.stopPropagation();
    // here return focus to the ArtworkElem
    const lastFocusedArtwork = document.querySelector(
      `[data-artwork="artwork-${activeItemIndex}"]`
    );
    console.log(lastFocusedArtwork, activeItemIndex);
    if (lastFocusedArtwork) {
      (lastFocusedArtwork as HTMLElement).focus();
    }
    setActiveItem(null);
  };

  const changeActiveItem = (newVal: number) => {
    setActiveItem(artworks[newVal]);
    setActiveItemIndex(newVal);
  };

  return (
    <div className={styles.artworkListContainer}>
      <h2>Obras de arte</h2>
      {loading ? (
        <RiveComponent src="loading.riv" className={styles.loading} />
      ) : (
        <ul>
          {artworks.map((artwork, index) => (
            <ArtworkElem
              artwork={artwork}
              key={`artwork-${index}`}
              activeItem={activeItem}
              onClick={handleItemClick}
              index={index}
            />
          ))}
        </ul>
      )}

      {activeItem && (
        <div className={styles.artworkItemContent}>
          <Modal
            activeItem={activeItem}
            handleCloseInfo={handleCloseInfo}
            changeActiveItem={changeActiveItem}
            activeItemIndex={activeItemIndex}
            artworksLength={artworks.length}
          />
        </div>
      )}
    </div>
  );
};

export default ArtworkList;
