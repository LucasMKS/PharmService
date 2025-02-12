import { React } from "react";
import PharmService from "../services/PharmService";
import {
  FiEdit,
  FiPackage,
  FiArchive,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiDroplet,
  FiGrid,
  FiLayers,
  FiTag,
  FiFileText,
} from "react-icons/fi";

const EditMedicationModal = ({
  isOpen,
  selectedMedicine,
  register,
  errors,
  handleSubmit,
  onClose,
  onSave,
  showToast,
  roles,
  pharmacyId,
}) => {
  const onSubmit = async (data) => {
    try {
      await PharmService.updateMedicine(selectedMedicine.pharmacy.id, {
        medicineName: data.medicineName,
        quantity: data.quantity,
        category: data.category,
        dosageForm: data.dosageForm,
        manufacturer: data.manufacturer,
        classification: data.classification,
        requiresPrescription: data.requiresPrescription === "true",
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
    <div className="modal modal-open backdrop-blur-sm">
      <div className="modal-box relative max-w-md bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 shadow-xl">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle absolute right-4 top-4 text-gray-500 hover:text-blue-600"
        >
          <FiX className="text-lg" />
        </button>

        <div className="text-center space-y-6">
          <div className="inline-block p-3 bg-blue-100 dark:bg-gray-700 rounded-full">
            <FiEdit className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Editar Medicamento
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Campos existentes */}
            <div className="grid grid-cols-2 gap-2">
              <div className="form-control">
                <label className="label justify-start gap-2 pl-1">
                  <FiPackage className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  <span className="label-text text-gray-600 dark:text-gray-300">
                    Nome do Medicamento
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Paracetamol 500mg"
                  className={`input input-bordered w-full bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-300 ${
                    errors.medicineName && "input-error"
                  }`}
                  defaultValue={selectedMedicine?.medicineName}
                  {...register("medicineName", {
                    required: "Campo obrigatório",
                  })}
                />
                {errors.medicineName && (
                  <div className="flex items-center gap-2 mt-2 text-error">
                    <FiAlertCircle className="text-sm" />
                    <span className="text-sm">
                      {errors.medicineName.message}
                    </span>
                  </div>
                )}
              </div>

              <div className="form-control">
                <label className="label justify-start gap-2 pl-1">
                  <FiArchive className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  <span className="label-text text-gray-600 dark:text-gray-300">
                    Quantidade
                  </span>
                </label>
                <input
                  type="number"
                  placeholder="Ex: 150"
                  className={`input input-bordered w-full bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-300 ${
                    errors.quantity && "input-error"
                  }`}
                  min="0"
                  defaultValue={selectedMedicine?.quantity}
                  {...register("quantity", {
                    required: "Campo obrigatório",
                    min: { value: 0, message: "Valor mínimo é 0" },
                  })}
                />
                {errors.quantity && (
                  <div className="flex items-center gap-2 mt-2 text-error">
                    <FiAlertCircle className="text-sm" />
                    <span className="text-sm">{errors.quantity.message}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {/* Categoria */}
              <div className="form-control">
                <label className="label justify-start gap-2 pl-1">
                  <FiGrid className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  <span className="label-text text-gray-600 dark:text-gray-300">
                    Categoria
                  </span>
                </label>
                <select
                  className={`select select-bordered w-full bg-white dark:bg-gray-700 ${
                    errors.category && "select-error"
                  }`}
                  defaultValue={selectedMedicine?.category}
                  {...register("category", { required: "Campo obrigatório" })}
                >
                  <option value="">Selecione</option>
                  <option value="Antidiabético">Antidiabético</option>
                  <option value="Antiviral">Antiviral</option>
                  <option value="Analgésico">Analgésico</option>
                  <option value="Antibiótico">Antibiótico</option>
                  <option value="Antiinflamatório">Antiinflamatório</option>
                  <option value="Antihipertensivo">Antihipertensivo</option>
                  <option value="Ansiolítico">Ansiolítico</option>
                  <option value="Antidepressivo">Antidepressivo</option>
                  <option value="Antifúngico">Antifúngico</option>
                  <option value="Antialérgico">Antialérgico</option>
                  <option value="Outros">Outros</option>
                </select>
                {errors.category && (
                  <div className="flex items-center gap-2 mt-2 text-error">
                    <FiAlertCircle className="text-sm" />
                    <span className="text-sm">{errors.category.message}</span>
                  </div>
                )}
              </div>

              {/* Forma Farmacêutica */}
              <div className="form-control">
                <label className="label justify-start gap-2 pl-1">
                  <FiLayers className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  <span className="label-text text-gray-600 dark:text-gray-300">
                    Forma Farmacêutica
                  </span>
                </label>
                <select
                  className={`select select-bordered w-full bg-white dark:bg-gray-700 ${
                    errors.dosageForm && "select-error"
                  }`}
                  defaultValue={selectedMedicine?.dosageForm}
                  {...register("dosageForm", { required: "Campo obrigatório" })}
                >
                  <option value="">Selecione</option>
                  <option value="Comprimido">Comprimido</option>
                  <option value="Cápsula">Cápsula</option>
                  <option value="Xarope">Xarope</option>
                  <option value="Pomada">Pomada</option>
                  <option value="Injeção">Injeção</option>
                  <option value="Creme">Creme</option>
                  <option value="Gotas">Gotas</option>
                  <option value="Inalador">Inalador</option>
                  <option value="Outros">Outros</option>
                </select>
                {errors.dosageForm && (
                  <div className="flex items-center gap-2 mt-2 text-error">
                    <FiAlertCircle className="text-sm" />
                    <span className="text-sm">{errors.dosageForm.message}</span>
                  </div>
                )}
              </div>
            </div>
            {/* Fabricante */}
            <div className="form-control">
              <label className="label justify-start gap-2 pl-1">
                <FiTag className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <span className="label-text text-gray-600 dark:text-gray-300">
                  Fabricante
                </span>
              </label>
              <input
                type="text"
                placeholder="Ex: Johnson & Johnson"
                className={`input input-bordered w-full bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-300 ${
                  errors.manufacturer && "input-error"
                }`}
                defaultValue={selectedMedicine?.manufacturer}
                {...register("manufacturer", { required: "Campo obrigatório" })}
              />
              {errors.manufacturer && (
                <div className="flex items-center gap-2 mt-2 text-error">
                  <FiAlertCircle className="text-sm" />
                  <span className="text-sm">{errors.manufacturer.message}</span>
                </div>
              )}
            </div>
            {/* Classificação */}
            <div className="form-control">
              <label className="label justify-start gap-2 pl-1">
                <FiDroplet className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <span className="label-text text-gray-600 dark:text-gray-300">
                  Classificação
                </span>
              </label>
              <select
                className={`select select-bordered w-full bg-white dark:bg-gray-700 ${
                  errors.classification && "select-error"
                }`}
                defaultValue={selectedMedicine?.classification}
                {...register("classification", {
                  required: "Campo obrigatório",
                })}
              >
                <option value="">Selecione</option>
                <option value="Controlado">Controlado</option>
                <option value="Genérico">Genérico</option>
                <option value="Similar">Similar</option>
                <option value="Fitoterápico">Fitoterápico</option>
                <option value="Manipulado">Manipulado</option>
                <option value="Outros">Outros</option>
              </select>
              {errors.classification && (
                <div className="flex items-center gap-2 mt-2 text-error">
                  <FiAlertCircle className="text-sm" />
                  <span className="text-sm">
                    {errors.classification.message}
                  </span>
                </div>
              )}
            </div>

            {/* <div className="form-control">
              <label className="label justify-start gap-2 pl-1">
                <FiFileText className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <span className="label-text text-gray-600 dark:text-gray-300">
                  Requer Prescrição
                </span>
              </label>
              <label className="label justify-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  defaultChecked={selectedMedicine?.requiresPrescription}
                  {...register("requiresPrescription")}
                />
                <span className="label-text text-sm">
                  {selectedMedicine?.requiresPrescription ? "Sim" : "Não"}
                </span>
              </label>
            </div> */}
            {/* Quantidade */}

            <div className="flex gap-3 justify-end pt-6">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost hover:bg-gray-100 dark:hover:bg-gray-700 gap-2"
              >
                <FiX className="text-lg" />
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary gap-2 hover:scale-[1.02] transition-transform"
              >
                <FiCheck className="text-lg" />
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMedicationModal;
