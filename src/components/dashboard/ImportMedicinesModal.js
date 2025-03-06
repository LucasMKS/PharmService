import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { FiUploadCloud, FiX } from "react-icons/fi";
import PharmService from "../services/PharmService";

const ImportMedicinesModal = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const userRole = Cookies.get("roles");

  useEffect(() => {
    if (userRole !== "GERENTE") {
      onClose();
    }
  }, [userRole, onClose]);

  const pharmacyId = Cookies.get("pharmacyId");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Selecione um arquivo Excel válido");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await PharmService.importMedicines(formData, pharmacyId);

      if (response.errors && response.errors.length > 0) {
        setError(`Importação parcial: ${response.errors.join(", ")}`);
      } else {
        setSuccess(true);
        onSuccess?.();
      }
    } catch (err) {
      setError(err.message || "Erro ao importar arquivo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="modal-box relative max-w-md bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 shadow-2xl">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle absolute right-4 top-4"
        >
          <FiX />
        </button>

        <div className="text-center space-y-4">
          <div className="inline-block p-3 bg-blue-100 dark:bg-gray-700 rounded-full">
            <FiUploadCloud className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>

          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Importar Medicamentos via Excel
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Arquivo importado com sucesso!</span>
              </div>
            )}

            <div className="modal-action">
              <button
                type="submit"
                className={`btn btn-primary ${loading ? "loading" : ""}`}
                disabled={loading || !file}
              >
                {loading ? "Enviando..." : "Importar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ImportMedicinesModal;
