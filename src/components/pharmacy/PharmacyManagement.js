import React, { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiEdit, FiUsers } from "react-icons/fi";
import Cookies from "js-cookie";
import PharmService from "../services/PharmService";
import NProgress from "nprogress";
import { toast } from "react-toastify";

// Configuração do NProgress
NProgress.configure({
  showSpinner: false,
  minimum: 0.3,
  easing: "ease",
  speed: 800,
});

const PharmacyManagement = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(null);
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
  const userRole = Cookies.get("roles");

  const loadPharmacies = async () => {
    try {
      const response = await PharmService.listAllPharmacies();
      // Garanta que a resposta seja um array
      setPharmacies(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error loading pharmacies:", error);
      setPharmacies([]); // Garante array vazio em caso de erro
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPharmacies();
  }, []);

  const handleCreatePharmacy = async (e) => {
    e.preventDefault();
    NProgress.start();
    try {
      const resposne = await PharmService.registerPharmacy(formData);
      console.log(resposne);
      toast.success("Farmácia criada com sucesso!");
      setShowCreateModal(false);
      loadPharmacies();
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao criar farmácia");
    } finally {
      NProgress.done();
    }
  };

  const handleAddEmployee = async (pharmacyId) => {
    NProgress.start();
    try {
      await PharmService.addEmployeeToPharmacy({
        pharmacyId,
        employeeEmail,
      });
      toast.success("Funcionário adicionado com sucesso!");
      setShowAddEmployeeModal(null);
      setEmployeeEmail("");
      loadPharmacies();
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Erro ao adicionar funcionário"
      );
    } finally {
      NProgress.done();
    }
  };

  const handleDismiss = async (pharmacyId, employeeId) => {
    if (!window.confirm("Tem certeza que deseja demitir este funcionário?"))
      return;

    NProgress.start();
    try {
      await PharmService.dismissEmployee(employeeId, pharmacyId);
      toast.success("Funcionário demitido com sucesso!");
      loadPharmacies();
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao demitir funcionário");
    } finally {
      NProgress.done();
    }
  };

  const handlePromote = async (pharmacyId, employeeId) => {
    NProgress.start();
    try {
      await PharmService.promoteEmployee(employeeId, pharmacyId);
      toast.success("Funcionário promovido com sucesso!");
      loadPharmacies();
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Erro ao promover funcionário"
      );
    } finally {
      NProgress.done();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!["ADMIN"].includes(userRole)) {
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
    <div className="bg-blue-100 dark:bg-slate-900 min-h-screen p-6">
      <div className="w-full max-w-6xl mx-auto bg-neutral-600 dark:bg-neutral-900 rounded-lg shadow-lg shadow-neutral-950 overflow-hidden">
        <div className="p-1.5 min-w-full inline-block align-middle">
          <div className="divide-y dark:border-neutral-700 divide-gray-200 dark:divide-neutral-950">
            <div className="py-3 px-4 bg-neutral-100 dark:bg-neutral-800 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-200">
                Gerenciamento de Farmácias
              </h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
              >
                <FiPlus className="mr-2" /> Nova Farmácia
              </button>
            </div>

            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                <thead className="bg-neutral-100 dark:bg-neutral-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                      Endereço
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                      Funcionários
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-neutral-200 dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-neutral-950">
                  {pharmacies && pharmacies.length > 0 ? (
                    pharmacies.map((pharmacy) => (
                      <tr key={pharmacy.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">
                          {pharmacy.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">
                          {pharmacy.address}, {pharmacy.number} -{" "}
                          {pharmacy.city}/{pharmacy.state}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">
                          <div className="flex flex-col gap-1">
                            {pharmacy.employees.map((employee) => (
                              <div
                                key={employee.id}
                                className="flex items-center gap-2"
                              >
                                <span>{employee.name}</span>
                                <span className="badge badge-sm">
                                  {employee.roles.includes("GERENTE")
                                    ? "Gerente"
                                    : "Funcionário"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                setShowAddEmployeeModal(pharmacy.id)
                              }
                              className="btn btn-sm btn-info"
                            >
                              <FiUsers className="mr-1" /> Add Funcionário
                            </button>
                            <button className="btn btn-sm btn-error">
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-4">
                        {isLoading
                          ? "Carregando..."
                          : "Nenhuma farmácia encontrada"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Criar Farmácia */}
            <dialog className={`modal ${showCreateModal ? "modal-open" : ""}`}>
              <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg mb-4">Nova Farmácia</h3>
                <form onSubmit={handleCreatePharmacy} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Nome"
                      className="input input-bordered"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email do Responsável"
                      className="input input-bordered"
                      value={formData.userEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, userEmail: e.target.value })
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="Endereço"
                      className="input input-bordered"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="Número"
                      className="input input-bordered"
                      value={formData.number}
                      onChange={(e) =>
                        setFormData({ ...formData, number: e.target.value })
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="Bairro"
                      className="input input-bordered"
                      value={formData.neighborhood}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          neighborhood: e.target.value,
                        })
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="Cidade"
                      className="input input-bordered"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="Estado"
                      className="input input-bordered"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="CEP"
                      className="input input-bordered"
                      value={formData.zipCode}
                      onChange={(e) =>
                        setFormData({ ...formData, zipCode: e.target.value })
                      }
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Telefone"
                      className="input input-bordered"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="modal-action">
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setShowCreateModal(false)}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Criar Farmácia
                    </button>
                  </div>
                </form>
              </div>
            </dialog>

            {/* Modal Add Funcionário */}
            <dialog
              className={`modal ${showAddEmployeeModal ? "modal-open" : ""}`}
            >
              <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">
                  Adicionar Funcionário
                </h3>
                <div className="form-control">
                  <input
                    type="email"
                    placeholder="Email do funcionário"
                    className="input input-bordered w-full"
                    value={employeeEmail}
                    onChange={(e) => setEmployeeEmail(e.target.value)}
                  />
                </div>
                <div className="modal-action">
                  <button
                    className="btn btn-ghost"
                    onClick={() => setShowAddEmployeeModal(null)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleAddEmployee(showAddEmployeeModal)}
                    disabled={!employeeEmail}
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyManagement;
