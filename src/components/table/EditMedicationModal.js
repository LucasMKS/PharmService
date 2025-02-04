import { React } from "react";
import PharmService from "../services/PharmService";

const EditMedicationModal = ({
  isOpen,
  selectedMedicine,
  register,
  errors,
  handleSubmit,
  onClose,
  onSave,
  showToast,
}) => {
  const onSubmit = async (data) => {
    try {
      await PharmService.updateMedicine(selectedMedicine.pharmacy.id, {
        medicineName: data.medicineName,
        quantity: data.quantity,
      });
      onSave();
      onClose();
      showToast("Medicamento atualizado com sucesso!");
    } catch (error) {
      showToast(`Erro ao atualizar: ${error.response?.data?.error}`, "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Editar Medicamento</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Nome do Medicamento</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              defaultValue={selectedMedicine?.medicineName}
              {...register("medicineName", { required: "Campo obrigatório" })}
            />
            {errors.medicineName && (
              <span className="text-error text-sm">
                {errors.medicineName.message}
              </span>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Quantidade</span>
            </label>
            <input
              type="number"
              className="input input-bordered"
              min="0"
              defaultValue={selectedMedicine?.quantity}
              {...register("quantity", {
                required: "Campo obrigatório",
                min: { value: 0, message: "Valor mínimo é 0" },
              })}
            />
            {errors.quantity && (
              <span className="text-error text-sm">
                {errors.quantity.message}
              </span>
            )}
          </div>

          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMedicationModal;
