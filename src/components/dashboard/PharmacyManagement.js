"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiHome,
  FiMapPin,
  FiPhone,
  FiUser,
  FiSearch,
} from "react-icons/fi";
import { getSessionData } from "@/hooks/useSessionStorage";
import PharmService from "../services/PharmService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import CreatePharmacyModalContent from "../modals/CreatePharmacyModalContent";
import EditPharmacyModalContent from "../modals/EditPharmacyModalContent";

const PharmacyManagement = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    userEmail: "",
  });

  // Estados do TanStack Table
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { toast } = useToast();
  const userData = getSessionData("user", {});
  const userRole = userData.roles;
  const isAdmin = Array.isArray(userRole) && userRole.includes("ADMIN");
  const isManager = Array.isArray(userRole) && userRole.includes("GERENTE");
  const isClient = Array.isArray(userRole) && userRole.includes("CLIENTE");

  const loadPharmacies = async () => {
    try {
      setLoading(true);
      let response = [];
      if (isAdmin) {
        response = await PharmService.listAllPharmacies();
      } else if (isManager) {
        const myPharmacy = await PharmService.getMyPharmacy();
        response = myPharmacy ? [myPharmacy] : [];
      } else if (isClient) {
        // Cliente: pode visualizar todas as farmácias
        response = await PharmService.listAllPharmacies();
      } else {
        // Outro papel: pode visualizar todas
        response = await PharmService.listAllPharmacies();
      }
      setPharmacies(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error loading pharmacies:", error);
      setError("Erro ao carregar farmácias");
      setPharmacies([]);
      toast({
        title: "Erro",
        description: "Erro ao carregar farmácias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPharmacies();
  }, []);

  const handleCreatePharmacy = async (e) => {
    e.preventDefault();
    try {
      await PharmService.registerPharmacy(formData);
      toast({
        title: "Sucesso",
        description: "Farmácia criada com sucesso!",
      });
      setShowCreateModal(false);
      // Reset form data
      setFormData({
        name: "",
        address: "",
        number: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
        phone: "",
        userEmail: "",
      });
      loadPharmacies();
    } catch (error) {
      toast({
        title: "Erro",
        description: error.response?.data?.error || "Erro ao criar farmácia",
        variant: "destructive",
      });
    }
  };

  const handleEditPharmacy = async (pharmacyData) => {
    try {
      await PharmService.updatePharmacy(selectedPharmacy.id, pharmacyData);
      toast({
        title: "Sucesso",
        description: "Farmácia atualizada com sucesso!",
      });
      setShowEditModal(false);
      setSelectedPharmacy(null);
      loadPharmacies();
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error.response?.data?.error || "Erro ao atualizar farmácia",
        variant: "destructive",
      });
    }
  };

  const handleDeletePharmacy = async (pharmacyId) => {
    try {
      await PharmService.deletePharmacy(pharmacyId);
      toast({
        title: "Sucesso",
        description: "Farmácia deletada com sucesso!",
      });
      loadPharmacies();
    } catch (error) {
      toast({
        title: "Erro",
        description: error.response?.data?.error || "Erro ao deletar farmácia",
        variant: "destructive",
      });
    }
  };

  const openEditModal = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setFormData({
      name: pharmacy.name,
      address: pharmacy.address,
      number: pharmacy.number,
      neighborhood: pharmacy.neighborhood,
      city: pharmacy.city,
      state: pharmacy.state,
      zipCode: pharmacy.zipCode,
      phone: pharmacy.phone,
      userEmail: pharmacy.user?.email || "",
    });
    setShowEditModal(true);
  };

  // Verificar se o usuário pode editar uma farmácia específica
  const canEditPharmacy = (pharmacy) => {
    if (isAdmin) return true;
    if (isManager) {
      return pharmacy.user?.id === userData.userId;
    }
    return false;
  };

  // Verificar se o usuário pode deletar uma farmácia específica
  const canDeletePharmacy = (pharmacy) => {
    return isAdmin;
  };

  // Verificar se o usuário pode criar farmácia
  const canCreatePharmacy = () => isAdmin;

  // Verificar se o usuário pode ver ações (apenas ADMIN e GERENTE)
  const canSeeActions = () => isAdmin || isManager;

  // Definição das colunas para TanStack Table
  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Nome da Farmácia",
        cell: (info) => (
          <div className="font-medium flex items-center gap-2">
            <FiHome className="w-4 h-4 text-primary" />
            {info.getValue()}
          </div>
        ),
      },
      {
        accessorKey: "address",
        header: "Endereço",
        cell: (info) => {
          const pharmacy = info.row.original;
          return (
            <div className="flex items-center gap-2">
              <FiMapPin className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="font-medium">
                  {pharmacy.address}, {pharmacy.number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {pharmacy.neighborhood}, {pharmacy.city}/{pharmacy.state}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "phone",
        header: "Telefone",
        cell: (info) => (
          <div className="flex items-center gap-2">
            <FiPhone className="w-4 h-4 text-muted-foreground" />
            {info.getValue()}
          </div>
        ),
      },
      {
        accessorKey: "user.name",
        header: "Gerente",
        cell: (info) => {
          const pharmacy = info.row.original;
          return (
            <div className="flex items-center gap-2">
              <FiUser className="w-4 h-4 text-muted-foreground" />
              {pharmacy.user?.name || "N/A"}
            </div>
          );
        },
      },
      ...(canSeeActions()
        ? [
            {
              id: "actions",
              header: "Ações",
              cell: ({ row }) => {
                const pharmacy = row.original;
                const canEdit = canEditPharmacy(pharmacy);
                const canDelete = canDeletePharmacy(pharmacy);

                return (
                  <div className="flex space-x-2">
                    {canEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(pharmacy)}
                        title="Editar farmácia"
                      >
                        <FiEdit className="w-4 h-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Tem certeza que deseja deletar esta farmácia?"
                            )
                          ) {
                            handleDeletePharmacy(pharmacy.id);
                          }
                        }}
                        title="Deletar farmácia"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                );
              },
              enableSorting: false,
            },
          ]
        : []),
    ],
    [userRole, userData.userId, canSeeActions]
  );

  // Instância da tabela
  const table = useReactTable({
    data: pharmacies,
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
          id: "name",
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
          <p className="mt-4 text-muted-foreground">Carregando farmácias...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin && !isManager && !isClient) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Acesso Negado</h2>
          <p className="mt-2 text-muted-foreground">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-6xl shadow-lg border border-border rounded-lg overflow-hidden">
        <div className="divide-y divide-border">
          <div className="py-3 px-4 bg-muted/50">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-foreground">
                Gerenciamento de Farmácias
              </h2>
              {canCreatePharmacy() && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2"
                >
                  <FiPlus className="w-4 h-4" />
                  Nova Farmácia
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isAdmin
                ? "Gerencie todas as farmácias do sistema"
                : isManager
                ? "Gerencie sua farmácia"
                : isClient
                ? "Visualize as farmácias disponíveis"
                : "Visualize as farmácias disponíveis"}
            </p>
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
                      className="text-center py-8 text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <FiHome className="w-12 h-12 opacity-50" />
                        <p>{error ? error : "Nenhuma farmácia encontrada"}</p>
                      </div>
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

      {/* Modal de Criar Farmácia */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Nova Farmácia</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar uma nova farmácia.
            </DialogDescription>
          </DialogHeader>
          <CreatePharmacyModalContent
            isOpen={showCreateModal}
            formData={formData}
            setFormData={setFormData}
            onCancel={() => setShowCreateModal(false)}
            onSubmit={handleCreatePharmacy}
            loading={false}
            error={null}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Editar Farmácia */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Farmácia</DialogTitle>
            <DialogDescription>
              Atualize os dados da farmácia.
            </DialogDescription>
          </DialogHeader>
          <EditPharmacyModalContent
            pharmacy={selectedPharmacy}
            formData={formData}
            onConfirm={handleEditPharmacy}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedPharmacy(null);
            }}
            loading={false}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PharmacyManagement;
