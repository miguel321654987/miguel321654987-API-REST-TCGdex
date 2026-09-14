// 🔧 HELPER DE CIERRE DEFENSIVO DE MODALES
export const closeModalSafely = (id) => {
  const modalEl = document.getElementById(id);
  if (!modalEl) return;

  if (window.bootstrap?.Modal) {
    // .Modal: módulo específico de Bootstrap que controla la lógica de las ventanas emergentes (abrir, cerrar, animar).
    try {
      // Recupera la instancia activa de Bootstrap asociada a ese modal.
      // Si no existe una, la crea automáticamente. Es más seguro que getInstance().
      const modalInstance = window.bootstrap.Modal.getOrCreateInstance(
        modalEl,
        {},
      );

      modalInstance.hide(); // Método de Bootstrap para animar y cerrar el modal
      return;
    } catch (error) {
      console.warn(
        `Bootstrap Modal.hide() falló para #${id}, usando fallback CSS`,
        error,
      );
    }
  }

  // Fallback:Cierre manual por CSS
  modalEl.classList.remove("show");
  modalEl.setAttribute("aria-hidden", "true");
  modalEl.style.display = "none";

  const backdrop = document.querySelector(".modal-backdrop");
  if (backdrop) backdrop.remove();

  document.body.classList.remove("modal-open");
  document.body.style.overflow = ""; // 🔥 Restablece el scroll si Bootstrap se quedó colgado
};

//* 🔧 HELPER DE APERTURA DEFENSIVA DE MODALES
export const openModalSafely = (id) => {
  const modalEl = document.getElementById(id);
  if (!modalEl) return;

  if (window.bootstrap?.Modal) {
    try {
      const modalInstance = window.bootstrap.Modal.getOrCreateInstance(
        modalEl,
        {},
      );
      modalInstance.show();
      return;
    } catch (error) {
      console.warn(
        `Bootstrap Modal.show() falló para #${id}, usando fallback CSS`,
        error,
      );
    }
  }

  // Fallback: Apertura manual por CSS
  modalEl.classList.add("show");
  modalEl.setAttribute("aria-hidden", "false");
  modalEl.style.display = "block";

  if (!document.querySelector(".modal-backdrop")) {
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop fade show";
    document.body.appendChild(backdrop);
  }

  document.body.classList.add("modal-open");
};

//* 🔧 HELPER PARA CAMBIAR ENTRE MODALES
export const switchModals = (closeId, openId) => {
  closeModalSafely(closeId);

  // 🔥 Escucha el evento nativo de Bootstrap para abrir el siguiente solo cuando el primero se oculte del todo
  const closeEl = document.getElementById(closeId);
  if (closeEl && window.bootstrap?.Modal) {
    closeEl.addEventListener(
      "hidden.bs.modal",
      () => {
        openModalSafely(openId);
      },
      { once: true },
    ); // { once: true } evita que el evento se quede escuchando siempre
  } else {
    // Fallback si Bootstrap no está listo
    setTimeout(() => {
      openModalSafely(openId);
    }, 150);
  }
};

//* 🔧 HELPER PARA FILTRAR CARTAS USANDO INPUT EN NAVBAR
export const filterPokemons = (pokemons, filters = {}) => {
  const normalize = (value) => {
    // Si es null, undefined, o una cadena vacía, devolvemos "".
    if (value === null || value === undefined || value === "") return "";

    // Normalizamos mayúsculas, espacios y acentos para comparar correctamente.
    return String(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  // Comprueba si un valor contiene el texto buscado.
  const matchesText = (value, filterValue) => {
    // Si el filtro no existe o solo contiene espacios, no restringimos el resultado.
    if (
      filterValue === null ||
      filterValue === undefined ||
      normalize(filterValue) === ""
    ) {
      return true;
    }

    // Si el valor de la carta está vacío, no puede coincidir con el filtro.
    if (value === null || value === undefined || value === "") return false;

    return normalize(value).includes(normalize(filterValue));
  };

  // Comprueba el filtro general introducido desde el Navbar.
  // Puede coincidir con ID, nombre, tipo, HP, rareza, expansión o artista.
  const matchesGenericFilter = (pokemon) => {
    if (!filters.inputText || normalize(filters.inputText) === "") return true;

    const genericFilter = normalize(filters.inputText);

    const searchableValues = [
      pokemon.id,
      pokemon.name,
      pokemon.pokemon_name,
      pokemon.hp,
      pokemon.rarity,
      pokemon.illustrator,
      pokemon.artist,
      pokemon.set?.name,
      ...(pokemon.types || []),
      ...(pokemon.attacks || []).flatMap((attack) => [
        attack.name,
        attack.damage,
        attack.effect,
      ]),
    ];

    return searchableValues.some((value) =>
      normalize(value).includes(genericFilter),
    );
  };

  // Comprueba si la carta cumple los filtros relacionados con los ataques.
  const matchesAttackFilters = (pokemon) => {
    const hasAttackFilters =
      filters.attackName || filters.attackDamage || filters.attackEffect;

    // Si no se ha escrito ningún filtro de ataque, no se descarta la carta.
    if (!hasAttackFilters) return true;

    // "some" devuelve true cuando encuentra al menos un ataque coincidente.
    return (pokemon.attacks || []).some((attack) => {
      return (
        matchesText(attack.name, filters.attackName) &&
        matchesText(attack.damage, filters.attackDamage) &&
        matchesText(attack.effect, filters.attackEffect)
      );
    });
  };

  // Comprueba si los puntos de vida están dentro del rango seleccionado.
  const matchesHpFilters = (pokemon) => {
    const hp = Number(pokemon.hp);

    // Un filtro vacío se representa como null para diferenciarlo del valor 0.
    const minimumHp =
      filters.hpMin !== "" && filters.hpMin !== undefined
        ? Number(filters.hpMin)
        : null;

    const maximumHp =
      filters.hpMax !== "" && filters.hpMax !== undefined
        ? Number(filters.hpMax)
        : null;

    // Si no hay límites de HP, la carta cumple esta condición.
    if (minimumHp === null && maximumHp === null) return true;

    // Las cartas sin un HP numérico no pueden compararse con un rango.
    if (!Number.isFinite(hp)) return false;

    // Descarta cartas por debajo del HP mínimo.
    if (minimumHp !== null && hp < minimumHp) return false;

    // Descarta cartas por encima del HP máximo.
    if (maximumHp !== null && hp > maximumHp) return false;

    return true;
  };

  // Recorre la colección y conserva las cartas que cumplen todos los filtros.
  return (pokemons || []).filter((pokemon) => {
    // Algunos datos pueden no existir en determinadas cartas.
    // Por eso usamos valores alternativos seguros.
    const pokemonName = pokemon.pokemon_name || pokemon.name || "";
    const expansionName = pokemon.set?.name || "";
    const pokemonTypes = pokemon.types || [];
    const artistName = pokemon.illustrator || pokemon.artist || "";

    // Una carta coincide por tipo si contiene el tipo seleccionado.
    const matchesType =
      !filters.type ||
      pokemonTypes.some((type) => normalize(type) === normalize(filters.type));

    // Todos los criterios se combinan con AND:
    // la carta debe cumplir cada filtro activo.
    return (
      matchesGenericFilter(pokemon) &&
      matchesText(pokemonName, filters.name) &&
      matchesText(expansionName, filters.expansion) &&
      matchesText(pokemon.rarity, filters.rarity) &&
      matchesType &&
      matchesHpFilters(pokemon) &&
      matchesText(artistName, filters.artist) &&
      matchesAttackFilters(pokemon)
    );
  });
};
