"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import Fuse from "fuse.js";
import PharmService from "../services/PharmService";
import PharmacyModal from "./PharmacyModal";
import { debounce } from "lodash";

const TableContent = ({ roles, pharmacyId }) => {
  const [medications, setMedications] = useState([]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  // Configuração do Fuse.js
  const fuse = useMemo(
    () =>
      new Fuse(medications, {
        keys: ["medicineName", "pharmacy.name"],
        threshold: 0.3, // Ajusta a sensibilidade da busca
      }),
    [medications]
  );

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        let response;
        if (roles === 'FARMACIA' || roles === 'GERENTE') {
          if (pharmacyId) {
            // Fetch medicines for specific pharmacy
            response = await PharmService.getMedicineByPharmacyId(pharmacyId);
          } else {
            // Fallback to all medicines if no pharmacyId
            response = await PharmService.getAllMedicines();
          }
        } else {
          // For other roles, fetch all medicines
          response = await PharmService.getAllMedicines();
        }

        setMedications(response);
        setFilteredMedications(response);
        setLoading(false);
      } catch (err) {
        setError("Falha ao buscar medicamentos");
        setLoading(false);
      }
    };

    fetchMedications();
  }, [roles, pharmacyId]);

  // Função otimizada para busca local
  const handleSearch = useCallback(
    debounce((term) => {
      if (term.trim() === "") {
        setFilteredMedications(medications); // Sem busca, exibe todos
      } else {
        const results = fuse.search(term).map(({ item }) => item);
        setFilteredMedications(results);
      }
    }, 300),
    [fuse, medications]
  );

  useEffect(() => {
    handleSearch(searchTerm);
  }, [searchTerm, handleSearch]);

  const handlePharmacyClick = (pharmacy) => setSelectedPharmacy(pharmacy);
  const handleCloseModal = () => setSelectedPharmacy(null);

  const handleAddMedication = async (data) => {
    try {
      await PharmService.addMedicine({
        medicineName: data.medicineName,
        idPharmacy: Number(data.idPharmacy), // Converte para número
        quantity: Number(data.quantity), // Converte para número

      });
      alert("Medicamento adicionado com sucesso!");
      reset(); // Reseta o formulário
    } catch (error) {
      console.error("Erro ao adicionar medicamento:", error);
      alert("Não foi possível adicionar o medicamento.");
    }
  };

  const handleEdit = (medicineId) => {
    const medicineToEdit = medications.find((med) => med.medicineId === medicineId);
    if (medicineToEdit) {
      reset({
        medicineName: medicineToEdit.medicineName,
        quantity: medicineToEdit.quantity,
        idPharmacy: medicineToEdit.idPharmacy,
      });
      setSelectedMedicine(medicineToEdit); // Defina o medicamento selecionado para o modal
      document.getElementById('edit_modal').showModal(); // Mostra o modal de edição
    }
  };

  const handleEditSubmit = async (data) => {
    try {
      // Suponha que `data` tenha os campos corretamente
      await PharmService.updateMedicine(data.idPharmacy, {
        medicineName: data.medicineName,
        quantity: data.quantity,
      });
  
      // Atualiza a lista local de medicamentos
      setMedications(
        medications.map((med) =>
          med.medicineId === selectedMedicine.medicineId
            ? { ...med, medicineName: data.medicineName, quantity: data.quantity }
            : med
        )
      );
  
      alert("Medicamento atualizado com sucesso!");
  
      // Fecha o modal e limpa o estado
      document.getElementById('edit_modal').close();
      setSelectedMedicine(null);  // Isso pode ser o suficiente para esconder o modal
    } catch (error) {
      console.error("Erro ao editar medicamento:", error);
      alert("Não foi possível editar o medicamento.");
    }
  };
  



  const handleDelete = async (medicineId) => {
    if (window.confirm("Tem certeza que deseja excluir este medicamento?")) {
      try {
        await PharmService.deleteMedicine(medicineId);
        setMedications(
          medications.filter((med) => med.medicineId !== medicineId)
        );
      } catch (error) {
        console.error("Erro ao excluir medicamento:", error);
        alert("Não foi possível excluir o medicamento. Tente novamente.");
      }
    }
  };

  const handleReserv = (medicineId) => {
    // Implementar lógica de edição
    console.log("Reservar medicamento", medicineId);
  };

  const handleAlert = (medicineId) => {
    // Implementar lógica de edição
    console.log("Alerta medicamento", medicineId);
  };

  const renderLoadingOrError = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center w-full h-64 bg-neutral-500 text-white text-xl font-semibold">
          Carregando medicamentos...
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center w-full h-64 bg-red-500 text-white text-xl font-semibold p-4 text-center">
          {error}
        </div>
      );
    }

    return null;
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMedications = filteredMedications.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMedications.length / itemsPerPage);


  // Pagination handlers
  const handleNextPage = () => currentPage < totalPages && setCurrentPage((p) => p + 1);
  const handlePrevPage = () => currentPage > 1 && setCurrentPage((p) => p - 1);

  return (
    <div className="bg-blue-100 dark:bg-slate-900 min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-neutral-600 dark:bg-neutral-300 rounded-lg shadow-lg overflow-hidden">
        <div className="p-1.5 min-w-full inline-block align-middle">
          <div className="border rounded-lg divide-y dark:border-neutral-700 divide-gray-200 dark:divide-neutral-950">
            <div className="py-3 px-4 bg-neutral-100 dark:bg-neutral-800 flex justify-between items-center">
              <div className="relative max-w-xs">
                <input
                  type="text"
                  className="py-2 px-3 ps-9 block w-full border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                  placeholder="Buscar medicamentos"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>


              {roles !== 'CLIENTE' && (
                <div >
                  <button className="btn" onClick={() => document.getElementById('my_modal_5').showModal()}>Adicionar medicamento</button>
                  <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
                    <div className="modal-box">
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
                            defaultValue={pharmacyId || ''} // Condicional para preencher com pharmacyId se existir
                            readOnly={!!pharmacyId}
                            {...register("idPharmacy", { required: !pharmacyId && "Campo obrigatório" })} // Se pharmacyId não existe, é obrigatório
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
                          <form method="dialog">
                            {/* if there is a button in form, it will close the modal */}
                            <button className="btn">Close</button>
                          </form>
                          <button type="submit" className="btn btn-primary">
                            Salvar
                          </button>
                        </div>
                      </form>
                    </div>
                  </dialog>
                </div>
              )}
            </div>

            <dialog id="edit_modal" className="modal modal-bottom sm:modal-middle">
              <div className="modal-box">
                <h3 className="font-bold text-lg">Editar Medicamento</h3>
                <form onSubmit={handleSubmit(handleEditSubmit)} className="space-y-4">
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
                    <form method="dialog">
                      {/* if there is a button in form, it will close the modal */}
                      <button className="btn">Close</button>
                    </form>
                    <button type="submit" className="btn btn-primary">
                      Salvar
                    </button>
                  </div>
                </form>
              </div>
            </dialog>



            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                <thead className="bg-neutral-100 dark:bg-neutral-800">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
                    >
                      Nome do Medicamento
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
                    >
                      Quantidade
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
                    >
                      Última Atualização
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
                    >
                      Farmácia
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
                    >
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-neutral-200 dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-neutral-950">
                  {currentMedications.map((medication) => (
                    <tr key={medication.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">
                        {medication.medicineName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">
                        {medication.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">
                        {new Date(medication.updatedOn).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">
                        <button
                          onClick={() =>
                            handlePharmacyClick(medication.pharmacy)
                          }
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
                        >
                          {medication.pharmacy.name}
                        </button>
                      </td>

                      {roles !== 'CLIENTE' && (
                        <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                          <button
                            onClick={() => handleEdit(medication.medicineId)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-600 mr-2"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(medication.medicineId)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-600"
                          >
                            Excluir
                          </button>
                        </td>
                      )}
                      {roles === 'CLIENTE' && (
                        <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                          {medication.quantity !== 0 ? (
                            <button
                              onClick={() => handleReserv(medication.medicineId)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-600 mr-2"
                            >
                              Reservar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAlert(medication.medicineId)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-600 mr-2"
                            >
                              Criar Alerta
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}

                </tbody>
              </table>
              {renderLoadingOrError()}
            </div>
            <div className="py-2 px-4 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-between">
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
      {selectedPharmacy && (
        <PharmacyModal pharmacy={selectedPharmacy} onClose={handleCloseModal} />
      )}
    </div>
  );
}

export default TableContent;