"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";

import PharmService from "../services/PharmService";
import { useLoading } from "@/hooks/useLoading";
import { LoadingWrapper, DataLoader } from "@/components/ui/loading";

import AddMedication from "../modals/AddMedication";
import NProgress from "nprogress";

import { FiSearch, FiPlus, FiUploadCloud } from "react-icons/fi";

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";

// IMPORTAR COMPONENTES DO SHADCN UI
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import PharmacyDetailsCard from "../cards/PharmacyDetailsCard";
import MedicineDetailsCard from "../cards/MedicineDetailsCard";
import ReservationModalContent from "../modals/ReservationModalContent";
import EditMedicationModal from "../modals/EditMedicationModal";
import ImportMedicinesModalContent from "../modals/ImportMedicinesModalContent";

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
    pageIndex: 0,
    pageSize: 10,
  });

  // NOVO ESTADO para controlar o modal Shadcn
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const [modalSize, setModalSize] = useState("");
  const [reservationLoading, setReservationLoading] = useState(false);

  // Usando o hook personalizado para gerenciar loading
  const { isDataLoading, withDataLoading } = useLoading({
    initialDataLoading: true,
  });

  // Estados para os dados dos modais específicos
  // (Mantidos, pois podem ser úteis para re-renderizações ou para passar data downstream)
  const [currentPharmacy, setCurrentPharmacy] = useState(null);
  const [currentMedicineDetails, setCurrentMedicineDetails] = useState(null);
  const [currentMedicationForReservation, setCurrentMedicationForReservation] =
    useState(null);
  const [currentMedicationForEdit, setCurrentMedicationForEdit] =
    useState(null);
  const [pendingReservations, setPendingReservations] = useState(new Set());

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

  // --- Funções de Manuseio dos Modais (Chamadas e Conteúdo) ---

  const openModal = useCallback((title, description, content, size = "") => {
    setModalTitle(title);
    setModalDescription(description);
    setModalContent(content);
    setModalSize(size);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalTitle("");
    setModalDescription("");
    setModalContent(null);
    setModalSize("");
    // Resetar estados específicos de cada modal se necessário para evitar vazamento de dados
    setCurrentPharmacy(null);
    setCurrentMedicineDetails(null);
    setCurrentMedicationForReservation(null);
    setCurrentMedicationForEdit(null);
    setReservationLoading(false); // Resetar o estado de loading da reserva
    reset(); // Resetar o formulário de edição, se houver
  }, [reset]);

  // Busca de medicamentos usando o hook de loading
  const fetchMedications = useCallback(async () => {
    await withDataLoading(async () => {
      try {
        setError(null);
        NProgress.start();

        let response;
        if (Array.isArray(roles) && roles.includes("CLIENTE")) {
          // Cliente pode ver todos os medicamentos
          response = await PharmService.getAllMedicines();
        } else if (
          Array.isArray(roles) &&
          (roles.includes("GERENTE") || roles.includes("FARMACIA"))
        ) {
          // Gerente e Funcionário só podem ver medicamentos da própria farmácia
          // O backend já filtra automaticamente baseado no userId
          response = await PharmService.getAllMedicines();
        } else if (roles === "ADMIN") {
          // Admin pode ver todos os medicamentos
          response = await PharmService.getAllMedicines();
        } else {
          // Fallback para outros casos
          response = await PharmService.getAllMedicines();
        }

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
    });
  }, [roles, pharmacyId, showToast, withDataLoading]);

  // Buscar reservas pendentes do usuário (apenas para clientes)
  const fetchPendingReservations = useCallback(async () => {
    if (Array.isArray(roles) && roles.includes("CLIENTE")) {
      try {
        const userReservations = await PharmService.getReservationsByUser();

        const pendingStockIds = userReservations
          .filter(
            (reservation) =>
              reservation.status === "pendente" &&
              reservation.medicine &&
              reservation.medicine.medicineId
          )
          .map((reservation) => reservation.medicine.medicineId);

        setPendingReservations(new Set(pendingStockIds));
      } catch (error) {
        console.error("Erro ao buscar reservas pendentes:", error);
      }
    }
  }, [roles]);

  const handlePharmacyClick = useCallback(
    (pharmacy) => {
      setCurrentPharmacy(pharmacy);
      const content = <PharmacyDetailsCard pharmacy={pharmacy} />;
      openModal(
        `Detalhes da Farmácia: ${pharmacy.name}`,
        "Informações de contato e localização da farmácia.",
        content
      );
    },
    [openModal]
  );

  const handleMedicineDetailsClick = useCallback(
    (medicine) => {
      setCurrentMedicineDetails(medicine);
      const content = <MedicineDetailsCard medicine={medicine} />;
      openModal(
        `Detalhes do Medicamento: ${medicine.medicineName}`,
        "Informações detalhadas sobre o medicamento.",
        content
      );
    },
    [openModal]
  );

  // FUNÇÕES DE MANUSEIO DOS BOTÕES DA TABELA
  const handleReserve = useCallback(
    (medication) => {
      setCurrentMedicationForReservation(medication);
      const content = (
        <ReservationModalContent
          medicineName={medication?.medicineName}
          requiresPrescription={medication?.requiresPrescription}
          onConfirm={async (file) => {
            try {
              setReservationLoading(true);

              if (medication?.requiresPrescription && !file) {
                showToast(
                  "Prescrição médica é obrigatória para este medicamento",
                  "error"
                );
                setReservationLoading(false);
                return;
              }
              // Validação do stockId
              if (
                !medication?.medicineId ||
                isNaN(Number(medication.medicineId))
              ) {
                showToast("Selecione um medicamento/estoque válido!", "error");
                setReservationLoading(false);
                return;
              }

              // Criar FormData para enviar ao backend
              const formData = new FormData();
              const userData =
                typeof window !== "undefined"
                  ? JSON.parse(sessionStorage.getItem("user") || "{}")
                  : {};

              formData.append("userId", userData.userId);
              formData.append("stockId", medication.medicineId);

              // Adicionar prescrição se fornecida
              if (file) {
                formData.append("prescription", file);
              }

              await PharmService.createReservation(formData);

              showToast("Reserva realizada com sucesso!");
              setMedications((prev) =>
                prev.map((med) =>
                  med.medicineId === medication.medicineId
                    ? { ...med, quantity: Math.max(0, med.quantity - 1) }
                    : med
                )
              );
              // Atualizar reservas pendentes após criar nova reserva
              fetchPendingReservations();
              closeModal();
            } catch (error) {
              console.error("Erro ao criar reserva:", error);
              const errorMessage =
                error.response?.data?.error ||
                error.message ||
                "Erro ao criar reserva";
              showToast(errorMessage, "error");
            } finally {
              setReservationLoading(false);
            }
          }}
          onCancel={closeModal}
          loading={reservationLoading}
          showToast={showToast}
        />
      );
      openModal(
        `Reservar ${medication.medicineName}`,
        "Preencha os detalhes para reservar este medicamento.",
        content
      );
    },
    [openModal, showToast, closeModal, reservationLoading]
  );

  const handleEdit = useCallback(
    (medicine) => {
      setCurrentMedicationForEdit(medicine);
      const content = (
        <EditMedicationModal
          isOpen={true}
          selectedMedicine={medicine}
          onClose={closeModal}
          onSave={() => {
            fetchMedications();
            closeModal();
          }}
          showToast={showToast}
        />
      );
      openModal(
        `Editar Medicamento: ${medicine.medicineName}`,
        "Atualize as informações deste medicamento.",
        content
      );
    },
    [openModal, closeModal, fetchMedications, showToast]
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
        const userData =
          typeof window !== "undefined"
            ? JSON.parse(sessionStorage.getItem("user") || "{}")
            : {};
        if (!userData.userId) throw new Error("Usuário não autorizado");

        await PharmService.createAlert(userData.userId, medication.medicineId);
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

  const onAddClick = useCallback(() => {
    // AGORA USAMOS AddMedication COMO CONTEÚDO
    const content = (
      <AddMedication
        pharmacyId={pharmacyId}
        onMedicationAdded={() => {
          fetchMedications();
          closeModal(); // Fechar o modal após adicionar
        }}
        roles={roles}
        showToast={showToast}
        onCancel={closeModal}
      />
    );
    openModal(
      "Adicionar Novo Medicamento",
      "Preencha os campos para adicionar um novo medicamento.",
      content,
      "lg"
    ); // Defina um tamanho se quiser
  }, [openModal, pharmacyId, roles, showToast, fetchMedications, closeModal]);

  const onImportClick = useCallback(() => {
    const content = (
      <ImportMedicinesModalContent
        onImport={(file) => {
          /* lógica de importação */
        }}
        onCancel={closeModal}
        loading={false}
        error={null}
        success={false}
      />
    );
    openModal(
      "Importar Medicamentos",
      "Importe medicamentos via arquivo CSV.",
      content,
      "md"
    );
  }, [openModal, closeModal]);

  // Efeito para buscar medicamentos na montagem
  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  // Efeito separado para buscar reservas pendentes
  useEffect(() => {
    fetchPendingReservations();
  }, [fetchPendingReservations]);

  // Efeito para atualizar reservas apenas quando necessário
  useEffect(() => {
    // Buscar reservas pendentes apenas na montagem inicial do componente
    fetchPendingReservations();
  }, [fetchPendingReservations]);

  // Definição das colunas para TanStack Table
  const columns = useMemo(
    () => [
      {
        accessorKey: "medicineName",
        header: "Medicamento",
        cell: (info) => (
          <span
            className="cursor-pointer text-primary hover:underline font-medium whitespace-nowrap"
            onClick={() => handleMedicineDetailsClick(info.row.original)}
          >
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "quantity",
        header: () => <div className="text-center">Quantidade</div>,
        cell: (info) => (
          <div className="text-center whitespace-nowrap">{info.getValue()}</div>
        ),
        filterFn: "includesString",
      },
      {
        accessorKey: "updatedAt",
        header: () => <div className="text-center">Última Atualização</div>,
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
        header: "Farmácia",
        cell: (info) => (
          <span
            className="cursor-pointer text-primary hover:underline font-medium whitespace-nowrap"
            onClick={() => handlePharmacyClick(info.row.original.pharmacy)}
          >
            {info.getValue()}
          </span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "category",
        header: () => <div className="text-center">Categoria</div>,
        cell: (info) => (
          <div className="text-center whitespace-nowrap">{info.getValue()}</div>
        ),
        filterFn: "includesString",
        enableHiding: true,
      },
      {
        accessorKey: "dosageForm",
        header: () => <div className="text-center">Forma de Dosagem</div>,
        cell: (info) => (
          <div className="text-center whitespace-nowrap">{info.getValue()}</div>
        ),
        filterFn: "includesString",
        enableHiding: true,
      },
      {
        accessorKey: "classification",
        header: () => <div className="text-center">Classificação</div>,
        cell: (info) => (
          <div className="text-center whitespace-nowrap">{info.getValue()}</div>
        ),
        filterFn: "includesString",
        enableHiding: true,
      },
      {
        id: "actions",
        header: () => <div className="text-center">Ações</div>,
        cell: ({ row }) => (
          <div className="flex justify-center space-x-2 whitespace-nowrap">
            {Array.isArray(roles) && roles.includes("CLIENTE") ? (
              // Ações para CLIENTE
              row.original.quantity > 0 ? (
                pendingReservations.has(row.original.medicineId) ? (
                  <button
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-gray-400 text-gray-200 shadow h-9 px-4 py-2 cursor-not-allowed"
                    title="Reserva pendente"
                    disabled={true}
                  >
                    Reserva Pendente
                  </button>
                ) : (
                  <button
                    onClick={() => handleReserve(row.original)}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                    title="Reservar"
                    disabled={row.original.quantity <= 0}
                  >
                    Reservar
                  </button>
                )
              ) : (
                <button
                  onClick={() => handleAlert(row.original)}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-warning text-warning-foreground shadow hover:bg-warning/90 h-9 px-4 py-2"
                  aria-label="Criar Alerta"
                >
                  Alerta
                </button>
              )
            ) : (
              // Ações para GERENTE, FARMACIA, ADMIN
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
          </div>
        ),
        enableSorting: false,
        enableColumnFilter: false,
      },
    ],
    [
      roles,
      pendingReservations,
      handleReserve,
      handleEdit,
      handleDelete,
      handleAlert,
      handlePharmacyClick,
      handleMedicineDetailsClick,
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

  // Funções para pegar as opções únicas para os filtros de seleção
  const getUniqueOptions = useCallback(
    (key) => {
      const options = new Set();
      medications.forEach((med) => {
        if (
          med &&
          med.hasOwnProperty(key) &&
          med[key] !== null &&
          med[key] !== undefined
        ) {
          options.add(med[key]);
        }
      });
      return Array.from(options).sort();
    },
    [medications]
  );

  return (
    <LoadingWrapper
      isLoading={isDataLoading}
      loadingComponent={<DataLoader message="Carregando medicamentos..." />}
    >
      <div className="bg-background min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-6xl shadow-lg border border-border rounded-lg overflow-hidden">
          <div className="divide-y divide-border">
            <div className="py-3 px-4 bg-muted/50 flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex flex-col md:flex-row gap-2">
                {/* Campo de busca global */}
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                  <Input
                    type="text"
                    placeholder="Busca por medicamentos ou farmácias"
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Filtros de seleção para categorias, formas de dosagem, classificações */}
                <div className="flex gap-2 flex-1">
                  <Select
                    value={
                      table.getColumn("category")?.getFilterValue() ?? "all"
                    }
                    onValueChange={(value) =>
                      table
                        .getColumn("category")
                        ?.setFilterValue(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Todas Categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas Categorias</SelectItem>
                      {getUniqueOptions("category").map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={
                      table.getColumn("dosageForm")?.getFilterValue() ?? "all"
                    }
                    onValueChange={(value) =>
                      table
                        .getColumn("dosageForm")
                        ?.setFilterValue(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Todas Formas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas Formas</SelectItem>
                      {getUniqueOptions("dosageForm").map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={
                      table.getColumn("classification")?.getFilterValue() ??
                      "all"
                    }
                    onValueChange={(value) =>
                      table
                        .getColumn("classification")
                        ?.setFilterValue(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Todas Classificações" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas Classificações</SelectItem>
                      {getUniqueOptions("classification").map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(!Array.isArray(roles) || !roles.includes("CLIENTE")) && (
                <div className="flex gap-2">
                  <Button
                    onClick={onAddClick}
                    aria-label="Adicionar medicamento"
                  >
                    <FiPlus className="text-lg" />
                    <span className="hidden sm:inline">Adicionar</span>
                  </Button>

                  {(!Array.isArray(roles) || !roles.includes("GERENTE")) && (
                    <Button
                      onClick={onImportClick}
                      variant="outline"
                      aria-label="Importar medicamentos"
                    >
                      <FiUploadCloud className="text-lg" />
                      <span className="hidden sm:inline">Importar</span>
                    </Button>
                  )}
                </div>
              )}
            </div>

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
                <Button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  variant="outline"
                >
                  Anterior
                </Button>
                <span className="text-sm">
                  Página{" "}
                  <strong>
                    {table.getState().pagination.pageIndex + 1} de{" "}
                    {table.getPageCount()}
                  </strong>
                </span>
                <Button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  variant="outline"
                >
                  Próxima
                </Button>
              </div>
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
      {/* --- O NOVO MODAL GENÉRICO DO SHADCN UI --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className={`sm:max-w-[425px] ${
            modalSize === "lg" ? "sm:max-w-xl" : ""
          } ${modalSize === "md" ? "sm:max-w-md" : ""} ${
            modalSize === "full" ? "sm:max-w-full" : ""
          }`}
        >
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
            <DialogDescription>{modalDescription}</DialogDescription>
          </DialogHeader>
          {modalContent}
        </DialogContent>
      </Dialog>
    </LoadingWrapper>
  );
};

export default TableContent;
