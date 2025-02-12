"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import Fuse from "fuse.js";
import Cookies from "js-cookie";
import PharmService from "../services/PharmService";
import PharmacyModal from "../table/PharmacyModal";
import AddMedication from "./AddMedication";
import MedicineModal from "../table/MedicineModal";
import NProgress from "nprogress";

import ReservationModal from "../table/ReservationModal";
import EditMedicationModal from "../table/EditMedicationModal";
import PaginationControls from "../table/PaginationControls";
import SearchBar from "../table/SearchBar";
import TableRow from "../table/TableRow";

// Configuração do NProgress
NProgress.configure({
  showSpinner: false,
  minimum: 0.3,
  easing: "ease",
  speed: 800,
});

const TableContent = ({ roles, pharmacyId, refreshAlerts }) => {
  const [toasts, setToasts] = useState([]);
  const [medications, setMedications] = useState([]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [error, setError] = useState(null); // Estado para erro
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [selectedMedicineName, setSelectedMedicineName] = useState(null);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [reservationModalOpen, setReservationModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: "",
    dosageForm: "",
    classification: "",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const itemsPerPage = 10;

  // Configuração do Fuse.js memoizada
  const fuse = useMemo(
    () =>
      new Fuse(medications, {
        keys: ["medicineName", "pharmacy.name"],
        threshold: 0.2, // Aumentar precisão (0 = exato, 1 = mais flexível)
        ignoreLocation: false, // Considerar posição dos caracteres
        minMatchCharLength: 3, // Mínimo de caracteres para considerar match
      }),
    [medications]
  );

  const filterOptions = useMemo(() => {
    const categories = new Set();
    const dosageForms = new Set();
    const classifications = new Set();

    medications.forEach((med) => {
      if (med.category) categories.add(med.category);
      if (med.dosageForm) dosageForms.add(med.dosageForm);
      if (med.classification) classifications.add(med.classification);
    });

    return {
      categories: Array.from(categories).sort(),
      dosageForms: Array.from(dosageForms).sort(),
      classifications: Array.from(classifications).sort(),
    };
  }, [medications]);

  // Função para atualizar filtros
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  // Modifique o useEffect de filtragem
  useEffect(() => {
    const debouncedSearch = setTimeout(() => {
      let results = medications;

      // Aplica busca textual
      if (searchTerm.trim()) {
        results = fuse.search(searchTerm).map(({ item }) => item);
      }

      // Aplica filtros
      results = results.filter((med) => {
        return (
          (!filters.category || med.category === filters.category) &&
          (!filters.dosageForm || med.dosageForm === filters.dosageForm) &&
          (!filters.classification ||
            med.classification === filters.classification)
        );
      });

      setFilteredMedications(results);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(debouncedSearch);
  }, [searchTerm, medications, fuse, filters]);

  // Função para exibir toasts
  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 8000);
  }, []);

  // Busca de medicamentos
  const fetchMedications = useCallback(async () => {
    try {
      setError(null); // Reseta o erro
      const response =
        roles === "FARMACIA" || roles === "GERENTE"
          ? pharmacyId
            ? await PharmService.getMedicineByPharmacyId(pharmacyId)
            : await PharmService.getAllMedicines()
          : await PharmService.getAllMedicines();

      // Verifica se o response é um array
      const data = Array.isArray(response)
        ? response
        : response && Array.isArray(response.data)
        ? response.data
        : [];

      // Se não houver dados, garante que seja um array vazio
      if (data.length === 0) {
        setMedications([]);
        setFilteredMedications([]);
      } else {
        setMedications(data);
        setFilteredMedications(data);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || "Falha ao carregar medicamentos";
      setError(errorMsg);
      setMedications([]);
      setFilteredMedications([]);
      showToast(errorMsg, "error");
    }
  }, [roles, pharmacyId, showToast]);

  // Efeitos
  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  useEffect(() => {
    const debouncedSearch = setTimeout(() => {
      if (!searchTerm.trim()) {
        setFilteredMedications(medications);
        setCurrentPage(1); // Resetar para a primeira página
      } else {
        const results = fuse.search(searchTerm).map(({ item }) => item);
        setFilteredMedications(results);
        setCurrentPage(1); // Resetar para a primeira página ao pesquisar
      }
    }, 300);

    return () => clearTimeout(debouncedSearch);
  }, [searchTerm, medications, fuse]);

  // Handlers
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Garantir reset da página ao pesquisar
  }, []);

  const handleReservationSuccess = useCallback((medicineId) => {
    setMedications((prev) =>
      prev.map((med) =>
        med.medicineId === medicineId
          ? { ...med, quantity: med.quantity - 1 }
          : med
      )
    );
  }, []);

  const handleReserve = (medication) => {
    if (medication?.medicineId) {
      setSelectedMedication(medication);
      setReservationModalOpen(true);
    } else {
      showToast("Erro: Medicamento não selecionado corretamente", "error");
    }
  };

  const handlePharmacyClick = useCallback(
    (pharmacy) => setSelectedPharmacy(pharmacy),
    []
  );

  const handleEdit = useCallback(
    (medicine) => {
      reset({
        medicineName: medicine.medicineName,
        quantity: medicine.quantity,
        idPharmacy: medicine.pharmacy.id,
      });
      setSelectedMedicine(medicine);
      setEditModalOpen(true);
    },
    [reset]
  );

  const handleDelete = useCallback(
    async (medicineId) => {
      if (window.confirm("Confirm deletion?")) {
        try {
          await PharmService.deleteMedicine(medicineId);
          setMedications((prev) =>
            prev.filter((med) => med.medicineId !== medicineId)
          );
          showToast("Medicamento excluído com sucesso!");
        } catch (error) {
          showToast("Erro ao excluir medicamento", "error");
        }
      }
    },
    [showToast]
  );

  const handleAlert = useCallback(
    async (medication) => {
      try {
        const userId = Cookies.get("userId");
        if (!userId) throw new Error("Unauthorized");

        await PharmService.createAlert(userId, medication.medicineId);
        refreshAlerts();
        showToast("Alerta criado com sucesso!");
      } catch (error) {
        showToast(`Erro: ${error.response?.data?.error}`, "error");
      }
    },
    [refreshAlerts, showToast]
  );

  // Dados paginados
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMedications.slice(start, start + itemsPerPage);
  }, [filteredMedications, currentPage]);

  const totalPages = Math.ceil(filteredMedications.length / itemsPerPage);

  return (
    <div className="bg-blue-100 dark:bg-slate-900 min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-neutral-600 dark:bg-neutral-900 rounded-lg shadow-lg shadow-neutral-950">
        <div className="p-1.5 min-w-full inline-block align-middle">
          <div className="divide-y divide-gray-200 dark:divide-neutral-950">
            <SearchBar
              onSearch={handleSearch}
              onAddClick={() =>
                document.getElementById("addMedicine").showModal()
              }
              showAddButton={roles !== "CLIENTE"}
              categories={filterOptions.categories}
              dosageForms={filterOptions.dosageForms}
              classifications={filterOptions.classifications}
              onFilterChange={handleFilterChange}
            />

            <EditMedicationModal
              isOpen={editModalOpen}
              onClose={() => setEditModalOpen(false)}
              selectedMedicine={selectedMedicine}
              roles={roles}
              pharmacyId={pharmacyId}
              register={register}
              errors={errors}
              handleSubmit={handleSubmit}
              onSave={fetchMedications}
              showToast={showToast}
            />

            <ReservationModal
              isOpen={reservationModalOpen}
              onClose={() => setReservationModalOpen(false)}
              onSuccess={handleReservationSuccess}
              medicineId={selectedMedication?.medicineId}
              medicineName={selectedMedication?.medicineName}
              requiresPrescription={selectedMedication?.requiresPrescription}
              showToast={showToast}
            />

            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                <TableHeader />
                <tbody className="bg-neutral-200 dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-neutral-950">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((medication) => (
                      <TableRow
                        key={medication.medicineId}
                        medication={medication}
                        roles={roles}
                        onPharmacyClick={handlePharmacyClick}
                        onMedicineClick={() =>
                          setSelectedMedicineName(medication)
                        }
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onReserve={() => handleReserve(medication)}
                        onAlert={handleAlert}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        {error ? error : "Nenhum dado encontrado"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
                onNext={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                prevDisabled={currentPage === 1}
                nextDisabled={currentPage === totalPages}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <div className="toast toast-top toast-end">
        {toasts.map((toast) => (
          <div key={toast.id} className={`alert alert-${toast.type}`}>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      <PharmacyModal
        pharmacy={selectedPharmacy}
        onClose={() => setSelectedPharmacy(null)}
      />

      <MedicineModal
        medicine={selectedMedicineName}
        onClose={() => setSelectedMedicineName(null)}
      />

      <dialog id="addMedicine" className="modal modal-bottom sm:modal-middle">
        <AddMedication
          pharmacyId={pharmacyId}
          onMedicationAdded={fetchMedications}
          roles={roles}
        />
      </dialog>
    </div>
  );
};

const TableHeader = () => (
  <thead className="bg-neutral-100 dark:bg-neutral-800">
    <tr>
      {[
        "Medicamento",
        "Quantidade",
        "Última Atualização",
        "Farmácia",
        "Ações",
      ].map((header, index) => (
        <th
          key={index}
          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
        >
          {header}
        </th>
      ))}
    </tr>
  </thead>
);

export default TableContent;
