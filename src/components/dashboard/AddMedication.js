import React from 'react';
import { useForm } from 'react-hook-form';
import PharmService from '../services/PharmService';

const AddMedication = ({ pharmacyId, onMedicationAdded }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const handleAddMedication = async (data) => {
    console.log("Dados do formulário:", data); // Log para depuração

    try {
      // Verificar se todos os campos obrigatórios estão preenchidos
      if (!data.medicineName || !data.idPharmacy || !data.quantity) {
        console.log("Campos obrigatórios não preenchidos"); // Log para depuração
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
      }

      // Fazer a chamada à API
      await PharmService.addMedicine({
        medicineName: data.medicineName,
        idPharmacy: Number(data.idPharmacy),
        quantity: Number(data.quantity),
      });

      console.log("Medicamento adicionado com sucesso"); // Log para depuração

      // Fechar o modal e resetar o formulário
      reset({
        medicineName: '',
        quantity: '',
        idPharmacy: pharmacyId || ''
      });

      alert("Medicamento adicionado com sucesso!");

      // Chamar a função de callback para atualizar a lista de medicamentos
      if (onMedicationAdded) {
        onMedicationAdded();
      }
    } catch (error) {
      console.error("Erro ao adicionar medicamento:", error);
      alert("Não foi possível adicionar o medicamento. " + (error.message || ""));
    }
  };

  return (
    <div>
      <h3 className="font-bold text-lg">Registrar Medicamento</h3>
      <p className="py-4">Preencha as informações abaixo para adicionar o medicamento:</p>
      <form onSubmit={handleSubmit(handleAddMedication)} className="space-y-4">
        <div>
          <label htmlFor="medicineName" className="block text-sm font-medium text-gray-700">
            Nome do Medicamento
          </label>
          <input
            id="medicineName"
            type="text"
            className="input input-bordered w-full"
            {...register("medicineName", { required: "Campo obrigatório" })}
          />
          {errors.medicineName && (
            <p className="text-red-600 text-sm">{errors.medicineName.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="idPharmacy" className="block text-sm font-medium text-gray-700">
            ID da Farmácia
          </label>
          <input
            id="idPharmacy"
            type="number"
            className="input input-bordered w-full"
            defaultValue={pharmacyId || undefined}
            readOnly={!!pharmacyId}
            {...register("idPharmacy", { required: !pharmacyId && "Campo obrigatório" })}
          />
          {errors.idPharmacy && (
            <p className="text-red-600 text-sm">{errors.idPharmacy.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
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
