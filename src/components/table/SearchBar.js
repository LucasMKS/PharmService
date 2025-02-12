import React from "react";
import { FiSearch, FiPlus, FiFilter } from "react-icons/fi";

const SearchBar = ({
  onSearch,
  onAddClick,
  showAddButton,
  categories,
  dosageForms,
  classifications,
  onFilterChange,
}) => {
  return (
    <div className="py-3 px-4 bg-neutral-100 dark:bg-neutral-800 flex flex-col md:flex-row gap-4">
      <div className="flex-1 flex flex-col md:flex-row gap-2">
        {/* Campo de busca */}
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Busca por medicamentos ou farmácias"
            className="py-2 px-3 ps-9 block w-full shadow-sm rounded-lg text-sm dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-1">
          <select
            className="select select-bordered select-sm w-full max-w-xs"
            onChange={(e) => onFilterChange("category", e.target.value)}
          >
            <option value="">Todas Categorias</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            className="select select-bordered select-sm w-full max-w-xs"
            onChange={(e) => onFilterChange("dosageForm", e.target.value)}
          >
            <option value="">Todas Formas</option>
            {dosageForms.map((form, i) => (
              <option key={i} value={form}>
                {form}
              </option>
            ))}
          </select>

          <select
            className="select select-bordered select-sm w-full max-w-xs"
            onChange={(e) => onFilterChange("classification", e.target.value)}
          >
            <option value="">Todas Classificações</option>
            {classifications.map((cls, i) => (
              <option key={i} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* <button
        onClick={() =>
          setFilters({ category: "", dosageForm: "", classification: "" })
        }
        className="btn btn-ghost btn-sm"
      >
        <FiFilter className="mr-1" />
        Limpar Filtros
      </button> */}

      {showAddButton && (
        <button
          onClick={onAddClick}
          className="btn btn-primary btn-sm shrink-0"
          aria-label="Adicionar medicamento"
        >
          <FiPlus className="text-lg" />
          <span className="hidden sm:inline">Adicionar</span>
        </button>
      )}
    </div>
  );
};

export default SearchBar;
