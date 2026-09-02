import { useEffect } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Favoritos = () => {
  const { store, actions } = useGlobalReducer();

  const { list: favoritos, loading, error } = store.favorites;

  useEffect(() => {
    if (store.user?.id) {
      actions.cargarFavoritosBackend(store.user.id);
    }
  }, [store.user?.id]);

  return (
    <div className="container text-center mt-5 text-light mb-5">
      <Link to="/" className="btn btn-outline-secondary mb-4">
        ← Volver a la Colección
      </Link>
      <h1 className="mb-4 text-warning">⭐ Mis Cartas Favoritas</h1>
      <p className="text-secondary">
        Esta es tu colección privada guardada en la base de datos.
      </p>

      {loading ? (
        <div className="mt-4">
          <p className="text-warning">Cargando tu colección privada...</p>
          <div className="spinner-border text-warning" role="status"></div>
        </div>
      ) : error ? (
        <p className="text-danger mt-4">Hubo un error: {error}</p>
      ) : (
        <div className="row g-4 justify-content-center mt-2">
          {favoritos.length === 0 ? (
            <div className="mt-5 p-5 bg-dark rounded border border-secondary">
              <p className="text-muted fs-5 mb-3">
                Aún no has guardado ninguna carta.
              </p>
              <Link to="/" className="btn btn-warning btn-sm">
                Ir a buscar cartas
              </Link>
            </div>
          ) : (
            favoritos.map((pokemon) => {
              return (
                <div key={pokemon.id} className="col-6 col-md-4 col-lg-3">
                  <div className="card bg-dark text-light border-warning h-100 shadow-sm">
                    {/* Contenedor de la imagen */}
                    <div
                      className="p-3 bg-secondary bg-opacity-20 d-flex justify-content-center align-items-center"
                      style={{ minHeight: "220px" }}
                    >
                      <img
                        src={pokemon.image}
                        alt={pokemon.pokemon_name}
                        className="img-fluid"
                        style={{ maxHeight: "180px", objectFit: "contain" }}
                        // Si la carta ya no existe en el CDN, muestra un placeholder
                        onError={(e) => {
                          e.target.src = "https://placehold.co";
                        }}
                      />
                    </div>

                    {/* Cuerpo de la tarjeta */}
                    <div className="card-body d-flex flex-column justify-content-between">
                      <h5 className="card-title text-capitalize fs-6 mb-3 text-start">
                        <span className="text-warning fs-6 small block d-block mb-1">
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
