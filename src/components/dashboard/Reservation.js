"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Cookies from "js-cookie";
import PharmService from "../services/PharmService";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiEdit,
} from "react-icons/fi";
import NProgress from "nprogress";

// Configuração do NProgress
NProgress.configure({
  showSpinner: false,
  minimum: 0.3,
  easing: "ease",
  speed: 800,
});

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pendente: {
      color: "bg-yellow-500",
      text: "Pendente",
      icon: <FiAlertCircle />,
    },
    aprovado: {
      color: "bg-green-600",
      text: "Aprovado",
      icon: <FiCheckCircle />,
    },
    cancelado: { color: "bg-red-600", text: "Cancelado", icon: <FiXCircle /> },
  };

  const { color, text, icon } = statusConfig[status.toLowerCase()] || {
    color: "bg-gray-500",
    text: "Desconhecido",
    icon: <FiAlertCircle />,
  };

  return (
    <div
      className={`flex items-center gap-1 ${color} text-white px-3 py-1 rounded-full text-sm`}
    >
      {icon}
      {text}
    </div>
  );
};

const ManageModal = ({ isOpen, onClose, reservation, onManage }) => {
  const { register, handleSubmit, watch } = useForm();
  const selectedStatus = watch("status", "aprovado");

  const onSubmit = (data) => {
    onManage(reservation.id, data.status, data.message);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-bottom sm:modal-middle" open>
      <div className="modal-box dark:bg-neutral-800">
        <h3 className="font-bold text-lg dark:text-white">Gerenciar Reserva</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text dark:text-gray-300">Novo Status</span>
            </label>
            <select
              className="select select-bordered w-full dark:bg-neutral-700 dark:text-white"
              {...register("status", { required: true })}
              defaultValue="aprovado"
            >
              <option value="aprovado" className="dark:bg-neutral-800">
                Aprovar
              </option>
              <option value="cancelado" className="dark:bg-neutral-800">
                Cancelar
              </option>
            </select>
          </div>

          {selectedStatus === "cancelado" && (
            <div className="form-control">
              <label className="label">
                <span className="label-text dark:text-gray-300">
                  Mensagem (Obrigatória para cancelamento)
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered dark:bg-neutral-700 dark:text-white"
                {...register("message", {
                  required: selectedStatus === "cancelado",
                })}
                placeholder="Motivo do cancelamento..."
              />
            </div>
          )}

          <div className="modal-action">
            <button
              type="button"
              className="btn dark:text-white"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

const UserInfoModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box dark:bg-neutral-800">
        <h3 className="font-bold text-lg dark:text-white">
          Informações do Usuário
        </h3>

        <div className="space-y-4 mt-4">
          <div>
            <label className="label-text dark:text-gray-300">Nome:</label>
            <p className="dark:text-gray-400">{user.name}</p>
          </div>

          <div>
            <label className="label-text dark:text-gray-300">Email:</label>
            <p className="dark:text-gray-400">{user.email}</p>
          </div>

          <div>
            <label className="label-text dark:text-gray-300">Perfil:</label>
            <p className="dark:text-gray-400">
              {user.roles?.join(", ") || "N/A"}
            </p>
          </div>
        </div>

        <div className="modal-action">
          <button className="btn dark:text-white" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </dialog>
  );
};

