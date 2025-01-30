"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import Fuse from "fuse.js";
import Cookies from "js-cookie";
import PharmService from "../services/PharmService";
import PharmacyModal from "./PharmacyModal";
import AddMedication from "./AddMedication"
import { debounce } from "lodash";

const ReservationModal = ({ 
  isOpen, 
  onClose, 
  medicineId, 
  medicineName, 
  onReservationSuccess 
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setError(null);
  };

  const handleReservation = async () => {
    if (!selectedFile) {
      setError("Por favor, selecione uma prescrição.");
      return;
    }

    const userId = Cookies.get("userId");
    if (!userId) {
      setError("Por favor, faça login para reservar um medicamento.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("stockId", medicineId);
    formData.append("prescription", selectedFile);

    try {
      const response = await PharmService.createReservation(formData);
      onReservationSuccess(medicineId);
      alert(`Reserva criada com sucesso! Protocolo: ${response.prescriptionPath}`);
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data || 
        "Não foi possível criar a reserva. Por favor, tente novamente.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
    <dialog id="reservation_modal" className="modal modal-bottom sm:modal-middle" open>
      <div className="modal-box">
        <h3 className="font-bold text-lg">Reservar Medicamento</h3>
        <p className="py-4">Reservando: {medicineName}</p>
        
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Anexe sua prescrição médica</span>
          </label>
          <input 
            type="file" 
            accept="image/*,application/pdf" 
            className="file-input file-input-bordered w-full" 
            onChange={handleFileChange}
          />
        </div>

        {selectedFile && (
          <div className="mt-4">
            <p>Arquivo selecionado: {selectedFile.name}</p>
          </div>
        )}

        {error && (
          <div className="alert alert-error mt-4">
            <div className="flex-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-6 h-6 mx-2 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <label>{error}</label>
            </div>
          </div>
        )}

        <div className="modal-action">
          <button 
            className="btn" 
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleReservation}
            disabled={!selectedFile || isLoading}
          >
            Reservar
          </button>
        </div>
      </div>
    </dialog>
    </>
  );  
};

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
  const [reservationModalOpen, setReservationModalOpen] = useState(false);
  const [selectedMedicineForReservation, setSelectedMedicineForReservation] = useState(null);

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

  const handleSearch = useCallback(
    debounce((term) => {
      if (term.trim() === "") {
        setFilteredMedications(medications); 
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

  const handleEdit = (medicineId) => {
    const medicineToEdit = medications.find((med) => med.medicineId === medicineId);
    if (medicineToEdit) {
      reset({
        medicineName: medicineToEdit.medicineName,
        quantity: medicineToEdit.quantity,
        idPharmacy: medicineToEdit.pharmacy.id,
      });
      setSelectedMedicine(medicineToEdit); // Defina o medicamento selecionado para o modal
      document.getElementById('edit_modal').showModal(); // Mostra o modal de edição
    }
  };

  const handleEditSubmit = async (data) => {
    try {
      console.log(selectedMedicine);
      // Suponha que `data` tenha os campos corretamente
      await PharmService.updateMedicine(selectedMedicine.pharmacy.id, {
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

  const handleReserv = (medication) => {
    setSelectedMedicineForReservation(medication);
    setReservationModalOpen(true);
  };

  const handleReservationSuccess = (medicineId) => {
    const updatedMedications = medications.map(med => 
      med.medicineId === medicineId 
        ? { ...med, quantity: med.quantity - 1 } 
        : med
    );
    
    setMedications(updatedMedications);
    setFilteredMedications(updatedMedications);
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

  const handleAddClick = () => {
    document.getElementById("my_modal_5").showModal()
  }

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

              {roles !== "CLIENTE" && (
                <div>
                  <button className="btn" onClick={handleAddClick}>
                    Adicionar medicamento
                  </button>
                  <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
                    <div className="modal-box">
                      <AddMedication
                        pharmacyId={pharmacyId}
                        onMedicationAdded={async () => {
                          const updatedMedications = await PharmService.getAllMedicines()
                          setMedications(updatedMedications)
                          setFilteredMedications(updatedMedications)
                          document.getElementById("my_modal_5").close()
                        }}
                      />
                      <div className="modal-action">
                        <button
                          type="button"
                          className="btn"
                          onClick={() => {
                            document.getElementById("my_modal_5").close()
                          }}
                        >
                          Fechar
                        </button>
                      </div>
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
                  {roles !== 'CLIENTE' && ( 
                    <input
                            id="idPharmacy"
                            type="number"
                            className="input input-bordered w-full"
                            defaultValue={pharmacyId || ''} // Condicional para preencher com pharmacyId se existir
                            readOnly
                            {...register("idPharmacy", { required: !pharmacyId && "Campo obrigatório" })} // Se pharmacyId não existe, é obrigatório
                          />
                  )}
                  
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
                              onClick={() => handleReserv(medication)}
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
<ReservationModal 
        isOpen={reservationModalOpen}
        onClose={() => setReservationModalOpen(false)}
        medicineId={selectedMedicineForReservation?.medicineId}
        medicineName={selectedMedicineForReservation?.medicineName}
        onReservationSuccess={handleReservationSuccess}
      />
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