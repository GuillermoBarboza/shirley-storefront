import React from "react";
import "./App.css";
import ArtworkList from "./components/ArtworkList/ArtworkList";

function App() {
  return (
    <div className="App">
      <div className="banner">
        <img src="./shirley.jpeg" alt="Shirley con su caballete" />
        <h1>Las mujeres que me habitan</h1>
        <p>
          Yo no estimó tesoros ni riquezas ....Yo estimó hermosura ...rostros de
          Santa azul y tostada frente. Por que entre cien mundanas he de
          encontrar tu cara.
        </p>
      </div>
      <div className="container">
        <ArtworkList />
      </div>
    </div>
  );
}

export default App;
