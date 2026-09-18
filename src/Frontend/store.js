export const initialStore = () => {
  return {
    message: null,
    token: localStorage.getItem("jwt-token") || null,
    user: null,
    api: {
      listLoading: false,
      list: [], // Catálogo base de Home
      detailsLoading: false,
      detail: null, // Detalle de carta individual
      filteredLoading: false,
      filtered: [], // Resultado de filtros locales
      filters: {
        types: [],
        retreat: [],
        rarity: [],
        illustrator: [],
        hp: [],
        category: [],
        dexId: [],
        energyType: [],
        stage: [],
        suffix: [],
        variants: [],
      },
      page: 1, // Página actual de resultados filtrados
      itemsPerPage: 24,
      totalPages: 1, // útil para desactivar “Siguiente”
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
          list: [],
          loading: false,
          error: null,
        },
      };

    case "SET_MESSAGE":
      return {
        ...store,
        message: action.payload,
      };

    // Indica que ha comenzado la carga del listado inicial de Home.
    case "API_LIST_LOADING":
      return {
        ...store,
        api: {
          ...store.api,
          listLoading: true,
          error: null,
        },
      };
    case "API_LIST_SUCCESS":
      return {
        ...store,
        api: {
          ...store.api,
          listLoading: false,
          list: action.payload,
          error: null,
        },
      };

    // Indica que ha comenzado la carga del detalle por ID.
    case "API_DETAILS_LOADING":
      return {
        ...store,
        api: {
          ...store.api,
          detailsLoading: true,
          error: null,
        },
      };
    case "API_DETAIL_SUCCESS":
      return {
        ...store,
        api: {
          ...store.api,
          detailsLoading: false,
          detail: action.payload,
          error: null,
        },
      };

    // Indica que ha comenzado la carga de filtros locales.
    case "API_FILTERED_LOADING":
      return {
        ...store,
        api: {
          ...store.api,
          filteredLoading: true,
          error: null,
        },
      };
    case "API_FILTERED_SUCCESS":
      return {
        ...store,
        api: {
          ...store.api,
          filteredLoading: false,
          filtered: action.payload,
          error: null,
        },
      };

    // Updates available filter options for the sidebar dropdowns
    case "API_FILTERS_SUCCESS":
      return {
        ...store,
        api: {
          ...store.api,
          filters: {
            ...store.api.filters,
            ...action.payload,
          },
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
    case "SET_FAVORITES":
      return {
        ...store,
        favorites: {
          loading: false,
          list: action.payload,
          error: null,
        },
      };
    case "CLEAR_FAVORITES":
      return {
        ...store,
        favorites: {
          loading: false,
          list: [],
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

    case "API_ERROR":
      return {
        ...store,
        api: {
          ...store.api,
          listLoading: false,
          detailsLoading: false,
          filteredLoading: false,
          searchLoading: false,
          error: action.payload,
        },
      };

    default:
      throw Error("Unknown action.");
  }
}
