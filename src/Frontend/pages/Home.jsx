import { useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { Link } from "react-router-dom";
import defaultImage from "../../assets/no-card-image.png";

export const Home = () => {
  const { store, actions } = useGlobalReducer();

  // Extraemos las variables directamente desde store global
  const { list: pokemons, loading, error } = store.api;

  useEffect(() => {
    actions.obtenerPokemons();
  }, []);

  return (
    <div className="container text-center mt-5 text-light">
      <h1
        className="fw-bold mb-4 animate-pulse"
        style={{
          fontSize: "calc(1.4rem + 1.8vw)",
          background: "linear-gradient(45deg, #46cef0, #ffda07, #ff8522de)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0px 4px 12px rgba(255, 193, 7, 0.5))",
          letterSpacing: "1px",
          fontFamily: "'Arial Black', Impact, sans-serif",
        }}
      >
        ¡Bienvenido a la PokeApp TCG!
      </h1>

      {loading ? (
        <div className="mt-4">
          <p className="text-warning">Conectando con el servidor...</p>
          <div className="spinner-border text-warning" role="status"></div>
        </div>
      ) : error ? (
        <p className="text-danger mt-4">
          Hubo un error al cargar las cartas: {error}
        </p>
      ) : (
        <div className="row g-4 justify-content-center mt-2">
          {!pokemons || pokemons.length === 0 ? (
            <p className="text-danger">
              No se recibieron datos desde el servidor de TCGdex.
            </p>
          ) : (
            pokemons.map((pokemon) => {
              return (
                <div key={pokemon.id} className="col-6 col-md-4 col-lg-3">
                  <div className="card bg-dark text-light border-secondary h-100 shadow-sm">
                    <div
                      className="p-3 bg-secondary bg-opacity-20 d-flex justify-content-center align-items-center"
                      style={{ minHeight: "220px" }}
                    >
                      <img
                        src={pokemon.image}
                        alt={pokemon.pokemon_name}
                        className="img-fluid"
                        style={{ maxHeight: "180px", objectFit: "contain" }}
                        onError={(e) => {
                          e.target.onerror = null; // Evita bucles infinitos de recarga
                          e.target.src = defaultImage;
                        }}
                      />
                    </div>
                    <div className="card-body d-flex flex-column justify-content-between">
                      <h5 className="card-title text-capitalize fs-6 mb-3 text-start">
                        <span className="text-secondary fs-6 small block d-block mb-1">
                          ID: {pokemon.id}
                        </span>
                        {pokemon.pokemon_name}
                      </h5>
                      <Link
                        to={`/pokemon/${pokemon.id}`}
                        className="btn btn-outline-warning btn-sm w-100"
                      >
                        Ver Detalles
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
