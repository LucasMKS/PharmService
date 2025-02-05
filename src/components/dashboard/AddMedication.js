import React from "react";
import { useForm } from "react-hook-form";
import PharmService from "../services/PharmService";
import { FiBox, FiAlertCircle, FiHome, FiPlus, FiX } from "react-icons/fi";

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
    },
  });

  const handleAddMedication = async (data) => {
    try {
      if (!data.medicineName || !data.quantity) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
      }

      // Se for GERENTE, usa sempre o pharmacyId passado como prop
      const finalPharmacyId =
        roles === "GERENTE" ? pharmacyId : data.idPharmacy;

      if (!finalPharmacyId) {
        alert("ID da farmácia é obrigatório");
        return;
      }

      await PharmService.addMedicine({
        medicineName: data.medicineName,
        idPharmacy: Number(finalPharmacyId),
        quantity: Number(data.quantity),
      });

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
      console.error("Erro ao adicionar medicamento:", error);
      alert(
        "Não foi possível adicionar o medicamento. " + (error.message || "")
      );
    }
  };

  return (
    <div className="modal-box relative max-w-md bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 shadow-2xl p-8">
      <button
        onClick={() => document.getElementById("my_modal_5").close()}
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
          <div className="form-control">
            <label className="label justify-start gap-2 pl-1">
              <FiBox className="w-5 h-5 text-blue-500 dark:text-blue-400" />
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
              {...register("medicineName", { required: "Campo obrigatório" })}
            />
            {errors.medicineName && (
              <div className="flex items-center gap-2 mt-2 text-error">
                <FiAlertCircle className="text-sm" />
                <span className="text-sm">{errors.medicineName.message}</span>
              </div>
            )}
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

          <div className="form-control">
            <label className="label justify-start gap-2 pl-1">
              <FiBox className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              <span className="label-text text-gray-600 dark:text-gray-300">
                Quantidade Inicial
              </span>
            </label>
            <input
              type="number"
              placeholder="Ex: 50"
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
  );
};

export default AddMedication;
