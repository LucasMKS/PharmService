import React from "react";
import { useForm } from "react-hook-form";
import PharmService from "../services/PharmService";
import {
  FiBox,
  FiAlertCircle,
  FiHome,
  FiPlus,
  FiX,
  FiFileText,
} from "react-icons/fi";

const AddMedication = ({ pharmacyId, onMedicationAdded, roles }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      medicineName: "",
      idPharmacy: pharmacyId || "",
      quantity: "",
      manufacturer: "",
      category: "",
      dosageForm: "",
      classification: "",
    },
  });

  const handleAddMedication = async (data) => {
    try {
      // Se for GERENTE, usa sempre o pharmacyId passado como prop
      const finalPharmacyId =
        roles === "GERENTE" ? pharmacyId : data.idPharmacy;

      if (!finalPharmacyId) {
        alert("ID da farmácia é obrigatório");
        return;
      }

      await PharmService.addMedicine(data);

      reset({
        medicineName: "",
        quantity: "",
        idPharmacy: pharmacyId || "",
      });

      alert("Medicamento adicionado com sucesso!");

      if (onMedicationAdded) {
        onMedicationAdded();
      }
    } catch (error) {
      alert(
        "Não foi possível adicionar o medicamento. " + (error.message || "")
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="modal-box relative max-w-md bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 shadow-2xl p-8 ">
        <button
          onClick={() => document.getElementById("addMedicine").close()}
          className="btn btn-sm btn-circle absolute right-4 top-4 text-gray-500 hover:text-blue-600"
        >
          <FiX className="text-lg" />
        </button>

        <div className="text-center space-y-6">
          <div className="inline-block p-3 bg-blue-100 dark:bg-gray-700 rounded-full">
            <FiPlus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>

          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Cadastrar Novo Medicamento
          </h3>

          <form
            onSubmit={handleSubmit(handleAddMedication)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-2">
              <div className="form-control">
                <label className="label justify-start gap-2 pl-1">
                  <FiBox className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  <span className="label-text text-gray-600 dark:text-gray-300">
                    Nome do Medicamento
                  </span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered w-full bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-300 ${
                    errors.medicineName && "input-error"
                  }`}
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
                  <FiBox className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  <span className="label-text text-gray-600 dark:text-gray-300">
                    Quantidade
                  </span>
                </label>
                <input
                  type="number"
                  className={`input input-bordered w-full bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-300 ${
                    errors.quantity && "input-error"
                  }`}
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

            <div className="form-control">
              <label className="label justify-start gap-2 pl-1">
                <FiBox className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <span className="label-text text-gray-600 dark:text-gray-300">
                  Fabricante
                </span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-300 ${
                  errors.manufacturer && "input-error"
                }`}
                {...register("manufacturer", {
                  required: "Campo obrigatório",
                })}
              />
              {errors.manufacturer && (
                <div className="flex items-center gap-2 mt-2 text-error">
                  <FiAlertCircle className="text-sm" />
                  <span className="text-sm">{errors.manufacturer.message}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="form-control">
                <label className="label justify-start gap-2 pl-1">
                  <FiBox className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  <span className="label-text text-gray-600 dark:text-gray-300">
                    Categoria
                  </span>
                </label>
                <select
                  className={`select select-bordered w-full bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-300 ${
                    errors.category && "select-error"
                  }`}
                  {...register("category", { required: "Campo obrigatório" })}
                >
                  <option value="">Selecione uma categoria</option>
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

              <div className="form-control">
                <label className="label justify-start gap-2 pl-1">
                  <FiBox className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  <span className="label-text text-gray-600 dark:text-gray-300">
                    Forma farmacêutica
                  </span>
                </label>
                <select
                  className={`select select-bordered w-full bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-300 ${
                    errors.dosageForm && "select-error"
                  }`}
                  {...register("dosageForm", { required: "Campo obrigatório" })}
                >
                  <option value="">Selecione uma opção</option>
                  <option value="Antidiabético">Creme</option>
                  <option value="Antiviral">Injeção</option>
                  <option value="Analgésico">Pomada</option>
                  <option value="Antibiótico">Xarope</option>
                  <option value="Antiinflamatório">Comprimido</option>
                  <option value="Antihipertensivo">Inalador</option>
                  <option value="Ansiolítico">Cápsula</option>
                  <option value="Antidepressivo">Gotas</option>
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

            <div className="form-control">
              <label className="label justify-start gap-2 pl-1">
                <FiBox className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <span className="label-text text-gray-600 dark:text-gray-300">
                  Classificação
                </span>
              </label>
              <select
                className={`select select-bordered w-full bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-300 ${
                  errors.classification && "select-error"
                }`}
                {...register("classification", {
                  required: "Campo obrigatório",
                })}
              >
                <option value="">Selecione a classificação</option>
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

            <div className="form-control">
              <label className="label justify-start gap-2 pl-1">
                <FiFileText className="w-5 h-5 text-blue-500" />
                <span className="label-text">Requer Prescrição</span>
              </label>
              <label className="label justify-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  {...register("requiresPrescription")}
                />
                <span className="label-text">Sim</span>
              </label>
            </div>

            {roles === "ADMIN" && (
              <div className="form-control">
                <label className="label justify-start gap-2 pl-1">
                  <FiHome className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  <span className="label-text text-gray-600 dark:text-gray-300">
                    ID da Farmácia
                  </span>
                </label>
                <input
                  type="number"
                  placeholder="Ex: 123"
                  className={`input input-bordered w-full bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-300 ${
                    errors.idPharmacy && "input-error"
                  }`}
                  {...register("idPharmacy", { required: "Campo obrigatório" })}
                />
                {errors.idPharmacy && (
                  <div className="flex items-center gap-2 mt-2 text-error">
                    <FiAlertCircle className="text-sm" />
                    <span className="text-sm">{errors.idPharmacy.message}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <button
                type="submit"
                className="btn btn-primary flex-1 gap-2 hover:scale-[1.02] transition-transform"
              >
                <FiPlus className="text-lg" />
                Cadastrar Medicamento
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMedication;
