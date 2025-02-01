import React, { useState, useEffect } from "react";
import { FiUserPlus, FiUserX, FiUserCheck } from "react-icons/fi";
import Cookies from "js-cookie";
import PharmService from "../services/PharmService";

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEmployeeEmail, setNewEmployeeEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const userRole = Cookies.get("roles");
  const pharmacyId = Cookies.get("pharmacyId");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await (userRole === "ADMIN"
        ? PharmService.getAllEmployees()
        : PharmService.getPharmacyEmployees(pharmacyId));

      setEmployees(data);
      setIsLoading(false);
    } catch (error) {
      alert(
        "Erro ao carregar funcionários: " +
          (error.message ||
            "Ocorreu um erro ao carregar a lista de funcionários.")
      );
      setIsLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    try {
      await PharmService.addEmployee(pharmacyId, newEmployeeEmail);

      alert("Funcionário adicionado com sucesso!");
      setIsAddDialogOpen(false);
      setNewEmployeeEmail("");
      fetchEmployees();
    } catch (error) {
      alert(
        "Erro ao adicionar funcionário: " +
          (error.response?.data?.message || "Erro ao adicionar funcionário")
      );
    }
  };

  const handlePromote = async (employeeId) => {
    try {
      await PharmService.promoteEmployee(employeeId, pharmacyId);

      alert("Funcionário promovido com sucesso!");
      fetchEmployees();
    } catch (error) {
      alert(
        "Erro ao promover funcionário: " +
          (error.response?.data?.message || "Erro ao promover funcionário")
      );
    }
  };

  const handleDismiss = async (employeeId) => {
    if (!window.confirm("Tem certeza que deseja demitir este funcionário?")) {
      return;
    }

    try {
      await PharmService.dismissEmployee(employeeId, pharmacyId);

      alert("Funcionário demitido com sucesso!");
      fetchEmployees();
    } catch (error) {
      alert(
        "Erro ao demitir funcionário: " +
          (error.response?.data?.message || "Erro ao demitir funcionário")
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // Verifica se o usuário tem permissão para acessar a página
  if (!["ADMIN", "GERENTE"].includes(userRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-error">Acesso Negado</h2>
          <p className="mt-2">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <div className="bg-base-100 shadow-xl rounded-lg">
        <div className="flex justify-between items-center p-4 border-b border-base-300">
          <h2 className="text-2xl font-bold">Gerenciamento de Funcionários</h2>
          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="btn btn-primary"
          >
            <FiUserPlus className="mr-2" />
            Adicionar Funcionário
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Cargo</th>
                {userRole === "ADMIN" && <th>Farmácia</th>}
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.name}</td>
                  <td>{employee.email}</td>
                  <td>
                    {employee.roles?.includes("GERENTE")
                      ? "Gerente"
                      : employee.roles?.includes("FARMACIA")
                      ? "Farmacêutico"
                      : "Funcionário"}
                  </td>
                  {userRole === "ADMIN" && <td>{employee.pharmacyName}</td>}
                  <td className="text-right space-x-2">
                    {employee.roles?.includes("FARMACIA") && (
                      <button
                        onClick={() => handlePromote(employee.id)}
                        className="btn btn-success btn-sm"
                      >
                        <FiUserCheck className="mr-1" />
                        Promover
                      </button>
                    )}
                    {(employee.roles?.includes("FARMACIA") ||
                      employee.roles?.includes("GERENTE")) && (
                      <button
                        onClick={() => handleDismiss(employee.id)}
                        className="btn btn-error btn-sm"
                      >
                        <FiUserX className="mr-1" />
                        Demitir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Adicionar Funcionário */}
      <dialog className={`modal ${isAddDialogOpen ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Adicionar Novo Funcionário</h3>
          <div className="form-control">
            <input
              type="email"
              placeholder="Email do funcionário"
              className="input input-bordered w-full"
              value={newEmployeeEmail}
              onChange={(e) => setNewEmployeeEmail(e.target.value)}
            />
          </div>
          <div className="modal-action">
            <button
              className="btn btn-ghost"
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={handleAddEmployee}
              disabled={!newEmployeeEmail}
            >
              Adicionar
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setIsAddDialogOpen(false)}>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default EmployeeManagement;
