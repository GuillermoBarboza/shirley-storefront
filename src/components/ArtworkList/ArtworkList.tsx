import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import styles from "./Artwork.module.css";
import Modal from "../Modal/Modal";
import ArtworkElem from "../Artwork/Artwork";
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

const ArtworkList: React.FC = () => {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [activeItem, setActiveItem] = useState<Artwork | null>(null);
    const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Initialize an array of refs
    const artworkRefs = useRef<
        Array<React.MutableRefObject<HTMLLIElement | null>>
    >([]);

    useEffect(() => {
        // Fetch artworks from the backend API
        if (process.env.REACT_APP_API_ENDPOINT) {
            axios
                .get<Artwork[]>(process.env.REACT_APP_API_ENDPOINT)
                .then((response) => {
                    setArtworks(response.data);
                    // Initialize refs array after artworks are loaded
                    artworkRefs.current = response.data.map(() =>
                        React.createRef<HTMLLIElement>()
                    );
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

    useEffect(() => {
        if (!loading) {
            const hash = window.location.hash.substring(1);
            if (hash) {
                const index = artworks.findIndex(
                    (artwork) => convertToUrl(artwork.title) === hash
                );
                if (index !== -1 && artworkRefs.current[index]?.current) {
                    artworkRefs.current[index].current?.scrollIntoView({
                        behavior: "smooth",
                        inline: "center",
                    });

                    artworkRefs.current[index].current?.focus();
                }
            }
        }
    }, [loading, artworks]);

    const handleItemClick = (artwork: Artwork, index: number): void => {
        setActiveItem(artwork);
        setActiveItemIndex(index);
    };

    const handleCloseInfo = (
        event: React.MouseEvent<HTMLButtonElement>
    ): void => {
        event.stopPropagation();
        // Return focus to the last focused artwork
        if (activeItemIndex !== null) {
            const lastFocusedArtwork =
                artworkRefs.current[activeItemIndex]?.current;
            if (lastFocusedArtwork) {
                lastFocusedArtwork.focus();
            }
        }
        setActiveItem(null);
    };

    const changeActiveItem = (newVal: number) => {
        setActiveItem(artworks[newVal]);
        setActiveItemIndex(newVal);
    };

    return loading ? (
        <div className={styles.loading}>Cargando...</div>
    ) : (
        <div className={styles.artworkListContainer}>
            <h2>Obras de arte</h2>
            <ul>
                {artworks.map((artwork, index) => (
                    <ArtworkElem
                        artwork={artwork}
                        key={`artwork-${artwork._id || index}`}
                        activeItem={activeItem}
                        onClick={handleItemClick}
                        index={index}
                        ref={artworkRefs.current[index]}
                    />
                ))}
            </ul>
            {activeItem && (
                <div className={styles.artworkItemContent}>
                    <Modal
                        activeItem={activeItem}
                        handleCloseInfo={handleCloseInfo}
                        changeActiveItem={changeActiveItem}
                        activeItemIndex={activeItemIndex!}
                        artworksLength={artworks.length}
                    />
                </div>
            )}
        </div>
    );
};

export default ArtworkList;
