// shirley-storefront/src/pages/Galeria.tsx
import React, { useEffect, useState } from "react";
import { Layout } from "../components/Layout/Layout";
import ArtworkList from "../components/ArtworkList/ArtworkList";

const Galeria: React.FC = () => {
    return (
        <Layout>
            <div className="banner">
                <div>
                    <img src="./shirley.jpeg" alt="Shirley con su caballete" />

                    <h1>Las mujeres que me habitan</h1>
                    <p>
                        Yo no estimo tesoros ni riquezas <br />
                        ....Yo estimo hermosura
                        <br /> ...rostros de Santa azul y tostada frente. <br />
                        Porque entre cien mundanas he de encontrar tu cara.
                    </p>
                </div>
            </div>
            <div className="container">
                <ArtworkList />
            </div>
        </Layout>
    );
};

export default Galeria;
