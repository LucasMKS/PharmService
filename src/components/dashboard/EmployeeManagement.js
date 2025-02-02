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
    <div className="bg-blue-100 dark:bg-slate-900 min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-neutral-600 dark:bg-neutral-900 rounded-lg shadow-lg shadow-neutral-950 overflow-hidden">
        <div className="p-1.5 min-w-full inline-block align-middle ">
          <div className=" divide-y dark:border-neutral-700 divide-gray-200 dark:divide-neutral-950">
            <div className="py-3 px-4 bg-neutral-100 dark:bg-neutral-800 flex justify-between items-center">
              <div className="relative">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-200">
                  Gerenciamento de Funcionários
                </h2>
              </div>
              <button
                onClick={() => setIsAddDialogOpen(true)}
                className="btn btn-primary"
              >
                <FiUserPlus className="mr-2" />
                Adicionar Funcionário
              </button>
            </div>

            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                <thead className="bg-neutral-100 dark:bg-neutral-800">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-gray-300"
                    >
                      Nome
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-gray-300"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-gray-300"
                    >
                      Cargo
                    </th>
                    {userRole === "ADMIN" && <th>Farmácia</th>}
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-gray-300"
                    >
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-neutral-200 dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-neutral-950">
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">
                        {employee.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">
                        {employee.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">
                        {employee.roles?.includes("GERENTE")
                          ? "Gerente"
                          : employee.roles?.includes("FARMACIA")
                          ? "Farmacêutico"
                          : "Funcionário"}
                      </td>
                      {userRole === "ADMIN" && <td>{employee.pharmacyName}</td>}
                      <td className="p-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">
                        {employee.roles?.includes("FARMACIA") && (
                          <button
                            onClick={() => handlePromote(employee.id)}
                            className="btn btn-success btn-sm mr-2"
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

            {/* Modal de Adicionar Funcionário */}
            <dialog className={`modal ${isAddDialogOpen ? "modal-open" : ""}`}>
              <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">
                  Adicionar Novo Funcionário
                </h3>
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
        </div>
      </div>
    </div>
  );
};

export default EmployeeManagement;
