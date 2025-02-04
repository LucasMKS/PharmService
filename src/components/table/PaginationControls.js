import React from "react";

const PaginationControls = ({ currentPage, totalPages, onPrev, onNext }) => {
  return (
    <div className="py-2 px-4 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center gap-4">
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        className="btn btn-sm btn-ghost"
        aria-label="Página anterior"
      >
        Anterior
      </button>

      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Página {currentPage} de {totalPages}
      </span>

      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="btn btn-sm btn-ghost"
        aria-label="Próxima página"
      >
        Próxima
      </button>
    </div>
  );
};

export default PaginationControls;
