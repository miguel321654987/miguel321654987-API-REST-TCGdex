import { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

// Estado local de las opciones elegidas por el usuario.
// Cada filtro solo puede tener un valor seleccionado.
const initialFilters = {
  types: "",
  retreats: "",
  rarity: "",
  illustrators: "",
  hps: "",
  categories: "",
  dexids: "",
  energytypes: "",
  stages: "",
  suffixes: "",
  variants: "",
};

export const Sidebar = () => {
  const { store, actions } = useGlobalReducer();

  // filters contiene únicamente las selecciones actuales del usuario.
  const [filters, setFilters] = useState(initialFilters);

  // filterOptions contiene los arrays completos cargados desde el backend.
  // Cada array se utilizará para crear las opciones de su <select>.
  const filterOptions = store.api.filters;

  // Actualiza solamente el filtro cuyo <select> ha cambiado.
  // Como cada <select> permite una sola opción, value siempre es un string.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFilters((previousFilters) => ({
      ...previousFilters,
      [name]: value,
    }));
  };

  // Envía los filtros seleccionados a la acción que consulta TCGdex.
  const handleApply = (event) => {
    event.preventDefault();

    actions.filtrarCartas({
      types: filters.types,
      retreats: filters.retreats,
      rarity: filters.rarity,
      illustrators: filters.illustrators,
      hps: filters.hps,
      categories: filters.categories,
      dexids: filters.dexids,
      energytypes: filters.energytypes,
      stages: filters.stages,
      suffixes: filters.suffixes,
      variants: filters.variants,

      // Una nueva combinación de filtros comienza en la primera página.
      page: 1,
      itemsPerPage: 24,
    });
  };

  // Limpia las selecciones locales.
  // No hace fetch: el usuario debe pulsar "Aplicar filtros".
  const handleClear = () => {
    setFilters(initialFilters);
  };

  // Crea un <select> reutilizable para cada categoría de filtros.
  //
  // filterName:
  // nombre del filtro en filters y en store.api.filters.
  //
  // label:
  // texto visible para el usuario.
  //
  // emptyLabel:
  // texto que representa la ausencia de filtro.
  const renderFilterSelect = (filterName, label, emptyLabel) => {
    const options = Array.isArray(filterOptions[filterName])
      ? filterOptions[filterName]
      : [];

    return (
      <div key={filterName}>
        <label
          htmlFor={`sidebar-${filterName}`}
          className="form-label small text-secondary"
        >
          {label}
        </label>

        <select
          id={`sidebar-${filterName}`}
          className="form-select form-select-sm"
          name={filterName}
          value={filters[filterName]}
          onChange={handleChange}
        >
          {/* String vacío significa que este filtro no está activo. */}
          <option value="">{emptyLabel}</option>

          {/* Cada opción del catálogo representa un único valor seleccionable. */}
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <aside
      className="bg-dark text-light border-end border-secondary shadow-sm p-3"
      style={{ minWidth: "260px", maxWidth: "280px" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h5 text-warning mb-0">Filtros</h2>

        <button
          type="button"
          className="btn btn-link btn-sm text-light p-0"
          onClick={handleClear}
        >
          Limpiar
        </button>
      </div>

      <form onSubmit={handleApply} className="d-grid gap-3">
        {/* Cada filtro permite seleccionar una única opción. */}
        {renderFilterSelect("types", "Tipo", "Todos")}
        {renderFilterSelect("retreats", "Coste de retirada", "Todos")}
        {renderFilterSelect("rarity", "Rareza", "Todas")}
        {renderFilterSelect("illustrators", "Ilustrador", "Todos")}
        {renderFilterSelect("hps", "HP", "Todos")}
        {renderFilterSelect("categories", "Categoría", "Todas")}
        {renderFilterSelect("dexids", "Número de Pokédex", "Todos")}
        {renderFilterSelect("energytypes", "Tipo de energía", "Todos")}
        {renderFilterSelect("stages", "Etapa", "Todas")}
        {renderFilterSelect("suffixes", "Sufijo", "Todos")}
        {renderFilterSelect("variants", "Variante", "Todas")}

        <button type="submit" className="btn btn-warning btn-sm w-100 mt-2">
          Aplicar filtros
        </button>
      </form>
    </aside>
  );
};
