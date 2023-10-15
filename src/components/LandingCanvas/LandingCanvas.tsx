import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import styles from "./LandingCanvas.module.css";

interface Square {
  color: string;
  height: number;
  width: number;
  x: number;
  y: number;
  opacity?: number;
  rotation?: number;
  compositeOperation: string;
}

const LandingCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const gridRows = 5; // Set the number of rows
  const gridCols = 5; // Set the number of columns

  const baseSquareHeight = windowDimensions.height / gridRows;
  const baseSquareWidth = windowDimensions.width / gridCols;

  /*   const squareSize = 100;
  const gridRows = Math.floor(windowDimensions.height / squareSize);
  const gridCols = Math.floor(windowDimensions.width / squareSize); */

  const colors = [
    "rgba(165, 101, 40, 1)",
    "rgba(181, 151, 76, 1)",
    "rgba(140, 56, 24, 1)",
    "rgba(113, 97, 73, 1)",
    "rgba(203, 121, 42, 1)",
  ];

  const initialSquareGrid: Square[][] = Array.from(
    { length: gridRows },
    (_, i) =>
      Array.from({ length: gridCols }, (_, j) => {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const heightMultiplier = Math.random() * 3 + 1; // Random multiplier between 1 and 4
        const height = Math.floor(baseSquareHeight * heightMultiplier); // Height is baseSquareHeight times the multiplier
        let widthMultiplier = (Math.random() + 1) * 3; // Random multiplier between 1 and 4
        if (heightMultiplier > 1.5) {
          widthMultiplier = Math.min(widthMultiplier, 2); // If height is more than 1.5 times the original, limit width to 2 times the original
        }
        const width = Math.floor(baseSquareWidth * widthMultiplier); // Width is baseSquareWidth times the multiplier
        const compositeOperation =
          Math.random() > 0.5 ? "source-over" : "destination-over";
        return {
          color,
          height,
          width,
          x: j * baseSquareWidth + baseSquareWidth / 2 - width / 2,
          y: i * baseSquareHeight + baseSquareHeight / 2 - height / 2,
          opacity: 1,
          rotation: 0,
          compositeOperation,
        };
      })
  );

  const [squareGrid, setSquareGrid] = useState<
    {
      color: string;
      height: number;
      width: number;
      x: number;
      y: number;
      opacity?: number;
      rotation?: number;
      compositeOperation: string;
    }[][]
  >(initialSquareGrid);

  const drawAndStyleSquare = (
    ctx: CanvasRenderingContext2D,
    square: Square
  ) => {
    const colorWithOpacity = square.color.replace(
      "1)",
      `${square.opacity ?? 1})`
    );
    ctx.fillStyle = colorWithOpacity;
    ctx.strokeStyle = `rgba(153, 133, 90, ${square.opacity ?? 1})`; // Add grey border with opacity
    ctx.lineWidth = 7; // Set border width

    // Save the current context state
    ctx.save();

    // Set the global composite operation
    //@ts-ignore
    ctx.globalCompositeOperation = square.compositeOperation;

    // Translate to the center of the square
    ctx.translate(square.x + square.width / 2, square.y + square.height / 2);

    // Rotate the context
    ctx.rotate(((square.rotation ?? 0) * Math.PI) / 180);

    // Draw the square at the origin, since the context is translated and rotated
    ctx.fillRect(
      -square.width / 2,
      -square.height / 2,
      square.width,
      square.height
    );

    // Draw the border
    ctx.strokeRect(
      -square.width / 2,
      -square.height / 2,
      square.width,
      square.height
    );

    // Restore the context state
    ctx.restore();
  };

  const drawSquare = (square: Square) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawAndStyleSquare(ctx, square);
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear the canvas before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw a square in each cell of the grid with the color and size from the squareGrid
    for (let i = 0; i < gridRows; i++) {
      for (let j = 0; j < gridCols; j++) {
        drawSquare(squareGrid[i][j]);
      }
    }

    // Request the next animation frame
    frameIdRef.current = requestAnimationFrame(animate);
  };

  const animateRowByRow = () => {
    for (let i = 0; i < gridRows; i++) {
      for (let j = 0; j < gridCols; j++) {
        gsap.to(squareGrid[i][j], {
          duration: 0.255,
          opacity: 0,
          ease: "power2.in",
          delay: i * 0.6,
          onUpdate: () => setSquareGrid((prev) => [...prev]),
        });
      }
    }
  };

  const animateSourceOver = () => {
    const duration = 0.5;
    const delay = 0.15;

    const squares = [];
    for (let i = 0; i < gridRows; i++) {
      for (let j = 0; j < gridCols; j++) {
        squares.push(squareGrid[i][j]);
      }
    }

    // Separate squares based on composite operation
    const sourceOverSquares = squares.filter(
      (square) => square.compositeOperation === "source-over"
    );
    const destinationOverSquares = squares.filter(
      (square) => square.compositeOperation === "destination-over"
    );

    // Randomize the order of squares
    sourceOverSquares.sort(() => Math.random() - 0.5);
    destinationOverSquares.sort(() => Math.random() - 0.5);

    // Animate squares with source-over first
    sourceOverSquares.forEach((square, index) => {
      gsap.to(square, {
        duration: duration,
        opacity: 0,
        ease: "power2.in",
        delay: index * delay,
        onComplete: () => setSquareGrid([...squareGrid]),
      });
    });

    // Then animate squares with destination-over
    destinationOverSquares.forEach((square, index) => {
      gsap.to(square, {
        duration: duration,
        opacity: 0,
        ease: "power2.in",
        delay: (sourceOverSquares.length + index) * delay,
        onComplete: () => setSquareGrid([...squareGrid]),
      });
    });
  };

  const animationPatterns = {
    rowByRow: animateRowByRow,
    sourceFirst: animateSourceOver,
  };

  useEffect(() => {
    gsap.ticker.add(animate);

    // Choose the animation pattern based on some condition
    const pattern = "rowByRow"; // Change this to choose the pattern
    animationPatterns[pattern]();

    return () => {
      gsap.ticker.remove(animate);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      className={styles.canvas}
      ref={canvasRef}
      width={windowDimensions.width}
      height={windowDimensions.height}
    />
  );
};

export default LandingCanvas;
