import React from "react";
import { useForm } from "react-hook-form";
import PharmService from "../services/PharmService";

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
    <div>
      <h3 className="font-bold text-lg">Registrar Medicamento</h3>
      <p className="py-4">
        Preencha as informações abaixo para adicionar o medicamento:
      </p>
      <form onSubmit={handleSubmit(handleAddMedication)} className="space-y-4">
        <div>
          <label
            htmlFor="medicineName"
            className="block text-sm font-medium text-gray-700"
          >
            Nome do Medicamento
          </label>
          <input
            id="medicineName"
            type="text"
            className="input input-bordered w-full"
            {...register("medicineName", { required: "Campo obrigatório" })}
          />
          {errors.medicineName && (
            <p className="text-red-600 text-sm">
              {errors.medicineName.message}
            </p>
          )}
        </div>

        {/* Campo ID da Farmácia - Só mostra se NÃO for GERENTE */}
        {roles !== "GERENTE" && (
          <div>
            <label
              htmlFor="idPharmacy"
              className="block text-sm font-medium text-gray-700"
            >
              ID da Farmácia
            </label>
            <input
              id="idPharmacy"
              type="number"
              className="input input-bordered w-full"
              {...register("idPharmacy", { required: "Campo obrigatório" })}
            />
            {errors.idPharmacy && (
              <p className="text-red-600 text-sm">
                {errors.idPharmacy.message}
              </p>
            )}
          </div>
        )}

        <div>
          <label
            htmlFor="quantity"
            className="block text-sm font-medium text-gray-700"
          >
            Quantidade
          </label>
          <input
            id="quantity"
            type="number"
            className="input input-bordered w-full"
            {...register("quantity", { required: "Campo obrigatório", min: 0 })}
          />
          {errors.quantity && (
            <p className="text-red-600 text-sm">{errors.quantity.message}</p>
          )}
        </div>
        <div className="modal-action">
          <button type="submit" className="btn btn-primary">
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMedication;
