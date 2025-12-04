import React, { useEffect } from "react";
import axios from "axios";
import { Analytics } from "@vercel/analytics/react";
import { Layout } from "../components/Layout/Layout";
import "../App.css";
import LandingCanvas from "../components/LandingCanvas/LandingCanvas";
import ArtworkCarousel from "../components/Carousel/Carousel";

function Home() {
    const [artworks, setArtworks] = React.useState([]);

    useEffect(() => {
        const fetchArtworks = async () => {
            try {
                const response = await axios.get(
                    process.env.REACT_APP_API_ENDPOINT + "/latest"
                );
                setArtworks(response.data);
            } catch (error) {
                console.error("Error fetching Artworks:", error);
            }
        };

        fetchArtworks();
    }, []);

    return (
        <Layout>
            <LandingCanvas></LandingCanvas>
            <div className="landing-page">
                <div className="name-container">
                    <span className="name">Shirley</span>
                    <span className="lastname">Madero</span>
                </div>
            </div>
            <div className="banner">
                <div className="content">
                    <img src="./shirley.jpeg" alt="Shirley con su caballete" />
                    <div className="text">
                        <h2>Las mujeres que me habitan</h2>
                        <p>
                            Yo no estimo tesoros ni riquezas <br />
                            ....Yo estimo hermosura
                            <br /> ...rostros de Santa azul y tostada frente. <br />
                            Porque entre cien mundanas he de encontrar tu cara.
                        </p>
                    </div>

                </div>
            </div>
            <ArtworkCarousel artworks={artworks} />
            <div className="container">
                <div className="column">
                    <img
                        src="./white-shirt.jpg"
                        alt="White shirt with painting"
                    />
                </div>
                <div className="column">
                    <img
                        src="./black-shirt.jpg"
                        alt="Black shirt with painting"
                    />
                </div>
            </div>
        </Layout>
    );
}

export default Home;
