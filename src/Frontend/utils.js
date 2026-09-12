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

// Nuevo: busca Pokémon por nombre ignorando mayúsculas y acentos
export const searchPokemonsByName = (pokemons, searchName) => {
  // Nuevo: normaliza los textos para comparar nombres de forma flexible
  const normalize = (value) =>
    String(value ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const normalizedSearchName = normalize(searchName);

  // Nuevo: encuentra coincidencias parciales mientras el usuario escribe
  const filteredPokemons = pokemons.filter((pokemon) =>
    normalize(pokemon.pokemon_name).includes(normalizedSearchName),
  );

  // Nuevo: selecciona una carta únicamente con coincidencia exacta
  const pokemonEncontrado = normalizedSearchName
    ? filteredPokemons.find(
        (pokemon) => normalize(pokemon.pokemon_name) === normalizedSearchName,
      )
    : null;

  return pokemonEncontrado;
};

// Filtra las cartas usando los criterios seleccionados desde Navbar o Home
export const filterPokemons = (pokemons, filters = {}) => {
  // Normaliza textos para ignorar mayúsculas, minúsculas y acentos
  const normalize = (value) =>
    String(value ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  // Comprueba coincidencias parciales en campos de texto
  const matchesText = (value, filterValue) => {
    const normalizedFilter = normalize(filterValue);

    if (!normalizedFilter) return true;

    return normalize(value).includes(normalizedFilter);
  };

  // Comprueba los filtros aplicados a los ataques
  const matchesAttackFilters = (pokemon) => {
    const hasAttackFilters =
      filters.attackName || filters.attackDamage || filters.attackEffect;

    if (!hasAttackFilters) return true;

    return (pokemon.attacks || []).some((attack) => {
      return (
        matchesText(attack.name, filters.attackName) &&
        matchesText(attack.damage, filters.attackDamage) &&
        matchesText(attack.effect, filters.attackEffect)
      );
    });
  };

  // Comprueba los límites mínimo y máximo de HP
  const matchesHpFilters = (pokemon) => {
    const hp = Number(pokemon.hp);
    const minimumHp = filters.hpMin ? Number(filters.hpMin) : null;
    const maximumHp = filters.hpMax ? Number(filters.hpMax) : null;

    if (!minimumHp && !maximumHp) return true;
    if (!Number.isFinite(hp)) return false;

    if (minimumHp !== null && hp < minimumHp) return false;
    if (maximumHp !== null && hp > maximumHp) return false;

    return true;
  };

  // Devuelve únicamente las cartas que cumplen todos los filtros
  return (pokemons || []).filter((pokemon) => {
    const pokemonTypes = pokemon.types || [];
    const expansionName = pokemon.set?.name || "";
    const artistName = pokemon.illustrator || pokemon.artist || "";

    const matchesType =
      !filters.type ||
      pokemonTypes.some((type) => normalize(type) === normalize(filters.type));

    return (
      matchesText(pokemon.pokemon_name || pokemon.name, filters.name) &&
      matchesText(expansionName, filters.expansion) &&
      matchesText(pokemon.rarity, filters.rarity) &&
      matchesType &&
      matchesHpFilters(pokemon) &&
      matchesText(artistName, filters.artist) &&
      matchesAttackFilters(pokemon)
    );
  });
};
