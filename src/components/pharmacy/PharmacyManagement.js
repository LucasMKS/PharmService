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
  const userRole = Cookies.get("roles");

  const loadPharmacies = async () => {
    try {
      const response = await PharmService.listAllPharmacies();
      console.log(response);
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
      setShowRemoveEmployeeModal(null);
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
    <div className="bg-blue-100 dark:bg-slate-900 min-h-screen flex items-center justify-center p-6">
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
                <thead className="bg-neutral-100 dark:bg-neutral-800 text-center text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                  <tr>
                    <th className="px-6 py-3">Nome</th>
                    <th className="px-6 py-3">Endereço</th>
                    <th className="px-6 py-3">Funcionários</th>
                    <th className="px-6 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-neutral-200 dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-neutral-950 text-center ">
                  {pharmacies && pharmacies.length > 0 ? (
                    pharmacies.map((pharmacy) => (
                      <tr key={pharmacy.id}>
                        <td className="py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">
                          {pharmacy.name}
                        </td>
                        <td className="py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">
                          {pharmacy.address}, {pharmacy.number} -{" "}
                          {pharmacy.city}/{pharmacy.state}
                        </td>
                        <td className="py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">
                          <button
                            onClick={() => setShowEmployeesModal(pharmacy.id)}
                            className="btn btn-sm btn-ghost"
                          >
                            <FiUsers className="mr-2" />
                            Ver Funcionários ({pharmacy.employees.length})
                          </button>
                        </td>
                        <td>
                          <button
                            onClick={() => setShowAddEmployeeModal(pharmacy.id)}
                            className="btn btn-sm btn-info"
                          >
                            <FiUsers />
                          </button>
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
              <div className="modal-box relative max-w-2xl bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 shadow-2xl p-8">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-sm btn-circle absolute right-4 top-4 text-gray-500 hover:text-blue-600"
                >
                  <FiX className="text-lg" />
                </button>

                <div className="text-center space-y-6">
                  <div className="inline-block p-3 bg-blue-100 dark:bg-gray-700 rounded-full">
                    <FiHome className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Nova Farmácia
                  </h3>

                  <form onSubmit={handleCreatePharmacy} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Nome */}
                      <div className="form-control">
                        <label className="label justify-start gap-2 pl-1">
                          <FiHome className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                          <span className="label-text text-gray-600 dark:text-gray-300">
                            Nome da Farmácia
                          </span>
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Farmácia Central"
                          className="input input-bordered w-full bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-300"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          required
                        />
                      </div>

                      {/* Email do Responsável */}
                      <div className="form-control">
                        <label className="label justify-start gap-2 pl-1">
                          <FiUsers className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                          <span className="label-text text-gray-600 dark:text-gray-300">
                            Email do Responsável
                          </span>
                        </label>
                        <input
                          type="email"
                          placeholder="Ex: gerente@farmacia.com"
                          className="input input-bordered w-full bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-300"
                          value={formData.userEmail}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              userEmail: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      {/* Endereço */}
                      <div className="form-control">
                        <label className="label justify-start gap-2 pl-1">
                          <FiMapPin className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                          <span className="label-text text-gray-600 dark:text-gray-300">
                            Endereço
                          </span>
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Rua das Flores"
                          className="input input-bordered w-full bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-300"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      {/* Número */}
                      <div className="form-control">
                        <label className="label justify-start gap-2 pl-1">
                          <FiHash className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                          <span className="label-text text-gray-600 dark:text-gray-300">
                            Número
                          </span>
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 123"
                          className="input input-bordered w-full bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-300"
                          value={formData.number}
                          onChange={(e) =>
                            setFormData({ ...formData, number: e.target.value })
                          }
                          required
                        />
                      </div>

                      {/* Bairro */}
                      <div className="form-control">
                        <label className="label justify-start gap-2 pl-1">
                          <FiMap className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                          <span className="label-text text-gray-600 dark:text-gray-300">
                            Bairro
                          </span>
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Centro"
                          className="input input-bordered w-full bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-300"
                          value={formData.neighborhood}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              neighborhood: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      {/* Cidade */}
                      <div className="form-control">
                        <label className="label justify-start gap-2 pl-1">
                          <FiMap className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                          <span className="label-text text-gray-600 dark:text-gray-300">
                            Cidade
                          </span>
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: São Paulo"
                          className="input input-bordered w-full bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-300"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          required
                        />
                      </div>

                      {/* Estado */}
                      <div className="form-control">
                        <label className="label justify-start gap-2 pl-1">
                          <FiFlag className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                          <span className="label-text text-gray-600 dark:text-gray-300">
                            Estado (UF)
                          </span>
                        </label>
                        <input
                          type="text"
                          maxLength={2}
                          placeholder="Ex: SP"
                          className="input input-bordered w-full bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-300"
                          value={formData.state}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              state: e.target.value.toUpperCase().slice(0, 2),
                            })
                          }
                          required
                        />
                      </div>

                      {/* CEP */}
                      <div className="form-control">
                        <label className="label justify-start gap-2 pl-1">
                          <FiMail className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                          <span className="label-text text-gray-600 dark:text-gray-300">
                            CEP
                          </span>
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 12345-678"
                          className="input input-bordered w-full bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-300"
                          value={formData.zipCode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              zipCode: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      {/* Telefone */}
                      <div className="form-control">
                        <label className="label justify-start gap-2 pl-1">
                          <FiPhone className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                          <span className="label-text text-gray-600 dark:text-gray-300">
                            Telefone
                          </span>
                        </label>
                        <input
                          type="tel"
                          placeholder="Ex: (11) 99999-9999"
                          className="input input-bordered w-full bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-300"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="modal-action mt-8">
                      <button
                        type="button"
                        className="btn btn-ghost hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowCreateModal(false)}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary gap-2 hover:scale-[1.02] transition-transform"
                      >
                        <FiPlus className="text-lg" />
                        Criar Farmácia
                      </button>
                    </div>
                  </form>
                </div>
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

            {/* Modal Remove Funcionário */}
            <dialog
              className={`modal ${showRemoveEmployeeModal ? "modal-open" : ""}`}
            >
              <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">Remover Funcionário</h3>
                <div className="form-control">
                  <input
                    type="number"
                    placeholder="ID do funcionário"
                    className="input input-bordered w-full"
                    value={employeeID}
                    onChange={(e) => setEmployeeID(e.target.value)}
                  />
                </div>
                <div className="modal-action">
                  <button
                    className="btn btn-ghost"
                    onClick={() => setShowRemoveEmployeeModal(null)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleDismiss(showRemoveEmployeeModal)}
                    disabled={!employeeID}
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </dialog>

            {/* Modal Listagem de Funcionários */}
            <dialog
              className={`modal ${showEmployeesModal ? "modal-open" : ""}`}
            >
              <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg mb-4">
                  Funcionários da Farmácia
                </h3>

                {pharmacies
                  .find((p) => p.id === showEmployeesModal)
                  ?.employees?.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center justify-between p-2 border-b"
                    >
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {employee.name} - ID: {employee.id}
                        </p>
                        <span className="badge badge-sm bg-sky-200 text-neutral-950 font-bold font-roboto">
                          {employee.roles.includes("GERENTE")
                            ? "Gerente"
                            : "Funcionário"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {!employee.roles.includes("GERENTE") && (
                          <button
                            onClick={() =>
                              handlePromote(showEmployeesModal, employee.id)
                            }
                            className="btn btn-xs btn-success"
                          >
                            Promover
                          </button>
                        )}
                        <button
                          onClick={() => {
                            handleDismiss(showEmployeesModal, employee.id);
                          }}
                          className="btn btn-xs btn-error"
                        >
                          Demitir
                        </button>
                      </div>
                    </div>
                  ))}

                <div className="modal-action">
                  <button
                    className="btn"
                    onClick={() => setShowEmployeesModal(null)}
                  >
                    Fechar
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
