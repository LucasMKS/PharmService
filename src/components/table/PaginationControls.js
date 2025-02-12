import React from "react";

const PaginationControls = ({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  prevDisabled,
  nextDisabled,
}) => {
  return (
    <div className="flex justify-center gap-2 p-4 bg-neutral-100 dark:bg-neutral-800">
      <button
        onClick={onPrev}
        disabled={prevDisabled}
        className={`btn btn-sm ${
          prevDisabled ? "btn-disabled" : "btn-primary"
        }`}
      >
        Anterior
      </button>

      <span className="btn btn-sm btn-disabled">
        Página {currentPage} de {totalPages}
      </span>

      <button
        onClick={onNext}
        disabled={nextDisabled}
        className={`btn btn-sm ${
          nextDisabled ? "btn-disabled" : "btn-primary"
        }`}
      >
        Próximo
      </button>
    </div>
  );
};

export default PaginationControls;
