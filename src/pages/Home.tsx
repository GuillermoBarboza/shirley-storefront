import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout/Layout";
import styles from "./Home.module.css";
import { convertToUrl } from "../utils/utils";
import { Artwork, thumbFor, titleOf, metaLine } from "../types/artwork";
import {
    useContactPhone,
    formatPhone,
    toWaNumber,
} from "../hooks/useContactPhone";

function Home() {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const phone = useContactPhone();

    useEffect(() => {
        const fetchArtworks = async () => {
            try {
                const response = await axios.get<Artwork[]>(
                    process.env.REACT_APP_API_ENDPOINT + "/latest"
                );
                setArtworks(response.data ?? []);
            } catch (error) {
                console.error("Error fetching Artworks:", error);
            }
        };

        fetchArtworks();
    }, []);

    const featured = artworks.slice(0, 6);
    const poemArt = artworks.slice(0, 2);

    return (
        <Layout>
            <section className={styles.hero}>
                <div className={styles.heroEyebrow}>Obra pictórica</div>
                <h1 className={styles.heroName}>Shirley Madero</h1>
                <p className={styles.heroLede}>
                    Retratos y figuras en óleo y técnica mixta — rostros que
                    habitan entre el color y la memoria.
                </p>
                <div className={styles.heroCta}>
                    <Link to="/galeria" className="btn">
                        Ver galería
                    </Link>
                </div>
            </section>

            <section className={styles.poem}>
                <div className={styles.poemInner}>
                    <div>
                        <div className={styles.poemLabel}>
                            Las mujeres que me habitan
                        </div>
                        <div className={styles.poemBody}>
                            Yo no estimo tesoros ni riquezas
                            <br />
                            ....Yo estimo hermosura
                            <br />
                            …rostros de Santa azul y tostada frente.
                            <br />
                            Porque entre cien mundanas he de encontrar tu cara.
                        </div>
                    </div>
                    <div className={styles.poemArt}>
                        {poemArt.map((art) => (
                            <figure key={art._id}>
                                <img
                                    src={thumbFor(art)}
                                    alt={titleOf(art)}
                                    loading="lazy"
                                    decoding="async"
                                />
                            </figure>
                        ))}
                    </div>
                </div>
            </section>

            <section className={styles.recent}>
                <div className={styles.sectionHead}>
                    <h2 className={styles.sectionTitle}>Obras recientes</h2>
                    <Link to="/galeria" className={styles.sectionLink}>
                        Ver todas →
                    </Link>
                </div>
                <div className={styles.strip}>
                    {featured.map((art) => (
                        <Link
                            key={art._id}
                            to={`/galeria#${convertToUrl(art.title || "")}`}
                            className={styles.stripItem}
                        >
                            <div className={styles.stripFrame}>
                                <img
                                    src={thumbFor(art)}
                                    alt={titleOf(art)}
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>
                            <div className={styles.stripTitle}>
                                {titleOf(art)}
                            </div>
                            <div className={styles.stripMeta}>
                                {metaLine(art)}
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <section className={styles.experiencias}>
                <div className={styles.experienciasInner}>
                    <div className={styles.sectionHead}>
                        <div>
                            <div className={styles.experienciasEyebrow}>
                                Además de la pintura
                            </div>
                            <h2 className={styles.experienciasTitle}>
                                Experiencias con Shirley
                            </h2>
                        </div>
                        <Link
                            to="/experiencias"
                            className={styles.experienciasLink}
                        >
                            Ver experiencias →
                        </Link>
                    </div>
                    <div className={styles.cards}>
                        <Link to="/experiencias" className={styles.card}>
                            <div className={styles.cardTitle}>
                                Ritual del Mate
                            </div>
                            <div className={styles.cardBody}>
                                Una experiencia sensorial íntima entre arte,
                                memoria y tradición — en Ciudad Vieja,
                                Montevideo.
                            </div>
                        </Link>
                        <Link to="/experiencias" className={styles.card}>
                            <div className={styles.cardTitle}>
                                Recorridos Murales
                            </div>
                            <div className={styles.cardBody}>
                                Paseos a pie por las historias y los murales
                                escondidos en los barrios de Montevideo.
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            <section className={styles.bio}>
                <div className={styles.bioInner}>
                    <img
                        className={styles.portrait}
                        src="./shirley.jpeg"
                        alt="Shirley Madero con su caballete"
                        loading="lazy"
                    />
                    <div className={styles.bioText}>
                        <h2 className={styles.bioTitle}>
                            Hola, soy Shirley Madero
                        </h2>
                        <p className={styles.bioBody}>
                            Pintora. Trabajo con óleo y técnica mixta — retratos
                            y figuras que exploran memoria e identidad.
                        </p>
                        {phone && (
                            <a
                                href={`tel:+${toWaNumber(phone)}`}
                                className="btn btn--terracotta"
                            >
                                Hacé tu consulta al {formatPhone(phone)}
                            </a>
                        )}
                    </div>
                </div>
            </section>
        </Layout>
    );
}

export default Home;