const Reservation = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const itemsPerPage = 10;

  const roles = Cookies.get("roles");
  const userId = Cookies.get("userId");

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const fetchReservations = async () => {
    try {
      let response;
      if (roles === "CLIENTE") {
        response = await PharmService.getReservationsByUser(userId);
      } else {
        response = await PharmService.getAllReservations();
      }

      setReservations(response);
      setLoading(false);
    } catch (error) {
      showToast("Falha ao carregar reservas: " + error.message, "error");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [roles]);

  const handleManage = async (reservationId, status, message) => {
    NProgress.start();

    try {
      await PharmService.manageReservation(reservationId, status, message);
      fetchReservations();
      showToast("Reserva atualizada com sucesso!");
    } catch (error) {
      showToast("Erro ao atualizar reserva: " + error.message, "error");
    } finally {
      NProgress.done();
    }
  };

  const filteredReservations = reservations.filter((reservation) => {
    const medicine = reservation.medicineName || "";
    const pharmacy = reservation.pharmacyName || "";

    const search = searchTerm.toLowerCase();

    return (
      medicine.toLowerCase().includes(search) ||
      pharmacy.toLowerCase().includes(search)
    );
  });

  const formatProtocol = (fileName) => {
    if (!fileName) return "N/A";
    return fileName.split(".").slice(0, -1).join("."); // Remove a extensão
  };

  // Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReservations = filteredReservations.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);

  const handleNextPage = () =>
    currentPage < totalPages && setCurrentPage((p) => p + 1);
  const handlePrevPage = () => currentPage > 1 && setCurrentPage((p) => p - 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="bg-blue-100 dark:bg-slate-900 min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-7xl bg-neutral-600 dark:bg-neutral-900 rounded-lg shadow-lg shadow-neutral-950 overflow-hidden">
        <div className="p-1.5 min-w-full inline-block align-middle">
          <div className="divide-y divide-gray-200 dark:divide-neutral-950">
            <div className="py-3 px-4 bg-neutral-100 dark:bg-neutral-800 flex justify-between items-center">
              <div className="flex justify-between items-center mb-4">
                <input
                  type="text"
                  placeholder="Buscar reservas..."
                  className="input input-bordered w-56 max-w-xs h-10 dark:bg-neutral-700 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                <thead className="bg-neutral-100 dark:bg-neutral-800">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-gray-300"
                    >
                      Usuário
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-gray-300"
                    >
                      Medicamento
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-gray-300"
                    >
                      Farmácia
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-gray-300"
                    >
                      Protocolo / Prescrição
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-gray-300"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-gray-300"
                    >
                      Data Expiração
                    </th>
                    {roles !== "CLIENTE" && (
                      <th
                        scope="col"
                        className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-gray-300"
                      >
                        Ações
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-neutral-200 dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-neutral-950">
                  {currentReservations.map((reservation) => {
                    const protocol = formatProtocol(
                      reservation.prescriptionPath
                    );
                    const medicineName =
                      reservation.medicineName || "Não disponível";
                    const pharmacyName =
                      reservation.pharmacyName || "Não disponível";
                    const expirationDate =
                      new Date(reservation.expirationDate).toLocaleString() ||
                      "Data inválida";

                    return (
                      <tr key={reservation.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">
                          <button
                            className="text-blue-500 hover:text-blue-700 dark:text-blue-400"
                            onClick={() => setSelectedUser(reservation.user)}
                          >
                            {reservation.user?.name || "N/A"}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">
                          {medicineName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">
                          {pharmacyName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">
                          <a
                            href={`http://localhost:8080/uploads/${reservation.prescriptionPath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 dark:text-blue-400"
                          >
                            {protocol}
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">
                          <StatusBadge status={reservation.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">
                          {expirationDate}
                        </td>
                        {roles !== "CLIENTE" && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">
                            <div className="flex space-x-2">
                              <button
                                className={
                                  reservation.status !== "pendente"
                                    ? "btn btn-sm btn-warning dark:bg-slate-800 dark:text-white"
                                    : "btn btn-sm btn-warning dark:bg-amber-600 dark:text-white"
                                }
                                onClick={() => {
                                  setSelectedReservation(reservation);
                                  setManageModalOpen(true);
                                }}
                                disabled={reservation.status !== "pendente"}
                              >
                                <FiEdit />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="py-2 px-4 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center space-x-4">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-gray-500 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-gray-500 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          </div>
        </div>
      </div>

      {toast.show && (
        <div className={`toast toast-top toast-end z-50`}>
          <div
            className={`alert ${
              toast.type === "error" ? "alert-error" : "alert-success"
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <UserInfoModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />

      <ManageModal
        isOpen={manageModalOpen}
        onClose={() => setManageModalOpen(false)}
        reservation={selectedReservation}
        onManage={handleManage}
      />
    </div>
  );
};

export default Reservation;
