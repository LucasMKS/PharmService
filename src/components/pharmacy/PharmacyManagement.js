"use client";
import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiUsers,
  FiHome,
  FiX,
  FiMapPin,
  FiHash,
  FiMap,
  FiFlag,
  FiMail,
  FiPhone,
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
import CreatePharmacyModalContent from "../modals/CreatePharmacyModalContent";
import AddEmployeeModalContent from "../modals/AddEmployeeModalContent";
import RemoveEmployeeModalContent from "../modals/RemoveEmployeeModalContent";
import EmployeesListModalContent from "../modals/EmployeesListModalContent";

const PharmacyManagement = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(null);
  const [showRemoveEmployeeModal, setShowRemoveEmployeeModal] = useState(null);
  const [showEmployeesModal, setShowEmployeesModal] = useState(null);
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
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [employeeID, setEmployeeID] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const userRole = getSessionData("user", {}).roles;

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const loadPharmacies = async () => {
    try {
      setLoading(true);
      const response = await PharmService.listAllPharmacies();
      setPharmacies(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error loading pharmacies:", error);
      setError("Erro ao carregar farmácias");
      setPharmacies([]);
      showToast("Erro ao carregar farmácias", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPharmacies();
  }, []);

  const handleCreatePharmacy = async (pharmacyData) => {
    try {
      await PharmService.registerPharmacy(pharmacyData);
      showToast("Farmácia criada com sucesso!");
      setShowCreateModal(false);
      loadPharmacies();
    } catch (error) {
      showToast(
        error.response?.data?.error || "Erro ao criar farmácia",
        "error"
      );
    }
  };

  const handleAddEmployee = async (pharmacyId) => {
    try {
      await PharmService.addEmployeeToPharmacy({
        pharmacyId,
        employeeEmail,
      });
      showToast("Funcionário adicionado com sucesso!");
      setShowAddEmployeeModal(null);
      setEmployeeEmail("");
      loadPharmacies();
    } catch (error) {
      showToast(
        error.response?.data?.error || "Erro ao adicionar funcionário",
        "error"
      );
    }
  };

  const handleDismiss = async (pharmacyId, employeeId) => {
    try {
      await PharmService.dismissEmployee(employeeId, pharmacyId);
      showToast("Funcionário demitido com sucesso!");
      setShowRemoveEmployeeModal(null);
      loadPharmacies();
    } catch (error) {
      showToast(
        error.response?.data?.error || "Erro ao demitir funcionário",
        "error"
      );
    }
  };

  const handlePromote = async (pharmacyId, employeeId) => {
    try {
      await PharmService.promoteEmployee(employeeId, pharmacyId);
      showToast("Funcionário promovido com sucesso!");
      loadPharmacies();
    } catch (error) {
      showToast(
        error.response?.data?.error || "Erro ao promover funcionário",
        "error"
      );
    }
  };

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

  if (!Array.isArray(userRole) || !userRole.includes("ADMIN")) {
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
          <div className="py-3 px-4 bg-muted/50 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-foreground">
              Gerenciamento de Farmácias
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-4 py-2"
            >
              <FiPlus className="mr-2" /> Nova Farmácia
            </button>
          </div>

          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium text-muted-foreground uppercase">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-muted-foreground uppercase">
                    Endereço
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-muted-foreground uppercase">
                    Funcionários
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-muted-foreground uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card text-card-foreground divide-y divide-border">
                {pharmacies && pharmacies.length > 0 ? (
                  pharmacies.map((pharmacy) => (
                    <tr
                      key={pharmacy.id}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <td className="py-4 whitespace-nowrap text-sm font-medium text-foreground">
                        {pharmacy.name}
                      </td>
                      <td className="py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {pharmacy.address}, {pharmacy.number} -{" "}
                        {pharmacy.neighborhood}, {pharmacy.city}/
                        {pharmacy.state}
                      </td>
                      <td className="py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {pharmacy.employees?.length || 0} funcionários
                      </td>
                      <td className="py-4 whitespace-nowrap text-sm font-medium text-foreground">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setShowEmployeesModal(pharmacy)}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-8 w-8"
                            title="Ver funcionários"
                          >
                            <FiUsers className="text-sm" />
                          </button>
                          <button
                            onClick={() => setShowAddEmployeeModal(pharmacy)}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-8 w-8"
                            title="Adicionar funcionário"
                          >
                            <FiPlus className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-4 text-muted-foreground"
                    >
                      {error ? error : "Nenhuma farmácia encontrada"}
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

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Nova Farmácia</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar uma nova farmácia.
            </DialogDescription>
          </DialogHeader>
          <CreatePharmacyModalContent
            onConfirm={handleCreatePharmacy}
            onCancel={() => setShowCreateModal(false)}
            loading={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!showAddEmployeeModal}
        onOpenChange={() => setShowAddEmployeeModal(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Funcionário</DialogTitle>
            <DialogDescription>
              Adicione um funcionário à farmácia {showAddEmployeeModal?.name}.
            </DialogDescription>
          </DialogHeader>
          <AddEmployeeModalContent
            pharmacyId={showAddEmployeeModal?.id}
            onAdd={handleAddEmployee}
            onCancel={() => setShowAddEmployeeModal(null)}
            loading={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!showRemoveEmployeeModal}
        onOpenChange={() => setShowRemoveEmployeeModal(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remover Funcionário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover este funcionário?
            </DialogDescription>
          </DialogHeader>
          <RemoveEmployeeModalContent
            employee={showRemoveEmployeeModal}
            onConfirm={handleDismiss}
            onCancel={() => setShowRemoveEmployeeModal(null)}
            loading={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!showEmployeesModal}
        onOpenChange={() => setShowEmployeesModal(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Funcionários da Farmácia</DialogTitle>
            <DialogDescription>
              Gerencie os funcionários da farmácia {showEmployeesModal?.name}.
            </DialogDescription>
          </DialogHeader>
          <EmployeesListModalContent
            pharmacy={showEmployeesModal}
            onPromote={handlePromote}
            onDismiss={handleDismiss}
            onClose={() => setShowEmployeesModal(null)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PharmacyManagement;
