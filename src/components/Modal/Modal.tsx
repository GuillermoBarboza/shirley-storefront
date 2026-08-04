import React, { useEffect, useRef } from "react";
import Styles from "./Modal.module.css";
//@ts-ignore
import useKeypress from "react-use-keypress";
import { useSwipeable } from "react-swipeable";
import WhatsAppLink from "../WhatsappLink/WhatsappLink";
import {
    Artwork,
    titleOf,
    statusLabel,
    sizeLabel,
} from "../../types/artwork";

interface ModalProps {
    activeItem: Artwork;
    handleCloseInfo: () => void;
    changeActiveItem: (newVal: number) => void;
    activeItemIndex: number;
    artworksLength: number;
}

const Modal: React.FC<ModalProps> = ({
    activeItem,
    handleCloseInfo,
    changeActiveItem,
    activeItemIndex,
    artworksLength,
}) => {
    const { artist, description, url, coleccion, styles, size, price, year } =
        activeItem;
    const modalContainerRef = useRef<HTMLDivElement>(null);
    const modalBkgRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        modalContainerRef.current?.focus();
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    const handlePrevItem = () => {
        const prevIndex =
            activeItemIndex - 1 >= 0 ? activeItemIndex - 1 : artworksLength - 1;
        changeActiveItem(prevIndex);
    };

    const handleNextItem = () => {
        const nextIndex =
            activeItemIndex + 1 < artworksLength ? activeItemIndex + 1 : 0;
        changeActiveItem(nextIndex);
    };

    useKeypress(
        ["ArrowRight", "ArrowLeft", "Escape"],
        (event: KeyboardEvent) => {
            event.preventDefault();
            if (event.key === "ArrowRight") {
                handleNextItem();
            } else if (event.key === "ArrowLeft") {
                handlePrevItem();
            } else if (event.key === "Escape") {
                handleCloseInfo();
            }
        },
        [handleNextItem, handlePrevItem, handleCloseInfo]
    );

    const handlers = useSwipeable({
        onSwipedLeft: handleNextItem,
        onSwipedRight: handlePrevItem,
        trackMouse: true,
    });

    const handleOutsideClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === modalBkgRef.current) {
            handleCloseInfo();
        }
    };

    const title = titleOf(activeItem);
    const hasStyles = styles?.length > 0 && styles[0]?.length >= 3;

    return (
        <div
            className={Styles.modalContainer}
            {...handlers}
            onClick={handleOutsideClick}
            ref={modalBkgRef}
        >
            <div className={Styles.stage} onClick={(e) => e.stopPropagation()}>
                <button
                    className={Styles.navButton}
                    onClick={handlePrevItem}
                    aria-label="Obra anterior"
                >
                    ‹
                </button>

                <div
                    className={Styles.modal}
                    tabIndex={0}
                    ref={modalContainerRef}
                >
                    <button
                        aria-label="Cerrar"
                        className={Styles.buttonClose}
                        onClick={handleCloseInfo}
                    >
                        ✕
                    </button>

                    <div className={Styles.figure}>
                        {/* Full resolution here — this is the one place it earns its weight. */}
                        <img src={url} alt={description || title} />
                    </div>

                    <div className={Styles.info}>
                        <h3 className={Styles.title}>{title}</h3>
                        <div className={Styles.artist}>
                            {artist || "Shirley Madero"}
                        </div>

                        {description && (
                            <div className={Styles.description}>
                                {description}
                            </div>
                        )}

                        <div className={Styles.specs}>
                            {hasStyles && (
                                <div>Técnica/estilo: {styles.join(", ")}</div>
                            )}
                            {coleccion && <div>Colección: {coleccion}</div>}
                            {sizeLabel(size) && (
                                <div>Medida: {sizeLabel(size)}</div>
                            )}
                            {year && <div>Año: {year}</div>}
                            {price && Number(price) > 0 && (
                                <div>Precio: {price} UYU</div>
                            )}
                            <div>Estado: {statusLabel(activeItem)}</div>
                        </div>

                        <WhatsAppLink
                            title={title}
                            className={`${Styles.cta} btn btn--terracotta`}
                        />
                    </div>
                </div>

                <button
                    className={Styles.navButton}
                    onClick={handleNextItem}
                    aria-label="Obra siguiente"
                >
                    ›
                </button>
            </div>
        </div>
    );
};

export default Modal;
