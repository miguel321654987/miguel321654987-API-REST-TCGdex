import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import defaultImage from "../../assets/no-card-image.png";
import { openModalSafely } from "../utils.js";

export const Home = () => {
  const { store, actions } = useGlobalReducer();

  // 1) El catálogo base de Home sigue siendo store.api.list.
  // 2) El resultado de un filtro del Sidebar se guarda en store.api.filtered.
  // 3) La clave es decidir qué lista renderizar en cada momento.
  const { list: pokemons, filtered, listLoading, error } = store.api;

  const { list: favoritos } = store.favorites;

  // Leemos el filtro de búsqueda del Navbar, si existe.
  const [searchParams] = useSearchParams();
  const searchFilter = searchParams.get("filter") || "";

  // Si hay filtros aplicados en el Sidebar, la vista debe mostrar filtered.
  // Si no hay filtros activos, debe volver al listado inicial de Home.
  const hasActiveFilters =
    Array.isArray(filtered) && filtered.length > 0 && filtered !== pokemons;

  // Variable final que decide qué listado mostrar en pantalla.
  // Esto es lo que corrige el bug: no se sigue renderizando el listado base
  // cuando ya hay un resultado de filtros en store.api.filtered.
  const cartasAMostrar =
    hasActiveFilters && Array.isArray(filtered) && filtered.length > 0
      ? filtered
      : pokemons;

  // Si además hay un filtro textual del Navbar, mostramos la primera coincidencia
  // como "overlay" encima del listado.
  const pokemonEncontrado =
    searchFilter.trim() && filtered.length > 0 ? filtered[0] : null;

  // Reutilizamos la lista de favoritos del store para pintar el corazón.
  const esFavorito = (pokemonId) =>
    favoritos.some((card) => String(card.id) === String(pokemonId));

  // Manejamos el toggle de favoritos.
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

  // Carga inicial del catálogo base de Home.
  useEffect(() => {
    actions.obtenerPokemons();
  }, []);

  return (
    <div className="container text-center mt-5 text-light">
      <h1 className="home-title fw-bold mb-4 animate-pulse">
        ¡Bienvenido a la PokeApp POKEMONWORLD!
      </h1>

      {/* Si hay una coincidencia exacta en la búsqueda del Navbar, la mostramos
          destacada en una tarjeta superior. */}
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

      {listLoading ? (
        <div className="mt-4">
          <p className="text-warning">Conectando con el servidor...</p>
          <div className="spinner-border text-warning" role="status"></div>
        </div>
      ) : error ? (
        <p className="text-danger mt-4">
          Hubo un error al cargar las cartas: {error}
        </p>
      ) : !cartasAMostrar || cartasAMostrar.length === 0 ? (
        <div className="row g-4 justify-content-center mt-2">
          <p className="text-danger">
            No se recibieron datos desde el servidor de TCGdex.
          </p>
        </div>
      ) : (
        // Aquí se renderiza la lista final según el estado del filtro.
        // Si hay filtros, muestra filtered; si no, muestra el catálogo base.
        <div className="row g-4 justify-content-center mt-2">
          {cartasAMostrar.map((pokemon) => {
            const favoritoActual = esFavorito(pokemon.id);

            return (
              <div key={pokemon.id} className="col-6 col-md-4 col-lg-3">
                <div className="card bg-dark text-light border-secondary h-100 shadow-sm position-relative">
                  {/* Botón de favoritos */}
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
          })}
        </div>
      )}
    </div>
  );
};
