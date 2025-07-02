import React from "react";
import { useForm } from "react-hook-form";

const ManageReservationModalContent = ({ reservation, onManage, onCancel }) => {
  const { register, handleSubmit, watch } = useForm();
  const selectedStatus = watch("status", "aprovado");

  const onSubmit = (data) => {
    onManage(reservation.id, data.status, data.message);
    onCancel();
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
      <div className="flex gap-3 justify-end mt-6">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary">
          Confirmar
        </button>
      </div>
    </form>
  );
};

export default ManageReservationModalContent;
