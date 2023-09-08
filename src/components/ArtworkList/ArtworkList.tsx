import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Artwork.module.css";
import { url } from "inspector";

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
      setLoading(false); // Set loading to false when all images have loaded
    });
  }, [artworks]);

  const handleItemClick = (artwork: Artwork) => {
    setActiveItem(artwork);
  };

  const handleCloseInfo = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setActiveItem(null);
  };

  return (
    <div className={styles.artworkListContainer}>
      <h1>Lista de obras</h1>
      <ul>
        {artworks.map((artwork) => (
          <li
            className={`${styles.artworkItem} ${
              artwork === activeItem ? styles.active : ""
            }`}
            key={artwork._id}
            onClick={() => handleItemClick(artwork)}
          >
            <img src={artwork.url} alt={artwork.title} />
            {artwork === activeItem && (
              <div className={styles.artworkItemContent}>
                {artwork.title && (
                  <div className={styles.artworkItemTitle}>
                    <strong>Título:</strong>
                    <br />
                    {artwork.title}
                  </div>
                )}
                {artwork.artist && (
                  <div className={styles.artworkItemArtist}>
                    <strong>Autor/a:</strong>
                    <br />
                    {artwork.artist}
                  </div>
                )}
                {artwork.description && (
                  <div className={styles.artworkItemDescription}>
                    <strong>Descripción:</strong>
                    <br />
                    {artwork.description}
                  </div>
                )}
                {artwork.styles && artwork.styles.length > 0 && (
                  <div className={styles.artworkItemStyles}>
                    <strong>Estilos:</strong>
                    <br />
                    {artwork.styles.join(", ")}
                  </div>
                )}
                {artwork.size && (
                  <div className={styles.artworkItemSize}>
                    <strong>Tamaño:</strong>
                    <br />
                    {artwork.size}
                  </div>
                )}
                {artwork.price && (
                  <div className={styles.artworkItemPrice}>
                    <strong>Precio:</strong>
                    <br />
                    {artwork.price}
                  </div>
                )}
                {artwork.year && (
                  <div className={styles.artworkItemYear}>
                    <strong>Año:</strong>
                    <br />
                    {artwork.year}
                  </div>
                )}
                {
                  <div className={styles.artworkItemAvailability}>
                    <strong>Disponibilidad:</strong>
                    <br />
                    {artwork.available ? "Disponible" : "No disponible"}
                  </div>
                }
                {artwork.coleccion && (
                  <div className={styles.artworkItemCollection}>
                    <strong>Colección:</strong>
                    <br />
                    {artwork.coleccion}
                  </div>
                )}
                <div className={styles.artworkItemContact}>
                  Contact me on WhatsApp:
                  <a
                    className={styles.artworkItemContactLink}
                    href={`https://wa.me/+59892904603?text=Me%20interesa%20esta%20pintura%20${encodeURIComponent(
                      artwork.url
                    )} esta disponible?`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Contácteme
                  </a>
                </div>
                {activeItem && (
                  <button
                    className={styles.closeButton}
                    onClick={handleCloseInfo}
                  >
                    Close
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ArtworkList;
