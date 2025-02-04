import React, { useState, useCallback } from "react";
import NProgress from "nprogress";
import PharmService from "../services/PharmService";
import Cookies from "js-cookie";

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
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Reservar {medicineName}</h3>

        <div className="py-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Anexar Prescrição</span>
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="file-input file-input-bordered w-full"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="modal-action">
          <button className="btn" onClick={onClose} disabled={isLoading}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            onClick={handleReservation}
            disabled={!selectedFile || isLoading}
          >
            {isLoading ? "Processando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;
