import React, { useEffect, useState, MouseEvent } from "react";
import axios from "axios";
import styles from "./Artwork.module.css";
import Modal from "../Modal/Modal";
import ArtworkElem from "../Artwork/Artwork";

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
        setLoading(false);
      }, 1500);
    });
  }, [artworks]);

  const handleItemClick = (
    event: MouseEvent<HTMLLIElement>,
    artwork: Artwork
  ): void => {
    setActiveItem(artwork === activeItem ? null : artwork);
  };

  const handleCloseInfo = (
    event: React.MouseEvent<HTMLButtonElement>
  ): void => {
    event.stopPropagation();
    setActiveItem(null);
  };

  return loading ? (
    <div className={styles.loading}>Cargando...</div>
  ) : (
    <div className={styles.artworkListContainer}>
      <h1>Lista de obras</h1>
      <ul>
        {artworks.map((artwork) => (
          <ArtworkElem
            artwork={artwork}
            key={artwork._id}
            activeItem={activeItem}
            onClick={handleItemClick}
          />
        ))}
      </ul>
      {activeItem && (
        <div className={styles.artworkItemContent}>
          <Modal activeItem={activeItem} handleCloseInfo={handleCloseInfo} />
        </div>
      )}
    </div>
  );
};

export default ArtworkList;
