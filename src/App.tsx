// shirley-storefront/src/App.tsx
import React from "react";
import {
    BrowserRouter as Router,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";
import Galeria from "./pages/Galeria";
import Home from "./pages/Home";
import Experiencias from "./pages/Experiencias";

/**
 * "Ver en tu pared" (in the painting modal) replaced the Sala Virtual 3D room;
 * old links to the room land on the gallery. three.js now loads only with the
 * lazy WallView chunk, on phones that can run AR.
 */
function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/galeria" element={<Galeria />} />
                <Route path="/experiencias" element={<Experiencias />} />
                <Route
                    path="/virtual-gallery"
                    element={<Navigate to="/galeria" replace />}
                />
            </Routes>
        </Router>
    );
}

export default App;
