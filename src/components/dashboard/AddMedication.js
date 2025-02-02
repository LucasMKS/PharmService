import React from "react";
import { useForm } from "react-hook-form";
import PharmService from "../services/PharmService";
import { FiBox, FiAlertCircle, FiHome } from "react-icons/fi";

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
    <div className="p-8 px-24 bg-gray-300 dark:bg-gray-800 rounded-xl shadow-lg">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Registrar Medicamento
      </h3>

      <form onSubmit={handleSubmit(handleAddMedication)} className="space-y-6">
        <div className="form-control">
          <label className="label">
            <span className="label-text flex items-center gap-2 text-stone-700 dark:text-stone-300">
              <FiBox className="text-lg" />
              Nome do Medicamento
            </span>
          </label>
          <input
            type="text"
            placeholder="Digite o nome do medicamento"
            className={`input input-bordered w-full bg-stone-800 shadow-md shadow-stone-950 dark:bg-stone-800 dark:shadow-none  ${
              errors.medicineName && "input-error"
            }`}
            {...register("medicineName", { required: "Campo obrigatório" })}
          />
          {errors.medicineName && (
            <label className="label">
              <span className="label-text-alt text-error flex items-center gap-1">
                <FiAlertCircle className="text-sm" />
                {errors.medicineName.message}
              </span>
            </label>
          )}
        </div>

        {/* Campo ID da Farmácia (condicional) */}
        {roles == "ADMIN" && (
          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <FiHome className="text-lg" />
                ID da Farmácia
              </span>
            </label>
            <input
              type="number"
              placeholder="Digite o ID da farmácia"
              className={`input input-bordered w-full${
                errors.idPharmacy && "input-error"
              }`}
              {...register("idPharmacy", { required: "Campo obrigatório" })}
            />
            {errors.idPharmacy && (
              <label className="label">
                <span className="label-text-alt text-error flex items-center gap-1">
                  <FiAlertCircle className="text-sm" />
                  {errors.idPharmacy.message}
                </span>
              </label>
            )}
          </div>
        )}

        <div className="form-control">
          <label className="label">
            <span className="label-text text-stone-700 dark:text-stone-300">
              Quantidade
            </span>
          </label>
          <input
            type="number"
            placeholder="Digite a quantidade"
            className={`input input-bordered w-full bg-stone-800 shadow-md shadow-stone-950 dark:bg-stone-800 dark:shadow-none ${
              errors.quantity && "input-error"
            }`}
            {...register("quantity", { required: "Campo obrigatório", min: 0 })}
          />
          {errors.quantity && (
            <label className="label">
              <span className="label-text-alt text-error flex items-center gap-1">
                <FiAlertCircle className="text-sm" />
                {errors.quantity.message}
              </span>
            </label>
          )}
        </div>

        <div className="space-y-1">
          <button
            type="submit"
            className="btn w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Salvar
          </button>
          <button
            type="button"
            className="btn w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            onClick={() => {
              document.getElementById("my_modal_5").close();
            }}
          >
            Fechar
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMedication;
