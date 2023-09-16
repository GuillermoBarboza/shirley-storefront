import React from "react";
import "./App.css";
import ArtworkList from "./components/ArtworkList/ArtworkList";

function App() {
  return (
    <div className="App">
      <div className="banner">
        <div>
          <img src="./shirley.jpeg" alt="Shirley con su caballete" />
        </div>
        <h1>Las mujeres que me habitan</h1>
        <p>
          Yo no estimo tesoros ni riquezas <br />
          ....Yo estimo hermosura
          <br /> ...rostros de Santa azul y tostada frente. <br />
          Por que entre cien mundanas he de encontrar tu cara.
        </p>
      </div>
      <div className="container">
        <ArtworkList />
      </div>
    </div>
  );
}

export default App;
