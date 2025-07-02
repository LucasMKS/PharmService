import React, { useState } from "react";
import { FiUploadCloud, FiCheck, FiX } from "react-icons/fi";

const ImportMedicinesModalContent = ({
  onImport,
  onCancel,
  loading,
  error,
  success,
}) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file) {
      onImport(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-center">
      <div className="inline-block p-3 bg-blue-100 dark:bg-gray-700 rounded-full">
        <FiUploadCloud className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
        Importar Medicamentos via Excel
      </h3>
      <div className="form-control">
        <input
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileChange}
          className="file-input file-input-bordered w-full"
        />
        <label className="label">
          <span className="label-text-alt text-gray-500">
            Formatos suportados: .xlsx, .xls, .csv
          </span>
        </label>
      </div>
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <span>Arquivo importado com sucesso!</span>
        </div>
      )}
      <div className="modal-action flex gap-2 justify-end">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className={`btn btn-primary ${loading ? "loading" : ""}`}
          disabled={loading || !file}
        >
          {loading ? "Enviando..." : "Importar"}
        </button>
      </div>
    </form>
  );
};

export default ImportMedicinesModalContent;
