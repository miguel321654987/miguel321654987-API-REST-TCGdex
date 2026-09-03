import defaultImage from "../../assets/no-card-image.png";
import { closeModalSafely } from "../utils.js";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const getActions = (store, dispatch) => {
  // 🔥 Helper interno para incluir el Token JWT de forma automática y segura
  const getAuthHeaders = () => {
    const token = localStorage.getItem("jwt-token");
    // Si no hay token, devolvemos solo el Content-Type básico
    if (!token) {
      return {
        "Content-Type": "application/json",
      };
    }
    // Si el token existe, devolvemos el objeto completo con la autorización
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  return {
    handleLogout: (modalId = null) => {
      // 1. Si hay un ID, cerramos ese modal específico de forma segura.
      if (modalId) {
        closeModalSafely(modalId);
      } else {
        // Si no hay un modal concreto, limpiamos los residuos del body de forma segura
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

    // === ❤️ GESTIÓN DE FAVORITOS
    cargarFavoritosBackend: async (userId) => {
      // antes de pedir la lista del nuevo usuario, limpiamos el estado local
      dispatch({ type: "CLEAR_FAVORITES" });

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
        const idSeguro = encodeURIComponent(String(pokemon.id).trim());

        const response = await fetch(
          `${BACKEND_URL}/api/favorites/user/${userId}/favorites/${idSeguro}`,
          {
            method: "POST",
            headers: { ...getAuthHeaders() }, // ✨ Escalabilidad: podrían agregarse otros headers
            body: JSON.stringify(pokemon), // 🌟 ¡Aquí pasamos la info del store al back!
          },
        );

        if (response.status === 409) {
          dispatch({
            type: "SET_MESSAGE",
            payload: { msg: "⚠️ Ya está en favoritos", status: 409 },
          });
          return;
        }

        if (!response.ok) throw new Error("No se pudo añadir el favorito");

        // Todo bien: Actualizamos el Navbar e interfaz en tiempo real
        dispatch({ type: "ADD_FAVORITE_STORE", payload: pokemon });
      } catch (error) {
        console.error(error);
      }
    },

    eliminarFavoritoBackend: async (userId, pokemonId) => {
      try {
        // Codificamos el ID para que coincida perfectamente con el POST
        const idSeguro = encodeURIComponent(String(pokemonId).trim());

        const response = await fetch(
          `${BACKEND_URL}/api/favorites/user/${userId}/favorites/${idSeguro}`,
          {
            method: "DELETE",
            headers: { ...getAuthHeaders() },
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
