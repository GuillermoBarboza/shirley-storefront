import React from "react";
import "./App.css";
import ArtworkList from "./components/ArtworkList/ArtworkList";

function App() {
  return (
    <div className="App">
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
      <footer>
        <p>
          <strong>Hola, soy Shirley Madero</strong>
        </p>
        <p>
          Hacé tu consulta al{" "}
          <a
            href={`https://wa.me/+59892904603`}
            target="_blank"
            rel="noopener noreferrer"
          >
            +598 92 904 603
          </a>
        </p>
        <p>
          <i>© 2023</i>
        </p>
      </footer>
    </div>
  );
}

export default App;
