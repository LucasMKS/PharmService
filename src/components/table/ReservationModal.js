import React, { useState } from "react";
import NProgress from "nprogress";
import PharmService from "../services/PharmService";
import Cookies from "js-cookie";
import { FiPackage, FiUploadCloud, FiX, FiCheck, FiFile } from "react-icons/fi";

const ReservationModal = ({
  isOpen,
  onClose,
  onSuccess,
  medicineId,
  medicineName,
  showToast,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const formatProtocol = (fileName) => {
    if (!fileName) return "N/A";
    return fileName.split(".").slice(0, -1).join("."); // Remove a extensão
  };

  const handleReservation = async () => {
    if (!selectedFile) {
      showToast("Por favor, selecione uma prescrição. ", "error");
      return;
    }

    setIsLoading(true);
    NProgress.start();

    try {
      const formData = new FormData();
      formData.append("stockId", medicineId);
      formData.append("prescription", selectedFile);

      const userId = Cookies.get("userId");
      if (!userId) throw new Error("Usuário não autenticado");
      formData.append("userId", userId);

      const response = await PharmService.createReservation(formData);
      onSuccess(medicineId);
      onClose();

      const protocol = formatProtocol(response.prescriptionPath);
      showToast("Reserva criada! Protocolo: " + protocol, "success");
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || error.message || "Erro ao criar reserva";
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
      NProgress.done();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open backdrop-blur-sm">
      <div className="modal-box relative max-w-md bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 shadow-xl">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle absolute right-4 top-4 text-gray-500 hover:text-blue-600"
        >
          <FiX className="text-lg" />
        </button>

        <div className="text-center space-y-4">
          <div className="inline-block p-3 bg-blue-100 dark:bg-gray-700 rounded-full">
            <FiPackage className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Reservar {medicineName}
          </h2>

          <div className="py-4">
            <div className="form-control">
              <label className="label justify-start gap-2 pl-1">
                <FiFile className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <span className="label-text text-gray-600 dark:text-gray-300">
                  Prescrição Médica
                </span>
              </label>

              <div className="relative group">
                <div
                  className={`flex flex-col items-center justify-center h-32 border-2 
                  border-dashed rounded-lg transition-all
                  ${
                    selectedFile
                      ? "border-green-100 bg-green-50"
                      : "border-blue-100 hover:border-blue-200 bg-white dark:bg-gray-700"
                  }`}
                >
                  <FiUploadCloud className="w-8 h-8 text-blue-400 mb-2" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedFile?.name || "Arraste ou clique para enviar"}
                  </span>

                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {selectedFile && (
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <FiFile className="flex-shrink-0" />
                  <span className="truncate">{selectedFile.name}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost hover:bg-gray-100 dark:hover:bg-gray-700 gap-2"
                disabled={isLoading}
              >
                <FiX className="text-lg" />
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary gap-2 hover:scale-[1.02] transition-transform"
                onClick={handleReservation}
                disabled={!selectedFile || isLoading}
              >
                {isLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  <FiCheck className="text-lg" />
                )}
                Confirmar Reserva
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;
