// shirley-storefront/src/App.tsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Galeria from "./pages/Galeria";
import Home from "./pages/Home";
import Experiencias from "./pages/Experiencias";
import { Layout } from "./components/Layout/Layout";
import styles from "./App.module.css";

/**
 * VirtualGallery is the only page that pulls in three / @react-three, and it
 * preloads a 443 KB GLTF model at module scope. Imported eagerly, every visitor
 * paid for both on the home page. Lazy keeps them in their own chunk, fetched
 * when someone actually opens the room.
 */
const VirtualGallery = lazy(() => import("./pages/VirtualGallery"));

const RouteFallback = () => (
    <Layout>
        <div className={styles.fallback}>Cargando sala virtual…</div>
    </Layout>
);

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/galeria" element={<Galeria />} />
                <Route path="/experiencias" element={<Experiencias />} />
                <Route
                    path="/virtual-gallery"
                    element={
                        <Suspense fallback={<RouteFallback />}>
                            <VirtualGallery />
                        </Suspense>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
