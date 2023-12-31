import React, { useEffect, useRef } from "react";
import Styles from "./Modal.module.css";
//@ts-ignore
import useKeypress from "react-use-keypress";
import { useSwipeable } from "react-swipeable";

interface ModalProps {
  activeItem: any;
  handleCloseInfo: any;
  changeActiveItem: (newVal: number) => void;
  activeItemIndex: number | null;
  artworksLength: number;
}

const Modal: React.FC<ModalProps> = ({
  activeItem,
  handleCloseInfo,
  changeActiveItem,
  activeItemIndex,
  artworksLength,
}) => {
  const {
    title,
    artist,
    description,
    url,
    coleccion,
    styles,
    size,
    price,
    year,
    available,
  } = activeItem;
  const modalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    if (modalContainerRef.current) {
      modalContainerRef.current.focus();
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handlePrevItem = () => {
    if (activeItemIndex !== null) {
      const prevIndex =
        activeItemIndex - 1 >= 0 ? activeItemIndex - 1 : artworksLength - 1;
      changeActiveItem(prevIndex);
    }
  };

  const handleNextItem = () => {
    if (activeItemIndex !== null) {
      const nextIndex =
        activeItemIndex + 1 < artworksLength ? activeItemIndex + 1 : 0;
      changeActiveItem(nextIndex);
    }
  };

  useKeypress(
    ["ArrowRight", "ArrowLeft", "Escape"],
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (event.key === "ArrowRight") {
        handleNextItem();
      } else if (event.key === "ArrowLeft") {
        handlePrevItem();
      } else if (event.key === "Escape") {
        handleCloseInfo(event);
      }
    },
    [handleNextItem, handlePrevItem, handleCloseInfo]
  );

  const handlers = useSwipeable({
    onSwipedLeft: handleNextItem,
    onSwipedRight: handlePrevItem,
    trackMouse: true,
  });

  return (
    <div className={Styles.modalContainer} {...handlers}>
      <div className={Styles.modal} tabIndex={0} ref={modalContainerRef}>
        <button
          aria-label="Close modal"
          className={Styles.buttonClose}
          onClick={handleCloseInfo}
        >
          X
        </button>
        <button
          className={`${Styles.navButton} ${Styles.prevButton}`}
          onClick={handlePrevItem}
          aria-label="Previous artwork"
        >
          &lt;
        </button>
        <button
          className={`${Styles.navButton} ${Styles.nextButton}`}
          onClick={handleNextItem}
          aria-label="Next artwork"
        >
          &gt;
        </button>
        <img src={url} alt={description || "Pintura seleccionada: " + title} />
        <div className={Styles.info}>
          <h3 className={Styles.title}>{title}</h3>
          {artist && <p className={Styles.artist}>Artista: {artist}</p>}
          {description && <p>Descripcion:{description}</p>}
          {coleccion && <p>Colleccion: {coleccion}</p>}
          {styles.length > 0 && styles[0].length >= 3 && (
            <p>Estilos: {styles.join(", ")}</p>
          )}
          {size > 0 && <p>Tamaño: {size}</p>}
          {price > 0 && <p>Precio: {price}UYU</p>}
          {year > 0 && <p>Año: {year}</p>}
          <p>{available ? "Aún disponible!" : "Vendida"}</p>
          <div className={styles.artworkItemContact}>
            Encuéntrame en WhatsApp: &nbsp;
            <a
              className={styles.artworkItemContactLink}
              href={`https://wa.me/+59892904603?text=Me%20interesa%20esta%20pintura%20${encodeURIComponent(
                url
              )} esta disponible?`}
              target="_blank"
              rel="noopener noreferrer"
            >
              +598 92 904 603
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
