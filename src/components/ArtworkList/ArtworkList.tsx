import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import styles from "./Artwork.module.css";
import Modal from "../Modal/Modal";
import ArtworkElem from "../Artwork/Artwork";
import { convertToUrl } from "../../utils/utils";
import { Artwork } from "../../types/artwork";

/** Two rows of the 4-up desktop grid. */
const PAGE = 8;

type Status = "loading" | "ready" | "error";

const SkeletonGrid = ({
    count,
    className,
}: {
    count: number;
    className?: string;
}) => (
    <div className={`${styles.grid} ${className ?? ""}`}>
        {Array.from({ length: count }, (_, i) => (
            <div key={`sk-${i}`} className={styles.skeletonTile}>
                <div className={`${styles.skeletonFrame} skeleton`} />
                <div className={styles.skeletonLine} />
            </div>
        ))}
    </div>
);

/** Lets the page banner show the piece count without fetching the list twice. */
interface ArtworkListProps {
    onCountChange?: (count: number) => void;
}

const ArtworkList: React.FC<ArtworkListProps> = ({ onCountChange }) => {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [status, setStatus] = useState<Status>("loading");
    const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
    const [visibleCount, setVisibleCount] = useState(PAGE);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);

    const artworkRefs = useRef<Array<HTMLLIElement | null>>([]);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const didScrollToHash = useRef(false);
    const loadingMoreRef = useRef(false);
    const visibleCountRef = useRef(PAGE);
    const loadTimer = useRef<number | undefined>(undefined);

    // Held in a ref so an inline arrow from the parent doesn't retrigger load().
    const onCountChangeRef = useRef(onCountChange);
    onCountChangeRef.current = onCountChange;

    // loadMore reads the count through a ref so it doesn't need to be rebuilt
    // (and the observer re-attached) on every window advance.
    visibleCountRef.current = visibleCount;

    const load = useCallback(() => {
        if (!process.env.REACT_APP_API_ENDPOINT) {
            setStatus("error");
            return;
        }
        setStatus("loading");
        window.clearTimeout(loadTimer.current);
        loadingMoreRef.current = false;
        setIsLoadingMore(false);
        setVisibleCount(PAGE);

        axios
            .get<Artwork[]>(process.env.REACT_APP_API_ENDPOINT)
            .then((response) => {
                const list = response.data ?? [];
                setArtworks(list);
                artworkRefs.current = list.map(() => null);
                onCountChangeRef.current?.(list.length);

                // A deep link may point at an artwork past the first window.
                // Widen the window up front so the scroll target actually exists.
                const hash = decodeURIComponent(
                    window.location.hash.substring(1)
                );
                if (hash) {
                    const index = list.findIndex(
                        (a) => convertToUrl(a.title || "") === hash
                    );
                    if (index >= 0) {
                        setVisibleCount(
                            Math.max(
                                PAGE,
                                Math.ceil((index + 1) / PAGE) * PAGE
                            )
                        );
                    }
                }
                setStatus("ready");
            })
            .catch((error) => {
                console.error("Error fetching artworks:", error);
                setStatus("error");
            });
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    // Scroll a deep-linked artwork into view once its tile has rendered.
    useEffect(() => {
        if (status !== "ready" || didScrollToHash.current) return;
        const hash = decodeURIComponent(window.location.hash.substring(1));
        if (!hash) return;

        const index = artworks.findIndex(
            (a) => convertToUrl(a.title || "") === hash
        );
        if (index < 0) return;

        const el = artworkRefs.current[index];
        if (!el) return;

        didScrollToHash.current = true;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus({ preventScroll: true });
    }, [status, artworks, visibleCount]);

    const loadMore = useCallback(() => {
        // Ref guard rather than reading isLoadingMore: the observer can fire
        // several times before a state update lands.
        if (loadingMoreRef.current) return;
        if (visibleCountRef.current >= artworks.length) return;

        loadingMoreRef.current = true;
        setIsLoadingMore(true);

        // Brief skeleton so the jump reads as a load rather than a flash.
        loadTimer.current = window.setTimeout(() => {
            setVisibleCount((c) => Math.min(c + PAGE, artworks.length));
            setIsLoadingMore(false);
            loadingMoreRef.current = false;
        }, 350);
    }, [artworks.length]);

    const sentinelRef = useCallback((el: HTMLDivElement | null) => {
        setSentinel(el);
    }, []);

    /*
     * Re-create the observer every time the window advances.
     *
     * IntersectionObserver only fires on a *change* of intersection state. With
     * a 600px rootMargin the sentinel usually stays continuously intersecting
     * after more tiles render, so a single long-lived observer goes silent after
     * a couple of pages and the list stalls partway through. Rebuilding it makes
     * the browser re-evaluate intersection from scratch, which fires again if the
     * sentinel is still in range.
     */
    useEffect(() => {
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) loadMore();
            },
            { rootMargin: "600px" }
        );
        observer.observe(sentinel);
        observerRef.current = observer;

        return () => observer.disconnect();
    }, [sentinel, visibleCount, loadMore]);

    useEffect(
        () => () => {
            observerRef.current?.disconnect();
            window.clearTimeout(loadTimer.current);
        },
        []
    );

    const handleItemClick = (_artwork: Artwork, index: number): void => {
        setActiveItemIndex(index);
    };

    const handleCloseInfo = (): void => {
        if (activeItemIndex !== null) {
            artworkRefs.current[activeItemIndex]?.focus();
        }
        setActiveItemIndex(null);
    };

    if (status === "loading") {
        return (
            <div>
                <div className={styles.loadingLabel}>Cargando obras…</div>
                <SkeletonGrid count={PAGE} />
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className={styles.errorPanel}>
                <div className={styles.errorTitle}>
                    No pudimos cargar la galería
                </div>
                <div className={styles.errorBody}>
                    Hubo un problema de conexión con el servidor. Intentá de
                    nuevo en unos minutos.
                </div>
                <button className="btn btn--dark" onClick={load}>
                    Reintentar
                </button>
            </div>
        );
    }

    const visible = artworks.slice(0, visibleCount);
    const hasMore = visibleCount < artworks.length;

    return (
        <div>
            <ul className={styles.grid}>
                {visible.map((artwork, index) => (
                    <ArtworkElem
                        artwork={artwork}
                        key={`artwork-${artwork._id || index}`}
                        onClick={handleItemClick}
                        index={index}
                        ref={(el) => {
                            artworkRefs.current[index] = el;
                        }}
                    />
                ))}
            </ul>

            {isLoadingMore && (
                <SkeletonGrid count={4} className={styles.moreGrid} />
            )}

            {hasMore && <div ref={sentinelRef} className={styles.sentinel} />}

            <div className={styles.shownLabel}>
                Mostrando {visible.length} de {artworks.length}
            </div>

            {activeItemIndex !== null && (
                <Modal
                    activeItem={artworks[activeItemIndex]}
                    handleCloseInfo={handleCloseInfo}
                    changeActiveItem={setActiveItemIndex}
                    activeItemIndex={activeItemIndex}
                    artworksLength={artworks.length}
                />
            )}
        </div>
    );
};

export default ArtworkList;
