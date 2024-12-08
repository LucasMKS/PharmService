"use client";
import React, { useState, useEffect, useCallback } from "react";
import PharmService from "../services/PharmService";
import PharmacyModal from "./PharmacyModal";
import { debounce } from "lodash";

export default function TableContent() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        const response = await PharmService.getAllMedicines();
        console.log("Resposta da API:", response);
        setMedications(response);
        setLoading(false);
      } catch (err) {
        setError("Falha ao buscar medicamentos");
        setLoading(false);
      }
    };

    fetchMedications();
  }, []);

  const handleSearch = useCallback(
    debounce(async (term) => {
      if (term.trim() === "") {
        setIsSearching(false);
        setNoResults(false);
        const allMedicines = await PharmService.getAllMedicines();
        setMedications(allMedicines);
        return;
      }

      setIsSearching(true);
      setNoResults(false);
      try {
        const results = await PharmService.getMedicineByName(term);
        setMedications(results);
        console.log(results);
        // Se nenhum resultado for encontrado
        if (results.length === 0) {
          setNoResults(true);
        }
      } catch (error) {
        console.error("Error searching for medicine:", error);
        // setError("Falha ao buscar medicamentos");
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    handleSearch(searchTerm);
  }, [searchTerm, handleSearch]);

  const handlePharmacyClick = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
  };

  const handleCloseModal = () => {
    setSelectedPharmacy(null);
  };

  const handleEdit = (medicineId) => {
    // Implementar lógica de edição
    console.log("Editar medicamento", medicineId);
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

  return (
    <div className="bg-blue-100 dark:bg-slate-900 min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-neutral-600 dark:bg-neutral-300 rounded-lg shadow-lg overflow-hidden">
        <div className="p-1.5 min-w-full inline-block align-middle">
          <div className="border rounded-lg divide-y dark:border-neutral-700 divide-gray-200 dark:divide-neutral-950">
            <div className="py-3 px-4 bg-neutral-100 dark:bg-neutral-800">
              <div className="relative max-w-xs">
                <label className="sr-only">Search</label>
                <input
                  type="text"
                  name="hs-table-with-pagination-search"
                  id="hs-table-with-pagination-search"
                  className="py-2 px-3 ps-9 block w-full border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                  placeholder="Buscar medicamentos"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-3">
                  <svg
                    className="size-4 text-gray-400 dark:text-neutral-500"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </svg>
                </div>

                {/* Mensagem de medicamento não encontrado */}
                {noResults && searchTerm.trim() !== "" && (
                  <div className="absolute right-0 top-full mt-1 text-red-600 text-sm">
                    Medicamento não encontrado
                  </div>
                )}

                {isSearching && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
            </div>
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
                  {medications.map((medication) => (
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
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderLoadingOrError()}
            </div>
            <div className="py-1 px-4 bg-neutral-100 dark:bg-neutral-800">
              <nav
                className="flex items-center space-x-1"
                aria-label="Pagination"
              >
                <button
                  type="button"
                  className="p-2.5 min-w-[40px] inline-flex justify-center items-center gap-x-2 text-sm rounded-full text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                  aria-label="Previous"
                >
                  <span aria-hidden="true">«</span>
                  <span className="sr-only">Previous</span>
                </button>
                <button
                  type="button"
                  className="min-w-[40px] flex justify-center items-center text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 py-2.5 text-sm rounded-full disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:focus:bg-neutral-700 dark:hover:bg-neutral-700"
                  aria-current="page"
                >
                  1
                </button>
                <button
                  type="button"
                  className="min-w-[40px] flex justify-center items-center text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 py-2.5 text-sm rounded-full disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:focus:bg-neutral-700 dark:hover:bg-neutral-700"
                >
                  2
                </button>
                <button
                  type="button"
                  className="min-w-[40px] flex justify-center items-center text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 py-2.5 text-sm rounded-full disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:focus:bg-neutral-700 dark:hover:bg-neutral-700"
                >
                  3
                </button>
                <button
                  type="button"
                  className="p-2.5 min-w-[40px] inline-flex justify-center items-center gap-x-2 text-sm rounded-full text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                  aria-label="Next"
                >
                  <span className="sr-only">Next</span>
                  <span aria-hidden="true">»</span>
                </button>
              </nav>
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
