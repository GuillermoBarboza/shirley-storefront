import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Artwork.module.css";

interface Artwork {
  _id: string;
  title: string;
  artist: string;
  description: string;
  url: string;
}

const ArtworkList: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);

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
          console.log(response.data, process.env.REACT_APP_API_ENDPOINT);
        })
        .catch((error) => {
          console.error("Error fetching artworks:", error);
        });
    }
  }, []);

  return (
    <div className={styles.artworkListContainer}>
      <h1>Lista de obras</h1>
      <ul>
        {artworks.map((artwork) => (
          <li className={styles.artworkItem} key={artwork._id}>
            <img src={artwork.url} alt={artwork.title} />
            <div className={styles.artworkItemContent}>
              {/*  <div className={styles.artworkItemTitle}>
                <strong>Titulo:</strong>
                <br />
                {artwork.title}
              </div> */}
              {/* <div className={styles.artworkItemArtist}>
                <strong>Autor/a: </strong>
                <br />
                {artwork.artist}
              </div> */}
              {/*  <div className={styles.artworkItemDescription}>
                <strong>Descripcion:</strong>

                <br />
                {artwork.description}
              </div> */}
              <div className={styles.artworkItemContact}>
                Contact me on WhatsApp:
                <a
                  className={styles.artworkItemContactLink}
                  href={`https://wa.me/Numero de sHIRLEY`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Numero de sHIRLEY
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ArtworkList;
