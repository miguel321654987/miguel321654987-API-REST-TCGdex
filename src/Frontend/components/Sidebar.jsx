import { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

const initialFilters = {
  types: "",
  retreats: "",
  rarities: "",
  illustrators: "",
  hps: "",
  categories: "",
  dexids: "",
  energytypes: "",
  regulationmarks: "",
  stages: "",
  suffixes: "",
  trainertypes: "",
  variants: "",
};

export const Sidebar = () => {
  const { actions } = useGlobalReducer();
  const [filters, setFilters] = useState(initialFilters);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApply = (event) => {
    event.preventDefault();

    actions.buscarCartasPorFiltro({
      inputText: filters.inputText,
      type: filters.type,
      rarity: filters.rarity,
      hpMin: filters.hpMin,
      hpMax: filters.hpMax,
    });
  };

  const handleClear = () => {
    setFilters(initialFilters);
    actions.buscarCartasPorFiltro({ inputText: "" });
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
        <div>
          <label
            htmlFor="sidebar-search"
            className="form-label small text-secondary"
          >
            Buscar por nombre
          </label>
          <input
            id="sidebar-search"
            type="text"
            className="form-control form-control-sm"
            name="inputText"
            value={filters.inputText}
            onChange={handleChange}
            placeholder="Pikachu, Charizard..."
          />
        </div>

        <div>
          <label
            htmlFor="sidebar-type"
            className="form-label small text-secondary"
          >
            Tipo
          </label>
          <select
            id="sidebar-type"
            className="form-select form-select-sm"
            name="type"
            value={filters.type}
            onChange={handleChange}
          >
            <option value="">Todos</option>
            <option value="Fire">Fire</option>
            <option value="Water">Water</option>
            <option value="Grass">Grass</option>
            <option value="Psychic">Psychic</option>
            <option value="Lightning">Lightning</option>
            <option value="Fighting">Fighting</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="sidebar-rarity"
            className="form-label small text-secondary"
          >
            Rareza
          </label>
          <select
            id="sidebar-rarity"
            className="form-select form-select-sm"
            name="rarity"
            value={filters.rarity}
            onChange={handleChange}
          >
            <option value="">Todas</option>
            <option value="Common">Common</option>
            <option value="Uncommon">Uncommon</option>
            <option value="Rare">Rare</option>
            <option value="Ultra Rare">Ultra Rare</option>
            <option value="Secret Rare">Secret Rare</option>
          </select>
        </div>

        <div className="row g-2">
          <div className="col-6">
            <label
              htmlFor="sidebar-hp-min"
              className="form-label small text-secondary"
            >
              HP mín.
            </label>
            <input
              id="sidebar-hp-min"
              type="number"
              className="form-control form-control-sm"
              name="hpMin"
              value={filters.hpMin}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="col-6">
            <label
              htmlFor="sidebar-hp-max"
              className="form-label small text-secondary"
            >
              HP máx.
            </label>
            <input
              id="sidebar-hp-max"
              type="number"
              className="form-control form-control-sm"
              name="hpMax"
              value={filters.hpMax}
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>

        <button type="submit" className="btn btn-warning btn-sm w-100 mt-2">
          Aplicar filtros
        </button>
      </form>
    </aside>
  );
};
