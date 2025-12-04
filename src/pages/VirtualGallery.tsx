import React from "react";
import { Layout } from "../components/Layout/Layout";

const VirtualGallery: React.FC = () => {
    return (
        <Layout>
            <div className="virtual-gallery-placeholder">
                <h1>Virtual Gallery</h1>
                <p>Coming soon: Spline integration 🚧</p>
            </div>
        </Layout>
    );
};

export default VirtualGallery;
