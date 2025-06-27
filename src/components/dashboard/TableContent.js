"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import Cookies from "js-cookie";
import PharmService from "../services/PharmService";
import PharmacyModal from "../table/PharmacyModal";
import AddMedication from "./AddMedication";
import MedicineModal from "../table/MedicineModal";
import NProgress from "nprogress";

import ReservationModal from "../table/ReservationModal";
import EditMedicationModal from "../table/EditMedicationModal";
import ImportMedicinesModal from "./ImportMedicinesModal";

import { FiSearch, FiPlus, FiUploadCloud } from "react-icons/fi";

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";

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
  const [error, setError] = useState(null);

  // Estados do TanStack Table
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0, // Corresponde a currentPage - 1
    pageSize: 10, // Corresponde a itemsPerPage
  });

  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [selectedMedicineName, setSelectedMedicineName] = useState(null); // Para o MedicineModal
  const [
    selectedMedicationForReservation,
    setSelectedMedicationForReservation,
  ] = useState(null); // Para ReservationModal
  const [reservationModalOpen, setReservationModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // Função para exibir toasts
  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 8000);
  }, []);

  // FUNÇÕES DE MANUSEIO DOS BOTÕES DA TABELA - MOVA ESTAS PARA CÁ
  const handleReservationSuccess = useCallback(
    (medicineId) => {
      setMedications((prev) =>
        prev.map((med) =>
          med.medicineId === medicineId
            ? { ...med, quantity: med.quantity - 1 }
            : med
        )
      );
      showToast("Reserva realizada com sucesso!");
    },
    [showToast]
  );

  const handleReserve = useCallback(
    // Certifique-se que esta e as demais estejam com useCallback
    (medication) => {
      if (medication?.medicineId) {
        setSelectedMedicationForReservation(medication);
        setReservationModalOpen(true);
      } else {
        showToast("Erro: Medicamento não selecionado corretamente", "error");
      }
    },
    [showToast]
  );

  const handleEdit = useCallback(
    (medicine) => {
      reset({
        medicineName: medicine.medicineName,
        quantity: medicine.quantity,
        idPharmacy: medicine.pharmacy.id,
        category: medicine.category,
        dosageForm: medicine.dosageForm,
        classification: medicine.classification,
        requiresPrescription: medicine.requiresPrescription,
      });
      setSelectedMedicine(medicine);
      setEditModalOpen(true);
    },
    [reset]
  );

  const handleDelete = useCallback(
    async (medicineId) => {
      if (window.confirm("Confirmar exclusão?")) {
        try {
          NProgress.start();
          await PharmService.deleteMedicine(medicineId);
          setMedications((prev) =>
            prev.filter((med) => med.medicineId !== medicineId)
          );
          showToast("Medicamento excluído com sucesso!");
        } catch (error) {
          showToast("Erro ao excluir medicamento", "error");
        } finally {
          NProgress.done();
        }
      }
    },
    [showToast]
  );

  const handleAlert = useCallback(
    async (medication) => {
      try {
        NProgress.start();
        const userId = Cookies.get("userId");
        if (!userId) throw new Error("Usuário não autorizado");

        await PharmService.createAlert(userId, medication.medicineId);
        refreshAlerts();
        showToast("Alerta criado com sucesso!");
      } catch (error) {
        const errorMsg = error.response?.data?.error || "Falha ao criar alerta";
        showToast(`Erro: ${errorMsg}`, "error");
      } finally {
        NProgress.done();
      }
    },
    [refreshAlerts, showToast]
  );

  // Busca de medicamentos
  const fetchMedications = useCallback(async () => {
    try {
      setError(null);
      NProgress.start();
      const response =
        roles === "FARMACIA" || roles === "GERENTE"
          ? pharmacyId
            ? await PharmService.getMedicineByPharmacyId(pharmacyId)
            : await PharmService.getAllMedicines()
          : await PharmService.getAllMedicines();

      const data = Array.isArray(response)
        ? response
        : response && Array.isArray(response.data)
        ? response.data
        : [];

      setMedications(data);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || "Falha ao carregar medicamentos";
      setError(errorMsg);
      setMedications([]);
      showToast(errorMsg, "error");
    } finally {
      NProgress.done();
    }
  }, [roles, pharmacyId, showToast]);

  // Efeito para buscar medicamentos na montagem
  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  // Definição das colunas para TanStack Table
  const columns = useMemo(
    () => [
      {
        accessorKey: "medicineName",
        header: "Medicamento",
        cell: (info) => (
          <span
            className="cursor-pointer text-primary hover:underline font-medium whitespace-nowrap"
            onClick={() => setSelectedMedicineName(info.row.original)}
          >
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "quantity",
        header: () => <div className="text-center">Quantidade</div>, // Centraliza o cabeçalho
        cell: (info) => (
          <div className="text-center whitespace-nowrap">{info.getValue()}</div>
        ), // Centraliza e evita quebra
        filterFn: "includesString", // Define o tipo de filtro para esta coluna
      },
      {
        accessorKey: "updatedAt",
        header: () => <div className="text-center">Última Atualização</div>, // Centraliza o cabeçalho
        cell: (info) => (
          <div className="text-center whitespace-nowrap">
            {info.getValue()
              ? new Date(info.getValue()).toLocaleDateString("pt-BR")
              : "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "pharmacy.name",
        header: "Farmácia", // Não centraliza o cabeçalho
        cell: (info) => (
          <span
            className="cursor-pointer text-primary hover:underline font-medium whitespace-nowrap" // Adicionado whitespace-nowrap
            onClick={() => setSelectedPharmacy(info.row.original.pharmacy)}
          >
            {info.getValue()}
          </span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "category",
        header: () => <div className="text-center">Categoria</div>, // Centraliza o cabeçalho
        cell: (info) => (
          <div className="text-center whitespace-nowrap">{info.getValue()}</div>
        ), // Centraliza e evita quebra
        filterFn: "includesString",
        enableHiding: true,
      },
      {
        accessorKey: "dosageForm",
        header: () => <div className="text-center">Forma de Dosagem</div>, // Centraliza o cabeçalho
        cell: (info) => (
          <div className="text-center whitespace-nowrap">{info.getValue()}</div>
        ), // Centraliza e evita quebra
        filterFn: "includesString",
        enableHiding: true,
      },
      {
        accessorKey: "classification",
        header: () => <div className="text-center">Classificação</div>, // Centraliza o cabeçalho
        cell: (info) => (
          <div className="text-center whitespace-nowrap">{info.getValue()}</div>
        ), // Centraliza e evita quebra
        filterFn: "includesString",
        enableHiding: true,
      },
      {
        id: "actions",
        header: () => <div className="text-center">Ações</div>, // Centraliza o cabeçalho
        cell: ({ row }) => (
          <div className="flex justify-center space-x-2 whitespace-nowrap">
            {" "}
            {/* Adicionado whitespace-nowrap no container dos botões */}
            {roles !== "FARMACIA" && roles !== "GERENTE" && (
              <button
                onClick={() => handleReserve(row.original)}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                title="Reservar"
                disabled={row.original.quantity <= 0}
              >
                Reservar
              </button>
            )}
            {roles !== "CLIENTE" && (
              <>
                <button
                  onClick={() => handleEdit(row.original)}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-9 px-4 py-2"
                  title="Editar"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(row.original.medicineId)}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 h-9 px-4 py-2"
                  title="Excluir"
                >
                  Excluir
                </button>
              </>
            )}
            {(roles === "FARMACIA" || roles === "GERENTE") && (
              <button
                onClick={() => handleAlert(row.original)}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                title="Criar Alerta"
              >
                Alertar
              </button>
            )}
          </div>
        ),
        enableSorting: false,
        enableColumnFilter: false,
      },
    ],
    [
      roles,
      handleReserve,
      handleEdit,
      handleDelete,
      handleAlert,
      showToast,
      setSelectedMedicineName,
      setSelectedPharmacy,
    ]
  );

  // Instância da tabela
  const table = useReactTable({
    data: medications,
    columns,
    state: {
      columnFilters,
      globalFilter,
      sorting,
      pagination,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    autoResetPageIndex: false,
  });

  const onAddClick = () => {
    document.getElementById("addMedicine").showModal();
  };

  const onImportClick = () => {
    setShowImportModal(true);
  };

  // Funções para pegar as opções únicas para os filtros de seleção
  const getUniqueOptions = useCallback(
    (key) => {
      const options = new Set();
      medications.forEach((med) => {
        if (med[key]) options.add(med[key]);
      });
      return Array.from(options).sort();
    },
    [medications]
  );

  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-6xl shadow-lg border border-border rounded-lg overflow-hidden">
        <div className="divide-y divide-border">
          <div className="py-3 px-4 bg-muted/50 flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex flex-col md:flex-row gap-2">
              {/* Campo de busca global */}
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Busca por medicamentos ou farmácias"
                  value={globalFilter ?? ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 ps-9 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Filtros de seleção para categorias, formas de dosagem, classificações */}
              <div className="flex gap-2 flex-1">
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" // Shadcn select classes
                  value={table.getColumn("category")?.getFilterValue() ?? ""}
                  onChange={(e) =>
                    table.getColumn("category")?.setFilterValue(e.target.value)
                  }
                >
                  <option value="">Todas Categorias</option>
                  {getUniqueOptions("category").map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" // Shadcn select classes
                  value={table.getColumn("dosageForm")?.getFilterValue() ?? ""}
                  onChange={(e) =>
                    table
                      .getColumn("dosageForm")
                      ?.setFilterValue(e.target.value)
                  }
                >
                  <option value="">Todas Formas</option>
                  {getUniqueOptions("dosageForm").map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" // Shadcn select classes
                  value={
                    table.getColumn("classification")?.getFilterValue() ?? ""
                  }
                  onChange={(e) =>
                    table
                      .getColumn("classification")
                      ?.setFilterValue(e.target.value)
                  }
                >
                  <option value="">Todas Classificações</option>
                  {getUniqueOptions("classification").map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {roles !== "CLIENTE" && (
              <div className="flex gap-2">
                <button
                  onClick={onAddClick}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2" // Shadcn button classes
                  aria-label="Adicionar medicamento"
                >
                  <FiPlus className="text-lg" />
                  <span className="hidden sm:inline">Adicionar</span>
                </button>

                {roles !== "GERENTE" && (
                  <button
                    onClick={onImportClick}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2" // Shadcn button classes
                    aria-label="Importar medicamentos"
                  >
                    <FiUploadCloud className="text-lg" />
                    <span className="hidden sm:inline">Importar</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {showImportModal && (
            <ImportMedicinesModal
              onClose={() => setShowImportModal(false)}
              onSuccess={fetchMedications}
            />
          )}
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
            medicineId={selectedMedicationForReservation?.medicineId}
            medicineName={selectedMedicationForReservation?.medicineName}
            requiresPrescription={
              selectedMedicationForReservation?.requiresPrescription
            }
            showToast={showToast}
          />
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 cursor-pointer"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted()] ?? null}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-card text-card-foreground divide-y divide-border">
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="p-4 align-middle [&:has([role=checkbox])]:pr-0"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="text-center py-4 text-muted-foreground"
                    >
                      {error ? error : "Nenhum dado encontrado"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Controles de Paginação */}
            <div className="py-3 px-4 flex justify-between items-center bg-muted/50 text-muted-foreground rounded-b-lg">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
              >
                Anterior
              </button>
              <span className="text-sm">
                Página{" "}
                <strong>
                  {table.getState().pagination.pageIndex + 1} de{" "}
                  {table.getPageCount()}
                </strong>
              </span>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
              >
                Próxima
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <div className="toast toast-top toast-end z-[9999]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow transition-colors ${
              toast.type === "success"
                ? "bg-chart-2"
                : toast.type === "error"
                ? "bg-destructive"
                : "bg-chart-1"
            }`}
          >
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
          showToast={showToast}
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default TableContent;
