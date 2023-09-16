import React, {
  useEffect,
  useState,
  MouseEvent,
  MouseEventHandler,
} from "react";
import axios from "axios";
import styles from "./Artwork.module.css";
import Modal from "../Modal/Modal";
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

  const handleItemClick = (
    event: MouseEvent<HTMLLIElement>,
    artwork: Artwork
  ): void => {
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
            onClick={(e: MouseEvent<HTMLLIElement>) =>
              handleItemClick(e, artwork)
            }
          >
            <img src={artwork.url} alt={artwork.title} />
            {artwork === activeItem && (
              <div className={styles.artworkItemContent}>
                {activeItem && (
                  /*  <button
                    className={styles.closeButton}
                    onClick={handleCloseInfo}
                  >
                    Close
                  </button> */
                  <Modal
                    activeItem={activeItem}
                    handleCloseInfo={handleCloseInfo}
                  />
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
