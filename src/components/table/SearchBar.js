import React from "react";
import { FiSearch, FiPlus } from "react-icons/fi";

const SearchBar = ({ onSearch, onAddClick, showAddButton }) => {
  return (
    <div className="py-3 px-4 bg-neutral-100 dark:bg-neutral-800 flex justify-between items-center gap-4">
      <div className="relative max-w-xs">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar medicamentos..."
          className="py-2 px-3 ps-9 block w-full shadow-slate-900 shadow-sm rounded-lg text-sm dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 "
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {showAddButton && (
        <button
          onClick={onAddClick}
          className="btn btn-primary btn-sm"
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
