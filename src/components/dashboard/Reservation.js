"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FiEdit,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiEye,
} from "react-icons/fi";
import PharmService from "../services/PharmService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ManageReservationModalContent from "../modals/ManageReservationModalContent";
import UserInfoModalContent from "../modals/UserInfoModalContent";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pendente: {
      color: "bg-yellow-500",
      text: "Pendente",
      icon: <FiAlertCircle />,
    },
    aprovado: {
      color: "bg-green-600",
      text: "Aprovado",
      icon: <FiCheckCircle />,
    },
    concluido: {
      color: "bg-blue-600",
      text: "Concluído",
      icon: <FiCheckCircle />,
    },
    cancelado: { color: "bg-red-600", text: "Cancelado", icon: <FiXCircle /> },
  };

  const { color, text, icon } = statusConfig[status.toLowerCase()] || {
    color: "bg-gray-500",
    text: "Desconhecido",
    icon: <FiAlertCircle />,
  };

  return (
    <div
      className={`flex items-center gap-1 ${color} text-white px-3 py-1 rounded-full text-sm`}
    >
      {icon}
      {text}
    </div>
  );
};

const Reservation = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [cancellingReservations, setCancellingReservations] = useState(
    new Set()
  );

  // Estados do TanStack Table
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const roles =
    typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem("user") || "{}").roles
      : null;
  const pharmacyId =
    typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem("user") || "{}").pharmacyId
      : null;

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const fetchReservations = async () => {
    try {
      setLoading(true);
      console.log("Buscando reservas...");
      let response;
      if (Array.isArray(roles) && roles.includes("CLIENTE")) {
        response = await PharmService.getReservationsByUser();
      } else {
        response = await PharmService.getAllReservations();
      }
      console.log("Resposta da API:", response);
      setReservations(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Erro detalhado ao carregar reservas:", error);
      setError("Erro ao carregar reservas");
      showToast("Erro ao carregar reservas", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleStatusUpdate = async (reservationId, newStatus) => {
    try {
      await PharmService.updateReservationStatus(reservationId, newStatus);
      showToast("Status da reserva atualizado com sucesso!");
      setManageModalOpen(false);
      setSelectedReservation(null);
      fetchReservations();
    } catch (error) {
      showToast("Erro ao atualizar status da reserva", "error");
    }
  };

  const handleUserClick = async (userId) => {
    try {
      const userData = await PharmService.getUserById(userId);
      setSelectedUser(userData);
    } catch (error) {
      showToast("Erro ao carregar dados do usuário", "error");
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (window.confirm("Tem certeza que deseja cancelar esta reserva?")) {
      try {
        // Adiciona o ID da reserva ao Set de reservas sendo canceladas
        setCancellingReservations((prev) => new Set([...prev, reservationId]));

        await PharmService.cancelOwnReservation(
          reservationId,
          "Cancelado pelo cliente"
        );
        showToast("Reserva cancelada com sucesso!");
        fetchReservations();
      } catch (error) {
        const errorMessage =
          error.response?.data || error.message || "Erro ao cancelar reserva";
        showToast(errorMessage, "error");
      } finally {
        // Remove o ID da reserva do Set de reservas sendo canceladas
        setCancellingReservations((prev) => {
          const newSet = new Set(prev);
          newSet.delete(reservationId);
          return newSet;
        });
      }
    }
  };

  // Definição das colunas para TanStack Table
  const columns = useMemo(
    () => [
      {
        accessorKey: "user.name",
        header: "Usuário",
        cell: (info) => (
          <button
            onClick={() => handleUserClick(info.row.original.user.id)}
            className="text-primary hover:underline font-medium"
          >
            {info.getValue()}
          </button>
        ),
      },
      {
        accessorKey: "medicine.medicineName",
        header: "Medicamento",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "medicine.pharmacy.name",
        header: "Farmácia",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "prescriptionUrl",
        header: "Protocolo / Prescrição",
        cell: (info) => {
          const row = info.row.original;
          const requiresPrescription = row.medicine?.requiresPrescription;
          const prescriptionUrl = info.getValue();
          const protocol = row.protocol;
          // Se não exige prescrição, mostre o protocolo em badge
          if (!requiresPrescription) {
            return (
              <span
                className="inline-block bg-muted px-2 py-1 rounded text-xs font-mono text-foreground/80 max-w-xs truncate"
                title="Identificador único da reserva"
              >
                {protocol || (
                  <span className="text-muted-foreground italic">N/A</span>
                )}
              </span>
            );
          }
          // Se exige prescrição e tem URL, mostre o link com ícone
          if (requiresPrescription && prescriptionUrl) {
            return (
              <a
                href={prescriptionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary font-semibold hover:underline max-w-xs truncate"
                title="Visualizar prescrição"
              >
                <FiEye className="text-base" />
                Ver Prescrição
              </a>
            );
          }
          // Se exige prescrição mas não tem imagem
          return <span className="text-muted-foreground italic">N/A</span>;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => <StatusBadge status={info.getValue()} />,
        sortingFn: (rowA, rowB) => {
          const statusOrder = {
            pendente: 0,
            aprovado: 1,
            concluido: 2,
            cancelado: 3,
          };
          const statusA = statusOrder[rowA.original.status] || 4;
          const statusB = statusOrder[rowB.original.status] || 4;
          return statusA - statusB;
        },
      },
      {
        accessorKey: "expirationDate",
        header: "Data Expiração",
        cell: (info) => new Date(info.getValue()).toLocaleDateString("pt-BR"),
      },
      {
        id: "actions",
        header: "Ações",
        cell: ({ row }) => {
          // Para CLIENTE: mostrar botão de cancelar se estiver pendente
          if (Array.isArray(roles) && roles.includes("CLIENTE")) {
            const isCancelling = cancellingReservations.has(row.original.id);
            return row.original.status === "pendente" ? (
              <div className="flex space-x-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleCancelReservation(row.original.id)}
                  disabled={isCancelling}
                  title={isCancelling ? "Cancelando..." : "Cancelar reserva"}
                >
                  <FiXCircle className="text-sm" />
                  {isCancelling ? "Cancelando..." : "Cancelar"}
                </Button>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                {row.original.status === "aprovado" ? "Aprovada" : "Cancelada"}
              </div>
            );
          }

          // Para ADMIN, GERENTE, FARMACIA: mostrar botão específico para cada status
          const getActionButton = () => {
            switch (row.original.status) {
              case "pendente":
                return (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedReservation(row.original);
                      setManageModalOpen(true);
                    }}
                    title="Gerenciar reserva pendente"
                  >
                    <FiEdit className="text-sm" />
                  </Button>
                );
              case "aprovado":
                return (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedReservation(row.original);
                      setManageModalOpen(true);
                    }}
                    title="Concluir reserva aprovada"
                  >
                    <FiCheckCircle className="text-sm" />
                  </Button>
                );
              default:
                return (
                  <div className="text-muted-foreground text-sm">
                    {row.original.status === "concluido"
                      ? "Concluída"
                      : "Cancelada"}
                  </div>
                );
            }
          };

          return <div className="flex space-x-2">{getActionButton()}</div>;
        },
        enableSorting: false,
      },
    ],
    [roles, handleUserClick, handleCancelReservation, cancellingReservations]
  );

  // Instância da tabela
  const table = useReactTable({
    data: reservations,
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
    initialState: {
      sorting: [
        {
          id: "status",
          desc: false,
        },
      ],
    },
  });

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="loading loading-ring loading-lg text-primary"></div>
          <p className="mt-4 text-muted-foreground">Carregando reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-6xl shadow-lg border border-border rounded-lg overflow-hidden">
        <div className="divide-y divide-border">
          <div className="py-3 px-4 bg-muted/50">
            <h2 className="text-2xl font-bold text-foreground">
              Gerenciamento de Reservas
            </h2>
          </div>

          <div className="overflow-hidden">
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
                      {error ? error : "Nenhuma reserva encontrada"}
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

      {toast.show && (
        <div className="toast toast-top toast-end z-50">
          <div
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow transition-colors ${
              toast.type === "error" ? "bg-destructive" : "bg-chart-2"
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <Dialog open={manageModalOpen} onOpenChange={setManageModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedReservation?.status === "pendente"
                ? "Aprovar Reserva"
                : "Concluir Reserva"}
            </DialogTitle>
            <DialogDescription>
              {selectedReservation?.status === "pendente"
                ? "Aprove ou rejeite esta reserva de medicamento."
                : "Conclua ou cancele esta reserva aprovada."}
            </DialogDescription>
          </DialogHeader>
          <ManageReservationModalContent
            reservation={selectedReservation}
            onConfirm={handleStatusUpdate}
            onCancel={() => {
              setManageModalOpen(false);
              setSelectedReservation(null);
            }}
            loading={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Informações do Usuário</DialogTitle>
            <DialogDescription>
              Veja os dados do usuário da reserva.
            </DialogDescription>
          </DialogHeader>
          <UserInfoModalContent
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reservation;
