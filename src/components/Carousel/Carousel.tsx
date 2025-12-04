import React, { useEffect, useState, useRef } from "react";
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
    className: styles.carousel,
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
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const carouselRef = useRef<Carousel>(null);

    function drawOilPaintingTexture0(canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
    
        const width = canvas.width;
        const height = canvas.height;
    
        // Generate random strokes continuously
        function draw(ctx: CanvasRenderingContext2D) {
            ctx.clearRect(0, 0, width, height);
    
            for (let i = 0; i < 350; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
    
                const strokeLength = Math.random() * 120 + 60; // Bigger strokes
                const angle = Math.random() * Math.PI * 2.1;
                const opacity = Math.random() * 0.5 + 0.2; // Random opacity (0.2 - 0.7)
                const color = `rgba(125, 83, 28, ${opacity})`; // Color close to desired
    
                ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.lineWidth = Math.random() * 20 + 15; // Thicker strokes
                ctx.lineCap = "round";
    
                // Create wavy stroke
                const steps = 10 + Math.floor(Math.random() * 5);
                for (let j = 0; j <= steps; j++) {
                    const offsetX =
                        Math.cos(angle + j * 0.3) * (strokeLength / steps) * j;
                    const offsetY =
                        Math.sin(angle + j * 0.3) * (strokeLength / steps) * j;
                    if (j === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x + offsetX, y + offsetY);
                }
                ctx.stroke();
            }
        }
    
    
        draw(ctx); // Initial draw
    }

    function drawOilPaintingTexture(canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
    
        const width = canvas.width;
        const height = canvas.height;
    
        // Calculate the number of strokes based on canvas dimensions
        const strokeDensity = 0.001; // Adjust density for more/less strokes
        const totalStrokes = Math.floor(width * height * strokeDensity);
    
        function draw(ctx: CanvasRenderingContext2D) {
            ctx.clearRect(0, 0, width, height);
    
            for (let i = 0; i < totalStrokes; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
    
                const strokeLength = Math.random() * 120 + 60; // Bigger strokes
                const angle = Math.random() * Math.PI * 2;
                const opacity = Math.random() * 0.5 + 0.2; // Random opacity (0.2 - 0.7)
                const color = `rgba(125, 83, 28, ${opacity})`; // Color close to desired
    
                ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.lineWidth = Math.random() * 20 + 10; // Thicker strokes
                ctx.lineCap = "round";
    
                // Create wavy stroke
                const steps = 10 + Math.floor(Math.random() * 5);
                for (let j = 0; j <= steps; j++) {
                    const offsetX =
                        Math.cos(angle + j * 0.3) * (strokeLength / steps) * j;
                    const offsetY =
                        Math.sin(angle + j * 0.3) * (strokeLength / steps) * j;
                    if (j === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x + offsetX, y + offsetY);
                }
                ctx.stroke();
            }
        }
    
        draw(ctx); // Initial draw
    }
    

    useEffect(() => {
        const carouselContainer = carouselRef.current?.containerRef?.current;
    
        const updateCanvasSize = () => {
            if (!canvasRef.current || !carouselContainer) return;
    
            const { clientWidth, clientHeight } = carouselContainer;
    
            // Ensure valid dimensions
            if (clientWidth && clientHeight) {
                canvasRef.current.width = clientWidth;
                canvasRef.current.height = clientHeight;
    
                console.log("Updated canvas dimensions to match carousel:", {
                    width: clientWidth,
                    height: clientHeight,
                });
    
                drawOilPaintingTexture(canvasRef.current);
            } else {
                console.warn("Carousel dimensions are not valid:", {
                    width: clientWidth,
                    height: clientHeight,
                });
            }
        };
    
        // Initial setup
        updateCanvasSize();
    
        // Handle window resize
        window.addEventListener("resize", updateCanvasSize);
    
        return () => {
            window.removeEventListener("resize", updateCanvasSize);
        };
    }, [carouselRef, canvasRef]);
    


    return (
        <div className={styles.root}>
            <canvas className={styles.canvas} ref={canvasRef} />

            <Carousel {...carouselConfig} ref={carouselRef} >
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
        </div>
    );
};

export default ArtworkCarousel;
