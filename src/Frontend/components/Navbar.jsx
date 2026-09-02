import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { openModalSafely } from "../utils.js";
import { toast } from "react-toastify";

export const Navbar = () => {
  const { store, actions } = useGlobalReducer();
  const navigate = useNavigate();

  // Garantizamos que 'favoritos' siempre sea un array para evitar errores de .length
  const favoritos = store.favorites?.list || [];

  const clickLogout = () => {
    actions.handleLogout();
    toast.info("Sesión cerrada correctamente");
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <div className="container-fluid d-flex justify-content-between">
        <Link to="/" className="navbar-brand font-weight-bold">
          🚀 PokemonWorld
        </Link>
        <div className="d-flex align-items-center gap-2">
          {/* Menú Dropdown de Favoritos */}
          <div className="btn-group">
            <button
              type="button"
              className="btn btn-info dropdown-toggle btn-sm d-flex align-items-center gap-2"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <span>Favoritos</span>
              {/* TOTAL DINÁMICO: Badge estilizado con Bootstrap 5 */}
              <span className="badge bg-dark text-info fw-bold">
                {favoritos.length}
              </span>
            </button>
            <ul
              className="dropdown-menu dropdown-menu-end"
              style={{
                minWidth: "220px",
                maxHeight: "300px",
                overflowY: "auto",
              }}
            >
              {favoritos.length > 0 ? (
                <>
                  {favoritos.map((fav) => (
                    <li key={fav.id}>
                      <Link
                        to={`/pokemon/${fav.id}`}
                        className="dropdown-item d-flex align-items-center justify-content-between py-2"
                      >
                        {/* NOMBRE: Compatibilidad doble (Backend y Frontend) */}
                        <span
                          className="text-capitalize text-truncate me-2"
                          style={{ maxWidth: "140px" }}
                        >
                          {fav.pokemon_name || fav.name || `Pokémon #${fav.id}`}
                        </span>
                        <i className="bi bi-heart-fill text-danger small"></i>
                      </Link>
                    </li>
                  ))}

                  <li>
                    <hr className="dropdown-divider" />
                  </li>

                  <li>
                    <Link
                      to="/favoritos"
                      className="dropdown-item text-center text-warning fw-semibold small"
                    >
                      Ver todos mis favoritos
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <span className="dropdown-item text-muted small text-center py-2">
                      No hay favoritos
                    </span>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <Link
                      to="/favoritos"
                      className="dropdown-item text-warning fw-semibold text-center small"
                    >
                      Ver favoritos
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* RENDERIZADO CONDICIONAL */}
          {!store.token ? (
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-outline-light btn-sm"
                onClick={() => openModalSafely("loginModal")}
              >
                Iniciar Sesión
              </button>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-3">
              {store.user && (
                <span className="text-light me-2 small">
                  ¡Hola,{" "}
                  {store.user?.email
                    ? store.user.email.split("@")[0]
                    : "Usuario"}
                  !
                </span>
              )}
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={clickLogout}
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
