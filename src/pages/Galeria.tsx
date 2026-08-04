// shirley-storefront/src/pages/Galeria.tsx
import React, { useState } from "react";
import { Layout } from "../components/Layout/Layout";
import ArtworkList from "../components/ArtworkList/ArtworkList";
import styles from "./Galeria.module.css";

const Galeria: React.FC = () => {
    const [count, setCount] = useState<number | null>(null);

    return (
        <Layout>
            <div className={styles.banner}>
                <h1 className={styles.title}>Obras de arte</h1>
                <div className={styles.count}>
                    {count === null ? " " : `${count} piezas`}
                </div>
            </div>
            <div className={styles.body}>
                <ArtworkList onCountChange={setCount} />
            </div>
        </Layout>
    );
};

export default Galeria;
