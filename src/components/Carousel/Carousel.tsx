import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { convertToUrl } from "../../utils/utils";
import styles from "./Carousel.module.css";

interface Artwork {
    title: string;
    description: string;
    artist: string;
    styles: string[];
    size: string;
    price: number;
    year: number;
    available: boolean;
    coleccion: string;
    url: string;
}

const carouselConfig = {
    additionalTransfrom: 0,
    arrows: true,
    autoPlaySpeed: 3000,
    centerMode: false,
    className: "",
    containerClass: "container-with-dots",
    dotListClass: "",
    draggable: true,
    focusOnSelect: false,
    infinite: true,
    itemClass: styles.card,
    keyBoardControl: true,
    minimumTouchDrag: 80,
    pauseOnHover: true,
    renderArrowsWhenDisabled: false,
    renderButtonGroupOutside: false,
    renderDotsOutside: false,

    responsive: {
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 6,
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 4,
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 3,
            slidesToSlide: 1, // optional, default to 1.
        },
    },
    rewind: false,
    rewindWithAnimation: false,
    rtl: false,
    shouldResetAutoplay: true,
    showDots: false,
    sliderClass: "",
    slidesToSlide: 1,
    swipeable: true,
};

const ArtworkCarousel = (props: { artworks: Artwork[] }) => {
    return (
        <Carousel {...carouselConfig} className={styles.root}>
            {props.artworks.map((artwork, index) => {
                console.log(artwork.title);
                let title = convertToUrl(artwork.title);
                return (
                    <div key={index} className={styles.cardWrapper}>
                        <img
                            src={artwork.url}
                            alt={artwork.title}
                            className="carousel-image object-cover h-96 max-w-full"
                        />

                        <div>
                            <a href={`/galeria#${title}`}>Ver en Galeria</a>
                            <button>Ver en Remera</button>
                        </div>
                    </div>
                );
            })}
        </Carousel>
    );
};

export default ArtworkCarousel;
