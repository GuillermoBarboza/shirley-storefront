// shirley-storefront/src/App.tsx
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Galeria from "./pages/Galeria";
import Home from "./pages/Home";
import VirtualGallery from "./pages/VirtualGallery";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/galeria" element={<Galeria />} />
                <Route path="/virtual-gallery" element={<VirtualGallery />} />
            </Routes>
        </Router>
    );
}

export default App;
