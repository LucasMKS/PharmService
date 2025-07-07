"use client";
import React, { useState, useEffect } from "react";
import { FiUserPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import PharmService from "../services/PharmService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AddEmployeeModalContent from "../modals/AddEmployeeModalContent";
import RemoveEmployeeModalContent from "../modals/RemoveEmployeeModalContent";

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

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
    setTimeout(() => setToast({ show: false, message: "", type: "" }, 3000));
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      let response;
      if (Array.isArray(roles) && roles.includes("ADMIN")) {
        response = await PharmService.getAllEmployees();
      } else if (Array.isArray(roles) && roles.includes("GERENTE")) {
        if (pharmacyId) {
          response = await PharmService.getPharmacyEmployees(pharmacyId);
        } else {
          setError("ID da farmácia não encontrado para o gerente.");
          showToast("ID da farmácia não encontrado para o gerente.", "error");
        }
      } else {
        setError("Você não tem permissão para visualizar funcionários.");
        showToast(
          "Você não tem permissão para visualizar funcionários.",
          "error"
        );
      }
      console.log("Resposta da API EmployeeManagement:", response);
      setEmployees(response);
    } catch (error) {
      setError("Erro ao carregar funcionários");
      showToast("Erro ao carregar funcionários", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployee = async (employeeData) => {
    try {
      await PharmService.addEmployee(employeeData);
      showToast("Funcionário adicionado com sucesso!");
      setIsAddDialogOpen(false);
      fetchEmployees();
    } catch (error) {
      showToast("Erro ao adicionar funcionário", "error");
    }
  };

  const handleRemoveEmployee = async (employeeId) => {
    try {
      await PharmService.removeEmployee(employeeId);
      showToast("Funcionário removido com sucesso!");
      setIsRemoveDialogOpen(false);
      setSelectedEmployee(null);
      fetchEmployees();
    } catch (error) {
      showToast("Erro ao remover funcionário", "error");
    }
  };

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
          <div className="py-3 px-4 bg-muted/50 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Gerenciamento de Funcionários
              </h2>
            </div>
            <button
              onClick={() => setIsAddDialogOpen(true)}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-4 py-2"
            >
              <FiUserPlus className="mr-2" />
              Adicionar Funcionário
            </button>
          </div>

          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-start text-xs font-medium text-muted-foreground uppercase"
                  >
                    Nome
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-start text-xs font-medium text-muted-foreground uppercase"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-start text-xs font-medium text-muted-foreground uppercase"
                  >
                    Cargo
                  </th>
                  {Array.isArray(roles) && roles.includes("ADMIN") && (
                    <th className="px-6 py-3 text-start text-xs font-medium text-muted-foreground uppercase">
                      Farmácia
                    </th>
                  )}
                  <th
                    scope="col"
                    className="px-6 py-3 text-start text-xs font-medium text-muted-foreground uppercase"
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card text-card-foreground divide-y divide-border">
                {employees.length > 0 ? (
                  employees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                        {employee.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {employee.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {employee.roles}
                      </td>
                      {Array.isArray(userRole) &&
                        userRole.includes("ADMIN") && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {employee.pharmacy?.name || "N/A"}
                          </td>
                        )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                        <div className="flex space-x-2">
                          <button
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 h-8 w-8"
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setIsRemoveDialogOpen(true);
                            }}
                            title="Remover funcionário"
                          >
                            <FiTrash2 className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={
                        Array.isArray(roles) && roles.includes("ADMIN") ? 5 : 4
                      }
                      className="text-center py-4 text-muted-foreground"
                    >
                      {error ? error : "Nenhum funcionário encontrado"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Funcionário</DialogTitle>
            <DialogDescription>
              Preencha os dados para adicionar um novo funcionário.
            </DialogDescription>
          </DialogHeader>
          <AddEmployeeModalContent
            onAdd={handleAddEmployee}
            onCancel={() => setIsAddDialogOpen(false)}
            loading={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remover Funcionário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover este funcionário?
            </DialogDescription>
          </DialogHeader>
          <RemoveEmployeeModalContent
            employee={selectedEmployee}
            onConfirm={handleRemoveEmployee}
            onCancel={() => {
              setIsRemoveDialogOpen(false);
              setSelectedEmployee(null);
            }}
            loading={false}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeManagement;
