import React, { useEffect, useState } from "react";
import Styles from "./Modal.module.css";

interface ModalProps {
  activeItem: any;
  handleCloseInfo: any;
}

const Modal: React.FC<ModalProps> = ({ activeItem, handleCloseInfo }) => {
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

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className={Styles.modalContainer}>
      <div className={Styles.modal}>
        <button className={Styles.buttonClose} onClick={handleCloseInfo}>
          X
        </button>
        <img src={url} alt={description || "Pintura seleccionada: " + title} />
        <div className={Styles.info}>
          <h3 className={Styles.title}>{title}</h3>
          {artist && <p className={Styles.artist}>Artista: {artist}</p>}
          {description && <p>Descripcion:{description}</p>}
          {coleccion && <p>Colleccion: {coleccion}</p>}
          {styles && <p>Estilos: {styles}</p>}
          {size && <p>Tamaño: {size}</p>}
          {price && <p>Precio: {price}UYU</p>}
          {year && <p>Año: {year}</p>}
          <p>{available}</p>
        </div>
      </div>
    </div>
  );
};

export default Modal;
