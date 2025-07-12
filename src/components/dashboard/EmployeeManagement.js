"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FiUserPlus,
  FiEdit,
  FiTrash2,
  FiUsers,
  FiSearch,
  FiMoreVertical,
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

const RoleBadge = ({ roles }) => {
  const getRoleBadge = (roles) => {
    if (Array.isArray(roles)) {
      if (roles.includes("ADMIN")) {
        return {
          color: "bg-red-600",
          text: "Admin",
        };
      } else if (roles.includes("GERENTE")) {
        return {
          color: "bg-blue-600",
          text: "Gerente",
        };
      } else if (roles.includes("FARMACIA")) {
        return {
          color: "bg-green-600",
          text: "Funcionário",
        };
      }
    }
    return {
      color: "bg-gray-500",
      text: "Cliente",
    };
  };

  const { color, text } = getRoleBadge(roles);

  return (
    <div
      className={`flex items-center gap-1 ${color} text-white px-3 py-1 rounded-full text-sm`}
    >
      {text}
    </div>
  );
};

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newEmployeeEmail, setNewEmployeeEmail] = useState("");
  const { toast } = useToast();

  // Estados do TanStack Table
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const userData = JSON.parse(sessionStorage.getItem("user") || "{}");
  const userRole = userData.roles;
  const pharmacyId = userData.pharmacyId;
  const currentUserId = userData.userId;

  const loadEmployees = async () => {
    try {
      setLoading(true);
      console.log("Carregando funcionários para pharmacyId:", pharmacyId);
      console.log("User role:", userRole);

      let response;
      if (userRole === "ADMIN") {
        // Admin pode ver todos os funcionários de todas as farmácias
        response = await PharmService.getAllEmployees();
      } else if (pharmacyId) {
        // Gerente vê funcionários da própria farmácia
        response = await PharmService.getPharmacyEmployees(pharmacyId);
      } else {
        console.error("pharmacyId não encontrado para usuário não-admin");
        setError("ID da farmácia não encontrado");
        return;
      }

      console.log("Resposta dos funcionários:", response);
      setEmployees(response);
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
      setError(error.message);
      toast({
        title: "Erro",
        description: "Erro ao carregar funcionários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Para admin, carrega sempre. Para outros, só se tiver pharmacyId
    if (userRole === "ADMIN" || pharmacyId) {
      loadEmployees();
    }
  }, [pharmacyId, userRole]);

  const handleAddEmployee = async () => {
    try {
      if (userRole === "ADMIN") {
        // Admin precisa especificar a farmácia
        // Por enquanto, vamos mostrar um erro
        toast({
          title: "Erro",
          description:
            "Admin precisa especificar a farmácia para adicionar funcionário",
          variant: "destructive",
        });
        return;
      }

      await PharmService.addEmployeeToPharmacy(pharmacyId, {
        email: newEmployeeEmail,
      });
      toast({
        title: "Sucesso",
        description: "Funcionário adicionado com sucesso!",
      });
      setIsAddDialogOpen(false);
      setNewEmployeeEmail("");
      loadEmployees();
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error.response?.data?.error || "Erro ao adicionar funcionário",
        variant: "destructive",
      });
    }
  };

  const handleRemoveEmployee = async () => {
    try {
      if (userRole === "ADMIN") {
        // Admin precisa especificar a farmácia
        // Por enquanto, vamos mostrar um erro
        toast({
          title: "Erro",
          description:
            "Admin precisa especificar a farmácia para remover funcionário",
          variant: "destructive",
        });
        return;
      }

      await PharmService.removeEmployeeFromPharmacy(
        pharmacyId,
        selectedEmployee.id
      );
      toast({
        title: "Sucesso",
        description: "Funcionário removido com sucesso!",
      });
      setIsRemoveDialogOpen(false);
      setSelectedEmployee(null);
      loadEmployees();
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error.response?.data?.error || "Erro ao remover funcionário",
        variant: "destructive",
      });
    }
  };

  const handlePromoteEmployee = async (employeeId) => {
    try {
      if (userRole === "ADMIN") {
        // Admin precisa especificar a farmácia
        // Por enquanto, vamos mostrar um erro
        toast({
          title: "Erro",
          description:
            "Admin precisa especificar a farmácia para promover funcionário",
          variant: "destructive",
        });
        return;
      }

      await PharmService.promoteEmployeeToManager(pharmacyId, employeeId);
      toast({
        title: "Sucesso",
        description: "Funcionário promovido com sucesso!",
      });
      loadEmployees();
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error.response?.data?.error || "Erro ao promover funcionário",
        variant: "destructive",
      });
    }
  };

  const canRemoveEmployee = (employee) => {
    // Gerente não pode se auto-remover
    if (userRole === "GERENTE" && employee.id === currentUserId) {
      return false;
    }
    // Admin pode remover qualquer funcionário, mas precisa especificar farmácia
    if (userRole === "ADMIN") {
      return false; // Por enquanto, desabilitado para admin
    }
    // Gerente só pode remover funcionários da própria farmácia (já validado no backend)
    return true;
  };

  const canPromoteEmployee = (employee) => {
    // Só pode promover funcionários com role FARMACIA
    if (userRole === "ADMIN") {
      return false; // Por enquanto, desabilitado para admin
    }
    return employee.roles?.includes("FARMACIA");
  };

  // Definição das colunas para TanStack Table
  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Nome",
        cell: (info) => <div className="font-medium">{info.getValue()}</div>,
      },
      {
        accessorKey: "email",
        header: "E-mail",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "roles",
        header: "Cargo",
        cell: (info) => <RoleBadge roles={info.getValue()} />,
      },
      {
        id: "actions",
        header: "Ações",
        cell: ({ row }) => {
          const employee = row.original;
          const canRemove = canRemoveEmployee(employee);
          const canPromote = canPromoteEmployee(employee);

          return (
            <div className="flex space-x-2">
              {canPromote && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePromoteEmployee(employee.id)}
                  title="Promover a Gerente"
                >
                  <FiEdit className="text-sm" />
                </Button>
              )}
              {canRemove ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setSelectedEmployee(employee);
                    setIsRemoveDialogOpen(true);
                  }}
                  title="Remover funcionário"
                >
                  <FiTrash2 className="text-sm" />
                </Button>
              ) : (
                <div className="text-muted-foreground text-sm">
                  Não pode remover a si mesmo
                </div>
              )}
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [userRole, currentUserId]
  );

  // Instância da tabela
  const table = useReactTable({
    data: employees,
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
          <p className="mt-4 text-muted-foreground">
            Carregando funcionários...
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
                Gestão de Funcionários
              </h2>
              {userRole !== "ADMIN" && (
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <FiUserPlus className="w-4 h-4" />
                  Adicionar Funcionário
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {userRole === "ADMIN"
                ? "Visualize todos os funcionários do sistema"
                : "Gerencie os funcionários da sua farmácia"}
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
                        <FiUsers className="w-12 h-12 opacity-50" />
                        <p>{error ? error : "Nenhum funcionário encontrado"}</p>
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

      {/* Modal de Adicionar Funcionário */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Funcionário</DialogTitle>
            <DialogDescription>
              Digite o e-mail do funcionário que deseja adicionar à farmácia.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">E-mail do Funcionário</Label>
              <Input
                id="email"
                type="email"
                value={newEmployeeEmail}
                onChange={(e) => setNewEmployeeEmail(e.target.value)}
                placeholder="funcionario@email.com"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleAddEmployee} disabled={!newEmployeeEmail}>
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Remover Funcionário */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remover Funcionário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover {selectedEmployee?.name} da
              farmácia? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsRemoveDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleRemoveEmployee}>
              Remover
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeManagement;
