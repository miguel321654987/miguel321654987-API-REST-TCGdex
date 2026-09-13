export const initialStore = () => {
  return {
    message: null,
    token: localStorage.getItem("jwt-token") || null,
    user: null,
    api: {
      listLoading: false, // Indica si se está cargando el listado básico de cartas.
      detailsLoading: false, // Indica si se están cargando los detalles individuales.
      list: [],
      detail: null,
      error: null,
    },
    favorites: {
      loading: false,
      list: [],
      error: null,
    },
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "LOGIN_SUCCESS": {
      const payload = action.payload || {};
      const nextToken = payload.token ?? payload;
      const nextUser = payload.user ?? null;

      return {
        ...store,
        token: nextToken,
        user: nextUser,
      };
    }

    case "LOGOUT":
      return {
        ...store,
        token: null,
        user: null,
        message: { msg: "👋 ¡Sesión cerrada con éxito!", status: 200 },
        favorites: {
          list: [], // también limpiamos al cerrar sesión
          loading: false,
          error: null,
        },
      };

    case "SET_MESSAGE":
      return {
        ...store,
        message: action.payload,
      };

    // Indica que ha comenzado la carga del listado inicial.
    case "API_LIST_LOADING":
      return {
        ...store,
        api: {
          ...store.api,
          listLoading: true,
          error: null,
        },
      };

    // Indica que ha comenzado la carga de los detalles por ID.
    case "API_DETAILS_LOADING":
      return {
        ...store,
        api: {
          ...store.api,
          detailsLoading: true,
          error: null,
        },
      };

    case "API_LIST_SUCCESS":
      return {
        ...store,
        api: {
          ...store.api,
          listLoading: false, // El listado básico ya terminó de cargarse.
          list: action.payload, // Guarda solo la lista
          error: null,
        },
      };

    case "API_DETAIL_SUCCESS":
      return {
        ...store,
        api: {
          ...store.api,
          detailsLoading: false, // La carga del detalle individual terminó.
          detail: action.payload, // Guarda solo el detalle individual
          error: null,
        },
      };

    case "API_ERROR":
      return {
        ...store,
        api: {
          ...store.api,
          listLoading: false, // Detenemos cualquier carga activa cuando ocurre un error.
          detailsLoading: false,
          error: action.payload,
        },
      };

    case "CLEAR_FAVORITES":
      return {
        ...store,
        favorites: {
          loading: false,
          list: [], // vaciamos el caché local del usuario anterior
          error: null,
        },
      };

    case "SET_FAVORITES": // Cargar lista de favoritos desde el backend
      return {
        ...store,
        favorites: {
          loading: false,
          list: action.payload,
          error: null,
        },
      };

    case "FAVORITES_LOADING":
      return {
        ...store,
        favorites: {
          ...store.favorites,
          loading: true,
          error: null,
        },
      };

    case "FAVORITES_ERROR":
      return {
        ...store,
        favorites: {
          ...store.favorites,
          loading: false,
          error: action.payload,
        },
      };

    case "ADD_FAVORITE_STORE":
      return {
        ...store,
        favorites: {
          ...store.favorites,
          list: [...store.favorites.list, action.payload],
        },
      };

    case "REMOVE_FAVORITE_STORE":
      return {
        ...store,
        favorites: {
          ...store.favorites,
          list: store.favorites.list.filter((fav) => fav.id !== action.payload),
        },
      };

    default:
      throw Error("Unknown action.");
  }
}
