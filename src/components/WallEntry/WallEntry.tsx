import React, { useEffect, useRef, useState } from "react";
import { Artwork } from "../../types/artwork";
import { useWallMode } from "../../hooks/useWallMode";
import { wallLink } from "../../wall/link";
import { parseSize } from "../../wall/size";
import styles from "./WallEntry.module.css";

type WallViewModule = typeof import("../WallView/WallView");

interface WallEntryProps {
    artwork: Artwork;
    /** Arrived through a "Ver en tu pared" link: draw attention to the entry. */
    highlight?: boolean;
}

/**
 * "Ver en tu pared" in the painting modal. What it shows depends on the device:
 * the AR button on phones that can run it, a QR on desktop, a copy-link
 * fallback on phones whose browser can't, and a note on iPhone.
 */
const WallEntry: React.FC<WallEntryProps> = ({ artwork, highlight }) => {
    const mode = useWallMode();
    const [qr, setQr] = useState("");
    const [copied, setCopied] = useState(false);
    const [opening, setOpening] = useState(false);
    const [failed, setFailed] = useState(false);
    const wallView = useRef<Promise<WallViewModule> | null>(null);
    const approximate = !parseSize(artwork.size);
    const link = wallLink(artwork, window.location.origin);

    // Fetch the AR chunk as soon as we know it will be used, so the tap can
    // start the camera straight away (browsers only allow it right after a tap).
    useEffect(() => {
        if (mode === "ar" && !wallView.current) {
            // A failed prefetch (flaky network) must not stick: clear it so the tap re-imports.
            wallView.current = import("../WallView/WallView");
            wallView.current.catch(() => {
                wallView.current = null;
            });
        }
    }, [mode]);

    useEffect(() => {
        if (mode !== "desktop") return;
        let alive = true;
        import("qrcode")
            .then((qrcode) => (qrcode.default ?? qrcode).toDataURL(link, { margin: 1, width: 320 }))
            .then((url) => alive && setQr(url))
            .catch((error) => console.error("No se pudo generar el QR:", error));
        return () => {
            alive = false;
        };
    }, [mode, link]);

    useEffect(() => setCopied(false), [link]);

    if (!mode) return null;

    const sizeNote = approximate && mode !== "iphone" && (
        <span className={styles.approx}>Tamaño aproximado</span>
    );

    if (mode === "ar") {
        const open = () => {
            if (opening) return;
            setOpening(true);
            setFailed(false);
            (wallView.current ?? import("../WallView/WallView"))
                .then((m) =>
                    m.startWallView({
                        artwork,
                        imageUrl: artwork.url,
                        onEnd: () => setOpening(false),
                    })
                )
                .catch((error) => {
                    console.error("No se pudo abrir la vista en pared:", error);
                    wallView.current = null;
                    setFailed(true);
                    setOpening(false);
                });
        };
        return (
            <div className={`${styles.entry} ${highlight ? styles.highlight : ""}`}>
                <button className="btn btn--olive" onClick={open} disabled={opening}>
                    Ver en tu pared
                </button>
                {sizeNote}
                {failed && (
                    <p className={styles.note}>
                        No pudimos abrir la cámara. Revisá los permisos del navegador.
                    </p>
                )}
            </div>
        );
    }

    if (mode === "iphone") {
        return (
            <div className={styles.entry}>
                <p className={styles.note}>Por ahora, ver en tu pared funciona en Android.</p>
            </div>
        );
    }

    if (mode === "phone-no-ar") {
        const copy = () => {
            navigator.clipboard
                ?.writeText(link)
                .then(() => setCopied(true))
                .catch((error) => console.error("No se pudo copiar el enlace:", error));
        };
        return (
            <div className={`${styles.entry} ${highlight ? styles.highlight : ""}`}>
                <p className={styles.note}>Para verlo en tu pared, abrí esta página en Chrome</p>
                <button className={`btn ${styles.small}`} onClick={copy}>
                    {copied ? "Enlace copiado" : "Copiar enlace"}
                </button>
                {sizeNote}
            </div>
        );
    }

    return (
        <div className={`${styles.entry} ${styles.desktop}`}>
            {qr && <img className={styles.qr} src={qr} alt="Código QR para abrir esta obra en tu celular" />}
            <div>
                <p className={styles.note}>¿Querés verlo en tu pared? Abrilo en tu celular</p>
                {sizeNote}
            </div>
        </div>
    );
};

export default WallEntry;
