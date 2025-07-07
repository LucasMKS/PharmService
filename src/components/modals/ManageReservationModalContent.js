import React, { useState } from "react";
import { useForm } from "react-hook-form";

const ManageReservationModalContent = ({
  reservation,
  onConfirm,
  onCancel,
}) => {
  const { register, handleSubmit, watch } = useForm();
  const [loading, setLoading] = useState(false);

  // Define o status padrão baseado no status atual da reserva
  const getDefaultStatus = () => {
    if (!reservation) return "aprovado";
    if (reservation.status === "pendente") return "aprovado";
    if (reservation.status === "aprovado") return "concluido";
    return "aprovado";
  };

  const selectedStatus = watch("status", getDefaultStatus());

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await onConfirm(reservation.id, data.status, data.message);
      onCancel();
    } finally {
      setLoading(false);
    }
  };

  if (!reservation) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text dark:text-gray-300">Novo Status</span>
        </label>
        <select
          className="select select-bordered w-full dark:bg-neutral-700 dark:text-white"
          {...register("status", { required: true })}
          defaultValue={getDefaultStatus()}
        >
          {reservation.status === "pendente" && (
            <>
              <option value="aprovado" className="dark:bg-neutral-800">
                Aprovar
              </option>
              <option value="cancelado" className="dark:bg-neutral-800">
                Cancelar
              </option>
            </>
          )}
          {reservation.status === "aprovado" && (
            <>
              <option value="concluido" className="dark:bg-neutral-800">
                Concluir
              </option>
              <option value="cancelado" className="dark:bg-neutral-800">
                Cancelar
              </option>
            </>
          )}
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
      <div className="flex gap-3 justify-end mt-6">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading
            ? "Processando..."
            : reservation.status === "pendente"
            ? "Aprovar"
            : "Concluir"}
        </button>
      </div>
    </form>
  );
};

export default ManageReservationModalContent;
