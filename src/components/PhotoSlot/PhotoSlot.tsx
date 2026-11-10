import React, { useState } from "react";
import styles from "./PhotoSlot.module.css";

interface PhotoSlotProps {
    src?: string;
    alt: string;
    /** Shown when there is no src, or the src fails to load. */
    placeholder: string;
    className?: string;
}

/**
 * The code counterpart of the design's <image-slot>: a fixed-size frame that
 * shows a labelled placeholder until a real photo exists. Keeps the layout
 * honest for sections whose imagery hasn't been supplied yet, instead of
 * rendering a broken-image icon.
 */
const PhotoSlot: React.FC<PhotoSlotProps> = ({
    src,
    alt,
    placeholder,
    className,
}) => {
    const [failed, setFailed] = useState(false);

    const showPlaceholder = !src || failed;

    return (
        <div className={`${styles.slot} ${className ?? ""}`}>
            {showPlaceholder ? (
                <div className={styles.placeholder}>{placeholder}</div>
            ) : (
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    onError={() => setFailed(true)}
                />
            )}
        </div>
    );
};

export default PhotoSlot;
