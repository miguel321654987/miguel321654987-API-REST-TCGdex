import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import defaultImage from "../../assets/no-card-image.png";
import { openModalSafely } from "../utils.js";

export const Home = () => {
  const { store, actions } = useGlobalReducer();

  // Extraemos las variables directamente desde store global
  const { list: pokemons, loading, error } = store.api;
  const { list: favoritos } = store.favorites;

  // Nuevo: obtenemos desde la URL el nombre escrito en el Navbar
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("search") || "";

  // Nuevo: normalizamos el texto para ignorar mayúsculas y acentos
  const normalize = (value) =>
    String(value ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  // Nuevo: localizamos las cartas cuyo nombre coincide parcialmente
  const filteredPokemons = pokemons.filter((pokemon) =>
    normalize(pokemon.pokemon_name).includes(normalize(searchTerm)),
  );

  // Nuevo: seleccionamos la carta cuando el nombre coincide exactamente
  const pokemonEncontrado = searchTerm
    ? filteredPokemons.find(
        (pokemon) => normalize(pokemon.pokemon_name) === normalize(searchTerm),
      )
    : null;

  // Reutilizamos la lista de favoritos del store
  const esFavorito = (pokemonId) =>
    favoritos.some((card) => String(card.id) === String(pokemonId));

  // Usamos las acciones ya creadas en actions.js
  const handleToggleFavorite = async (pokemon) => {
    if (!store.token || !store.user?.id) {
      openModalSafely("loginModal");
      return;
    }

    if (esFavorito(pokemon.id)) {
      await actions.eliminarFavoritoBackend(store.user.id, pokemon.id);
      return;
    }

    await actions.añadirFavoritoBackend(store.user.id, pokemon);
  };

  useEffect(() => {
    actions.obtenerPokemons();
  }, []);

  return (
    <div className="container text-center mt-5 text-light">
      <h1 className="home-title fw-bold mb-4 animate-pulse">
        ¡Bienvenido a la PokeApp TCG!
      </h1>

      {/* Nuevo: muestra una carta superpuesta cuando hay coincidencia exacta */}
      {pokemonEncontrado && (
        <div className="search-result-overlay">
          <div className="card bg-dark text-light border-warning shadow-lg">
            <img
              src={pokemonEncontrado.image}
              alt={pokemonEncontrado.pokemon_name}
              className="card-img-top p-3"
            />

            <div className="card-body">
              <h2 className="h5 text-warning">
                {pokemonEncontrado.pokemon_name}
              </h2>

              <p className="text-secondary mb-3">ID: {pokemonEncontrado.id}</p>

              <Link
                to={`/pokemon/${pokemonEncontrado.id}`}
                className="btn btn-warning btn-sm w-100"
              >
                Ver detalles
              </Link>
            </div>
          </div>
        </div>
      )}

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
            // Se mantienen todas las cartas visibles en pantalla
            pokemons.map((pokemon) => {
              const favoritoActual = esFavorito(pokemon.id);

              return (
                <div key={pokemon.id} className="col-6 col-md-4 col-lg-3">
                  <div className="card bg-dark text-light border-secondary h-100 shadow-sm position-relative">
                    {/* Botón con aspecto de corazón para añadir o borrar favoritos */}
                    <button
                      type="button"
                      className={`btn btn-sm position-absolute top-0 end-0 m-2 rounded-circle ${
                        favoritoActual
                          ? "btn-danger"
                          : "btn-outline-light bg-dark bg-opacity-75"
                      }`}
                      onClick={() => handleToggleFavorite(pokemon)}
                      aria-label={
                        favoritoActual
                          ? "Quitar de favoritos"
                          : "Añadir a favoritos"
                      }
                      // tooltip opcional para accesibilidad y UX
                      title={
                        favoritoActual
                          ? "Quitar de favoritos"
                          : "Añadir a favoritos"
                      }
                    >
                      <i
                        className={`bi ${
                          favoritoActual ? "bi-heart-fill" : "bi-heart"
                        }`}
                        style={{ fontSize: "1.1rem" }}
                      ></i>
                    </button>

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
                          e.target.onerror = null;
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
