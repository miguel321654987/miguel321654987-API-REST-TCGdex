import defaultImage from "../../assets/no-card-image.png";
import { closeModalSafely } from "../utils.js";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const getActions = (store, dispatch) => {
  // 🔥 Helper interno para incluir el Token JWT de forma automática y segura
  const getAuthHeaders = () => {
    const token = localStorage.getItem("jwt-token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }), // Envía Bearer token si existe
    };
  };

  return {
    handleLogout: (modalId = null) => {
      // 1. Si hay un ID, cerramos ese modal específico de forma segura.
      // Si no hay ID, pero puede haber backdrops huérfanos por desmontajes abruptos,
      // ejecutar la limpieza pasando un ID genérico o adaptando tu función.
      if (modalId) {
        closeModalSafely(modalId);
      } else {
        // Si no hay un modal concreto, limpiamos los residuos del body de forma segura
        // (Puedes extraer esta limpieza a una pequeña función reutilizable si lo deseas)
        const backdrops = document.querySelectorAll(".modal-backdrop");
        backdrops.forEach((backdrop) => backdrop.remove());
        document.body.classList.remove("modal-open");
        document.body.style.removeProperty("overflow");
        document.body.style.removeProperty("padding-right");
      }

      // 2. Limpieza segura de los datos de sesión
      localStorage.removeItem("jwt-token");
      dispatch({ type: "LOGOUT" });

      dispatch({
        type: "SET_MESSAGE",
        payload: {
          msg: "Sesión expirada. Por favor, identifícate de nuevo.",
          status: 401,
        },
      });

      setTimeout(() => {
        dispatch({ type: "SET_MESSAGE", payload: null });
      }, 3000);
    },

    // === 👾 PETICIONES DE POKÉMON ===
    obtenerPokemons: async () => {
      if (store.api.list && store.api.list.length > 0) return;

      try {
        dispatch({ type: "API_LOADING" });
        const response = await fetch(
          "https://api.tcgdex.net/v2/en/cards?pagination:page=1&pagination:itemsPerPage=24",
        );

        if (!response.ok)
          throw new Error("Error al obtener los pokémons de la API externa");
        const data = await response.json();

        // 🔥 Corrección: TCGdex a veces devuelve un objeto con paginación, no un Array directo
        const listaCartas = Array.isArray(data) ? data : data.cards;

        if (listaCartas && Array.isArray(listaCartas)) {
          const datosFormateados = listaCartas.map((carta) => ({
            id: String(carta.id),
            pokemon_name: carta.name,
            image: carta.image ? `${carta.image}/low.png` : defaultImage, // Simplificado el fallback
          }));
          dispatch({ type: "API_LIST_SUCCESS", payload: datosFormateados });
        } else {
          throw new Error(
            "La respuesta del servidor no tiene el formato esperado.",
          );
        }
      } catch (err) {
        console.error("Error crítico al conectar con la API de TCGdex:", err);
        dispatch({ type: "API_ERROR", payload: err.message });
      }
    },

    // === 👾 PETICIONES DETALLE POKÉMON ===
    obtenerDetallePokemon: async (id) => {
      try {
        dispatch({ type: "API_LOADING" });

        // Detector de caracteres especiales PARA EL SEGUNDO POKEMON
        let idTexto = String(id).trim();
        if (
          idTexto.toLowerCase().startsWith("exu-") &&
          (idTexto.includes("?") ||
            idTexto.includes("%") ||
            idTexto.toLowerCase().includes("3f"))
        ) {
          idTexto = "exu-%253F"; // Doble codificación requerida PARA EL SEGUNDO POKEMON
        } else {
          idTexto = encodeURIComponent(idTexto);
        }

        const response = await fetch(
          `https://api.tcgdex.net/v2/en/cards/${idTexto}`,
        );

        if (!response.ok) {
          throw new Error("No se pudo encontrar la información de esta carta.");
        }

        const data = await response.json();

        /* 🔥 FORMATEO DEFENSIVO: Validamos la imagen usando 'defaultImage'
        TCGdex estructura la imagen de la carta como string o dentro de un objeto */
        const imagenFinal = data.image // Operadores Ternarios Anidados,
          ? data.image.includes("http") // se leen como secuencia de condiciones
            ? `${data.image}/high.png`
            : data.image
          : defaultImage;

        const detalleFormateado = {
          ...data,
          image: imagenFinal, // Nos aseguramos de que siempre contenga algo válido
        };

        dispatch({ type: "API_DETAIL_SUCCESS", payload: detalleFormateado });
      } catch (err) {
        console.error("Error al cargar detalle:", err);
        dispatch({ type: "API_ERROR", payload: err.message });
      }
    },

    // 🔥 Helper para limpiar el detalle al desmontar el componente
    limpiarDetallePokemon: () => {
      dispatch({ type: "API_DETAIL_SUCCESS", payload: null });
    },

    // === ❤️ GESTIÓN DE FAVORITOS ===
    cargarFavoritosBackend: async (userId) => {
      // 1. Activa el loading exclusivo de favoritos
      dispatch({ type: "FAVORITES_LOADING" });

      try {
        const response = await fetch(
          `${BACKEND_URL}/api/favorites/user/${userId}/favorites`,
          { headers: getAuthHeaders() },
        );
        if (!response.ok)
          throw new Error("Error al obtener los favoritos del servidor");

        const data = await response.json();

        // 2. Guarda la lista y apaga el loading de favoritos
        dispatch({
          type: "SET_FAVORITES",
          payload: data.results || data,
        });
      } catch (error) {
        console.error("Error cargando favoritos del backend:", error);
        // 3. Registra el error exclusivo de favoritos
        dispatch({
          type: "FAVORITES_ERROR",
          payload: error.message,
        });
      }
    },

    añadirFavoritoBackend: async (userId, pokemon) => {
      try {
        // === CAMBIO: primero registramos la carta TCGdex en la base de datos ===
        const pokemonResponse = await fetch(`${BACKEND_URL}/api/pok/pokemon`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            id: pokemon.id,
            pokemon_name: pokemon.pokemon_name,
          }),
        });

        // Un 409 significa que la carta ya existe y se puede asociar igualmente.
        if (!pokemonResponse.ok && pokemonResponse.status !== 409) {
          throw new Error("No se pudo guardar la carta en el servidor");
        }

        // === CAMBIO: después asociamos la carta existente al usuario ===
        const response = await fetch(
          `${BACKEND_URL}/api/favorites/user/${userId}/favorites/${pokemon.id}`,
          {
            method: "POST",
            headers: getAuthHeaders(),
          },
        );

        if (response.status === 409) {
          // Avisamos a la UI que ya existe usando SET_MESSAGE global
          dispatch({
            type: "SET_MESSAGE",
            payload: {
              msg: "⚠️ Esta carta ya está en tus favoritos",
              status: 409,
            },
          });
          return;
        }

        if (!response.ok)
          throw new Error("No se pudo añadir el favorito en el servidor");

        // Todo bien: agregamos al estado local (dentro de favorites.list)
        dispatch({ type: "ADD_FAVORITE_STORE", payload: pokemon });

        dispatch({
          type: "SET_MESSAGE",
          payload: { msg: "❤️ ¡Carta añadida a favoritos!", status: 200 },
        });
      } catch (error) {
        console.error("Error al guardar favorito:", error);
        dispatch({ type: "FAVORITES_ERROR", payload: error.message });
      }
    },

    eliminarFavoritoBackend: async (userId, pokemonId) => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/favorites/user/${userId}/favorites/${pokemonId}`,
          {
            method: "DELETE",
            headers: getAuthHeaders(),
          },
        );
        if (!response.ok)
          throw new Error("No se pudo eliminar el favorito del servidor");

        // Todo bien: removemos del estado local filtrando por ID
        dispatch({ type: "REMOVE_FAVORITE_STORE", payload: pokemonId });

        dispatch({
          type: "SET_MESSAGE",
          payload: { msg: "🗑️ Carta eliminada de tus favoritos", status: 200 },
        });
      } catch (error) {
        console.error("Error al eliminar favorito:", error);
        dispatch({ type: "FAVORITES_ERROR", payload: error.message });
      }
    },
  };
};
